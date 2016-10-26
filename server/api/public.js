/**
 * Defines the public part of the api
 */

"use strict";

var router = require("express").Router();

var db = require("../db/db");
var linguist = require("../utils/linguist");
var utils = require("./utils");

var Commit = db.Commit;
var Repository = db.Repository;
var User = db.User;


/**
 * Route to get the count of all users
 */
router.get("/users", function(request, response) {
    User
        .count()
        .then(function(users) {
            response.json({ count: users });
        });
});


/**
 * Route to get the count of all repositories
 */
router.get("/repositories", function(request, response) {
    Repository
        .distinct("id")
        .count()
        .then(function(repositories) {
            response.json({ count: repositories });
        });
});


/**
 * Returns the list of all commits registered by the application
 */
router.get("/commits", function(request, response) {
    Promise.all([
        Commit
            .aggregate([
                { $group: {
                    _id: "$sha",
                    day: { "$first": "$day" },
                    hour: { "$first": "$hour" },
                    languages: { "$first": "$languages" },
                    shas: { $addToSet: "$sha" }
                }},
                { $project: { day: 1, hour: 1, languages: 1, count: { $size: "$shas" }, _id: 0 } }
            ]),
        utils.getLanguages()
    ])
        .then(function(data) {
            response.json({ commits: data[0], languages: data[1] });
        });
});


module.exports = router;
