class Commands {
    /**
     * @param {import("./Client").Client} client 
     */
    constructor(client) {
        const fs = require("fs");
        const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(".js"));
        for (let file of commandFiles) {
            const command = require(`../commands/${file}`);
            if(command.data) {
                client.commands.set(command.data.name, command);
            }
        }
        this.client = client;
    }

    /**
     * @param {string} commandName 
     * @returns 
     */
    get(commandName) {
        const client = this.client;
        return client.commands.get(commandName);
    }

    /**
     * @param {string} commandName 
     * @returns 
     */
    has(commandName) {
        const client = this.client;
        return client.commands.has(commandName);
    }

    toJSON() {
        const client = this.client;
        return client.commands.toJSON();
    }
}

exports.Commands = Commands;