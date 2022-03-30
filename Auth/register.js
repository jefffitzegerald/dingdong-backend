const UserDatabese = require("../data/user");
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
    res.render(`${req.views}/register`, { req });
});

router.post("/callback", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    const body = req.body;
    const client = req.client;
    const { clientId, clientSecret } = req.auth;
    const user_databese = await UserDatabese.findOne({ clientId, clientSecret });
    let id = client.generateId(10);

    if(user_databese) {
        let new_user_data = {
            username: body.username,
            id: id,
            email: body.email,
            avatar: "https://cdn.onlinewebfonts.com/svg/img_162386.png",
            password: body.password,
            connection: {
                discord: null,
                spotify: null,
                youtube: null
            }
        }
        req.session.user = new_user_data;
        user_databese.reguler.push(new_user_data);
        user_databese.save();
    } else {
        let new_user_data = {
            username: body.username,
            id: id,
            email: body.email,
            avatar: "https://cdn.onlinewebfonts.com/svg/img_162386.png",
            password: body.password,
            connection: {
                discord: null,
                spotify: null,
                youtube: null
            }
        }

        req.session.user = new_user_data;
        req.session.search = null;
        new UserDatabese({ clientId: clientId, clientSecret: clientSecret, google: [], discord: [], regular: [new_user_data] }).save();
    }

    return res.redirect("/me");
});

router.post("/check", async(req, res) => {
    const { clientId, clientSecret } = req.auth;
    const data = await UserDatabese.findOne({ clientId, clientSecret });
    if(data) {
        return res.json(data.regular);
    } else {
        return res.json([]);
    }
});

module.exports = router;