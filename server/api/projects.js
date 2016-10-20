var router = require("express").Router();

var ghApi = require("../utils/github-api");
var linguist = require("../utils/linguist");
var db = require("../db/db");

var Project = db.Project;


router.get("", function(request, response) {
    ghApi("user/repos?per_page=100", request.session)
        .then(function(projects) {
            return Promise.all(projects.map(function(project) {
                return Project.findOneAndUpdate(
                    { "_id": project.id, "user": request.session.userId },
                    {
                        "_id": project.id,
                        "user": request.session.userId,
                        "full_name": project.full_name,
                        "name": project.name,
                        "color": linguist.color(project.language) || "#333"
                    },
                    { upsert: true, new: true, fields: "-__v -user -_id" }
                );
            }))
        })
        .then(function(projects) {
            return { projects: projects };
        })
        .catch(function(err) {
            if (err.statusCode === 403 && err.response.headers["x-ratelimit-remaining"] === "0") {
                return Project.find({"user": request.session.userId}, "-_id").then(function(projects) {
                    return { projects: projects, retry: err.response.headers["x-ratelimit-reset"] * 1000 };
                });
            }
            throw err;
        })
        .then(function(projects) {
            response.setHeader("Content-Type", "application/json");
            response.send(projects);
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
