var router = require("express").Router();

var ghApi = require("../utils/github-api");
var linguist = require("../utils/linguist");
var db = require("../db/db");
var utils = require("./utils");

var Commit = db.Commit;
var Repository = db.Repository;


function getExtensions(files) {
    return files.map(function(file) {
        return file.filename.split("/").pop().split(".").pop();
    }).filter(function(item, pos, array) {
        return array.indexOf(item) == pos;
    });
}


function getLanguages(extensions, repositoryLanguages) {
    return extensions.map(function(extension) {
        var languages = linguist.languages("." + extension);

        if (languages === undefined) {
            return "Other";
        } else if (languages.length === 1) {
            return languages[0];
        } else {
            return repositoryLanguages.filter(function(entry) {
                return languages.indexOf(entry) !== -1;
            })[0] || "Other";
        }
    }).filter(function(item, pos, array) {
        return array.indexOf(item) == pos;
    });
}


function saveMissingCommits(commits, commitsInDB, session, repository) {
    var newCommits = commits
        .filter(function(commit) {
            return !commitsInDB.find(function(commitInDB) { return commit.sha === commitInDB.sha && repository.id == commitInDB.repository; });
        });

    if (newCommits.length == 0) {
        return commitsInDB;
    }

    return Promise.all(newCommits
        .map(function(commit) {
            return ghApi(commit["url"], session, true)
                .then(function (commit) {
                    var date = new Date(commit.commit.author.date);

                    return {
                        sha: commit.sha,
                        hour: date.getHours(),
                        day: date.getDay(),
                        user: session.userId,
                        repository: repository.id,
                        languages: getLanguages(getExtensions(commit.files), repository.languages)
                    }
                })
        }))
        .then(function(commits) {
            return Commit.collection.insert(commits);
        })
        .catch(function(err) {
            if (err.rateLimit === true) {
                return [];
            }
            throw err;
        })
}


function saveCommits(session, repository) {
    return ghApi("https://api.github.com/repos/" + repository.full_name + "/commits?author=" + session.login, session, true)
        // check for missing commits
        .then(function(commits) {
            return Commit
                .find({
                    "sha": { "$in": commits.map(function(commit) { return commit.sha; })},
                    "repository": repository.id,
                    "user": session.userId
                })
                .then(function(commitsInDB) {
                    return saveMissingCommits(commits, commitsInDB, session, repository)
                })
        })
        .catch(function(err) {
            // we are limited by GitHub API, let's just use local content
            if (err.rateLimit === true) {
                // we are limited by GitHub API, let's just use local content
                return;
            }
            else if (err.response !== undefined && err.response.statusCode == 409) {
                // repository is empty
                return;
            }
            return Promise.reject(err);
        })
}


function getCommits(session) {
    return Commit.aggregate([
        { "$match": { "user": session.userId } },
        {
            "$group": {
                _id: "$sha",
                hour: { "$first": "$hour" },
                day: { "$first": "$day" },
                languages: { "$first": "$languages" },
                repositories: { $push: "$repository" }
            }
        },
        { $project: { "day": 1, "hour": 1, "languages": 1, "repositories": 1, "_id": 0 } }
    ])
}


function saveRepository(repository, session) {
    return ghApi(repository.languages_url, session, true)
        .then(function(languages) {
            return Object.keys(languages);
        })
        .then(function(languages) {
            return Repository.findOneAndUpdate(
                { "id": repository.id },
                {
                    "id": repository.id,
                    "name": repository.name,
                    "full_name": repository.full_name,
                    "user": session.userId,
                    "color": linguist.color(repository.language) || "#333",
                    "languages": languages
                },
                { upsert: true, new: true, fields: "-__v -_id -user" }
            );

        });
}


function getRepositories(session) {
    return ghApi("user/repos?per_page=100", session)
        .then(function(repositories) {
            return Promise.all(repositories.map(function(repository) {
                return saveRepository(repository, session);
            }))
        })
        .catch(function(err) {
            if (err.rateLimit === true) {
                // we are limited by GitHub
                return Commit
                    .find({"user": session.userId})
                    .distinct("repository")
                    .then(function(repositories) {
                        return Repository.find({"id": { "$in": repositories } }, "-__v -_id");
                    })
                    .then(function(repositories) {
                        return Promise.reject({
                            data: repositories,
                            rateLimit: true
                        })
                    });
            }
            return Promise.reject(err);
        })
}


router.use(function(request, response, next) {
    if (request.session.access_token === undefined) {
        // FIXME : a correct redirect ?
        response.status(401).send({url: "/auth/login"});
        return;
    }

    var unCheckedSend = response.send.bind(response);

    response.send = function(data) {
        if (request.session.ghRateLimitReset !== undefined) {
            if (new Date(request.session.ghRateLimitReset) > new Date()) {
                data.limitedUntil = request.session.ghRateLimitReset;
            } else {
                delete request.session.ghRateLimitReset;
            }
        }
        unCheckedSend(data);
    };

    next();
});


router.use(function(request, response, next) {
    if (request.session.userId === undefined) {
        response.status(403).send({ error: "User information couldn't be retrieved from GitHub, we can't know who you are." });
    } else {
        next();
    }
});



router.get("/user", function(request, response) {
    response.send({ name: request.session.name });
});


router.get("/commits", function(request, response) {
    Commit
        .aggregate([
            { $match: { user: request.session.userId }},
            { $group: {
                _id: "$sha",
                day: {"$first": "$day"},
                hour: {"$first": "$hour"},
                languages: {"$first": "$languages"},
                count: {$sum: 1}
            }},
            { $project: { "day": 1, "hour": 1, "languages": 1, "count": 1, "_id": 0 } }
        ])
        .then(function(commits) {
            response.send({ commits: commits});
        })
});


router.get("/repositories", function(request, response) {
    getRepositories(request.session)
        .catch(function(err) {
            if (err.rateLimit === true) {
                return err.data;
            }
            return Promise.reject(err);
        })
        .then(function(repositories) {
            return Promise.all(repositories.map(function(repository) {
                    return saveCommits(request.session, repository);
                }))
                .then(function() {
                    return Promise.all([
                        getCommits(request.session),
                        utils.getLanguages(request.session)
                    ])
                })
                .then(function(data) {
                    return {
                        commits: data[0],
                        languages: data[1],
                        repositories: repositories
                    }
                })
        })
        .then(function(data) {
            response.send(data);
        })
});


module.exports = router;
