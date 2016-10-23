var router = require("express").Router();
var db = require("../db/db");

var Commit = db.Commit;
var Repository = db.Repository;
var User = db.User;


router.get("/users", function(request, response) {
    User
        .count()
        .then(function(users) {
            response.send(JSON.stringify({ count: users }));
        });
});


router.get("/repositories", function(request, response) {
    Repository
        .count()
        .then(function(repositories) {
            response.send({ count: repositories });
        });
});


router.get("/commits", function(request, response) {
    // FIXME : check that the count is correct
    // FIXME : repository to not have _id anymore
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
        ])
        .then(function(commits) {
            response.send(commits);
        });
});


module.exports = router;
