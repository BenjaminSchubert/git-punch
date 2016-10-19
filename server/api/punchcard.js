var router = require("express").Router();
var linguist = require("../utils/linguist");


var gApi = require("../utils/github-api");

var Commit = require("../db/db").Commit;


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
            })[0];
        }
    }).filter(function(item, pos, array) {
        return array.indexOf(item) == pos;
    });
}


function saveCommit(commit, project, languages) {
    var date = new Date(commit.commit.author.date);

    var newCommit = new Commit({
        _id: commit.sha,
        project: project,
        hour: date.getHours(),
        day: date.getDay(),
        languages: getLanguages(getExtensions(commit.files), languages)
    });

    newCommit.save();
    return newCommit;
}


function loadCommits(commits, session, user, project) {
    var project_languages;

    return Promise.all(commits.map(function(commit) {
        return Commit.findById(commit["sha"], "-__v -_id").then(function(object) {
            if (object === null) {
                if (project_languages === undefined) {
                    project_languages = gApi("repos/" + user + "/" + project + "/languages", session);
                }

                return project_languages.then(function(languages) {
                    languages = Object.keys(languages);
                    return gApi(commit["url"], session, true).then(function(entry) {
                        return saveCommit(entry, project, languages);
                    });
                });
            } else {
                return object;
            }
        });
    }));

}


router.get("/projects", function(request, response) {
    gApi("user/repos?per_page=100", request.session)
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


router.get("/commits/:user/:project", function(request, response) {
    var url = "repos/" + request.params.user + "/" + request.params.project + "/commits" +
        "?author=" + request.session.login + "&per_page=100";

    response.setHeader('Content-Type', 'application/json');
    gApi(url, request.session)
        .then(function(data) {
            return loadCommits(data, request.session, request.params.user, request.params.project);
        })
        .then(function(commits) {
            response.send(commits);
        })
        .catch(function (error) {
            if (error.statusCode === 409) {
                response.send(JSON.stringify([]));
            }
            else {
                console.log(error);
                response.status(500).send();
            }
        });
});


module.exports = router;
