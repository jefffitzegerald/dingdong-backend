const scopes = ["identify", "email", "guilds"];
const FormData = require("form-data");
const fetch = require("node-fetch").default;
const router = require("express").Router();
const UserDatabese = require("../../data/user");

router.get("/discord", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(!req.session.user) return res.redirect("/login/discord");
    if(req.session.user.connection.discord) return res.redirect("/me/servers");

    const { clientId, connection_redirect_uri } = req.auth.discord;
    const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(connection_redirect_uri)}&response_type=code&scope=${scopes.join("%20")}`;
    
    req.session.search = null;
    res.redirect(authorizeUrl);
});

router.get("/discord/callback", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(!req.session.user) return res.redirect("/login/discord");
    if(req.session.user.connection.discord) return res.redirect("/me/servers");

    const { clientId, clientSecret, connection_redirect_uri } = req.auth.discord;
    const accessCode = req.query.code;
    if(!accessCode) return res.redirect("/me?error=NoReceiveAccessCode");

    const data = new FormData();
    data.append("client_id", clientId);
    data.append("client_secret", clientSecret);
    data.append("grant_type", "authorization_code");
    data.append("redirect_uri", connection_redirect_uri);
    data.append("scope", scopes.join(" "));
    data.append("code", accessCode);

    let response = await fetch("https://discordapp.com/api/oauth2/token", { method: "POST", body: data }).then(res => res.json());
    let response2 = await fetch("https://discordapp.com/api/users/@me", { method: "GET", headers: { authorization: `${response.token_type} ${response.access_token}` }}).then(res => res.json());
    let response3 = await fetch("https://discordapp.com/api/users/@me/guilds", { method: "GET", headers: { authorization: `${response.token_type} ${response.access_token}` }}).then(res => res.json());

    response2.tag = `${response2.username}#${response2.discriminator}`;
    response2.avatarURL = response2.avatar ? `https://cdn.discordapp.com/avatars/${response2.avatar}.png?size=1024` : "https://logodownload.org/wp-content/uploads/2017/11/discord-logo-1-1.png"

    let userData = await UserDatabese.findOne({ clientId: req.auth.clientId, clientSecret: req.auth.clientSecret });
    let index = userData.google.map(i => { return i.id }).indexOf(req.session.user.id);
    let index2 = userData.regular.map(i => { return i.id }).indexOf(req.session.user.id);
    let index3 = userData.discord.map(i => { return i.id }).indexOf(req.session.user.id);

    if(userData.google[index]) {
        let user = userData.google[index];
        user.connection.discord = {
            user: response2,
            guilds: response3
        }

        req.session.user.connection.discord = {
            user: response2,
            guilds: response3
        }
        userData.google.splice(index, 1);
        userData.google.push(user);
        userData.save();
    } else
    if(userData.regular[index2]) {
        let user = userData.regular[index2];
        user.connection.discord = {
            user: response2,
            guilds: response3
        }

        req.session.user.connection.discord = {
            user: response2,
            guilds: response3
        }
        userData.google.splice(index2, 1);
        userData.google.push(user);
        userData.save();
    } else
    if(userData.discord[index3]) {
        let user = userData.discord[index3];
        user.connection.discord = {
            user: response2,
            guilds: response3
        }

        req.session.user.connection.discord = {
            user: response2,
            guilds: response3
        }
        userData.discord.splice(index3, 1);
        userData.discord.push(user);
        userData.save();
    }

    req.session.search = null;
    return res.redirect("/me/servers");
});

router.get("/discord/disconnect", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(!req.session.user) return res.redirect("/");
    if(!req.session.user.connection.discord) return res.redirect("/me");
    req.session.user.connection.discord = null;

    let userData = await UserDatabese.findOne({ clientId: req.auth.clientId, clientSecret: req.auth.clientSecret });
    let index = userData.google.map(i => { return i.id }).indexOf(req.session.user.id);
    let index2 = userData.regular.map(i => { return i.id }).indexOf(req.session.user.id);
    let index3 = userData.discord.map(i => { return i.id }).indexOf(req.session.user.id);

    if(userData.google[index]) {
        let user = userData.google[index];
        user.connection.discord = null

        userData.google.splice(index, 1);
        userData.google.push(user);
        userData.save();
    } else 
    if(userData.regular[index2]) {
        let user = userData.regular[index2];
        user.connection.discord = null

        userData.regular.splice(index2, 1);
        userData.regular.push(user);
        userData.save();
    } else
    if(userData.discord[index3]) {
        let user = userData.discord[index3];
        user.connection.discord = null

        userData.discord.splice(index3, 1);
        userData.discord.push(user);
        userData.save();
    }

    req.session.search = null;
    return res.redirect("/me");
});

router.use("/discord/invite", require("./invite_bot"));

module.exports = router;