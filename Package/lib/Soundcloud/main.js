const { Sets } = require("./sets")
const { Track } = require("./track");

module.exports.soundcloud = {
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
        async search(title, options={ maxResults:Number }) {
            let number = options.maxResults ? options.maxResults : 5;
            let results = await Track.search(title, { maxResults: number });
            return results;
        }
    },
    sets: {
        /**
         * @param {string} url 
         * @returns 
         */
         async get(url) {
            let set = await Sets.get(url);
            return set;
        }
    }
}