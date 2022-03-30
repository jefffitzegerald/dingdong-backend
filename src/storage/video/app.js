const fs = require("fs");
const router = require("express").Router();
const path = "/video";
let videoFiles = [];

setInterval(() => {
    let files = fs.readdirSync("./src/storage/video").filter(file => file.endsWith(".mp4"));
    for (let file of files) {
        let index = videoFiles.map(i => {
            return i;
        }).indexOf(file);
        if(!videoFiles[index]) videoFiles.push(file);
    }
}, 50);

router.get(`${path}/:filename`, (req, res) => {
    let index = videoFiles.map(i => {
        return i;
    }).indexOf(req.params.filename);
    if(!videoFiles[index]) return res.sendFile(`${__dirname}/secret.mp4`);
    else {

        let mp4_file = videoFiles[index];
        return res.sendFile(`${__dirname}/${mp4_file}`);

    }
});

module.exports = router;