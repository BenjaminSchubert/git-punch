var router = require("express").Router();

var ghApi = require("../utils/github-api");
var linguist = require("../utils/linguist");
var db = require("../db/db");

var Commit = db.Commit;
var Project = db.Project;


function getExtensions(files) {
    return files.map(function(file) {
        return file.filename.split("/").pop().split(".").pop();
    }).filter(function(item, pos, array) {
        return array.indexOf(item) == pos;
    });
}


function getLanguages(extensions, projectLanguages) {
    return extensions.map(function(extension) {
        var languages = linguist.languages("." + extension);

        if (languages === undefined) {
            return "Other";
        } else if (languages.length === 1) {
            return languages[0];
        } else {
            return projectLanguages.filter(function(entry) {
                return languages.indexOf(entry) !== -1;
            })[0] || "Other";
        }
    }).filter(function(item, pos, array) {
        return array.indexOf(item) == pos;
    });
}


function saveMissingCommits(commits, commitsInDB, session, project) {
    var newCommits = commits
        .filter(function(commit) {
            return !commitsInDB.find(function(commitInDB) { return commit.sha === commitInDB.sha && project._id == commitInDB.project; });
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
                        project: project._id,
                        languages: getLanguages(getExtensions(commit.files), project.languages)
                    }
                })
        }))
        .then(function(commits) {
            return Commit.collection.insert(commits);
        })
        .catch(function(err) {
            console.log("Projects", project);
            err.writeErrors.map(function(e) {
                console.log(e.toString())
            });
            return [];
        })
}


function saveCommits(session, project) {
    return ghApi(project.url + "/commits?author=" + session.login, session, true)
        // check for missing commits
        .then(function(commits) {
            return Commit
                .find({
                    "sha": { "$in": commits.map(function(commit) { return commit.sha; })},
                    "project": project._id,
                    "user": session.userId
                })
                .then(function(commitsInDB) {
                    return saveMissingCommits(commits, commitsInDB, session, project)
                })
        })
        .catch(function(err) {
            if (err.response === undefined) {
                console.log(err);
            }
            // we are limited by GitHub API, let's just use local content
            if (err.response.statusCode === 403 && err.response.headers["x-ratelimit-remaining"] === "0") {
                return;
            }
            else if (err.response.statusCode == 409) {
                // repository is empty
                return;
            }
            throw err;
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
                projects: { $push: "$project" }
            }
        },
        { $project: { "day": 1, "hour": 1, "languages": 1, "projects": 1, "_id": 0 } }
    ])
}


function saveRepository(repository, session) {
    return ghApi(repository.languages_url, session, true)
        .then(function(languages) {
            return Object.keys(languages);
        })
        .then(function(languages) {
            return Project.findOneAndUpdate(
                { "_id": repository.id },
                {
                    "_id": repository.id,
                    "url": repository.url,
                    "name": repository.name,
                    "color": linguist.color(repository.language) || "#333",
                    "languages": languages
                },
                { upsert: true, new: true, fields: "-__v" }
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
                if (err.statusCode === 403 && err.response.headers["x-ratelimit-remaining"] === "0") {
                    return Commit
                        .find({"user": session.userId})
                        .distinct("project")
                        .then(function(repositories) {
                            return Project.find({"_id": { "$in": repositories } }, "-__v");
                        });
                }
                throw err;
            })
}


router.get("/user", function(request, response) {
   if (request.session.access_token) {
       response.send({ name: request.session.name });
   } else {
       response.status(401).send();
   }
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
            response.send(commits);
        })
});


router.get("/projects", function(request, response) {
    getRepositories(request.session)
        .then(function(repositories) {
            return Promise.all(repositories.map(function(repository) {
                    return saveCommits(request.session, repository);
                }))
                .then(function() {
                    return getCommits(request.session);
                })
                .then(function(commits) {
                    return {
                        commits: commits,
                        repositories: repositories
                    }
                })
        })
        .then(function(data) {
            response.setHeader("Content-Type", "application/json");
            response.send(data);
        })
        .catch(function(err) {
            if (err.statusCode === 401) {
                request.session.redirect = "/#/punchcard";
                response.status(401).send({url: "/auth/login"});
            } else {
                throw err;
            }
        })
});


module.exports = router;
