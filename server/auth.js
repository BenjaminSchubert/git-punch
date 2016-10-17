var crypto = require("crypto");
var http = require("request-promise");
var router = require("express").Router();

var gApi = require("./utils/github-api");


const GITHUB_CLIENT = process.env["GITHUB_CLIENT"];
const GITHUB_SECRET = process.env["GITHUB_SECRET"];
const state = crypto.randomBytes(32).toString('hex');


if (GITHUB_CLIENT === undefined) {
    console.log("GITHUB_CLIENT is undefined");
    process.exit(1);
}

if (GITHUB_SECRET === undefined) {
    console.log("GITHUB_SECRET is undefined");
    process.exit(1);
}


router.get("/", function(request, response) {
    response.redirect(301, "login");
});


router.get("/login", function(request, response) {
    response.statusCode = 302;
    response.setHeader("location", "https://github.com/login/oauth/authorize?"
        + "client_id=" + GITHUB_CLIENT
        + "&scope=repo"
        + "&state=" + state
    );
    response.end();
});


router.get("/callback", function(request, response) {
    if (request.query.state !== state) {
        // FIXME : error handling
        console.error("State do not match, abort !", request.query.state, state);
        response.status(500).send("The url received was not correct, maybe someone tried to trick you !");
        return;
    }

    url = "https://github.com/login/oauth/access_token?"
        + "client_id=" + GITHUB_CLIENT
        + "&client_secret=" + GITHUB_SECRET
        + "&code=" + request.query.code
        + "&state=" + state
    ;

    http.post({url: url, json: true })
        .then(function(res) {
            request.session.access_token = res["access_token"];
            gApi("user", request.session).then(function(result) {
                request.session.login = result["login"];

                response.status(301).redirect(request.session.redirect || "/");
                delete request.session.redirect;

            });
        });
});


module.exports = router;
