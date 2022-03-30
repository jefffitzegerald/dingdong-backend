const { play } = require("../Package/Player");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "replay",
        description: "Replaying current song"
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

        if(!serverQueue) return interaction.reply({ content: "There's no queue in this server!", ephemeral: true });
        if(!interaction.guild.me.voice.channel) {
            if(serverQueue) client.queue.delete(interaction.guild.id);
            if(connection) client.connection.delete(interaction.guild.id);
            return interaction.reply({ content: "There's no queue in this server!", ephemeral: true });
        }

        if(!channel) return interaction.reply({ content: "You must join voice channel first!", ephemeral: true });
        if(channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({ content: `You must join: <#${interaction.guild.me.voice.channel.id}>!`, ephemeral: true });
        if(!serverQueue.audioPlayer) return interaction.reply({ content: "Queue its already stop! Use `resume` command if you want to play!", ephemeral: true });

        serverQueue.audioPlayer.stop();
        serverQueue.audioPlayer = null;
        serverQueue.resource = null;

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setDescription("🔄Replay current song!");
        interaction
            .reply({ embeds: [embed] })
            .catch(console.error);
        
        try {
            play(serverQueue.songs[0], interaction.guild.id, client);
        } catch (error) {
            console.log(error);
            if(connection) {
                connection.destroy();
                client.connection.delete(interaction.guild.id);
            }
            return client.queue.delete(interaction.guild.id);
        }

    }
}