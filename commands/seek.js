module.exports = {
    data: {
        name: "skip",
        description: "Skip current song"
    },
    public: false,
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client 
     */
    async run(interaction, client) {
        return interaction.reply({ content: "Still under development!", ephemeral: true });
    }
}