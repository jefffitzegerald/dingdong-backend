const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: String,
    playlist: Array
});

module.exports = mongoose.model("queue", schema);