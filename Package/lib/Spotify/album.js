const { Track } = require("./track");
const { Spotify } = require("simple-spotify");
const spotify = new Spotify();

module.exports.Album = {
    /**
     * @param {string} url 
     * @returns
     */
    async get(url) {
        let album = await spotify.album(url);
        let tracksAlbum = await album.tracks(true);

        let tracks = [];
        for (let track of tracksAlbum) {
            let getTrack = await Track.get(`https://open.spotify.com/track/${track.id}`);
            tracks.push(getTrack);
        }

        let albumInfo = {
            title: album.name,
            id: album.id,
            url: `https://open.spotify.com/album/${album.id}`,
            description: "",
            thumbnails: album.images,
            author: {
                name: album.artists.length == 2 ? `${album.artists[0].name} & ${album.artists[1].name}` : album.artists[0].name,
                id: "",
                url: "",
                description: "",
                createdAt: null,
                thumbnails: []
            },
            items: tracks
        }

        return albumInfo;
    }
}