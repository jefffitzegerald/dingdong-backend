const UserDatabese = require("../data/user");

/**
 * @param {import("express").Application} app 
 * @param {import("../../Package/Client").Client} client
 */
module.exports = (app, client) => {
    app.post("/me/settings/save", async(req, res) => {
        if(!req.session.user) return res.redirect("/login");

        let data = await UserDatabese.findOne({ clientId: req.auth.clientId, clientSecret: req.auth.clientSecret });
        if(!data) return res.redirect("/login");

        let body = req.body;
        let index = 0
        if(data.google) {
            index = data.google.map(i => { return i.id; }).indexOf(req.session.user.id);
        }

        let index2 = 0;
        if(data.discord) {
            index2 = data.discord.map(i => { return i.id; }).indexOf(req.session.user.id);
        }

        let index3 = 0;
        if(data.reguler) {
            index3 = data.reguler.map(i => { return i.id; }).indexOf(req.session.user.id);
        }

        if(data.google[index]) {

            let user = data.google[index];
            user.username = body.username;
            req.session.user = user;
            
            data.google.splice(index, 1);
            data.google.push(user);

        } else if(data.discord[index2]) {

            let user = data.discord[index2];
            user.username = body.username;
            req.session.user = user;
            
            data.discord.splice(index2, 1);
            data.discord.push(user);

        } else if(data.reguler[index3]) {

            let user = data.reguler[index3];
            user.username = body.username;
            req.session.user = user;
            
            data.reguler.splice(index3, 1);
            data.reguler.push(user);

        }

        data.save();
        return res.redirect("/me/settings");
    });
}