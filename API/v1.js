const router = require("express").Router();

let error1 = {
    error: {
        message: "Bad request: cannot defined {component}",
        code: 400
    }
}
let error2 = {
    error: {
        message: "Cannot find track!",
        code: 404
    }
}

router.get("/:type", async(req, res) => {
    let types = ["youtube", "spotify", "soundcloud"];
    if(!types.includes(req.params.type)) {
        let error_json = {
            error: {
                message: "Cannot find Type",
                code: 400
            }
        }
        return res.json(error_json);
    }

    let error = {
        error: {
            method: "POST",
            message: "Wrong type GET",
            code: 400
        }
    }
    return res.json(error);
});

router.post("/search", async(req, res) => {
    let types = ["spotify", "youtube", "spotify"];
    const client = req.client;
    const trackInfo = new client.clientTrack({ spotify: true, youtube: true, soundcloud: true });
    const body = req.body;

    if(!body.query && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "QUERY and Type");
        return res.json(error1);
    } else if(!body.query && body.type) {
        error1.error.message = error1.error.message.replace("{component}", "QUERY");
        return res.json(error1);
    } else if(body.query && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "Type");
        return res.json(error1);
    }

    if(!types.includes(body.type.toLowerCase())) {
        let errorType = {
            error: {
                message: "Wrong type input",
                code: 400
            }
        }
        return res.json(errorType);
    }

    try {

        let type = body.type.toLowerCase();
        if(type === "youtube") {
            let songInfo = await trackInfo.youtube.search(body.query, { maxResults: 10 });
            return res.json({ id: req.sessionID, track: songInfo });
        }
        if(type === "soundcloud") {
            return res.json({ error: { message: "Type is deprecated!", error: 404 } });
        }
        if(type === "spotify") {
            let songInfo = await trackInfo.spotify.search(body.query, { maxResults: 10 });
            return res.json({ id: req.sessionID, track: songInfo });
        }

    } catch (error) {
        return res.json({ error: { message: "There's an error while fetching information!", error: 400 } });
    }
});

router.post("/spotify", async(req, res) =>{
    let types = ["track", "album", "playlist"];
    const client = req.client;
    const trackInfo = new client.clientTrack({ spotify: true });
    const body = req.body;

    if(!body.id && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "ID and Type");
        return res.json(error1);
    } else if(!body.id && body.type) {
        error1.error.message = error1.error.message.replace("{component}", "ID");
        return res.json(error1);
    } else if(body.id && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "Type");
        return res.json(error1);
    }

    if(!types.includes(body.type.toLowerCase())) {
        let errorType = {
            error: {
                message: "Wrong type input",
                code: 400
            }
        }
        return res.json(errorType);
    }

    try {
        if(body.type.toLowerCase() === "track") {
            const track = await trackInfo.spotify.getInfo(`https://open.spotify.com/track/${body.id}`);
            let request = {
                id: req.session.id,
                track: track
            }
            return res.json(request);
        }
        if(body.type.toLowerCase() === "playlist" || body.type.toLowerCase() === "album") {
            const playlist_album = await trackInfo.spotify.getPlaylistInfo(`https://open.spotify.com/${body.type.toLowerCase()}/${body.id}`);
            let request = {
                id: req.session.id,
                playlist_album: playlist_album
            }
            return res.json(request);
        }
    } catch (error) {
        return res.json(error2);
    }
});

router.post("/youtube", async(req, res) => {
    const body = req.body;
    const client = req.client;

    let types = ["video"];
    let clientTrack = new client.clientTrack({ youtube: true });

    if(!body.id && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "ID and Type");
        return res.json(error1);
    } else if(!body.id && body.type) {
        error1.error.message = error1.error.message.replace("{component}", "ID");
        return res.json(error1);
    } else if(body.id && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "Type");
        return res.json(error1);
    }
    if(!types.includes(body.type.toLowerCase())) {
        let errorType = {
            error: {
                message: "Wrong type input",
                code: 400
            }
        }
        return res.json(errorType);
    }

    try {
        const video = await clientTrack.youtube.getInfo(`https://youtube.com/watch?v=${body.id}`);
        return res.json(video);
    } catch (error) {
        return res.json(error2);
    }
});

router.post("/soundcloud", async(req, res) => {
    const body = req.body;
    const client = req.client;
    let types = ["sets", "track"];
    const fetch = require("node-fetch").default;
    const trackInfo = new client.clientTrack({ soundcloud: true });

    if(!body.url && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "URL and Type");
        return res.json(error1);
    } else if(!body.url && body.type) {
        error1.error.message = error1.error.message.replace("{component}", "URL");
        return res.json(error1);
    } else if(body.url && !body.type) {
        error1.error.message = error1.error.message.replace("{component}", "Type");
        return res.json(error1);
    }
    if(!types.includes(body.type.toLowerCase())) {
        let errorType = {
            error: {
                message: "Wrong type input",
                code: 400
            }
        }
        return res.json(errorType);
    }

    const mobileRegex = trackInfo.regex.soundcloud.mobile.test(body.url);

    try {
        let info = null;
        if(mobileRegex) {
            let response = await fetch(body.url);
            if(body.type.toLowerCase() === "sets") info = await trackInfo.soundcloud.getSetsInfo(response.url);
            if(body.type.toLowerCase() === "track") info = await trackInfo.soundcloud.getInfo(response.url);
        } else {
            if(body.type.toLowerCase() === "sets") info = await trackInfo.soundcloud.getSetsInfo(body.url);
            if(body.type.toLowerCase() === "track") info = await trackInfo.soundcloud.getInfo(body.url);
        }
        let request = {
            id: req.session.id,
            track: info
        }
        return res.json(request);
    } catch (error) {
        return res.json(error2);
    }
});

router.post("/secret", async(req, res) => {
    if(req.session.secret) req.session.secret += 1;
    else req.session.secret = 1;

    if(req.session.secret == 10) {
        return res.redirect("/");
    } else {
        return res.json({ number: req.session.secret });
    }
});

module.exports = router;

async function getYouTubeVideo(url) {
    const ytdl = require("ytdl-core");
    let videoInfo = await ytdl.getInfo(url);
    let video = {
        title: `${videoInfo.videoDetails.title}`,
        id: `${videoInfo.videoDetails.videoId}`,
        url: `https://www.youtube.com/watch?v=${videoInfo.videoDetails.videoId}`,
        description: `${videoInfo.videoDetails.description}`,
        millieSeconds: (videoInfo.videoDetails.lengthSeconds*1000),
        thumbnails: [
            {
                height: 90,
                width: 120,
                url: `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/default.jpg`
            },
            {
                height: 180,
                width: 320,
                url: `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/mqdefault.jpg`
            },
            {
                height: 360,
                width: 480,
                url: `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/hqdefault.jpg`
            },
            {
                height: 720,
                width: 1280,
                url: `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/sddefault.jpg`
            },
            {
                height: 1080,
                width: 1920,
                url: `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/maxresdefault.jpg`
            }
        ],
        author: {
            name: videoInfo.videoDetails.author.name,
            id: videoInfo.videoDetails.author.id,
            url: `https://www.youtube.com/channel/${videoInfo.videoDetails.author.id}`,
            description: "",
            thumbnail: videoInfo.videoDetails.author.thumbnails[2].url
        }
    }
    return video;
}