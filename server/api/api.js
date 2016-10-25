/**
 * This file wires up the whole api
 */

"use strict";

var router = require("express").Router();

var ghApi = require("../utils/github-api");
var db = require("../db/db");

var User = db.User;


/**
 * Sets the content type for the api to json (only json is supported here).
 *
 * Also checks that we have the current user's information. If not, we fetch it
 * from GitHub
 */
router.use(function(request, response, next) {
    response.setHeader('Content-Type', 'application/json');

    if (request.session.access_token === undefined || request.session.userId !== undefined) {
        next();
    } else {
        ghApi("user", request.session)
            .then(function(result) {
                request.session.login = result.login;
                request.session.userId = result.id;
                request.session.name = result.name;
                return User.update({ _id: result.id }, { _id: result.id }, { upsert: true });
            })
            .then(function() {
                next();
            })
            .catch(function(error) {
                if (error.rateLimit) {
                    // do nothing, this will be handled if needed by children
                    next();
                } else {
                    return Promise.reject(error);
                }
            });
    }
});

router.use("/private", require("./private"));
router.use("/public", require("./public"));


module.exports = router;
