module.exports.post = (app, client) => {
    require("./search")(app, client);
    require("./profile")(app, client);
    require("./playlist")(app, client);
}