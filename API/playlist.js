const fs = require("fs");
const Playlist = require("../data/queue");
const router = require("express").Router();

const ytdl = require("ytdl-core");
const scdl = require("soundcloud-downloader").default;

router.post("/start", async(req, res) => {

    let { id } = req.body;
    const playlists = await Playlist.findOne({ userId: req.session.user.id });

    let i = playlists.playlist.map(i => { return i.id }).indexOf(id);
    let playlist = playlists.playlist[i];

    let items = playlist.items;
    if(!items.length) return res.json({ items: [] });
    else return res.json({ items: items });

});

router.post("/download", async(req, res) => {

    let { url, request_id } = req.body;
    
    const client = req.client;
    const clientTrack = new client.clientTrack({ youtube: true, soundcloud: true, spotify: true });

    let stream;
    if(clientTrack.regex.youtube.video.test(url)) stream = ytdl(url, { filter: f => f.hasAudio === true && f.hasVideo === false });
    else if(clientTrack.regex.soundcloud.track.test(url)) stream = await scdl.download(url);
    else if(clientTrack.regex.spotify.track.test(url)) {

        let songInfo = await clientTrack.spotify.getInfo(url);
        let results = await clientTrack.youtube.search(`${songInfo.title} - ${songInfo.author.name} Topic`);
        stream = ytdl(results[0].url, { filter: f => f.hasAudio === true && f.hasVideo === false });

    }

    if(req.session.playlist_id) {

        fs.readFile(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`, (err, file) => {
            if(err) {
                
                stream.pipe(fs.createWriteStream(`./src/storage/playlist/${request_id}_${req.session.id}.mp3`));
                req.session.playlist_id = request_id;

            } else {

                try {
                    fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
                } catch (error) {
                    console.log(error);
                }

                stream.pipe(fs.createWriteStream(`./src/storage/playlist/${request_id}_${req.session.id}.mp3`));
                req.session.playlist_id = request_id;

            }
            return res.json({ filename: `${request_id}_${req.session.id}.mp3`, path: `storage/playlist` });
        });

    } else {

        stream.pipe(fs.createWriteStream(`./src/storage/playlist/${request_id}_${req.session.id}.mp3`));
        req.session.playlist_id = request_id;
        return res.json({ filename: `${request_id}_${req.session.id}.mp3`, path: `storage/playlist` });

    }

});

module.exports = router;