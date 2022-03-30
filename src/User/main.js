const fs = require("fs");
const router = require("express").Router();
const Playlist = require("../data/queue");

router.get("/", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
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

    if(!req.session.user) return res.redirect("/login");

    req.session.r = "/";
    req.session.search = null;
    res.render(`${req.views}/profile`, { req, bot: req.client });
});

router.get("/settings", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
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

    if(!req.session.user) return res.redirect("/login");
    
    req.session.r = "/";
    req.session.search = null;
    res.render(`${req.views}/edit_profile`, { req, bot: req.client });
});

router.get("/playlist", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
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

    if(!req.session.user) return res.redirect("/login");

    const playlist = await Playlist.findOne({ userId: req.session.user.id });
    req.session.r = "/";
    req.session.search = null;
    res.render(`${req.views}/playlist-list`, { req, playlist, bot: req.client });
});

router.get("/playlist/:id", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }
    if(!req.session.user) return res.redirect("/login");

    const data = await Playlist.findOne({ userId: req.session.user.id });
    if(!data) return res.redirect("/me/playlist");

    let index = data.playlist.map(i => { return i.id }).indexOf(req.params.id);
    if(!data.playlist[index]) return res.redirect("/me/playlist");

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

    if(req.session.playlist_id) {

        try {
            
            fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);

        } catch (error) {
            
        }
        
        req.session.playlist_id = undefined;
    }

    req.session.r = "/";
    req.session.search = undefined;
    res.render(`${req.views}/playlist`, { req, bot: req.client, playlist: data.playlist[index] });
});

router.get("/servers", async(req, res) => {
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
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

    if(!req.session.user) return res.redirect("/login");
    if(!req.session.user.connection.discord) return res.redirect("/login/connection/discord");

    req.session.r = "/";
    req.session.search = null;
    res.render(`${req.views}/servers`, { req, bot: req.client, guilds: req.session.user.connection.discord.guilds });
});

router.get("/servers/:id", async(req, res) => {
    const Discord = require("discord.js");
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(!req.session.user) return res.redirect("/login");
    if(!req.session.user.connection.discord) return res.redirect("/login/connection/discord");

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

    const client = req.client;
    const guild = client.guilds.cache.get(req.params.id);
    
    if(!guild) return res.redirect(`/login/connection/discord/invite?guild_id=${req.params.id}`);
    await guild.members.fetch(req.session.user.connection.discord.user.id);

    if(!guild.members.cache.get(req.session.user.connection.discord.user.id)) return res.redirect("/me/servers");
    if(!guild.members.cache.get(req.session.user.connection.discord.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) return res.redirect("/me/servers");

    let reguler_commands = client.commandsSchema.toJSON().filter(cmd => cmd.public);
    let membership_commands = client.commandsSchema.toJSON().filter(cmd => !cmd.public);

    req.session.r = "/";
    req.session.search = null;
    res.render(`${req.views}/server`, { req, bot: client, guild, reguler_commands, membership_commands });
});

router.get("/servers/:id/player", async(req, res) => {
    const Discord = require("discord.js");
    if(req.session.number) {
        if(req.session.number >= 10) return res.redirect("/secret");
    }

    if(!req.session.user) return res.redirect("/login");
    if(!req.session.user.connection.discord) return res.redirect("/login/connection/discord");

    const client = req.client;
    const guild = client.guilds.cache.get(req.params.id);

    if(!client.config.membershipForever.includes(req.session.user.connection.discord.user.id)) return res.redirect(`/me/servers/${req.params.id}`);
    if(!guild) return res.redirect(`/login/connection/discord/invite?guild_id=${req.params.id}`);
    await guild.members.fetch(req.session.user.connection.discord.user.id);

    if(!guild.members.cache.get(req.session.user.connection.discord.user.id)) return res.redirect("/me/servers");
    if(!guild.members.cache.get(req.session.user.connection.discord.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) return res.redirect("/me/servers");

    const serverQueue = client.queue.get(req.params.id);
    const connection = client.connection.get(req.params.id);

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

    req.session.r = "/";
    req.session.search = null;
    res.render(`${req.views}/queue`, { req, bot: client, guild, serverQueue, connection });
});

module.exports = router;