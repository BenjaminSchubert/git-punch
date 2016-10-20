var router = require("express").Router();
var db = require("../db/db");

var User = db.User;


router.get("/users", function(request, response) {
    response.setHeader('Content-Type', 'application/json');

    User.count().then(function(users) {
        response.send(JSON.stringify({count: users}));
    });
});


module.exports = router;
