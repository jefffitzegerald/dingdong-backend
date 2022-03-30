const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: String,
    apps: Array
});

module.exports = mongoose.model("app", schema);