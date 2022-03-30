const router = require("express").Router();

router.get("/", (req, res) => {
    return res.json({ session: req.session, id: req.sessionID });
});

router.post("/redirect", (req, res) => {
    let r = req.session.r || "/";
    return res.json(r);
});

router.post("/promotions", (req, res) => {
    if(!req.session.number) {
        req.session.number = 1;
    } else if(req.session.number == 10) {
        req.session.number = 1;
    } else {
        req.session.number += 1;
    }

    return res.json({ number: req.session.number, session: req.session });
});

router.post("/guilds", (req, res) => {
    const client = req.client;
    const { guild_id } = req.body;

    const guild = client.guilds.cache.get(guild_id);
    if(guild) return res.json({ guild: guild });
    else return res.json({ guild: null });
});

router.post("/channels", (req, res) => {
    const client = req.client;
    const { channel_id } = req.body;

    const channel = client.channels.cache.get(channel_id);
    if(channel) return res.json({ channel: channel });
    else return res.json({ channel: null });
});

module.exports = router;