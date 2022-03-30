const ytdl = require("ytdl-core");
const { youtube } = require("scrape-youtube");
const fetch = require("node-fetch").default;
let Options = {
    maxResults: Number()
}

module.exports.video = {
    /**
     * @param {string} url 
     * @returns 
     */
    async get(url) {
        let id = youtube_parser(url);
        let videoUrlApi = `https://www.googleapis.com/youtube/v3/videos?key=${process.env.YT_KEY}&id=${id}&part=snippet&part=contentDetails`;
        let data = await fetch(videoUrlApi).then(res => res.json());
        let video = null;

        if(data.error) {

            let videoInfo = await ytdl.getInfo(url);
            video = {
                title: `${videoInfo.videoDetails.title}`,
                id: `${videoInfo.videoDetails.videoId}`,
                url: `https://www.youtube.com/watch?v=${videoInfo.videoDetails.videoId}`,
                description: `${videoInfo.videoDetails.description}`,
                length_milliSeconds: (videoInfo.videoDetails.lengthSeconds*1000),
                thumbnails: videoInfo.videoDetails.thumbnails,
                author: {
                    name: `${videoInfo.videoDetails.author.name}`,
                    id: `${videoInfo.videoDetails.author.id}`,
                    url: `https://www.youtube.com/channel/${videoInfo.videoDetails.author.id}`,
                    description: "",
                    createdAt: null,
                    thumbnails: videoInfo.videoDetails.author.thumbnails,
                },
                publishedAt: new Date(videoInfo.videoDetails.publishDate),
                snippet: videoInfo
            }

        } else {

            let videoInfo = data.items[0].snippet;
            let thumbnail = videoInfo.thumbnails;
            let lengthSeconds = youtubeDurationToSeconds(data.items[0].contentDetails.duration)
    
            let channelUrlApi = `https://www.googleapis.com/youtube/v3/channels?key=${process.env.YT_KEY}&id=${videoInfo.channelId}&part=snippet`;
            let channelInfo = await fetch(channelUrlApi).then(res => res.json());
        
            video = {
                title: `${videoInfo.title}`,
                id: `${data.items[0].id}`,
                url: `https://www.youtube.com/watch?v=${data.items[0].id}`,
                description: `${videoInfo.description}`,
                length_milliSeconds: (lengthSeconds*1000),
                thumbnails: [
                    {
                        height: thumbnail.default ? Number(thumbnail.default.height) : null,
                        width: thumbnail.default ? Number(thumbnail.default.width) : null,
                        url: thumbnail.default ? `${thumbnail.default.url}` : ""
                    },
                    {
                        height: thumbnail.medium ? Number(thumbnail.medium.height) : null,
                        width: thumbnail.medium ? Number(thumbnail.medium.width) : null,
                        url: thumbnail.medium ? `${thumbnail.medium.url}` : ""
                    },
                    {
                        height: thumbnail.high ? Number(thumbnail.high.height) : null,
                        width: thumbnail.high ? Number(thumbnail.high.width) : null,
                        url: thumbnail.high ? `${thumbnail.high.url}` : ""
                    },
                    {
                        height: thumbnail.standard ? Number(thumbnail.standard.height) : null,
                        width: thumbnail.standard ? Number(thumbnail.standard.width) : null,
                        url: thumbnail.standard ? `${thumbnail.standard.url}` : ""
                    },
                    {
                        height: thumbnail.maxres ? Number(thumbnail.maxres.height) : null,
                        width: thumbnail.maxres ? Number(thumbnail.maxres.width) : null,
                        url: thumbnail.maxres ? `${thumbnail.maxres.url}` : ""
                    }
                ],
                author: {
                    name: `${channelInfo.items[0].snippet.title}`,
                    id: `${channelInfo.items[0].id}`,
                    url: `https://www.youtube.com/channel/${channelInfo.items[0].id}`,
                    description: `${channelInfo.items[0].snippet.description}`,
                    createdAt: new Date(channelInfo.items[0].snippet.publishedAt),
                    thumbnails: [
                        {
                            height: channelInfo.items[0].snippet.thumbnails.default ? Number(channelInfo.items[0].snippet.thumbnails.default.height) : null,
                            width: channelInfo.items[0].snippet.thumbnails.default ? Number(channelInfo.items[0].snippet.thumbnails.default.width) : null,
                            url: channelInfo.items[0].snippet.thumbnails.default ? `${channelInfo.items[0].snippet.thumbnails.default.url}` : ""
                        },
                        {
                            height: channelInfo.items[0].snippet.thumbnails.medium ? Number(channelInfo.items[0].snippet.thumbnails.medium.height) : null,
                            width: channelInfo.items[0].snippet.thumbnails.medium ? Number(channelInfo.items[0].snippet.thumbnails.medium.width) : null,
                            url: channelInfo.items[0].snippet.thumbnails.medium ? `${channelInfo.items[0].snippet.thumbnails.medium.url}` : ""
                        },
                        {
                            height: channelInfo.items[0].snippet.thumbnails.high ? Number(channelInfo.items[0].snippet.thumbnails.high.height) : null,
                            width: channelInfo.items[0].snippet.thumbnails.high ? Number(channelInfo.items[0].snippet.thumbnails.high.width) : null,
                            url: channelInfo.items[0].snippet.thumbnails.high ? `${channelInfo.items[0].snippet.thumbnails.high.url}` : ""
                        }
                    ]
                },
                publishedAt: new Date(videoInfo.publishedAt),
                snippet: data
            }

        }
        
        return video;
    },
    /**
     * @param {string} title 
     * @returns 
     */
    async search(title, options=Options) {
        try {

            var maxResults = options.maxResults;
            var query = `${title.replace("'", "%27").split(" ").join("%20")}`;
            let searchUrlApi = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YT_KEY}&type=video&part=snippet&maxResults=${maxResults}&q=${query}`;
            let data = await fetch(searchUrlApi).then(res => res.json());
    
            let results = [];
            if(data.error) {
                let search = await youtube.search(title);
                for (let result of search.videos.splice(0, maxResults)) {
                    let videoInfo = await this.get(result.link);
                    results.push(videoInfo);
                }
            } else {
                for (let result of data.items) {
                    let video = await module.exports.video.get(`https://www.youtube.com/watch?v=${result.id.videoId}`);
                    results.push(video);
                }
            }
    
            return results;

        } catch (error) {
            
            console.log(error);
            this.search(title, options);

        }
    }
}

/**
 * 
 * @param {string} url 
 * @returns 
 */
function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}


function youtubeDurationToSeconds(duration) {
	var hours   = 0;
	var minutes = 0;
	var seconds = 0;

	// Remove PT from string ref: https://developers.google.com/youtube/v3/docs/videos#contentDetails.duration
	duration = duration.replace('PT','');

	// If the string contains hours parse it and remove it from our duration string
	if (duration.indexOf('H') > -1) {
		hours_split = duration.split('H');
		hours       = parseInt(hours_split[0]);
		duration    = hours_split[1];
	}

	// If the string contains minutes parse it and remove it from our duration string
	if (duration.indexOf('M') > -1) {
		minutes_split = duration.split('M');
		minutes       = parseInt(minutes_split[0]);
		duration      = minutes_split[1];
	}

	// If the string contains seconds parse it and remove it from our duration string
	if (duration.indexOf('S') > -1) {
		seconds_split = duration.split('S');
		seconds       = parseInt(seconds_split[0]);
	}

	return (hours * 60 * 60) + (minutes * 60) + seconds;
}