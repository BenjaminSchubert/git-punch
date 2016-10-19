var router = require("express").Router();
var linguist = require("../utils/linguist");


router.get("", function(request, response) {
    response.setHeader('Content-Type', 'application/json');

    var languages = request.query.language || [];
    languages = languages.constructor === Array ? languages : [languages];

    var data = {};

    languages.forEach(function(language) {
        data[language] = linguist.color(language);
    });

    response.send(JSON.stringify(data));
});


module.exports = router;
