const { play } = require("../Package/Player");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: {
        name: "play",
        description: "Playing song in your server",
        options: [
            {
                name: "input",
                description: "Input link or title, or you can play your own queue by type: queue",
                type: 3,
                required: true
            }
        ]
    },
    public: false,
    /**
     * @param {string} url 
     * @returns
     */
    async getVideo(url) {
        let ytdl = require("ytdl-core");
        let video = await ytdl.getInfo(url).then(v => v.videoDetails);
        let info = {
            title: `${video.title}`,
            id: `${video.videoId}`,
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            description: `${video.description}`,
            length_milliSeconds: parseInt(video.lengthSeconds)*1000,
            thumbnails: [
                {
                    height: 90,
                    width: 120,
                    url: `https://i.ytimg.com/vi/${video.videoId}/default.jpg`
                },
                {
                    height: 180,
                    width: 320,
                    url: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`
                },
                {
                    height: 360,
                    width: 480,
                    url: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`
                },
                {
                    height: 720,
                    width: 1280,
                    url: `https://i.ytimg.com/vi/${video.videoId}/sddefault.jpg`
                },
                {
                    height: 1080,
                    width: 1920,
                    url: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`
                }
            ],
            author: {
                name: video.author.name,
                id: video.author.id,
                url: `https://www.youtube.com/channel/${video.channelId}`,
                description: "",
                thumbnail: video.author.thumbnails[2].url
            }
        }
        return info;
    },
    /**
     * @param {string} search 
     * @returns 
     */
    async searchVideos(search) {
        const ytdl = require("ytdl-core");
        const { youtube } = require("scrape-youtube");
        const results = await youtube.search(search);
        let videos = [];
        for (let video of results.videos.splice(0, 15)) {
            let duration = await ytdl.getInfo(video.link).then(v => parseInt(v.videoDetails.lengthSeconds));
            let info = {
                title: `${video.title}`,
                id: `${video.id}`,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                description: `${video.description}`,
                length_milliSeconds: duration*1000,
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
        const search = interaction.options.getString("input");
        const args1 = search.split(" ")[0];

        const fetch = require("node-fetch").default;
        const clientTrack = new client.clientTrack({ spotify: true, soundcloud: true, youtube: true });
        const regex = {
            ding_dong_url: /^(https?:\/\/)?(www\.)?(dingdong-entertainment\.herokuapp\.com|localhost:3002)\/(youtube|spotify|soundcloud)\/([^#\&\?]*).+$/gi.test(args1),
            youtube: {
                video: clientTrack.regex.youtube.video.test(args1),
                playlist: !clientTrack.regex.youtube.video.test(args1) && clientTrack.regex.youtube.playlist.test(args1)
            },
            spotify: {
                track: clientTrack.regex.spotify.track.test(args1),
                playlist: clientTrack.regex.spotify.playlist.test(args1),
                album: clientTrack.regex.spotify.album.test(args1)
            },
            soundcloud: {
                track: clientTrack.regex.soundcloud.track.test(args1),
                sets: clientTrack.regex.soundcloud.sets.test(args1),
                mobile: clientTrack.regex.soundcloud.mobile.test(args1)
            }
        };

        const { joinVoiceChannel } = require("@discordjs/voice");
        const { channel } = interaction.member.voice;
        const connection = client.connection.get(interaction.guild.id);
        const guild = interaction.guild;

        if(!channel) return interaction.reply({ content: "You must join voice channel first!", ephemeral: true });
        if(connection) {
            if(guild.me.voice.channel) {
                if(channel.id !== guild.me.voice.channel.id) return interaction.reply({  content: `You must join the same voice channel with me: <#${guild.me.voice.channel.id}>`, ephemeral: true });
            } else {
                client.connection.delete(guild.id);
                const joinChannel = joinVoiceChannel({
                    guildId: guild.id,
                    channelId: channel.id,
                    adapterCreator: guild.voiceAdapterCreator
                });
                client.connection.set(guild.id, joinChannel);
            }
        } else {
            if(guild.me.voice.channel) {
                if(channel.id !== guild.me.voice.channel.id) {
                    const voiceFilter = guild.me.voice.channel.members.filter(m => m.user.id === client.user.id).first();
                    const joinChannel = joinVoiceChannel({
                        guildId: guild.id,
                        channelId: voiceFilter.voice.channel.id,
                        adapterCreator: guild.voiceAdapterCreator
                    });
                    client.connection.set(guild.id, joinChannel);
                    return interaction.reply({ content: `You must join the same voice channel with me: <#${guild.me.voice.channel.id}>`, ephemeral: true });
                } else {
                    const joinChannel = joinVoiceChannel({
                        guildId: guild.id,
                        channelId: channel.id,
                        adapterCreator: guild.voiceAdapterCreator
                    });
                    client.connection.set(guild.id, joinChannel);
                }
            } else {
                const joinChannel = joinVoiceChannel({
                    guildId: guild.id,
                    channelId: channel.id,
                    adapterCreator: guild.voiceAdapterCreator
                });
                client.connection.set(guild.id, joinChannel);
            }
        }

        if(regex.youtube.playlist) return;
        if(regex.spotify.playlist) return;
        if(regex.spotify.album) return;

        const serverQueue = client.queue.get(interaction.guild.id);
        let songs = serverQueue ? serverQueue.songs : null;
        const queueConstuct = {
            loop: {
                track: false,
                queue: false
            },
            songs: [],
            audioPlayer: null,
            resource: null,
            message: null,
            volume: 100,
            playing: true
        }

        let song = null;
        let songInfo = null;

        if(regex.ding_dong_url) {
            try {
                let split_url = args1.split("/");
                let type = split_url[3];
                let id = split_url[4];

                if(type.toLowerCase() === "youtube") songInfo = await clientTrack.youtube.getInfo(`https://youtube.com/watch?v=${id}`);
                if(type.toLowerCase() === "spotify") songInfo = await clientTrack.spotify.getInfo(`https://open.spotify.com/track/${id}`);
                if(type.toLowerCase() === "soundcloud") {
                    const scdl = require("soundcloud-downloader").default;
                    const url = await scdl.getTrackInfoByID([parseInt(id)]).then(track => track[0].permalink_url);
                    songInfo = await clientTrack.soundcloud.getInfo(url);
                }

                song = {
                    title: songInfo.title,
                    url: songInfo.url,
                    id: songInfo.id,
                    request_id: client.generateId(10),
                    ding_dong_url: `${client.config.domain}/${type}/${songInfo.id}`,
                    thumbnails: songInfo.thumbnails,
                    duration: songInfo.length_milliSeconds,
                    author: {
                        name: songInfo.author.name,
                        url: songInfo.author.url.length < 1 ? "" : songInfo.author.url
                    },
                    textChannel: interaction.channel,
                    userPlayer: interaction.user,
                    vote: []
                }
            } catch (error) {
                interaction.reply({ content: "There's something wrong while fetching the track!", ephemeral: true });
                return console.log(error);
            }
        } else if(regex.youtube.video) {
            try {
                songInfo = await clientTrack.youtube.getInfo(args1);
                song = {
                    title: songInfo.title,
                    url: `https://youtube.com/watch?v=${songInfo.id}`,
                    id: songInfo.id,
                    request_id: client.generateId(10),
                    ding_dong_url: `${client.config.domain}/youtube/${songInfo.id}`,
                    thumbnails: songInfo.thumbnails,
                    duration: songInfo.length_milliSeconds,
                    author: {
                        name: songInfo.author.name,
                        url: `https://youtube.com/channel/${songInfo.author.id}`
                    },
                    textChannel: interaction.channel,
                    userPlayer: interaction.user,
                    vote: []
                }
            } catch (error) {
                interaction.reply({ content: "There's something wrong while fetching the track!", ephemeral: true });
                return console.log(error);
            }
        } else if(regex.spotify.track) {
            try {
                songInfo = await clientTrack.spotify.getInfo(args1);
                song = {
                    title: songInfo.title,
                    url: `https://open.spotify.com/track/${songInfo.id}`,
                    id: songInfo.id,
                    request_id: client.generateId(10),
                    ding_dong_url: `${client.config.domain}/spotify/${songInfo.id}`,
                    thumbnails: songInfo.thumbnails,
                    duration: songInfo.length_milliSeconds,
                    author: {
                        name: songInfo.author.name,
                        url: ""
                    },
                    textChannel: interaction.channel,
                    userPlayer: interaction.user,
                    vote: []
                }
            } catch (error) {
                interaction.reply({ content: "There's something wrong while fetching the track!", ephemeral: true });
                return console.log(error);
            }
        } else if(regex.soundcloud.track) {
            try {
                if(regex.soundcloud.sets) return;
                songInfo = await clientTrack.spotify.getInfo(args1);
                song = {
                    title: songInfo.title,
                    url: songInfo.url,
                    id: songInfo.id,
                    request_id: client.generateId(10),
                    ding_dong_url: `${client.config.domain}/soundcloud/${songInfo.id}`,
                    thumbnails: songInfo.thumbnails,
                    duration: songInfo.length_milliSeconds,
                    author: {
                        name: songInfo.author.name,
                        url: songInfo.author.url
                    },
                    textChannel: interaction.channel,
                    userPlayer: interaction.user,
                    vote: []
                }
            } catch (error) {
                interaction.reply({ content: "There's something wrong while fetching the track!", ephemeral: true });
                return console.log(error);
            }
        } else if(regex.soundcloud.mobile) {
            try {
                let response = await fetch(args1, { method: "GET" });
                songInfo = await clientTrack.soundcloud.getInfo(response.url);
                song = {
                    title: songInfo.title,
                    url: songInfo.url,
                    id: songInfo.id,
                    request_id: client.generateId(10),
                    ding_dong_url: `${client.config.domain}/soundcloud/${songInfo.id}`,
                    thumbnails: songInfo.thumbnails,
                    duration: songInfo.length_milliSeconds,
                    author: {
                        name: songInfo.author.name,
                        url: songInfo.author.url
                    },
                    textChannel: interaction.channel,
                    userPlayer: interaction.user,
                    vote: []
                }
            } catch (error) {
                interaction.reply({ content: "There's something wrong while fetching the track!", ephemeral: true });
                return console.log(error);
            }
        } else {
            try {
                let search_tracks = await this.searchVideos(search);
                songInfo = await this.getVideo(search_tracks[0].url);
                song = {
                    title: songInfo.title,
                    url: songInfo.url,
                    id: songInfo.id,
                    request_id: client.generateId(10),
                    ding_dong_url: `${client.config.domain}/youtube/${songInfo.id}`,
                    thumbnails: songInfo.thumbnails,
                    duration: songInfo.length_milliSeconds,
                    author: {
                        name: songInfo.author.name,
                        url: songInfo.author.url
                    },
                    textChannel: interaction.channel,
                    userPlayer: interaction.user,
                    vote: []
                }
            } catch (error) {
                interaction.reply({ content: "There's something wrong while fetching the track!", ephemeral: true });
                return console.log(error);
            }
        }

        let embed = new MessageEmbed()
            .setColor("WHITE")
            .setAuthor({ name: "Added To Queue" })
            .setTitle(song.title.length > 67 ? `${song.title.substr(0, 67)}...` : song.title)
            .setURL(song.ding_dong_url)
            .setThumbnail(song.thumbnails[2] ? song.thumbnails[2].url : song.thumbnails[0].url)
            .addFields(
                {
                    name: "Author",
                    value: `${song.author.name}`,
                    inline: true
                },
                {
                    name: "Duration",
                    value: client.msToTime(song.duration),
                    inline: true
                },
                {
                    name: "Requested User",
                    value: `<@${song.userPlayer.id}>`,
                    inline: true
                }
            );

        if(serverQueue) {
            serverQueue.songs.push(song);
        } else {
            queueConstuct.songs.push(song);
        }

        interaction
            .reply({ embeds: [embed] })
            .catch(console.error);
        
        if(serverQueue) {
            if(!serverQueue.audioPlayer && !serverQueue.resource) {
                if(songs.length < 2) {
                    try {
                        play(songs[0], interaction.guild.id, client);
                    } catch (error) {
                        console.log(error);
                        if(client.connection.has(interaction.guild.id)) {
                            client.connection.get(interaction.guild.id).destroy();
                            client.connection.delete(interaction.guild.id);
                        }
                        return client.queue.delete(interaction.guild.id);
                    }
                }
            }
        }

        if(!serverQueue) client.queue.set(interaction.guild.id, queueConstuct);
        if(!serverQueue) {
            try {
                play(queueConstuct.songs[0], interaction.guild.id, client);
            } catch (error) {
                console.log(error);
                if(client.connection.has(interaction.guild.id)) {
                    client.connection.get(interaction.guild.id).destroy();
                    client.connection.delete(interaction.guild.id);
                }
                return client.queue.delete(interaction.guild.id);
            }
        }
    }
}