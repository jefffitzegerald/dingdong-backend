const { Track } = require("./track");
const { Album } = require("./album");
const { Playlist } = require("./playlist");

module.exports.spotify = {
    track: {
        /**
         * @param {string} url 
         * @returns 
         */
        async get(url) {
            let track = await Track.get(url);
            return track;
        },
        /**
         * @param {string} title 
         * @returns 
         */
        async search(title, options={ maxResults:Number() }) {
            let number = options.maxResults ? options.maxResults : 5;
            let results = await Track.search(title, { maxResults: number });
            return results;
        }
    },
    playlist: {
        /**
         * @param {string} url 
         * @returns 
         */
        async get(url) {
            let playlist = await Playlist.get(url);
            return playlist;
        }
    },
    album: {
        /**
         * @param {string} url 
         * @returns 
         */
        async get(url) {
            let album = await Album.get(url);
            return album;
        }
    }
}