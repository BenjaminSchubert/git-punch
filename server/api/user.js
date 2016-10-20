var router = require("express").Router();


var db = require("../db/db");

var User = db.User;


router.get("", function(request, response) {
   if (request.session.access_token) {
       response.send({ name: request.session.name });
   } else {
       response.status(401).send();
   }
});


module.exports = router;
