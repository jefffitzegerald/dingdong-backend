const { MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "disconnect",
        description: "Disconnect from voice channel"
    },
    public: false,
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client 
     */
    async run(interaction, client) {
        const { channel } = interaction.member.voice;
        const connection = client.connection.get(interaction.guild.id);
        const serverQueue = client.queue.get(interaction.guild.id);

        if(!channel) return interaction.reply({ content: "You must join voice channel first before stop queue!", ephemeral: true });
        if(!interaction.guild.me.voice.channel) {
            if(serverQueue) client.queue.delete(interaction.guild.id);
            if(connection) client.connection.delete(interaction.guild.id);
            return interaction.reply({ content: `There's no queue in ${interaction.guild.name} server! Use \`play\` command to play song!`, ephemeral: true });
        }
        if(channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({ content: `Currently, im using on <#${interaction.guild.me.voice.channel.id}> channel!`, ephemeral: true });

        if(connection) {
            if(serverQueue) {
                if(serverQueue.message) {
                    serverQueue.message.delete().catch(console.error);
                }

                if(serverQueue.audioPlayer && serverQueue.resource) {
                    serverQueue.audioPlayer.stop();
                    serverQueue.audioPlayer = null;
                    serverQueue.resource = null;
                }
                client.queue.delete(interaction.guild.id);
            }
            connection.destroy();
            client.connection.delete(interaction.guild.id);
        } else {
            require("@discordjs/voice").joinVoiceChannel({
                guildId: interaction.guild.id,
                channelId: channel.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            }).destroy();
        }

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setDescription(":wave:Leaving voice channel! Thank you for using "+client.user.username+"!");
        return interaction.reply({ embeds: [embed] });
    }
}