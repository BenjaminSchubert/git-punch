var router = require("express").Router();
var ghApi = require("../utils/github-api");


router.get("", function(request, response) {
    ghApi("user/repos?per_page=100", request.session)
        .then(function(data) {
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(data.map(function(project) {
                return project["full_name"];
            })));
        })
        .catch(function(err) {
            if (err.statusCode === 401) {
                // FIXME : this doesn't work
                request.session.redirect = "/#/punchcard";
                response.status(301).redirect("/auth/login");
            } else {
                console.log(err);
                response.status(500).send();
            }
        })
});

module.exports = router;
