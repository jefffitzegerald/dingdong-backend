const router = require("express").Router();

router.use("/v1", require("./API/v1"));
router.use("/queue", require("./API/queue"));
router.use("/session", require("./API/session"));
router.use("/playlist", require("./API/playlist"));

module.exports = router;