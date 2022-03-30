const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    clientId: String,
    clientSecret: String,
    google: Array,
    discord: Array,
    regular: Array
});

module.exports = mongoose.model("user", schema);