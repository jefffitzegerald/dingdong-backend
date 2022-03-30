const fs = require("fs");
const router = require("express").Router();
const path = "/audio";
let audioFiles = [];

setInterval(() => {
    let files = fs.readdirSync("./src/storage/audio").filter(file => file.endsWith(".mp3"));
    for (let file of files) {
        let index = audioFiles.map(i => {
            return i;
        }).indexOf(file);
        if(!audioFiles[index]) audioFiles.push(file);
    }
}, 1000);

router.get(`${path}/:filename`, (req, res) => {
    let index = audioFiles.map(i => {
        return i;
    }).indexOf(req.params.filename);
    if(!audioFiles[index]) return;

    let mp3_file = audioFiles[index];
    res.sendFile(`${__dirname}/${mp3_file}`);
});

module.exports = router;