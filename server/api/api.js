var router = require("express").Router();
var punchcard = require("./punchcard");
var colors = require("./colors");

router.use("/punchcard", punchcard);
router.use("/colors", colors);


module.exports = router;
