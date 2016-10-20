var router = require("express").Router();


router.use("/projects", require("./projects"));
router.use("/commits", require("./commits"));
router.use("/colors", require("./colors"));
router.use("/user", require("./user"));
router.use("/stats", require("./stats"));


module.exports = router;
