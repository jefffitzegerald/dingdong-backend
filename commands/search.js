const { MessageEmbed } = require("discord.js");
const scdl = require("soundcloud-downloader").default;

module.exports = {
    data: {
        name: "search",
        description: "Search video or track",
        options: [
            {
                name: "type",
                description: "Choose platform",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "Spotify",
                        value: "spotify"
                    },
                    {
                        name: "YouTube",
                        value: "youtube"
                    },
                    {
                        name: "Soundcloud",
                        value: "soundcloud"
                    }
                ]
            },
            {
                name: "title",
                description: "Name of the track or video",
                type: 3,
                required: true
            }
        ]
    },
    public: true,
    /**
     * @param {string} search 
     * @returns 
     */
    async searchYouTube(search) {
        const { youtube } = require("scrape-youtube");
        const results = await youtube.search(search);
        let videos = [];
        for (let video of results.videos.splice(0, 15)) {
            let info = {
                title: `${video.title}`,
                id: `${video.id}`,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                description: `${video.description}`,
                thumbnails: [
                    {
                        height: 90,
                        width: 120,
                        url: `https://i.ytimg.com/vi/${video.id}/default.jpg`
                    },
                    {
                        height: 180,
                        width: 320,
                        url: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`
                    },
                    {
                        height: 360,
                        width: 480,
                        url: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
                    },
                    {
                        height: 720,
                        width: 1280,
                        url: `https://i.ytimg.com/vi/${video.id}/sddefault.jpg`
                    },
                    {
                        height: 1080,
                        width: 1920,
                        url: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`
                    }
                ],
                author: {
                    name: video.channel.name,
                    id: video.channel.id,
                    url: `https://www.youtube.com/channel/${video.channel.id}`,
                    description: "",
                    thumbnail: video.channel.thumbnail
                }
            }
            videos.push(info);
        }
        return videos;
    },
    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../Package/Client").Client} client 
     */
    async run(interaction, client) {
        const type = interaction.options.getString("type");
        const search = interaction.options.getString("title");

        let trackInfo = new client.clientTrack({ soundcloud: true, spotify: true, youtube: true });
        let embed = new MessageEmbed().setColor("WHITE")
            .setTitle("**__Search Results__**")
            .setDescription(`Results of: [${search}](${client.config.domain}/search?type=${type}&search=${search.split(" ").join("+")})`)
            .setFooter({ text: `Reply to ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) });

        if(type.toLowerCase() === "youtube") {
            try {
                let results = await trackInfo.youtube.search(search);
                results.map((track, index) => {
                    embed.addField(`${index+1}). ${track.author.name}`, `[${track.title.length > 67 ? `${track.title.substr(0, 67)}...` : track.title}](${client.config.domain}/youtube/${track.id})`)
                });
            } catch (error) {
                console.log(error);
                return interaction.reply({ content: "There's an error when fetching information!", ephemeral: true });
            }
        }
        if(type.toLowerCase() === "spotify") {
            try {
                let results = await trackInfo.spotify.search(search);
                results.map((track, index) => {
                    embed.addField(`${index+1}). ${track.author.name}`, `[${track.title.length > 67 ? `${track.title.substr(0, 67)}...` : track.title}](${client.config.domain}/spotify/${track.id})`)
                });
            } catch (error) {
                console.log(error);
                return interaction.reply({ content: "There's an error when fetching information!", ephemeral: true });
            }
        }
        if(type.toLowerCase() === "soundcloud") {
            try {
                let results = await trackInfo.soundcloud.search(search);
                results.map((track, index) => {
                    embed.addField(`${index+1}). ${track.author.name}`, `[${track.title.length > 67 ? `${track.title.substr(0, 67)}...` : track.title}](${client.config.domain}/soundcloud/${track.snippet.user.permalink}/${track.snippet.permalink})`);
                });
            } catch (error) {
                console.log(error);
                return interaction.reply({ content: "There's an error when fetching information!", ephemeral: true });
            }
        }
        
        return interaction.reply({ embeds: [embed] }).catch(console.error);
    }
}