/**
 * Defines the private api for which users must be logged in through GitHub OAuth
 */

"use strict";

var router = require("express").Router();

var ghApi = require("../utils/github-api");
var linguist = require("../utils/linguist");
var db = require("../db/db");
var utils = require("./utils");

var Commit = db.Commit;
var Repository = db.Repository;


/**
 * Get the extensions for the list of given files
 *
 * @param files for which to get the extensions
 * @returns {Array.<String>}
 */
function getExtensions(files) {
    return files.map(function(file) {
        return file.filename.split("/").pop().split(".").pop();
    }).filter(function(item, pos, array) {
        return array.indexOf(item) == pos;
    });
}


/**
 * Get the languages for the given list of extensions.
 *
 * @param extensions for which to get the languages
 * @param repositoryLanguages found in the repository, to allow for filtering in
 *              case there are multiple languages for the given extension
 * @returns {Array.<String>}
 */
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


/**
 * Downloads and saves information about commits that are not yet in the database
 *
 * @param commits list for a given repository
 * @param commitsInDB for the given repository
 * @param session from the user
 * @param repository of the commits
 * @returns {*} a promise telling whether the operation succeeded
 */
function saveMissingCommits(commits, commitsInDB, session, repository) {
    // filter new commits
    var newCommits = commits
        .filter(function(commit) {
            return !commitsInDB.find(function(commitInDB) {
                return commit.sha === commitInDB.sha && repository.id == commitInDB.repository;
            });
        });

    if (newCommits.length == 0) {
        // no new commits to save
        return commitsInDB;
    }

    // download commits information and prepare them
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
        // save the commits
        .then(function(commits) {
            return Commit.collection.insert(commits);
        })
        .catch(function(err) {
            if (err.rateLimit === true) {
                // we've been limited, let's just return
                return [];
            }
            // unknown error
            return Promise.reject(err);
        })
}


/**
 * Check all commits for a repository and ensures that all commits
 * are saved in the database. If not, will download and save them.
 *
 * Also checks that no extra commits are there and removes them if necessary
 *
 * @param session of the user
 * @param repository for which to get the commits
 * @returns {*} a promise telling whether the operation succeeded
 */
function checkAndSaveCommits(session, repository) {
    return ghApi("https://api.github.com/repos/" + repository.full_name + "/commits?author=" + session.login, session, true)
        // check for missing commits
        .then(function(commits) {
            var shas = commits.map(function(commit) { return commit.sha; });

            return Promise
                .all([
                    // insert missing commits
                    Commit
                        .find({
                            "sha": { "$in": shas },
                            "repository": repository.id,
                            "user": session.userId
                        })
                        .then(function(commitsInDB) {
                            return saveMissingCommits(commits, commitsInDB, session, repository)
                        }),
                    // remove dangling commits
                    Commit
                        .remove({
                            "sha": { "$nin": shas },
                            "repository": repository.id,
                            "user": session.userId
                        })
                ])
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


/**
 * Get all commits for the given user, sorted by languages and repositories
 *
 * @param session of the user
 * @returns {*} Promise containing all the commits
 */
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


/**
 * saves the given repository
 *
 * @param repository to save
 * @param session of the user for which to save the repository
 * @returns {*} Promise telling whether the operation was successful
 */
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


/**
 * Remove all repositories in the database but not in the list for the given user
 *
 * @param repositories to keep
 * @param session of the user for which to remove the repositories
 * @returns {a|Promise|*} whether something was removed or not
 */
function removeDanglingRepositories(repositories, session) {
    var repository_ids = repositories.map(function(repository) { return repository.id });

    return Promise
        .all([
            Repository.remove({
                user: session.userId,
                id: { $nin: repository_ids }
            }),
            Commit.remove({
                user: session.userId,
                project: { $nin: repository_ids }
            })
        ]);
}


/**
 * Get all repositories for the given user
 *
 * @param session of the user
 * @returns {*} Promise of a list of repositories
 */
function getRepositories(session) {
    return ghApi("user/repos?per_page=100", session)
        .then(function(repositories) {
            return Promise
                .all([
                    Promise.all(repositories.map(function(repository) {
                        return saveRepository(repository, session);
                    })),
                    removeDanglingRepositories(repositories, session)
                ])
        })
        .then(function(promises) {
            // send back only new repositories, we don't care about dangling ones
            return promises[0];
        })
        .catch(function(err) {
            if (err.rateLimit === true) {
                // we are limited by GitHub, let's return what we have in the database
                return Repository
                    .find({"user": session.userId}, "-__v -_id")
                    .then(function(repositories) {
                        return Promise.reject({
                            data: repositories,
                            rateLimit: true
                        })
                    });
            }
            // unknown error
            return Promise.reject(err);
        })
}


/**
 * Middleware to check whether the user is logged in or not
 *
 * This will also add information whether the user is limited by the
 * GitHub api or not on the response
 */
router.use(function(request, response, next) {
    if (request.session.access_token === undefined) {
        // FIXME : a correct redirect ?
        response.status(401).send({url: "/auth/login"});
        return;
    }

    var unCheckedSend = response.send.bind(response);

    // monkey patch the response to be able to add data before effectively sending it
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


/**
 * Ensures we have information about the user's information.
 *
 * If we don't we won't be able to know who did the request and
 * therefore won't be able to give back information
 */
router.use(function(request, response, next) {
    if (request.session.userId === undefined) {
        response.status(403).send({ error: "User information couldn't be retrieved from GitHub, we can't know who you are." });
    } else {
        next();
    }
});


/**
 * Return user's information
 */
router.get("/user", function(request, response) {
    response.send({ name: request.session.name });
});


/**
 * Send all commits for the given user
 */
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


/**
 * Send all information concerning the given user
 *
 * This will send
 *  - a list of languages used in its projects
 *  - a list of projects
 *  - a list of all commits, with their respective project(s) and language(s)
 *
 * This will also sync all user's data with the GitHub api
 */
router.get("/repositories", function(request, response) {
    // get all repositories from github
    getRepositories(request.session)
        .catch(function(err) {
            if (err.rateLimit === true) {
                // we might have partial data, let's use this
                return err.data;
            }
            return Promise.reject(err);
        })
        .then(function(repositories) {
            return Promise
                .all(repositories.map(function(repository) {
                    // save all commits
                    return checkAndSaveCommits(request.session, repository);
                }))
                .then(function() {
                    // build data
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
        .catch(function(error) {
            console.log(error);
            response.status(500).send({});
        })
});


module.exports = router;
