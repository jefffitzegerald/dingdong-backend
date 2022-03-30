const router = require("express").Router();

router.get("/", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(req.session.playlist_id) {

        try {
            
            fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);

        } catch (error) {
            
        }
        
        req.session.playlist_id = undefined;
    }

    if(req.session.title) {
        try {
            fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
        } catch (error) {
            
        }
        try {
            fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
        } catch (error) {

        }
        req.session.title = undefined;
    }

    if(req.session.user) return res.redirect("/");
    req.session.search = null;
    res.render(`${req.views}/login`, { req });
});

router.post("/callback", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(req.session.user) return res.redirect("/me");

    const body = req.body;
    const { clientId, clientSecret } = req.auth;

    const user = require("../data/user");
    const databeses = await user.findOne({ clientId, clientSecret });
    if(!databeses) return res.redirect("/login?error=wrong_username_password");

    let index = indexOf_username(databeses.reguler, body.username_email);
    let index2 = indexOf_password(databeses.reguler, body.password);
    if(!databeses.reguler[index] && !databeses.reguler[index2]) return res.redirect("/login?error=wrong_password_username");

    /**
     * user = {
     *  username: "",
     *  id: "",
     *  email: "",
     *  avatar: "",
     *  password: "",
     *  connection: {
     *   discord: {},
     *   spotify: {},
         youtube: {}
     *  }
     * }
     * 
     */

    req.session.user = databeses.reguler[index];
    req.session.search = null;
    return res.redirect("/me");
});

router.use("/google", require("./google/google"));
router.use("/discord", require("./discord/discord"));

router.use("/connection", require("./connection/discord"));
router.use("/connection", require("./connection/spotify"));
router.use("/connection", require("./connection/youtube"));

module.exports = router;

/**
 * @param {Array} array
 */
 function indexOf_username(array, parameter) {
    let index = array.map(i => {
        return i.username || i.email;
    }).indexOf(parameter);
    return index;
}

/**
 * @param {Array} array
 */
function indexOf_password(array, parameter) {
    let index = array.map(i => {
        return i.password;
    }).indexOf(parameter);
    return index;
}