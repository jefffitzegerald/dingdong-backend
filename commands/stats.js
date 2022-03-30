const { MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "bot-stats",
        description: "Stats command to check bot status in the server"
    },
    public: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client
     */
    async run(interaction, client) {

        let ping = client.ws.ping;
        let permissions = interaction.guild.me.permissions.toArray().map(perms => perms.toLocaleUpperCase()).join(", ");
        let status = interaction.guild.me.presence ? interaction.guild.me.presence.status : "Offline";

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setTitle(`${client.user.username} Stats`)
            .addFields(
                {
                    name: "Ping",
                    value: `${ping}`,
                    inline: true
                },
                {
                    name: "Status",
                    value: status,
                    inline: true
                },
                {
                    name: "Permissions:",
                    value: permissions
                }
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }));
        interaction.reply({ embeds: [embed] });
    }
}