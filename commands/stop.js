const { MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "stop",
        description: "Stop queue in your server"
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
        if(!serverQueue) {
            if(!interaction.guild.me.voice.channel) {
                if(connection) client.connection.delete(interaction.guild.id);
            }
            return interaction.reply({ content: `There's no queue in ${interaction.guild.name} server! Use \`play\` command to play song!`, ephemeral: true });
        }
        if(channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({ content: `Currently, im using on <#${interaction.guild.me.voice.channel.id}> channel!`, ephemeral: true });
        if(!serverQueue.audioPlayer && !serverQueue.resource) return interaction.reply({ content: "Queue already stop!" });

        if(!serverQueue.loop.track) {
            if(serverQueue.message) {
                serverQueue.message.delete().catch(console.error);
            }
        }

        serverQueue.playing = false;
        serverQueue.audioPlayer.stop();
        serverQueue.audioPlayer = null;
        serverQueue.resource = null;

        if(serverQueue.loop.queue) {
            let lastSong =  serverQueue.songs.shift();
            serverQueue.songs.push(lastSong);
        } else {
            serverQueue.songs.shift();
        }

        if(serverQueue.songs.length < 1) {
            client.queue.delete(interaction.guild.id);
        }

        let embed = new MessageEmbed()
            .setColor('WHITE')
            .setDescription("⏹Stop queue");
        return interaction.reply({ embeds: [embed] });
    }
}