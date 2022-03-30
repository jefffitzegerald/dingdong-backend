const router = require("express").Router();
const { play } = require("../../Package/Player");
const Playlist = require("../data/queue");
const { joinVoiceChannel } = require("@discordjs/voice");

router.post("/", (req, res) => {
    const client = req.client;
    const { guild_id } = req.body;

    const serverQueue = client.queue.get(guild_id);
    return res.json({ isQueue: serverQueue ? true : false, queue: serverQueue ? { songs: serverQueue.songs, loop: serverQueue.loop, playing: serverQueue.playing } : null });
});

router.post("/manage", async(req, res) => {
    const client = req.client;
    let { guild_id, track_url, voiceChannel_id } = req.body;
    
    const connection = client.connection.get(guild_id);
    const guild = client.guilds.cache.get(guild_id);

    if(connection) {
        if(!guild.me.voice.channel) {
            client.connection.delete(guild_id);
            const join = joinVoiceChannel({
                guildId: guild_id,
                channelId: voiceChannel_id,
                adapterCreator: guild.voiceAdapterCreator
            });
            client.connection.set(guild_id, join);
        }
    } else{
        if(guild.me.voice.channel) {
            const join = joinVoiceChannel({
                guildId: guild_id,
                channelId: guild.me.voice.channel.id,
                adapterCreator: guild.voiceAdapterCreator
            });
            client.connection.set(guild_id, join);
        } else {
            const join = joinVoiceChannel({
                guildId: guild_id,
                channelId: voiceChannel_id,
                adapterCreator: guild.voiceAdapterCreator
            });
            client.connection.set(guild_id, join);
        }
    }

    let clientTrack = new client.clientTrack({ youtube: true, spotify: true });
    const serverQueue = client.queue.get(guild_id);
    const queueConstruct = {
        loop: {
            track: false,
            queue: false
        },
        songs: [],
        audioPlayer: null,
        resource: null,
        message: null,
        volume: 100,
        playing: false
    }

    let song = null;
    let songInfo = null;

    if(clientTrack.regex.spotify.track.test(track_url)) {

        try {
            songInfo = await clientTrack.spotify.getInfo(track_url);
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
                textChannel: null,
                userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                vote: []
            }
        } catch (error) {
            return console.log(error);
        }

    } else if(clientTrack.regex.youtube.video.test(track_url)) {

        try {
            songInfo = await clientTrack.youtube.getInfo(track_url);
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
                textChannel: null,
                userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                vote: []
            }
        } catch (error) {
            return console.log(error);
        }

    }

    let data;
    if(serverQueue) {
        serverQueue.songs.push(song);
        data = serverQueue.songs;
    } else {
        queueConstruct.songs.push(song);
        data = queueConstruct.songs;
    }

    if(!serverQueue) client.queue.set(guild_id, queueConstruct);
    return res.json(data);
});

router.post("/pause", (req, res) => {
    const client = req.client;
    const { guild_id } = req.body;

    const serverQueue = client.queue.get(guild_id);
    if(serverQueue.playing) {
        serverQueue.audioPlayer.pause();
        serverQueue.playing = false;
        return res.json({ message: "Successfully pause queue!", playing: serverQueue.playing });
    } else {
        return res.json({ message: "Already pause queue!", playing: serverQueue.playing });
    }
});

router.post("/resume", (req, res) => {
    const client = req.client;
    const { guild_id } = req.body;

    const serverQueue = client.queue.get(guild_id);
    if(!serverQueue.playing) {
        if(serverQueue.audioPlayer) {
            serverQueue.audioPlayer.unpause();
            serverQueue.playing = true;
        } else {
            try {
                serverQueue.playing = true;
                play(serverQueue.songs[0], guild_id, client);
            } catch (error) {
                if(client.connection.has(guild_id)) {
                    client.connection.get(guild_id).destroy();
                    client.connection.delete(guild_id);
                }
                client.queue.delete(guild_id);
            }
        }
        return res.json({ message: "Successfully resume queue!", playing: serverQueue.playing });
    } else {
        return res.json({ message: "Already resume queue!", playing: serverQueue.playing });
    }
});

router.post("/loop", (req, res) => {
    const client = req.client;
    const { guild_id, type } = req.body;

    const serverQueue = client.queue.get(guild_id);
    if(type.toLowerCase() === "off") {
        serverQueue.loop.track = false;
        serverQueue.loop.queue = false;
    } else if(type.toLowerCase() === "queue") {
        serverQueue.loop.track = false;
        serverQueue.loop.queue = true;
    } else if(type.toLowerCase() === "track") {
        serverQueue.loop.track = true;
        serverQueue.loop.queue = false;
    }
    return res.json(serverQueue.loop);
});

