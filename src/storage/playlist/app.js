const fs = require("fs");
const router = require("express").Router();
const path = "/playlist";
let playlist_audios = [];

setInterval(() => {
    let files = fs.readdirSync("./src/storage/playlist").filter(file => file.endsWith(".mp3"));
    for (let file of files) {
        let index = playlist_audios.map(i => {
            return i;
        }).indexOf(file);
        if(!playlist_audios[index]) playlist_audios.push(file);
    }
}, 50);

router.get(`${path}/:filename`, (req, res) => {
    let index = playlist_audios.map(i => {
        return i;
    }).indexOf(req.params.filename);
    let mp3_file = playlist_audios[index];
    return res.sendFile(`${__dirname}/${mp3_file}`);
});

module.exports = router;