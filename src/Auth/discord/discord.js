const scopes = ["identify", "email", "guilds"];
const FormData = require("form-data");
const fetch = require("node-fetch").default;
const router = require("express").Router();
const userDatabese = require("../../data/user");

/**
 *  /login/discord
 */

router.get("/", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }
    if(req.session.user) return res.redirect("/profile");

    const { clientId, redirect_uri } = req.auth.discord;
    const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=${scopes.join("%20")}`;
    
    req.session.search = null;
    res.redirect(authorizeUrl);
});

router.get("/callback", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    const clientId_ding_dong = req.auth.clientId;
    const clientSecret_ding_dong = req.auth.clientSecret;
    const { clientId, clientSecret, redirect_uri } = req.auth.discord;
    const code = req.query.code;

    if(!code) return res.redirect("/login?error=NoReceiveAccessCode");

    const data = new FormData();
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', redirect_uri);
    data.append('scope', scopes.join(' '));
    data.append('code', code);

    let response = await fetch("https://discordapp.com/api/oauth2/token", { method: "POST", body: data }).then(res => res.json());
    let response2 = await fetch("https://discordapp.com/api/users/@me", { method: "GET", headers: { authorization: `${response.token_type} ${response.access_token}` }}).then(res => res.json());
    let response3 = await fetch("https://discordapp.com/api/users/@me/guilds", { method: "GET", headers: { authorization: `${response.token_type} ${response.access_token}` }}).then(res => res.json());

    response2.tag = `${response2.username}#${response2.discriminator}`;
    response2.avatarURL = response2.avatar ? `https://cdn.discordapp.com/avatars/${response2.id}/${response2.avatar}.png?size=1024` : "https://logodownload.org/wp-content/uploads/2017/11/discord-logo-1-1.png"

    const userData = await userDatabese.findOne({ clientId: clientId_ding_dong, clientSecret: clientSecret_ding_dong });
    if(userData) {
        let index = userData.discord.map(i => {
            return i.id;
        }).indexOf(response2.id);
        if(userData.discord[index]) req.session.user = userData.discord[index];
        else {
            let new_user = {
                username: response2.username,
                id: response2.id,
                email: response2.email,
                avatar: response2.avatarURL,
                password: null,
                connection: {
                    discord: {
                        user: response2,
                        guilds: response3
                    },
                    spotify: null,
                    youtube: null
                }
            }

            req.session.user = new_user;
            userData.discord.push(new_user);
            userData.save();
        }
    } else {
        let new_user = {
            username: response2.username,
            id: response2.id,
            email: response2.email,
            avatar: response2.avatarURL,
            password: null,
            connection: {
                discord: {
                    user: response2,
                    guilds: response3
                },
                spotify: null,
                youtube: null
            }
        }

        req.session.search = null;
        req.session.user = new_user;
        new userDatabese({ clientId: clientId_ding_dong, clientSecret: clientSecret_ding_dong, google: [], discord: [new_user], reguler: [] }).save();
    }

    return res.redirect("/me");
});

module.exports = router;