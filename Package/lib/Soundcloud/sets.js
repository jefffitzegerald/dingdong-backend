const { Track } = require("./track");
const scdl = require("soundcloud-downloader").default;

module.exports.Sets = {
    /**
     * @param {string} url 
     * @returns 
     */
    async get(url) {
        let setsInfo = await scdl.getSetInfo(url);
        let tracks = [];
        for (let track of setsInfo.tracks) {
            let trackInfo = await Track.get(track.permalink_url);
            tracks.push(trackInfo);
        }

        let set = {
            title: `${setsInfo.label_name}`,
            id: `${setsInfo.id}`,
            url: setsInfo.permalink_url,
            description: setsInfo.description,
            thumbnails: [
                {
                    height: 800,
                    width: 800,
                    url: setsInfo.artwork_url
                }
            ],
            author: {
                name: setsInfo.user.username,
                id: setsInfo.user.id,
                url: setsInfo.user.permalink_url,
                description: setsInfo.user.description,
                createdAt: setsInfo.user.created_at,
                thumbnails: [
                    {
                        height: 400,
                        width: 400,
                        url: setsInfo.user.avatar_url
                    }
                ]
            },
            items: tracks
        }
        return set;
    }
}