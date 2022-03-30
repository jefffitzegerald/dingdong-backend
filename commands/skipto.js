const { MessageEmbed } = require("discord.js");
const { play } = require("../Package/Player");

module.exports = {
    data: {
        name: "skipto",
        description: "Skip song to specific song",
        options: [
            {
                name: "queue-number",
                description: "Number of specific song",
                type: 4,
                required: true
            }
        ]
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
            if(connection) client.connection.delete(interaction.guild.id);
            if(serverQueue) client.connection.delete(interaction.guild.id);
            return interaction.reply({ content: "There's no queue in this server!", ephemeral: true });
        }
        if(!channel) return interaction.reply({ content: "You must join voice channel first!", ephemeral: true });
        if(channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({ content: `You must join: <#${interaction.guild.me.voice.channel.id}>!`, ephemeral: true });
        if(serverQueue.loop.track) return interaction.reply({ content: "**forceskip**, **skip**, **previous**, and **skipto** command its disable while loop track its on!", ephemeral: true });

        let number = interaction.options.getInteger("queue-number");
        if(1  > number || number < serverQueue.songs.length) return interaction.reply({ content: `You must choose number between 1 - ${serverQueue.songs.length}!`, ephemeral: true });

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setDescription(`⏭ Skip ${number - 1} songs`);
        interaction
            .reply({ embeds: [embed] })
            .catch(console.error);

        if(serverQueue.audioPlayer) {

            serverQueue.audioPlayer.stop();
            serverQueue.audioPlayer = null;
            serverQueue.resource = null;

        }

        if(serverQueue.loop.queue) {

            let songs = serverQueue.songs.splice(0, (number - 2));
            for (let song of songs) {
                serverQueue.songs.push(song);
            }

        } else if(!serverQueue.loop.queue) {

            serverQueue.songs.splice(0, (number - 2));

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