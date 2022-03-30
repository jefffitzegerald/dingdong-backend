class Dashboard {
    /**
     * @param {import("../Package/Client").Client} client 
     */
    constructor(client) {
        this.client = client;
    }

    init() {
        const client = this.client;
        const express = require("express");
        const bodyParser = require("body-parser");
        const session = require("express-session");
        const Store = require("connect-mongo");
        const http = require("http");
        const cors = require("cors");

        const UserDatabese = require("./data/user");

        const PORT = process.env.PORT || 3002;
        const app = express();
        const server = http.createServer(app);
        const listener = server.listen(PORT, function() {
            console.log(`Listen to port: `, listener.address().port);
        });

        let sessionIs = session({
            secret: 'total_secret_cookie_secret_code_cV4bUFpMRe8_kETyJJytFN',
            resave: true,
            saveUninitialized: true,
            cookie: {
                expires: new Date(253402300799999),
                maxAge: 253402300799999
            },
            store: Store.create({
                autoRemove: "native",
                mongoUrl: process.env.MONGODB
            }),
            name: "ding_dong_cookies"
        });

        app.set("view engine", "ejs");

        // Public
        app.use(express.static(`${__dirname}/static/public`));
        app.use(express.static(`${__dirname}/static/js`));

        app.use(cors());
        app.use(sessionIs);
        app.use(express.json());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(async(req, res, next) => {
            if(!req.body) req.body = {};

            req.client = client;
            req.domain = req.client.config.domain;
            req.views = `${__dirname}/static/views`;
            req.auth = {
                clientId: "cV4bUFpMRe8nCt4QyRzU",
                clientSecret: "kETyJJytFNx4zYdhmpGgHcBiQZqK7q",
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                    yt_redirect_uri: process.env.YOUTUBE_REDIRECT_URI
                },
                discord: {
                    clientId: process.env.DISCORD_CLIENT_ID,
                    clientSecret: process.env.DISCORD_CLIENT_SECRET,
                    redirect_uri: process.env.DISCORD_REDIRECT_URI,
                    invite_redirect_uri: process.env.DISCORD_INVITE_REDIRECT_URI,
                    connection_redirect_uri: process.env.DISCORD_CONNECTION_REDIRECT_URI
                },
                spotify: {
                    clientId: process.env.SPOTIFY_CLIENT_ID,
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URI
                }
            }

            req.developer = {
                main_path: `${__dirname}/Developer/views`,
                app_path: `${__dirname}/Developer/app/views`
            }

            let databese = await UserDatabese.findOne({ client: req.auth.clientId, clientSecret: req.auth.clientSecret });
            if(databese) {
                if(req.session.user) {

                    let index = 0;
                    if(databese.google) {
                        index += databese.google.map(i => { return i.id }).indexOf(req.session.user.id);
                    }

                    let index2 = 0;
                    if(databese.discord) {
                        index2 += databese.discord.map(i => { return i.id }).indexOf(req.session.user.id);
                    }

                    let index3 = 0
                    if(databese.reguler) {
                        index3 += databese.reguler.map(i => { return i.id }).indexOf(req.session.user.id);
                    }

                    if(databese.google[index]) req.session.user = databese.google[index];
                    else if(databese.discord[index2]) req.session.user = databese.discord[index2];
                    else if(databese.reguler[index3]) req.session.user = databese.reguler[index3];
                    else req.session.user = null;
                }
            } else {
                req.session.user = null;
            }

            next();
        });

        require("./page")(app, client);
        require("./storage/router")(app);
        require("./post/main").post(app, client);

        app.use("/register", require("./Auth/register"));
        app.use("/login", require("./Auth/router"));
        app.use("/me", require("./User/main"));
        app.get("/logout", async(req, res) => {
            if(req.session.number) {
                if(req.session.number >= 10) return res.redirect("/secret");
            }

            let r = req.session.r;
            if(!req.session.user) return res.redirect(r);

            const fs = require("fs");
            try {
                fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
            } catch (error) {
                
            }
            try {
                fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
            } catch (error) {
    
            }
            try {
                    
                fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
        
            } catch (error) {
                    
            }

            req.session.destroy();
            res.redirect(r);
        });

        app.use("/developers", require("./Developer/main"));
        app.get("/secret", (req, res) => {
            if(!req.session.number) return res.redirect("/");
            if(req.session.number < 10) return res.redirect("/");

            if(req.session.title) {
                try {
                    fs.unlinkSync(`./src/storage/video/${req.session.title}_${req.session.id}.mp4`);
                } catch (error) {
                    
                }
                try {
                    fs.unlinkSync(`./src/storage/audio/${req.session.title}_${req.session.id}.mp3`);
                } catch (error) {
        
                }
                req.session.title = undefined;
            }

            if(req.session.playlist_id) {

                try {
                    
                    fs.unlinkSync(`./src/storage/playlist/${req.session.playlist_id}_${req.session.id}.mp3`);
        
                } catch (error) {
                    
                }
                
                req.session.playlist_id = undefined;
            }

            res.render(`${req.views}/secret`, { req, bot: req.client });
        });

        app.use("/api", require("./restAPI"));
        app.get("*", async(req, res) => {
            if(req.session.number) {
                if(req.session.number >= 10) return res.redirect("/secret");
            }
            res.render(`${req.views}/404`, { req });
        });
    }
}

exports.Dashboard = Dashboard;