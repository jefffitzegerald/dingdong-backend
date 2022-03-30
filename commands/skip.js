const { MessageEmbed } = require("discord.js");
const { play } = require("../Package/Player");

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

        let current_song = serverQueue.songs[0];
        if(current_song.vote.includes(interaction.user.id)) return interaction.reply({ content: "You're already vote to skip!", ephemeral: true });
        current_song.vote.push(interaction.user.id);

        let vote_embed = new MessageEmbed()
            .setColor("WHITE")
            .setDescription(`🗳Vote to skip! **${current_song.vote.length}/${interaction.guild.me.voice.channel.members.filter(m => !m.user.bot).size} votes**.`);
        interaction
            .reply({ embeds: [vote_embed] })
            .catch(console.error);

        if(current_song.vote.length >= interaction.guild.me.voice.channel.members.filter(m => !m.user.bot).size) {

            let skip_embed = new MessageEmbed()
                .setColor("WHITE")
                .setDescription("⏭Skip current song!");
            interaction.channel
                .send({ embeds: [skip_embed] })
                .catch(console.error);

            if(serverQueue.message) serverQueue.message.delete().catch(console.error);
            if(serverQueue.audioPlayer) {
                serverQueue.audioPlayer.stop();
                serverQueue.audioPlayer = null;
                serverQueue.resource = null;
            }
            if(serverQueue.loop.queue) {
                let lastSong = serverQueue.songs.shift();
                serverQueue.songs.push(lastSong);
            } else if(!serverQueue.loop.queue) serverQueue.songs.shift();
    
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
}