var router = require("express").Router();

var ghApi = require("../utils/github-api");


router.get("", function(request, response) {
    ghApi("user/repos?per_page=100", request.session)
        .then(function(projects) {
            response.setHeader("Content-Type", "application/json");
            response.send(projects.map(function(project) {
                return { name: project.name, fullName: project.full_name }
            }))
        })
        .catch(function(err) {
            if (err.statusCode === 401) {
                request.session.redirect = "/#/punchcard";
                response.status(401).send({url: "/auth/login"});
            } else {
                console.log(err);
                response.status(500).send();
            }
        })
});

module.exports = router;
