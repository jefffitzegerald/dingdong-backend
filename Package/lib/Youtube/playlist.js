const fetch = require("node-fetch").default;
const { video } = require("./video");

module.exports.playlist = {
    /**
     * @param {string} playlistId 
     * @returns 
     */
    async get(playlistId) {
        let playlistUrlApi = `https://www.googleapis.com/youtube/v3/playlists?key=${process.env.YT_KEY}&part=snippet&id=${playlistId}`;
        let playlistItemsUrlApi = `https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YT_KEY}&part=snippet&playlistId=${playlistId}`;
        let data = await fetch(playlistItemsUrlApi).then(res => res.json());
        let fetchPlaylist = await fetch(playlistUrlApi).then(res => res.json());

        let videos = [];
        let playlist = fetchPlaylist.items[0];
        let thumbnail = playlist.snippet.thumbnails;
        for (let item of data.items) {
            let videoInfo = await video.get(`https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`);
            videos.push(videoInfo);
        }
        
        let channelUrlApi = `https://www.googleapis.com/youtube/v3/channels?key=${process.env.YT_KEY}&id=${playlist.snippet.channelId}&part=snippet`;
        let channel = await fetch(channelUrlApi).then(res => res.json());
        let playlistInfo = {
            title: `${playlist.snippet.title}`,
            id: `${playlist.id}`,
            url: `https://www.youtube.com/playlist?list=${playlist.id}`,
            description: `${playlist.snippet.description}`,
            thumbnails: [
                {
                    height: thumbnail.default ? thumbnail.default.height : null,
                    width: thumbnail.default ? thumbnail.default.width : null,
                    url: thumbnail.default ? `${thumbnail.default.url}` : ""
                },
                {
                    height: thumbnail.medium ? thumbnail.medium.height : null,
                    width: thumbnail.medium ? thumbnail.medium.width : null,
                    url: thumbnail.medium ? `${thumbnail.medium.url}` : ""
                },
                {
                    height: thumbnail.high ? thumbnail.high.height : null,
                    width: thumbnail.high ? thumbnail.high.width : null,
                    url: thumbnail.high ? `${thumbnail.high.url}` : ""
                },
                {
                    height: thumbnail.standard ? thumbnail.standard.height : null,
                    width: thumbnail.standard ? thumbnail.standard.width : null,
                    url: thumbnail.standard ? `${thumbnail.standard.url}` : ""
                },
                {
                    height: thumbnail.maxres ? thumbnail.maxres.height : null,
                    width: thumbnail.maxres ? thumbnail.maxres.width : null,
                    url: thumbnail.maxres ? `${thumbnail.maxres.url}` : ""
                }
            ],
            author: {
                name: `${channel.items[0].snippet.title}`,
                id: `${channel.items[0].id}`,
                url: `https://www.youtube.com/channel/${channel.items[0].id}`,
                description: `${channel.items[0].snippet.description}`,
                createdAt: new Date(channel.items[0].snippet.publishedAt),
                thumbnails: [
                    {
                        height: channel.items[0].snippet.thumbnails.default ? channel.items[0].snippet.thumbnails.default.height : null,
                        width: channel.items[0].snippet.thumbnails.default ? channel.items[0].snippet.thumbnails.default.width : null,
                        url: channel.items[0].snippet.thumbnails.default ? `${channel.items[0].snippet.thumbnails.default.url}` : ""
                    },
                    {
                        height: channel.items[0].snippet.thumbnails.medium ? channel.items[0].snippet.thumbnails.medium.height : null,
                        width: channel.items[0].snippet.thumbnails.medium ? channel.items[0].snippet.thumbnails.medium.width : null,
                        url: channel.items[0].snippet.thumbnails.medium ? `${channel.items[0].snippet.thumbnails.medium.url}` : ""
                    },
                    {
                        height: channel.items[0].snippet.thumbnails.high ? channel.items[0].snippet.thumbnails.high.height : null,
                        width: channel.items[0].snippet.thumbnails.high ? channel.items[0].snippet.thumbnails.high.width : null,
                        url: channel.items[0].snippet.thumbnails.high ? `${channel.items[0].snippet.thumbnails.high.url}` : ""
                    }
                ]
            },
            items: videos
        }

        return playlistInfo;
    },
}