var router = require("express").Router();
var db = require("../db/db");

var User = db.User;
var Project = db.Project;


router.get("/users", function(request, response) {
    response.setHeader('Content-Type', 'application/json');

    User.count().then(function(users) {
        response.send(JSON.stringify({ count: users }));
    });
});


router.get("/projects", function(request, response) {
    response.setHeader("Content-Type", "application/json");

    Project
        .count()
        .then(function(projects) {
            response.send(JSON.stringify({ count: projects }));
        })
});

module.exports = router;
