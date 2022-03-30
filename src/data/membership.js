const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: String,
    date: {
        start: Number,
        expire: Number
    }
});

module.exports = mongoose.model("membership", schema);