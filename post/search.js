/**
 * @param {import("express").Application} app 
 * @param {import("../../Package/Client").Client} client 
 */
module.exports = (app, client) => {
    app.post("/search", async(req, res) => {
        let type = "";
        let body = req.body;

        if(!body.type || isPlaceholder(body.type)) type += "youtube";
        else type += body.type;

        if(!isExistType(body.type)) return res.redirect(`/search?error=cannout_found_type`);
        let query = body.query.split(" ").join("+");

        req.session.search = {
            type: type,
            query: query
        }

        return res.redirect(`/search?type=${type}&search=${query}`);
    });
}

function isPlaceholder(type) {
    return type === "placeholder";
}

function isExistType(type) {
    let types = ["youtube", "spotify", "soundcloud", "placeholder"];
    return types.includes(type);
}