router.post("/skip", (req, res) => {
    const client = req.client;
    const { guild_id } = req.body;
    const serverQueue = client.queue.get(guild_id);

    if(serverQueue.message) {
        serverQueue.message.delete().catch(console.error);
    }

    if(serverQueue.audioPlayer) {
        serverQueue.audioPlayer.stop();
        serverQueue.audioPlayer = null;
        serverQueue.resource = null;
    }

    if(serverQueue.loop.queue) {
        let lastSong = serverQueue.songs.shift();
        serverQueue.songs.push(lastSong);
    } else {
        serverQueue.songs.shift();
    }

    if(serverQueue.playing) {
        try {
            play(serverQueue.songs[0], guild_id, client);
        } catch (error) {
            if(client.connection.has(guild_id)) {
                client.connection.get(guild_id).destroy();
                client.connection.delete(guild_id);
            }
            client.queue.delete(guild_id);
        }
    }
    return res.json({ loop: serverQueue.loop });
});

router.post("/playback", (req, res) => {
    const client = req.client;
    const { guild_id } = req.body;
    const serverQueue = client.queue.get(guild_id);

    if(serverQueue) {

        let data = {
            resource: serverQueue.resource ? true : false,
            current_time: serverQueue.resource ? serverQueue.resource.playbackDuration : null,
            duration: serverQueue.songs[0].duration
        }
    
        return res.json(data);

    }
});

router.post("/playback/set", (req, res) => {
    const client = req.client;
    const { guild_id, value } = req.body;
    const serverQueue = client.queue.get(guild_id);

    serverQueue.audioPlayer.state.playbackDuration = value;
    serverQueue.resource.playbackDuration = value;

    console.log(serverQueue.audioPlayer.state.playbackDuration);
    console.log(serverQueue.resource.playbackDuration);

    return res.json({ current_time: serverQueue.resource.playbackDuration });
});

router.post("/prev", (req, res) => {
    const client = req.client;
    const { guild_id } = req.body;
    const serverQueue = client.queue.get(guild_id);

    if(serverQueue.message) {
        serverQueue.message.delete().catch(console.error);
    }

    if(serverQueue.audioPlayer) {
        serverQueue.audioPlayer.stop();
        serverQueue.audioPlayer = null;
        serverQueue.resource = null;
    }

    let previousSong = serverQueue.songs.pop();
    let songs = serverQueue.songs.splice(0, serverQueue.songs.length);


    serverQueue.songs.push(previousSong);
    for(let song of songs) {
        serverQueue.songs.push(song);
    }

    if(serverQueue.playing) {
        try {
            play(serverQueue.songs[0], guild_id, client);
        } catch (error) {
            if(client.connection.has(guild_id)) {
                client.connection.get(guild_id).destroy();
                client.connection.delete(guild_id);
            }
            client.queue.delete(guild_id);
        }
    }
    return res.json({ loop: serverQueue.loop });
});

router.post("/volume", (req, res) => {
    const client = req.client;
    const { guild_id, value } = req.body;
    const serverQueue = client.queue.get(guild_id);

    if(serverQueue) {

        serverQueue.volume = parseInt(value);
        if(serverQueue.resource) serverQueue.resource.volume.setVolume(parseInt(value) / 100);

        return res.json({ volume: serverQueue.volume });
    }
});

router.post("/remove/:track_id", (req, res) => {
    if(!req.params.track_id) return res.json({ error: "Cannot defined track_id", error_code: 400 });

    const client = req.client;
    const { guild_id } = req.body;
    const serverQueue = client.queue.get(guild_id);

    let index = serverQueue.songs.map(i => { return i.request_id }).indexOf(req.params.track_id);
    let song = serverQueue.songs.splice(index, 1);

    return res.json({ queue: serverQueue.songs, remove_song: song[0], index: index });
});

