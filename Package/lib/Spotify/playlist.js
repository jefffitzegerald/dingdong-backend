const { Track } = require("./track");
const { Spotify } = require("simple-spotify");
const spotify = new Spotify();

module.exports.Playlist = {
    /**
     * @param {string} url 
     * @returns 
     */
    async get(url) {
        let playlistInfo = await spotify.playlist(url, true);
        
        let tracks = [];
        for (let track of playlistInfo.tracks.items) {
            let trackInfo = await Track.get(`https://open.spotify.com/track/${track.track.id}`);
            tracks.push(trackInfo);
        }
        let playlist = {
            title: `${playlistInfo.name}`,
            id: `${playlistInfo.id}`,
            url: `https://open.spotify.com/playlist/${playlistInfo.id}`,
            description: playlistInfo.description,
            thumbnails: playlistInfo.images,
            author: {
                name: playlistInfo.owner.display_name,
                id: playlistInfo.owner.id,
                url: `https://open.spotify.com/user/${playlistInfo.owner.id}`,
                description: "",
                createdAt: null,
                thumbnails: []
            },
            items: tracks
        }

        return playlist;
    }
}