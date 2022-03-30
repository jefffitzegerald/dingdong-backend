/**
 * @param {import("express").Application} app 
 * @param {import("../Package/Client").Client} client 
 */
 module.exports = (app, client) => {
    app.get("/", (req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        req.session.r = "/";
        req.session.search = null;

        const fs = require("fs");
        if(req.session.title) {
            try {
                fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
            } catch (error) {
                
            }
            try {
                fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
            } catch (error) {
    
            }
            req.session.title = undefined;
        }

        if(req.session.playlist_id) {

            try {
                
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
    
            } catch (error) {
                
            }
            
            req.session.playlist_id = undefined;
        }
        
        res.render(`${req.views}/index`, { req, bot: client, r: "/" });
        
    });

    app.get("/redirect", async(req, res) => {
        if(!req.query.url_site) return res.redirect("/");
        let url = decodeURIComponent(req.query.url_site);
        let expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        let regex = new RegExp(expression);

        if(regex.test(url)) return res.redirect(url);
        else return res.redirect("/");
    });

    app.get("/about", (req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        req.session.r = "/about";
        req.session.search = null;

        const fs = require("fs");
        const guild = client.guilds.cache.get("772740285221699624");

        if(req.session.title) {
            try {
                fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
            } catch (error) {
                
            }
            try {
                fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
            } catch (error) {
    
            }
            req.session.title = undefined;
        }

        if(req.session.playlist_id) {

            try {
                
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
    
            } catch (error) {
                
            }
            
            req.session.playlist_id = undefined;
        }
        
        res.render(`${req.views}/about`, { req, bot: client, r: "/about", guild, queue: client.queue.get("772740285221699624") });
    });

    app.get("/membership", (req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        req.session.r = "/membership";
        req.session.search = null;
        const fs = require("fs");

        if(req.session.title) {
            try {
                fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
            } catch (error) {
                
            }
            try {
                fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
            } catch (error) {
    
            }
            req.session.title = undefined;
        }

        if(req.session.playlist_id) {

            try {
                
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
    
            } catch (error) {
                
            }
            
            req.session.playlist_id = undefined;
        }

        res.render(`${req.views}/membership`, { req, bot: client, r: "/membership" });
    });

    app.get("/search", async(req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        req.session.r = "/search";
        const fs = require("fs");

        if(!req.query.type && req.query.search) return res.redirect(`/search?type=youtube&search=${req.query.search}`);
        if(req.query.type) {
            if(!isType(req.query.type)) return res.redirect(`/search`);
        }

        let type = "";
        const search = new client.clientTrack({ youtube: true, soundcloud: true, spotify: true });

        let results = null;
        if(req.query.search) {
            if(req.query.type === "placeholder" || req.query.type === "youtube") {
                type += "youtube";
                results = await search.youtube.search(req.query.search.split("+").join(" "), { maxResults: 15 });
            }
            if(req.query.type === "spotify") {
                type += "spotify";
                results = await search.spotify.search(req.query.search.split("+").join(" "), { maxResults: 15 });
            }
            if(req.query.type === "soundcloud") {
                type += "soundcloud"
                results = await search.soundcloud.search(req.query.search.split("+").join(" "), { maxResults: 15 });
            }
        }

        req.session.search = {
            type: type.length ? type : "",
            query: req.query.search ? req.query.search : ""
        }

        if(req.session.title) {
            try {
                fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
            } catch (error) {
                
            }
            try {
                fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
            } catch (error) {
    
            }
            req.session.title = undefined;
        }

        if(req.session.playlist_id) {

            try {
                
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
    
            } catch (error) {
                
            }
            
            req.session.playlist_id = undefined;
        }

        res.render(`${req.views}/search`, { req, bot: client, search, results: req.query.search ? results : null, type, r: "/search" });
                
    });

    app.get("/youtube", (req, res) => res.redirect("/search?type=youtube"));
    app.get("/spotify", (req, res) => res.redirect("/search?type=spotify"));
    app.get("/soundcloud", (req, res) => res.redirect("/search?type=soundcloud"));

    app.get("/youtube/:id", async(req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        if(!req.params.id) return res.redirect("/search?type=youtube");
        req.session.r = `/youtube/${req.params.id}`;

        const fs = require("fs");
        const ytdl = require("ytdl-core");

        let videoInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${req.params.id}`);
        let clientTrack = new client.clientTrack({ youtube: true });
        if(!videoInfo) return res.redirect("/search?type=youtube");

        let video = await clientTrack.youtube.getInfo(`https://youtube.com/watch?v=${req.params.id}`);
        let stream = ytdl(video.url, { filter: f => f.hasAudio === true && f.hasVideo === true });

        if(req.session.playlist_id) {

            try {
                
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
    
            } catch (error) {
                
            }
            
            req.session.playlist_id = undefined;
        }

        if(req.session.title) {
            fs.readFile(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`, (err, file) => {
                if(err) {
                    stream.pipe(fs.createWriteStream(`./src/storage/video/${video.id}_${req.session.id}.mp4`));
                    req.session.title = video.id;
                } else {
                    if(req.session.title !== video.id) {
                        try {
                            fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
                        } catch (error) {
                            console.log(error);
                        }
                        stream.pipe(fs.createWriteStream(`./src/storage/video/${video.id}_${req.session.id}.mp4`));
                        req.session.title = video.id;
                    }
                }
                setTimeout(() => {
                    res.render(`${req.views}/youtube`, { bot: client, req, video, type: "youtube", r: `/youtube/${req.params.id}` });
                }, 2000);
            });
        } else {

            stream.pipe(fs.createWriteStream(`./src/storage/video/${video.id}_${req.session.id}.mp4`));
            req.session.title = video.id;
            
            setTimeout(() => {
                res.render(`${req.views}/youtube`, { bot: client, req, video, type: "youtube", r: `/youtube/${req.params.id}` });
            }, 2000);

        }
    });

    app.get("/spotify/:id", async(req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        if(!req.params.id) return res.redirect("/search?type=spotify");
        req.session.r = `/spotify/${req.params.id}`;

        const fs = require("fs");
        const spdl = require("spdl-core").default;

        let trackInfo = null
        try {
            trackInfo = await spdl.getInfo(`https://open.spotify.com/track/${req.params.id}`);
        } catch (error) {
            return res.redirect("/search?type=spotify");
        }

        function msToTime(s) {
            var ms = s % 1000;
            s = (s - ms) / 1000;
            var secs = s % 60;
            s = (s - secs) / 60;
            var mins = s % 60;
            var hrs = (s - mins) / 60;
            return (hrs > 0 ? (hrs < 10 ? "0"+hrs : hrs)+":" : "") + (mins < 10 ? "0"+mins : mins) + ':' + (secs < 10 ? "0"+secs : secs);
        }
        let duration = msToTime(trackInfo.duration);

        let clientTrack = new client.clientTrack({ spotify: true });
        let track = await clientTrack.spotify.getInfo(trackInfo.url);
        
        let { youtube } = require("scrape-youtube");
        let ytdl = require("ytdl-core");

        let search = await youtube.search(`${trackInfo.title} - ${trackInfo.artist} Topic`);
        let stream = ytdl(search.videos[0].link, { filter: f => f.hasAudio === true });

        track.title = track.title
            .replaceAll('"', "").replaceAll("\\", "")
            .replaceAll("/", "").replaceAll(":", "")
            .replaceAll("*", "").replaceAll("?", "")
            .replaceAll("<", "").replaceAll(">", "")
            .replaceAll("|", "");
        
        if(req.session.playlist_id) {

            try {
                
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);

            } catch (error) {
                    
            }
            
            req.session.playlist_id = undefined;
        }
        
        if(req.session.title) {
            fs.readFile(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`, (err, file) => {
                if(err) {
                    stream.pipe(fs.createWriteStream(`./src/storage/audio/${track.id}_${req.session.id}.mp3`));
                    req.session.title = track.id;
                } else {
                    if(req.session.title !== track.id) {
                        try {
                            fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
                        } catch (error) {
                            console.log(error);
                        }
                        stream.pipe(fs.createWriteStream(`./src/storage/audio/${track.id}_${req.session.id}.mp3`));
                        req.session.title = track.id;
                    }
                }
                setTimeout(() => {
                    res.render(`${req.views}/spotify`, { bot: client, req, track, msToTime, duration, type: "spotify", r: `/spotify/${req.params.id}` });
                }, 2000);
            });
        } else {
            stream.pipe(fs.createWriteStream(`./src/storage/audio/${track.id}_${req.session.id}.mp3`));
            req.session.title = track.id;
            setTimeout(() => {
                res.render(`${req.views}/spotify`, { bot: client, req, track, msToTime, duration, type: "spotify", r: `/spotify/${req.params.id}` });
            }, 2000);
        }
    });

    app.get("/soundcloud/:author_permalink/:permalink", async(req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        if(!req.params.author_permalink) return res.redirect("/search?type=soundcloud");
        if(!req.params.permalink) return res.redirect("/search?type=soundcloud");

        req.session.r = `/soundcloud/${req.params.author_permalink}/${req.params.permalink}`;
        const fs = require("fs");
        const scdl = require("soundcloud-downloader").default;
        const trackInfo = new client.clientTrack({ soundcloud: true });

        let track = null;
        try {
            track = await trackInfo.soundcloud.getInfo(`https://soundcloud.com/${req.params.author_permalink}/${req.params.permalink}`);
        } catch (error) {
            console.log(error);
            return res.redirect("/search?type=soundcloud");
        }

        track.title = track.title
            .replaceAll('"', "").replaceAll("\\", "")
            .replaceAll("/", "").replaceAll(":", "")
            .replaceAll("*", "").replaceAll("?", "")
            .replaceAll("<", "").replaceAll(">", "")
            .replaceAll("|", "");

        let stream = await scdl.download(track.url);

        if(req.session.playlist_id) {

            try {
                
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
    
            } catch (error) {
                
            }
            
            req.session.playlist_id = undefined;
        }

        if(req.session.title) {
            fs.readFile(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`, (err, file) => {
                if(!err) {
                    try {
                        fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
                    } catch (error) {
                        console.log(error);
                    }
                    stream.pipe(fs.createWriteStream(`./src/storage/audio/${track.id}_${req.session.id}.mp3`));
                } else {
                    stream.pipe(fs.createWriteStream(`./src/storage/audio/${track.id}_${req.session.id}.mp3`));
                }
                req.session.title = track.id;
                setTimeout(() => {
                    res.render(`${req.views}/soundcloud`, { bot: client, req, track, type: "soundcloud", r: `/soundcloud/${req.params.id}` });
                }, 2000);
            });
        } else {
            req.session.title = track.id;
            stream.pipe(fs.createWriteStream(`./src/storage/audio/${track.id}_${req.session.id}.mp3`));
            setTimeout(() => {
                res.render(`${req.views}/soundcloud`, { bot: client, req, track, type: "soundcloud", r: `/soundcloud/${req.params.id}` });
            }, 2000);
        }
    });

    app.get("/download", async(req, res) => {
        if(req.session.number) {
            if(req.session.number >= 10) return res.redirect("/secret");
        }

        const ytdl = require("ytdl-core");
        const scdl = require("soundcloud-downloader").default;
        const clientTrack = new client.clientTrack({ spotify: true });

        const format = req.query.format;
        const type = req.query.type;
        const id = req.query.id;

        if(!type && !id) return res.redirect("/search");
        if(type === "youtube") {
            const video = await ytdl.getInfo(id);
            if(!video) return res.redirect(`/search?error=cannot_find_videoId`);

            let formats = video.formats.filter(f => f.hasAudio === true && f.hasVideo === true).sort((a, b) => a.itag - b.itag);
            res.header("Content-Disposition", `attachment; filename="${video.videoDetails.title}.${format}"`);
            ytdl(video.videoDetails.video_url, { filter: f => f.itag == formats[0].itag }).pipe(res);
        } else if(type === "spotify") {
            const track = await clientTrack.spotify.getInfo(`https://open.spotify.com/track/${id}`);
            
            const { youtube } = require("scrape-youtube");
            const search = await youtube.search(`${track.title} - ${track.artist} Topic`);
            const video = await ytdl.getInfo(search.videos[0].link);

            let formats = video.formats.filter(f => f.hasAudio === true).sort((a, b) => a.itag - b.itag );
            res.header("Content-Disposition", `attachment; filename="${track.title}.${format}"`);
            ytdl(video.videoDetails.video_url, { filter: f => f.itag == formats[0].itag }).pipe(res);
        } else if(type === "soundcloud") {
            let track = await scdl.getInfo(req.query.direct);
            let stream = await scdl.download(track.permalink_url);

            res.header("Content-Disposition", `attachment; filename="${track.title}.${format}"`);
            stream.pipe(res);
        }
    });
}

function isType(type) {
    return type === "youtube" || type === "soundcloud" || type === "spotify";
}