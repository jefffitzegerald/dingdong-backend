const { Commands } = require("./Commands");
const { TrackInfo } = require("./lib/index");
const { Client, Collection, Intents } = require("discord.js");
const { DiscordTogether } = require("discord-together");
const allIntents = new Intents(32767);

module.exports.Client = class extends Client {
    constructor() {
        super({
            partials: ["CHANNEL", "GUILD_MEMBER", "GUILD_SCHEDULED_EVENT", "MESSAGE", "REACTION", "USER"],
            intents: allIntents
        });

        this.discordTogether = new DiscordTogether(this);
        this.commands = new Collection();
        this.commandsSchema = new Commands(this);
        this.clientTrack = TrackInfo;
        this.config = require("./config.json");

        this.connection = new Map();
        this.queue = new Map();
    }

    msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        return (hrs > 0 ? (hrs < 10 ? "0"+hrs : hrs)+":" : "") + (mins < 10 ? "0"+mins : mins) + ':' + (secs < 10 ? "0"+secs : secs);
    }

    /**
     * @param {string} token
     * @returns 
     */
    setToken(token) {
        this.login(token);
        return this;
    }
    log(content, params) {
        let param = params ? params : "";
        return console.log(content, param);
    }
    
    /**
     * @param {number} length 
     * @returns 
     */
    generateId(length) {
        let results = "";
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            results += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return results;
    }
}