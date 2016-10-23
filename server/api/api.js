var router = require("express").Router();

var ghApi = require("../utils/github-api");
var db = require("../db/db");

var User = db.User;


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
