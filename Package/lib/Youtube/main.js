const { video } = require("./video");
const { playlist } = require("./playlist");

module.exports.youtube = {
    video: {
        /**
         * @param {string} url 
         * @returns 
         */
        async get(url) {
            let videoInfo = await video.get(url);
            return videoInfo;
        },
        /**
         * @param {string} title 
         * @returns 
         */
        async search(title, options={ maxResults:Number() }) {
            var countResults;
            var maxResults = options.maxResults;
            if(maxResults) {
                if(maxResults > 50 || maxResults < 1) console.log("Max Results only between 1 and 50!");
                countResults = maxResults;
            } else {
                countResults = 5;
            }
            let videos = await video.search(title, { maxResults: countResults });
            return videos;
        }
    },
    playlist: {
        /**
         * @param {string} id 
         * @returns 
         */
        async get(id) {
            let info = await playlist.get(id);
            return info;
        }
    }
}