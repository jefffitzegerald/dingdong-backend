const { Spotify } = require("simple-spotify");
const spotify = new Spotify();
const fetch = require("node-fetch").default;

const { youtube } = require("./Youtube/main");
const { soundcloud } = require("./Soundcloud/main");
const { spotify: spty } = require("./Spotify/main");

let Options = {
    spotify: Boolean(),
    soundcloud: Boolean(),
    youtube: Boolean()
}

class TrackInfo {
    constructor(options=Options) {
        let notInclude = [];
        if(!options.spotify) notInclude.push("spotify");
        if(!options.soundcloud) notInclude.push("soundcloud");
        if(!options.youtube) notInclude.push("youtube");
        if(notInclude.length == 3) throw new Error("You can't make all three (YouTube, Soundcloud, Spotify) false. One of them must be made true.");

        this.regex = {
            youtube: {
                video: /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/gi,
                playlist: /^.*(list=)([^#\&\?]*).*/gi
            },
            spotify: {
                track: spotify.trackRegex,
                album: spotify.albumRegex,
                playlist: spotify.playlistRegex
            },
            soundcloud: {
                track: /^https?:\/\/(soundcloud\.com)\/(.*)$/,
                mobile: /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/,
                sets: /^.*\/(sets)\/([^#\&\?]*).*/gi
            }
        } 
        this.youtube = {
            /**
             * @param {string} url get information track/video from Spotify, Soundcloud, or YouTube
             * @returns return as track/video information
             */
            async getInfo(url) {
                const boolean = options;
                const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
                const videoPattern = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
                const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;

                if(!boolean.youtube) throw new Error("You must set youtube from false to true!");
                if(!url) throw new Error("`getInfo` function cannot be empty!");
                if(!urlPattern.test(url)) throw new Error("Url its undefined!");
                if(!videoPattern.test(url) && playlistPattern.test(url)) throw new Error("Playlist Url its using `getPlaylistInfo`!");

                let info = await youtube.video.get(url);
                return info;
            },
            /**
             * @param {string} url Only Spotify and YouTube url who can use this method
             * @returns return as playlistfrom spotify or youtube
             */
            async getPlaylistInfo(url) {
                const boolean = options;
                const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
                const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;

                if(!boolean.youtube) throw new Error("You must set youtube from false to true!");
                if(!url) throw new Error("`getPlaylistInfo` function cannot be empty!");
                if(!urlPattern.test(url)) throw new Error("Url its undefined!");
                if(!playlistPattern.test(url)) throw new Error("Playlist URL its invalid!");
                
                /**
                 * @param {string} url 
                 * @returns 
                 */
                function getPlaylistIdFromURL(url) {
                    let id = null;
                    url = url.replace(/(>|<)/gi, "").split(/(list=)/);
                    if(url[2]) {
                    id = url[2].split(/[^0-9a-z_-]/i)[0];
                    }
                    return id;
                }

                let id = getPlaylistIdFromURL(url);
                let playlist = await youtube.playlist.get(id);
                return playlist;
            },
            /**
             * @param {string} title Searching song from youtube
             * @returns return as video information
             */
            async search(title, option={ maxResults:Number() }) {
                const boolean = options;
                if(!boolean.youtube) throw new Error("You must set youtube from false to true!");
                let videos = await youtube.video.search(title, { maxResults: option.maxResults });
                return videos;
            }
        }
        this.spotify = {
            /**
             * @param {string} url get information track/video from Spotify, Soundcloud, or YouTube
             * @returns return as track/video information
             */
            async getInfo(url) {
                const boolean = options;
                const spotifyPattern = spotify.trackRegex;
                const spotifyPlaylistPattern = spotify.playlistRegex;
                const spotifyAlbumPattern = spotify.albumRegex;
                const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;

                if(!boolean.spotify) throw new Error("You must set spotify from false to true!");
                if(!url) throw new Error("`getPlaylistInfo` function cannot be empty!");
                if(!urlPattern.test(url)) throw new Error("Url its undefined!");
                if(spotifyAlbumPattern.test(url)) throw new Error("Playlist Url its using `getPlaylistInfo`!");
                if(spotifyPlaylistPattern.test(url)) throw new Error("Playlist Url its using `getPlaylistInfo`!");
                if(!spotifyPattern.test(url)) throw new Error("Track URL its invalid");

                let info = await spty.track.get(url);
                return info;
            },
            /**
             * @param {string} url This method its only for spotify url (album and playlist url)
             * @returns return as array tracks from album 
             */
            async getPlaylistInfo(url) {
                const boolean = options;
                const spotifyPattern = spotify.trackRegex;
                const spotifyPlaylistPattern = spotify.playlistRegex;
                const spotifyAlbumPattern = spotify.albumRegex;
                const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;

                if(!boolean.spotify) throw new Error("You must set spotify from false to true!");
                if(!url) throw new Error("`getPlaylistInfo` function cannot be empty!");
                if(!urlPattern.test(url)) throw new Error("Url its undefined!");
                if(spotifyPattern.test(url)) throw new Error("Track Url its using `getInfo`!");
                if(!spotifyAlbumPattern.test(url) && !spotifyPlaylistPattern.test(url)) throw new Error("Playlist/Album URL its invalid!");

                let spotifyInfo = null;
                if(spotifyPlaylistPattern.test(url)) {
                    spotifyInfo = await spty.playlist.get(url);
                } else if(spotifyAlbumPattern.test(url)) {
                    spotifyInfo = await spty.album.get(url);
                }
                return spotifyInfo;
            },
            /**
             * @param {string} title 
             * @returns 
             */
            async search(title, option={ maxResults:Number() }) {
                const boolean = options;
                if(!boolean.spotify) throw new Error("You must set spotify from false to true!");
                let results = await spty.track.search(title, { maxResults: option.maxResults });
                return results;
            }
        }
        this.soundcloud = {
            /**
             * @param {string} url get information track/video from Spotify, Soundcloud, or YouTube
             * @returns return as track/video information
             */
            async getInfo(url) {
                const boolean = options;
                const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
                const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
                const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
                const scSets = /^.*\/(sets)\/([^#\&\?]*).*/gi;

                if(!boolean.soundcloud) throw new Error("You must set soundcloud from false to true!");
                if(!url) throw new Error("`getInfo` function cannot be empty!");
                if(!urlPattern.test(url)) throw new Error("Url its undefined!");
                if(!scRegex.test(url) && !mobileScRegex.test(url)) throw new Error("Track URL its invalid");
                
                let info = null;
                if(mobileScRegex.test(url)) {
                    let header = await fetch(url, { method: "GET" });
                    if(scSets.test(header.url)) throw new Error("Sets Url its using `getSetsInfo`!");
                    info = await soundcloud.track.get(header.url);
                }
                if(scRegex.test(url)) {
                    if(scSets.test(url)) throw new Error("Sets Url its using `getSetsInfo`!");
                    info = await soundcloud.track.get(url);
                }
                return info;
            },
            /**
             * @param {string} url This method its only for soundcloud sets 
             * @returns return as array tracks from soundcloud sets
             */
            async getSetsInfo(url) {
                const boolean = options;
                const setsRegex = /^.*\/(sets)\/([^#\&\?]*)$/;
                const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;

                if(!boolean.soundcloud) throw new Error("You must set soundcloud from false to true!");
                if(!setsRegex.test(url) && !mobileScRegex.test(url)) throw new Error("Sets URL its invalid!");

                let sets = null;
                if(mobileScRegex.test(url)) {
                    let header = await fetch(url, { method: "GET" });
                    if(!setsRegex.test(header.url)) throw new Error("Track only Url its using `getInfo`!");
                    sets = await soundcloud.sets.get(header.url);
                }
                if(setsRegex.test(url)) {
                    sets = await soundcloud.sets.get(url)
                }
                return sets;
            },
            /**
             * @param {string} title 
             * @returns  
             */
            async search(title, option={ maxResults:Number() }) {
                const boolean = options;
                if(!boolean.soundcloud) throw new Error("You must set soundcloud from false to true!");
                let results = await soundcloud.track.search(title, { maxResults: option.maxResults });
                return results;
            }
        }
    }
}

module.exports = {
    TrackInfo: TrackInfo
}