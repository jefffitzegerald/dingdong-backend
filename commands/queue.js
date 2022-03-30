let forms = new Map();
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "queue",
        description: "List song in queue",
    },
    public: false,
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client 
     */
    async run(interaction, client) {
        let substring = 67;
        const serverQueue = client.queue.get(interaction.guild.id);
        if(!serverQueue) return interaction.reply({ content: `There's no queue in ${interaction.guild.name} server! Use \`play\` command to play song!`, ephemeral: true });

        if(serverQueue.songs.length <= 5) {
            let message = serverQueue.songs.map((song, index) => `${index+1}). ${song.title.length > substring ? `${song.title.substr(0, substring)}...` : song.title} - [${song.userPlayer.tag}]`).join("\n");
            return interaction.reply({
                content: `\`\`\`** QUEUE SONGS **\nSongs in queue: ${serverQueue.songs.length}\n\n${message}\`\`\``
            });
        } else {
            let data = {
                first: 0,
                second: 5
            }
            forms.set(interaction.guild.id+interaction.user.id, data);

            let current_songs = [];
            for(let song of serverQueue.songs) {
                current_songs.push(song);
            }

            let message = current_songs.splice(0, 5).map((song, index) => `${index+1}). ${song.title.length > substring ? `${song.title.substr(0, substring)}...` : song.title} - [${song.userPlayer.tag}]`).join("\n");
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("left")
                        .setEmoji("<:Previous_Page:897314282872655983>")
                        .setStyle("SECONDARY")
                        .setDisabled(true),
                    new MessageButton()
                        .setCustomId("right")
                        .setEmoji("<:Next_Page:897289358187589663>")
                        .setStyle("SECONDARY")
                );

            await interaction.reply({ content: "Select left or right to view all queue in "+interaction.guild.name, ephemeral: true });
            const collectorMessage = await interaction.channel.send({
                content: `\`\`\`** QUEUE SONGS **\nSongs in queue: ${serverQueue.songs.length}\n\n${message}\`\`\``,
                components: [row]
            });
            
            const collector = collectorMessage.createMessageComponentCollector({ componentType: "BUTTON", filter: f => f.user.id === interaction.user.id, time: 60000 });
            collector.on("collect", (r) => {
                if(r.user.id !== interaction.user.id) {
                    let embed = new MessageEmbed()
                        .setTitle("Invalid Interaction")
                        .setDescription("You can't control this message queue!")
                    return r.reply({ embeds: [embed] });
                }

                if(r.customId === "left") {
                    let action_songs = [];
                    for(let song of serverQueue.songs) {
                        action_songs.push(song);
                    }

                    let form = forms.get(r.guild.id+r.user.id);
                    form.first -= 5;
                    form.second -= 5;

                    let row;
                    let queue_message = action_songs.splice(form.first, form.second).map((index, song) => `${index+1}). ${song.title.length > substring ? `${song.title.substr(0, substring)}...` : song.title} - [${song.userPlayer.tag}]`).join("\n");
                    
                    if(form.second == 5 && form.first == 0) {
                        row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId("left")
                                    .setEmoji("<:Previous_Page:897314282872655983>")
                                    .setStyle("SECONDARY")
                                    .setDisabled(true),
                                new MessageButton()
                                    .setCustomId("right")
                                    .setEmoji("<:Next_Page:897289358187589663>")
                                    .setStyle("SECONDARY")
                            )
                    } else {
                        row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId("left")
                                    .setEmoji("<:Previous_Page:897314282872655983>")
                                    .setStyle("SECONDARY"),
                                new MessageButton()
                                    .setCustomId("right")
                                    .setEmoji("<:Next_Page:897289358187589663>")
                                    .setStyle("SECONDARY")
                            )
                    }
                    
                    return r.update({
                        content: `\`\`\`** QUEUE SONGS **\nSongs in queue: ${serverQueue.songs.length}\n\n${queue_message}\`\`\``,
                        components: [row]
                    });
                }

                if(r.customId === "right") {
                    let action_songs = [];
                    for(let song of serverQueue.songs) {
                        action_songs.push(song);
                    }

                    let form = forms.get(r.guild.id+r.user.id);
                    form.first += 5;
                    form.second += 5;

                    let row;
                    let queue_message = action_songs.splice(form.first, form.second).map((index, song) => `${index+1}). ${song.title.length > substring ? `${song.title.substr(0, substring)}...` : song.title} - [${song.userPlayer.tag}]`).join("\n");
                    
                    if(form.second == 5 && form.first == 0) {
                        row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId("left")
                                    .setEmoji("<:Previous_Page:897314282872655983>")
                                    .setStyle("SECONDARY"),
                                new MessageButton()
                                    .setCustomId("right")
                                    .setEmoji("<:Next_Page:897289358187589663>")
                                    .setStyle("SECONDARY")
                                    .setDisabled(true)
                            )
                    } else {
                        row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId("left")
                                    .setEmoji("<:Previous_Page:897314282872655983>")
                                    .setStyle("SECONDARY"),
                                new MessageButton()
                                    .setCustomId("right")
                                    .setEmoji("<:Next_Page:897289358187589663>")
                                    .setStyle("SECONDARY")
                            )
                    }
                    
                    return r.update({
                        content: `\`\`\`** QUEUE SONGS **\nSongs in queue: ${serverQueue.songs.length}\n\n${queue_message}\`\`\``,
                        components: [row]
                    });
                }
            })
            .on("end", () => {
                let form = forms.get(interaction.guild.id+interaction.user.id);
                let first = form.first;
                let second = form.second;

                let last_collector = [];
                for(let song of serverQueue.songs) {
                    last_collector.push(song);
                }
                let last_message = last_collector.splice(first, second).map((index, song) => `${index+1}). ${song.title.length > substring ? `${song.title.substr(0, substring)}...` : song.title} - [${song.userPlayer.tag}]`).join("\n");
                let last_row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId("left")
                            .setEmoji("<:Previous_Page:897314282872655983>")
                            .setStyle("SECONDARY")
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId("right")
                            .setEmoji("<:Next_Page:897289358187589663>")
                            .setStyle("SECONDARY")
                            .setDisabled(true)
                    );

                forms.delete(interaction.guild.id+interaction.user.id);
                collectorMessage.edit({
                    content: `\`\`\`** QUEUE SONGS **\nSongs in queue: ${serverQueue.songs.length}\n\n${last_message}\`\`\``,
                    components: [last_row]
                });
            });
        }
    }
}