router.post("/playlist/:id/add", async(req, res) => {
    const client = req.client;

    let { guild_id, voiceChannel_id } = req.body;
    const connection = client.connection.get(guild_id);

    if(!req.params.id) return res.json({ error: "cannot defined playlist id!", error_code: 400 });

    let playlists = await Playlist.findOne({ userId: req.session.user.id });
    if(!playlists) return res.json({ error: { message: "This user doesn't have any playlist!" } });

    let index = playlists.playlist.map(i => { return i.id }).indexOf(req.params.id);
    let playlist = playlists.playlist[index];

    const guild = client.guilds.cache.get(guild_id);
    if(connection) {
        if(!guild.me.voice.channel) {
            client.connection.delete(guild_id);
            const join = joinVoiceChannel({
                guildId: guild_id,
                channelId: voiceChannel_id,
                adapterCreator: guild.voiceAdapterCreator
            });
            client.connection.set(guild_id, join);
        }
    } else{
        if(guild.me.voice.channel) {
            const join = joinVoiceChannel({
                guildId: guild_id,
                channelId: guild.me.voice.channel.id,
                adapterCreator: guild.voiceAdapterCreator
            });
            client.connection.set(guild_id, join);
        } else {
            const join = joinVoiceChannel({
                guildId: guild_id,
                channelId: voiceChannel_id,
                adapterCreator: guild.voiceAdapterCreator
            });
            client.connection.set(guild_id, join);
        }
    }

    let clientTrack = new client.clientTrack({ youtube: true, spotify: true });
    const serverQueue = client.queue.get(guild_id);
    const queueConstruct = {
        loop: {
            track: false,
            queue: false
        },
        songs: [],
        audioPlayer: null,
        resource: null,
        message: null,
        volume: 100,
        playing: false
    }

    if(playlist.items.length > 0) {

        if(serverQueue) {
            for (let item of playlist.items) {

                let song = null;
                let songInfo = null;
                let track_url = item.track.url;

                if(clientTrack.regex.spotify.track.test(track_url)) {

                    try {
                        songInfo = await clientTrack.spotify.getInfo(track_url);
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
                            textChannel: null,
                            userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                            vote: []
                        }
                    } catch (error) {
                        return console.log(error);
                    }
            
                } else if(clientTrack.regex.youtube.video.test(track_url)) {
            
                    try {
                        songInfo = await clientTrack.youtube.getInfo(track_url);
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
                            textChannel: null,
                            userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                            vote: []
                        }
                    } catch (error) {
                        return console.log(error);
                    }
            
                } else if(clientTrack.regex.soundcloud.track.test(track_url)) {
                    try {
                        songInfo = await clientTrack.soundcloud.getInfo(track_url);
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
                            textChannel: null,
                            userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                            vote: []
                        }
                    } catch (error) {
                        return console.log(error);
                    }
                }

                serverQueue.songs.push(song);

            }
        } else {

            for (let item of playlist.items) {

                let song = null;
                let songInfo = null;
                let track_url = item.track.url;

                if(clientTrack.regex.spotify.track.test(track_url)) {

                    try {
                        songInfo = await clientTrack.spotify.getInfo(track_url);
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
                            textChannel: null,
                            userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                            vote: []
                        }
                    } catch (error) {
                        return console.log(error);
                    }
            
                } else if(clientTrack.regex.youtube.video.test(track_url)) {
            
                    try {
                        songInfo = await clientTrack.youtube.getInfo(track_url);
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
                            textChannel: null,
                            userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                            vote: []
                        }
                    } catch (error) {
                        return console.log(error);
                    }
            
                } else if(clientTrack.regex.soundcloud.track.test(track_url)) {
                    try {
                        songInfo = await clientTrack.soundcloud.getInfo(track_url);
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
                            textChannel: null,
                            userPlayer: client.users.cache.get(req.session.user.connection.discord.user.id),
                            vote: []
                        }
                    } catch (error) {
                        return console.log(error);
                    }
                }

                queueConstruct.songs.push(song);

            }

        }

    }

    if(!serverQueue) client.queue.set(guild_id, queueConstruct);
    return res.json({ message: "Successfully add to queue!" });
});

router.post("/connection", (req, res) => {
    const { guild_id } = req.body;
    const client = req.client;
    const guild = client.guilds.cache.get(guild_id);

    const connection = client.connection.get(guild_id);
    if(connection && guild.me.voice.channel) {
        return res.json({ is_join: true });
    } else {
        return res.json({ is_join: false });
    }
});

router.post("/connection/leave", (req, res) => {
    const { guild_id } = req.body;
    const client = req.client;

    const serverQueue = client.queue.get(guild_id);
    const connection = client.connection.get(guild_id);

    if(serverQueue) {
        if(serverQueue.message) {
            serverQueue.message.delete().catch(console.error);
        }
        client.queue.delete(guild_id);
    }

    if(connection) {
        connection.destroy();
        client.connection.delete(guild_id);
    }
    return res.json({ message: "Successfully leave voice channel!" });
});

module.exports = router;