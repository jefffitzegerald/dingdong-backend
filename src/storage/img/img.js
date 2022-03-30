const router = require("express").Router();
let path = "/image";

const fs = require("fs");
const file_image = "./src/storage/img";

let pngs = fs.readdirSync(file_image).filter(file => file.endsWith(".png")),
    jpegs = fs.readdirSync(file_image).filter(file => file.endsWith(".jpeg")),
    svgs = fs.readdirSync(file_image).filter(file => file.endsWith(".svg")),
    jpgs = fs.readdirSync(file_image).filter(file => file.endsWith(".jpg"));

router.get(`${path}/:filename`, (req, res) => {
    if(
        pngs.includes(req.params.filename) ||
        jpegs.includes(req.params.filename) || 
        svgs.includes(req.params.filename) ||
        jpgs.includes(req.params.filename)
    ) {
        return res.sendFile(`${__dirname}/${req.params.filename}`);
    } else {
        return res.sendFile(`${__dirname}/404image.png`);
    }
});

module.exports = router;