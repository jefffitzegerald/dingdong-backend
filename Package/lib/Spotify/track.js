const searchSpotify = require("@ksolo/spotify-search");
const { Spotify } = require("simple-spotify");
const spdl = require("spdl-core").default;
const spotify = new Spotify();

module.exports.Track = {
    /**
     * @param {string} url 
     * @returns 
     */
    async get(url) {
        let trackInfo = await spotify.track(url);
        let additionalInfo = await spdl.getInfo(url);

        let albums = await spotify.album(`https://open.spotify.com/album/${trackInfo.album.id}`);
        let track = {
            title: trackInfo.name,
            id: trackInfo.id,
            url: `https://open.spotify.com/track/${trackInfo.id}`,
            description: "",
            length_milliSeconds: trackInfo.duration_ms,
            thumbnails: [
                {
                    height: 400,
                    width: 400,
                    url: additionalInfo.thumbnail
                }
            ],
            author: {
                name: additionalInfo.artist,
                id: "",
                url: "",
                description: "",
                createdAt: null,
                thumbnails: []
            },
            publishedAt: null,
            albums: {
                tracks: await albums.tracks(true),
                album: albums
            },
            snippet: trackInfo
        }

        return track;
    },
    /**
     * @param {string} title 
     * @returns 
     */
    async search(title, options={ maxResults:Number() }) {
        try {
            searchSpotify.setCredentials(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
            let search = await searchSpotify.search(title);
            let results = search.tracks.items;
    
            let filter = results.splice(0, options.maxResults);
            let tracks = [];
            for (let track of filter) {
                let trackInfo = await this.get(`https://open.spotify.com/track/${track.id}`);
                tracks.push(trackInfo);
            }
            return tracks;
        } catch (error) {
            console.log(error);
            this.search(title, options);
        }
    }
}