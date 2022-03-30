const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    data: {
        name: "set-activity",
        description: "Set activity in voice channel",
        options: [
            {
                name: "channel",
                description: "Set voice channel for activity",
                type: 7,
                channel_types: [2],
                required: true,
            }
        ]
    },
    public: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client
     */
    async run(interaction, client) {
        const voice_channel = interaction.options.getChannel("channel");
        let activity = await client.discordTogether.createTogetherCode(voice_channel.id, "youtube");

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setTitle("Activity Done Arranged!")
            .setDescription(`The activity will be carried out in <#${voice_channel.id}> channel, click the button to join the activity!`);
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle("LINK")
                    .setEmoji("<:ding_dong_circle:954190665753968702>")
                    .setLabel("Join Activity")
                    .setURL(activity.code)
            );
        interaction
            .reply({ embeds: [embed], components: [row] })
            .catch(console.error);
    }
}