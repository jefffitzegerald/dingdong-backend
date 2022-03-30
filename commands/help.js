const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    data: {
        name: "help",
        description: "Need help using this bot? Use this command",
        options: [
            {
                name: "type",
                description: "Choose type",
                type: 3,
                required: false,
                choices: [
                    {
                        name: "commands",
                        value: "See commands list (reguler and membership commands)"
                    }
                ]
            }
        ]
    },
    public: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client 
     */
    async run(interaction, client) {
        return interaction.reply({ content: "Coming soon . . . ", ephemeral: true });
    }
}