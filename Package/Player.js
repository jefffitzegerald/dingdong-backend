const ytdlDiscord = require("youtube-dl-exec").exec;
const scdl = require("soundcloud-downloader").default;
const { youtube } = require("scrape-youtube");
const {
    createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState
} = require("@discordjs/voice");
const { MessageEmbed } = require("discord.js");


/**
 * @param {*} song 
 * @param {string} guild_id 
 * @param {import("./Client").Client} client 
 */
module.exports.play = async(song, guild_id, client) => {
    const queue = client.queue.get(guild_id);
    const connection = client.connection.get(guild_id);
    if(!song) {
        return client.queue.delete(guild_id);
    }

    const clientTrack = new client.clientTrack({ youtube: true, soundcloud: true, spotify: true });
    let youtube_regex = clientTrack.regex.youtube.video.test(song.url);
    let spotify_regex = clientTrack.regex.spotify.track.test(song.url);
    let soundcloud_regex = clientTrack.regex.soundcloud.track.test(song.url);

    try {
        var stream;
        if(youtube_regex) {
            stream = ytdlDiscord(song.url, {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '100K',
            }, { stdio: ["ignore", "pipe", "pipe", "pipe"] }).stdout;
        } else
        if(spotify_regex) {
            let results = await youtube.search(`${song.title} - ${song.author.name} Topic`);
            stream = ytdlDiscord(results.videos[0].link, {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '100K'
            }, { stdio: ["ignore", "pipe", "pipe", "pipe"] }).stdout;
        } else
        if(soundcloud_regex) {
            stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3);
        }
    } catch (error) {
        console.log(error);
        if(queue) {
            queue.songs[0].vote = [];

            if(queue.message) {
                if(!queue.loop.track) {
                    queue.message.delete().catch(console.error);
                    queue.message = null;
                }
            }

            if(queue.audioPlayer) queue.audioPlayer = null;
            if(queue.resource) queue.resource = null;
            
            if(queue.loop.track && !queue.loop.queue) {
                return module.exports.play(queue.songs[0], guild_id, client);
            } else if(!queue.loop.track && queue.loop.queue) {
                let lastSong = queue.songs.shift();
                queue.songs.push(lastSong);
                return module.exports.play(queue.songs[0], guild_id, client);
            } else {
                queue.songs.shift();
                return module.exports.play(queue.songs[0], guild_id, client);
            }
        }
    }

    queue.audioPlayer = createAudioPlayer();
    queue.resource = createAudioResource(stream, { inlineVolume: true });
    queue.resource.volume.setVolume(queue.volume / 100);

    queue.audioPlayer.play(queue.resource);

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        connection.subscribe(queue.audioPlayer);
    } catch (error) {
        if(queue) {
            queue.songs[0].vote = [];

            if(queue.message) {
                if(!queue.loop.track) {
                    queue.message.delete().catch(console.error);
                    queue.message = null;
                }
            }

            if(queue.audioPlayer) queue.audioPlayer = null;
            if(queue.resource) queue.resource = null;
            
            if(queue.loop.track && !queue.loop.queue) {
                return module.exports.play(queue.songs[0], guild_id, client);
            } else if(!queue.loop.track && queue.loop.queue) {
                let lastSong = queue.songs.shift();
                queue.songs.push(lastSong);
                return module.exports.play(queue.songs[0], guild_id, client);
            } else {
                queue.songs.shift();
                return module.exports.play(queue.songs[0], guild_id, client);
            }
        }
    }

    queue.resource.playStream
        .on("end", () => {
            if(queue) {
                queue.songs[0].vote = [];

                if(queue.message) {
                    if(!queue.loop.track) {
                        queue.message.delete().catch(console.error);
                        queue.message = null;
                    }
                }
    
                if(queue.audioPlayer) queue.audioPlayer = null;
                if(queue.resource) queue.resource = null;
                
                if(queue.loop.track && !queue.loop.queue) {
                    return module.exports.play(queue.songs[0], guild_id, client);
                } else if(!queue.loop.track && queue.loop.queue) {
                    let lastSong = queue.songs.shift();
                    queue.songs.push(lastSong);
                    return module.exports.play(queue.songs[0], guild_id, client);
                } else {
                    queue.songs.shift();
                    return module.exports.play(queue.songs[0], guild_id, client);
                }
            }
        })
        .on("error", (err) => {
            console.log(err)
            if(queue) {
                queue.songs[0].vote = [];

                if(queue.message) {
                    if(!queue.loop.track) {
                        queue.message.delete().catch(console.error);
                        queue.message = null;
                    }
                }
    
                if(queue.audioPlayer) queue.audioPlayer = null;
                if(queue.resource) queue.resource = null;
                
                if(queue.loop.track && !queue.loop.queue) {
                    return module.exports.play(queue.songs[0], guild_id, client);
                } else if(!queue.loop.track && queue.loop.queue) {
                    let lastSong = queue.songs.shift();
                    queue.songs.push(lastSong);
                    return module.exports.play(queue.songs[0], guild_id, client);
                } else {
                    queue.songs.shift();
                    return module.exports.play(queue.songs[0], guild_id, client);
                }
            }
        });
    
    queue.audioPlayer
        .on("error", (err) => {
            console.log(err);
            if(queue) {
                queue.songs[0].vote = [];
                
                if(queue.message) {
                    if(!queue.loop.track) {
                        queue.message.delete().catch(console.error);
                        queue.message = null;
                    }
                }
    
                if(queue.audioPlayer) queue.audioPlayer = null;
                if(queue.resource) queue.resource = null;
                
                if(queue.loop.track && !queue.loop.queue) {
                    return module.exports.play(queue.songs[0], guild_id, client);
                } else if(!queue.loop.track && queue.loop.queue) {
                    let lastSong = queue.songs.shift();
                    queue.songs.push(lastSong);
                    return module.exports.play(queue.songs[0], guild_id, client);
                } else {
                    queue.songs.shift();
                    return module.exports.play(queue.songs[0], guild_id, client);
                }
            }
        });
    
    try {
        if(queue.loop.track) {
            if(!queue.message) {
                let embed = new MessageEmbed()
                    .setColor("WHITE")
                    .setTitle("Playing")
                    .setDescription(`[${song.title.length > 67 ? `${song.title.substr(0, 67)}...` : song.title}](${song.ding_dong_url})`)
                    .setThumbnail(song.thumbnails[2] ? song.thumbnails[2].url : song.thumbnails[0].url)
                    .setFooter({ text: `Requested by ${song.userPlayer.tag}` });
                if(song.textChannel) {
                    queue.message = await song.textChannel.send({ embeds: [embed] });
                }
            }
        } else {
            let embed = new MessageEmbed()
                .setColor("WHITE")
                .setTitle("Playing")
                .setDescription(`[${song.title.length > 67 ? `${song.title.substr(0, 67)}...` : song.title}](${song.ding_dong_url})`)
                .setThumbnail(song.thumbnails[2] ? song.thumbnails[2].url : song.thumbnails[0].url)
                .setFooter({ text: `Requested by ${song.userPlayer.tag}` });
            if(song.textChannel) {
                queue.message = await song.textChannel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.log(error);
    }
}