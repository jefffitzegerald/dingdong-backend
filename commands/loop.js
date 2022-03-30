const { MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "loop",
        description: "Looping current queue",
        options: [
            {
                name: "type",
                description: "Type loop queue",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "Queue",
                        value: "queue"
                    },
                    {
                        name: "Track",
                        value: "track"
                    },
                    {
                        name: "Off",
                        value: "off"
                    }
                ]
            }
        ]
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
        const type = interaction.options.getString("type");

        if(!serverQueue) {
            if(!interaction.guild.me.voice.channel) {
                if(connection) client.connection.delete(interaction.guild.id)
            }
            return interaction.reply({ content: `There's no queue in ${interaction.guild.name} server! Use \`play\` command to play song!`, ephemeral: true });
        }
        if(!channel) return interaction.reply({ content: "You must join voice channel first!", ephemeral: true });
        if(channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({ content: `You must join the same voice channel with the bot: <#${interaction.guild.me.voice.channel.id}>`, ephemeral: true });

        let message = "";
        if(type.toLowerCase() === "track") {
            if(serverQueue.loop.track) return interaction.reply({ content: "Track loop its already on!", ephemeral: true });
            serverQueue.loop.track = true;
            serverQueue.loop.queue = false;
            message += "🔁Loop **track** its now on!";
        }

        if(type.toLowerCase() === "queue") {
            if(serverQueue.loop.queue) return interaction.reply({ content: "Queue loop its already on!", ephemeral: true });
            serverQueue.loop.track = false;
            serverQueue.loop.queue = true
            message += "🔁Loop **queue** its now on!";
        }

        if(type.toLowerCase() === "off") {
            if(!serverQueue.loop.track && !serverQueue.loop.queue) return interaction.reply({ content: "Track loop its already on!", ephemeral: true });
            serverQueue.loop.track = false;
            serverQueue.loop.queue = true;
            message += "❌Loop its now off!"
        }

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setDescription(message);
        return interaction
            .reply({ embeds: [embed] })
            .catch(console.error);
    }
}