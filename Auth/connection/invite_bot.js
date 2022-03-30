const router = require("express").Router();
let scopes = ["applications.commands", "bot", "identify", "email"];
let permissions = "140160396672";

router.get("/", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(!req.session.user) return res.redirect("/login");
    if(!req.session.user.connection.discord) return res.redirect("/login/connection/discord");
    
    let guild_id = req.query.guild_id ? `&guild_id=${req.query.guild_id}` : "";
    const { clientId, invite_redirect_uri } = req.auth.discord;
    let authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}${guild_id}&redirect_uri=${encodeURIComponent(invite_redirect_uri)}&permissions=${permissions}&scope=${scopes.join("%20")}&response_type=code`;
    
    req.session.search = null;
    res.redirect(authorizeUrl);
});

router.get("/callback", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    const guild_id = req.query["guild_id"];
    if(!guild_id) return res.redirect("/me/servers?error=cannot_find_server");

    req.session.search = null;
    res.redirect(`/me/servers/${guild_id}`);
});

router.get("/disconnect", async(req, res) => {
    const client = req.client;
    const guild_id = req.query.guild_id;
    const Discord = require("discord.js");

    if(!req.query.guild_id) return res.redirect("/me/servers");
    if(!client.guilds.cache.has(guild_id)) return res.redirect("/me/servers");
    
    let guild = client.guilds.cache.get(guild_id);
    let member = guild.members.cache.get(req.session.user.connection.discord.user.id);
    
    if(!member) return res.redirect("/me/servers");
    await guild.members.fetch(req.session.user.connection.discord.user.id);
    if(!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) return res.redirect("/me/servers");

    if(guild) await guild.leave();
    
    req.session.search = null;
    return res.redirect("/me/servers");
});

module.exports = router;