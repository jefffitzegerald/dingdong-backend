module.exports = (app) => {
    app.use("/storage", require("./img/img"));
    app.use("/storage", require('./audio/main'));
    app.use("/storage", require("./video/app"));
    app.use("/storage", require("./playlist/app"));
}