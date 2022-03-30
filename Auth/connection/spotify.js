const request = require("request");
const fetch = require("node-fetch").default;
const router = require("express").Router();
let scopes = ['user-read-private', 'user-read-email'];
const UserDatabese = require("../../data/user");

router.get("/spotify", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    const data = await UserDatabese.findOne({ clientId: req.auth.clientId, clientSecret: req.auth.clientSecret });
    if(!data) return res.redirect("/login");

    if(!req.session.user) return res.redirect("/login");
    if(req.session.user.connection.spotify) return res.redirect("/profile");

    const { clientId, redirect_uri } = req.auth.spotify;
    const state = req.client.generateId(10)
    let authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=${scopes.join("%20")}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`;
    
    req.session.search = null;
    res.redirect(authorizeUrl);
});

router.get("/spotify/callback", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    const data = await UserDatabese.findOne({ clientId: req.auth.clientId, clientSecret: req.auth.clientSecret });
    if(!data) return res.redirect("/login");

    if(!req.session.user) return res.redirect("/login");
    if(req.session.user.connection.spotify) return res.redirect("/me");

    const { clientId, clientSecret, redirect_uri } = req.auth.spotify;
    const state = req.query.state;

    const accessCode = req.query.code;
    if(!accessCode) return res.redirect("/me?error=NotReceiveAccessCode");
    
    let authOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
            'Authorization': 'Basic '+ Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            code: accessCode,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        json: true
    }

    let index = data.google.map(i => { return i.id }).indexOf(req.session.user.id);
    let index2 = data.discord.map(i => { return i.id }).indexOf(req.session.user.id);
    let index3 = data.regular.map(i => {  return i.id }).indexOf(req.session.user.id);

    let user;
    if(data.google[index]) user = data.google[index];
    else if(data.discord[index2]) user = data.discord[index2];
    else if(data.regular[index3]) user = data.regular[index3];

    req.session.search = null;
    request.post(authOptions, function(error, response, body) {
        if(!error && response.statusCode === 200) {

            fetch("	https://api.spotify.com/v1/me", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${body.token_type} ${body.access_token}`
                }
            })
            .then(resp => resp.json())
            .then(resp => {

                let new_user = user;
                new_user.connection.spotify = {
                    user: resp,
                    state: state
                };

                if(data.google[index]) {

                    data.google.splice(index, 1);
                    data.google.push(new_user);

                } else if(data.discord[index2]) {

                    data.discord.splice(index2, 1);
                    data.discord.push(new_user);

                } else if(data.regular[index3]) {

                    data.regular.splice(index3, 1);
                    data.regular.push(new_user);

                }
                data.save();
                req.session.user.connection.spotify = {
                    user: resp,
                    state: state
                }

                return res.redirect("/me");

            });

        } else {

            return res.redirect("/me?error=200");

        }
    });
});

router.get("/spotify/disconnect", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    const userData = await UserDatabese.findOne({ clientId: req.auth.clientId, clientSecret: req.auth.clientSecret });
    if(!userData) return res.redirect("/");

    if(!req.session.user) return res.redirect("/");
    if(!req.session.user.connection.spotify) return res.redirect("/me");

    let index = userData.google.map(i => { return i.id }).indexOf(req.session.user.id);
    let index2 = userData.regular.map(i => { return i.id }).indexOf(req.session.user.id);
    let index3 = userData.discord.map(i => { return i.id }).indexOf(req.session.user.id);

    if(userData.google[index]) {
        let user = userData.google[index];
        user.connection.spotify = null

        userData.google.splice(index, 1);
        userData.google.push(user);
    } else 
    if(userData.regular[index2]) {
        let user = userData.regular[index2];
        user.connection.spotify = null

        userData.regular.splice(index2, 1);
        userData.regular.push(user);
    } else
    if(userData.discord[index3]) {
        let user = userData.discord[index3];
        user.connection.spotify = null

        userData.discord.splice(index3, 1);
        userData.discord.push(user);
    }
    userData.save();
    req.session.user.connection.spotify = null;
    return res.redirect("/me");
});

module.exports = router;