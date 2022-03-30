const { play } = require("../Package/Player");

module.exports = {
    data: {
        name: "previous",
        description: "Play previous song"
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
        if(serverQueue.loop.track) return interaction.reply({ content: "**forceskip**, **skip**, **previous**, and **skipto** command its disable while loop track its on!", ephemeral: true });
        if(!serverQueue.loop.queue) return interaction.reply({ content: "This command its disable when queue loop its off!", ephemeral: true });

        if(serverQueue.message) serverQueue.message.delete().catch(console.error);
        if(serverQueue.audioPlayer) {
            serverQueue.audioPlayer.stop();
            serverQueue.audioPlayer = null;
            serverQueue.resource = null;
        }
        
        let lastSong = serverQueue.songs.pop();
        let songs = serverQueue.songs.splice(0, (serverQueue.songs.length - 1));

        serverQueue.songs.push(lastSong);
        for (let song of songs) {
            serverQueue.songs.push(song);
        }

        if(serverQueue.playing) {
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
}