/**
 * Defines authentication related routes
 */

"use strict";

var crypto = require("crypto");
var http = require("request-promise");
var mongoose = require("mongoose");
var router = require("express").Router();


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

/**
 * Redirect to login on base access
 */
router.get("/", function(request, response) {
    response.redirect(301, "login");
});


/**
 * Redirect the user to GitHub for authorization
 */
router.get("/login", function(request, response) {
    response.statusCode = 302;
    response.setHeader("location", "https://github.com/login/oauth/authorize?"
        + "client_id=" + GITHUB_CLIENT
        + "&scope=repo"
        + "&state=" + state
    );
    response.end();
});


/**
 * Removes user's session
 */
router.get("/logout", function(request, response) {
    request.session.destroy();
    response.redirect(301, "/");
});


/**
 * Callback to which to redirect GitHub oauth
 */
router.get("/callback", function(request, response) {
    if (request.query.state !== state) {
        // FIXME : error handling
        console.error("State do not match, abort !", request.query.state, state);
        response.status(500).send("The url received was not correct, maybe someone tried to trick you !");
        return;
    }

    var url = "https://github.com/login/oauth/access_token?"
        + "client_id=" + GITHUB_CLIENT
        + "&client_secret=" + GITHUB_SECRET
        + "&code=" + request.query.code
        + "&state=" + state
    ;

    http.post({url: url, json: true })
        .then(function(res) {
            if (res.error !== undefined) {
                console.log("ERROR:", res.error_description);
                response.status(500).send("An error occured while signing you up, sorry");
                return;
            }

            request.session.access_token = res["access_token"];
            // FIXME : this doesn't redirect correctly
            response.status(301).redirect("/#/stats");
        });
});


module.exports = router;
