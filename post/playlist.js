const Playlist = require("../data/queue");

/**
 * 
 * @param {import("express").Application} app 
 * @param {import("../../Package/Client").Client} client 
 */
module.exports = (app, client) => {
    app.post("/me/playlist", async(req, res) => {
        if(!req.session.user) return res.redirect("/login");

        let { title } = req.body;
        let id = client.generateId(20);
        
        try {
            
            let data = await Playlist.findOne({ userId: req.session.user.id });
            if(data) {

                let playlist = {
                    title: title ? title : "My Playlist",
                    id: id,
                    createdAt: Date.now(),
                    items: [],
                    index: data.playlist.length
                }

                data.playlist.push(playlist);
                data.save();

            } else {

                let playlist = {
                    title: title ? title : "My Playlist",
                    id: id,
                    createdAt: Date.now(),
                    items: [],
                    index: 0
                }

                new Playlist({ userId: req.session.user.id, playlist: [playlist] }).save();

            }

        } catch (error) {
            console.log(error);
        }

        return res.redirect(`/me/playlist/${id}`);
    });

    app.get("/me/playlist/check", async(req, res) => {
        if(!req.session.user) return res.redirect("/login");
        try {

            const data = await Playlist.findOne({ userId: req.session.user.id });
            if(!data) return res.json({ userId: req.session.user.id, playlist: [] });
            return res.json(data);

        } catch (error) {
            return res.json({ error: error });
        }
    });

    app.post("/me/playlist/:id/delete", async(req, res) => {
        if(!req.session.user) return res.redirect("/login");

        try {

            const data = await Playlist.findOne({ userId: req.session.user.id });
            if(!data) return res.redirect("/me/playlist");
    
            let index = data.playlist.map(i => {
                return i.id;
            }).indexOf(req.params.id);
            if(!data.playlist[index]) return res.redirect("/me/playlist");
    
            data.playlist.splice(index, 1);
            if(data.playlist.length > 0) data.save();
            else await Playlist.findOneAndDelete({ userId: req.session.user.id });

        } catch (error) {
            console.log(error);
        }

        return res.redirect("/me/playlist");
    });

    app.post("/me/playlist/:id/add", async(req, res) => {
        if(!req.session.user) return res.redirect("/login")
        if(!req.body.type) return res.json({ error: { message: "Required things are missing: TYPE", code: 400 } });
        if(!req.body.url) return res.json({ error: { message: "Required things are missing: URL", code: 400 } });

        const clientTrack = new client.clientTrack({ soundcloud: true, spotify: true, youtube: true });
        const data = await Playlist.findOne({ userId: req.session.user.id });
        if(!data) return res.json({ error: { message: "Cannot find playlist!", error: 404 } });

        let index = data.playlist.map(i => { return i.id }).indexOf(req.params.id);
        if(!data.playlist[index]) return res.json({ error: { message: "Cannot find playlist!", error: 404 } });

        let track = null;
        let type = req.body.type;

        if(type === "soundcloud") {

            try {
                track = await clientTrack.soundcloud.getInfo(req.body.url);
            } catch (error) {
                return res.json({ error: error });
            }

        } else if(type === "spotify") {

            try {
                track = await clientTrack.spotify.getInfo(req.body.url);
            } catch (error) {
                return res.json({ error: error });
            }

        } else if(type === "youtube") {

            try {
                track = await clientTrack.youtube.getInfo(req.body.url);
            } catch (error) {
                return res.json({ error: error });
            }

        }

        let playlist = data.playlist[index];
        let new_track = {
            index: playlist.items.length,
            request_id: client.generateId(10),
            track: track
        }
        playlist.items.push(new_track);

        data.playlist.splice(index, 1);
        data.playlist.push(playlist);
        
        let sort = data.playlist.sort((a, b) => a.index - b.index);
        data.playlist = sort;
        data.save();

        return res.json({ message: "Successfully save song", success: true, playlist: playlist });
    });

    app.post("/me/playlist/:id/remove", async(req, res) => {
        if(!req.session.user) return res.redirect("/login")
        if(!req.body.id) return res.json({ error: { message: "Required things are missing: TYPE", code: 400 } });

        let data = await Playlist.findOne({ userId: req.session.user.id });
        if(!data) return res.json({ error: { message: "Cannot find playlist!", error: 404 } });

        let index = data.playlist.map(i => { return i.id }).indexOf(req.params.id);
        if(!data.playlist[index]) return res.json({ error: { message: "Cannot find playlist!", error: 404 } });

        let { id } = req.body;
        let playlist = data.playlist[index];
        let index2 = playlist.items.map(i => { return i.request_id }).indexOf(id);
        if(!playlist.items[index2]) return res.json({ error: { message: "Cannot find track!", error: 404 } });

        playlist.items.splice(index2, 1);
        if(playlist.items.length > 0) {
            for (let i = 0; i < playlist.items.length; i++) {
                const item = playlist.items[i];
                item.index = i;
            }
        }

        data.playlist.splice(index, 1);
        data.playlist.push(playlist);

        let sort = data.playlist.sort((a, b) => a.index - b.index);
        data.playlist = sort;
        data.save();

        return res.json({ message: "Successfully save song", success: true, playlist: playlist })
    });
}