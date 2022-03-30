const router = require("express").Router();
const scopes = ["https://www.googleapis.com/auth/youtube.readonly"];

const { GoogleAuthentication } = require("../../../Package/GoogleAuthentication");
const google = new GoogleAuthentication(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI, scopes);

/**
 *  /login/youtube
 */

router.get("/youtube", (req, res) => {
    req.session.search = null;
    return res.redirect("/login");
});

router.get("/youtube/callback", async(req, res) => {
    req.session.search = null;
    return res.redirect("/login");
});

module.exports = router;