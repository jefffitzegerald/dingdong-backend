const SoundCloud = require("soundcloud-search-core");
const soundcloud = new SoundCloud(process.env.SOUNDCLOUD_CLIENT_ID);
const scdl = require("soundcloud-downloader").default;

module.exports.Track = {
    /**
     * @param {string} url soundcloud single track url 
     * @returns return as soundcloud data information track
     */
    async get(url) {
        let trackInfo = await scdl.getInfo(url);
        let track = {
            title: trackInfo.title,
            id: trackInfo.id,
            url: trackInfo.permalink_url,
            description: trackInfo.description,
            length_milliSeconds: trackInfo.full_duration,
            thumbnails: [
                {
                    height: trackInfo.artwork_url ? 800 : null,
                    width: trackInfo.artwork_url ? 800 : null,
                    url: trackInfo.artwork_url ? trackInfo.artwork_url : ""
                }
            ],
            author: {
                name: trackInfo.user.username,
                id: trackInfo.user.id,
                url: trackInfo.user.permalink_url,
                description: trackInfo.user.description,
                createdAt: trackInfo.user.created_at,
                thumbnails: [
                    {
                        height: 800,
                        width: 800,
                        url: trackInfo.user.avatar_url
                    }
                ]
            },
            publishedAt: trackInfo.created_at,
            snippet: trackInfo
        }
        return track;
    },
    /**
     * @param {string} title searching soundcloud track
     * @returns return as soundcloud data information track
     */
    async search(title, options={maxResults:Number()}) {
        try {
            
            let results = await soundcloud.tracks(title, options.maxResults);
            let tracks = [];
            for (let track of results) {
                let trackInfo = await this.get(track.permalink_url);
                tracks.push(trackInfo);
            }
            return tracks;

        } catch (error) {

            console.log(error);
            this.search(title, options);
            
        }
    }
}