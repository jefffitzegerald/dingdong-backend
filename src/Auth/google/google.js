const fetch = require("node-fetch").default;
const router = require("express").Router();
const UserDatabese = require("../../data/user");
const { GoogleAuthentication } = require("../../../Package/GoogleAuthentication");

const defaultScope = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/userinfo.email',
];

const google = new GoogleAuthentication(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI, defaultScope);

/**
 *  /login/google
 */

router.get("/", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(req.session.user) return res.redirect("/");
    req.session.search = null;
    return res.redirect(google.OAuth2_url);
});

router.get("/callback", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    const code = req.query.code;
    if(!code) return res.redirect("/login?error=ErrorNotReceiveAccessCode");

    const clientId = req.auth.clientId;
    const clientSecret = req.auth.clientSecret;
    const tokens = await google.getTokens(code);
    const userInfo = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        method: "GET",
        headers: {
            'authorization': `${tokens.token_type} ${tokens.access_token}`
        }
    })
    .then(res => res.json())
    .catch(console.error);

    const data = await UserDatabese.findOne({ clientId, clientSecret });
    if(data) {
        let index = data.google.map(i => {
            return i.id;
        }).indexOf(userInfo.id);
        if(data.google[index]) {
            req.session.user = data.google[index];
        } else {
            let new_user = {
                username: "Ding Dong User",
                id: userInfo.id,
                email: userInfo.email,
                avatar: userInfo.picture,
                password: null,
                connection: {
                    discord: null,
                    spotify: null,
                    youtube: null
                }
            }
            req.session.user = new_user;
            data.google.push(new_user);
            data.save();
            
        }
    } else {
        let new_user = {
            username: "Ding Dong User",
            id: userInfo.id,
            email: userInfo.email,
            avatar: userInfo.picture,
            password: null,
            connection: {
                discord: null,
                spotify: null,
                youtube: null
            }
        }
        req.session.user = new_user;
        req.session.search = null;
        new UserDatabese({ clientId: clientId, clientSecret: clientSecret, google: [new_user], discord: [], regular: [] }).save();
    }

    return res.redirect("/me");
});

module.exports = router;