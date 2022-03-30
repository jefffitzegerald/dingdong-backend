const { MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "pause",
        description: "Pause current song"
    },
    public: false,
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client 
     */
    async run(interaction, client) {

        const { channel } = interaction.guild.members.cache.get(interaction.user.id).voice;
        const serverQueue = client.queue.get(interaction.guild.id);
        const connection = client.connection.get(interaction.guild.id);

        if(!serverQueue) return interaction.reply({ content: "There's no queue in this server!", ephemeral: true })
        if(!interaction.guild.me.voice.channel) {
            if(connection) client.connection.delete(interaction.guild.id);
            if(serverQueue) client.queue.delete(interaction.guild.id);
            return interaction.reply({ content: "There's no queue in this server!", ephemeral: true });
        }

        if(!channel) return interaction.reply({ content: "You have to join voice channel!", ephemeral: true });
        if(channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({ content: `You must join: <#${interaction.guild.me.voice.channel.id}>!`, ephemeral: true });
        if(!serverQueue.playing) return interaction.reply({ content: "Current song already paused!", ephemeral: true });

        serverQueue.playing = false;
        serverQueue.audioPlayer.pause(true);

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setDescription("⏸Pause current song");
        interaction
            .reply({ embeds: [embed] })
            .catch(console.error);

    }
}