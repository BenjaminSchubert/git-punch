var router = require("express").Router();
var punchcard = require("./punchcard");

router.use("/punchcard", punchcard);


module.exports = router;
