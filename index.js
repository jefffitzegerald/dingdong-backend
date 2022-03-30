require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client } = require("./Package/Client");

const client = new Client().setToken(process.env.TOKEN);
const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB);

let commands = [];
for (let command of client.commandsSchema.toJSON()) {
    if(command.data) {
        commands.push(command.data);
    }
}

(async() => {
    try {
        console.log("Refreshing slash commands!");
        rest.put(
            Routes.applicationCommands("779659595630510080"),
            { body: commands }
        );
    } catch (error) {
        console.log(error);
    }
})();

client.on("ready", async() => {
    client.log(`${client.user.tag} its ready!`);
    setInterval(() => {
        let types = ["Youtube", "Spotify", "Soundcloud"];
        client.user.setActivity(types[Math.floor(Math.random()*types.length)], { type: "STREAMING", url: "https://www.youtube.com/watch?v=iik25wqIuFo" });
    }, 10*1000);
});

client.on("interactionCreate", async(interaction) => {
    if(interaction.isCommand()) {
        const membership = require("./src/data/membership");
        const data = await membership.findOne({ userId: interaction.user.id });

        const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
        const command = client.commandsSchema.get(interaction.commandName);

        if(command) {
            if(!command.public) {
                if(!data && !client.config.membershipForever.includes(interaction.user.id)) {
                    let row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setEmoji("💎")
                                .setStyle("LINK")
                                .setLabel("BUY MEMBERSHIP")
                                .setURL(client.config.domain+"/membership")
                        )
                    let embed = new MessageEmbed().setColor("WHITE")
                        .setTitle("Membership Command")
                        .setDescription(`You must buy a membership to use this command!`);
                    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
                }
            }
            return command.run(interaction, client);
        }
    }
});

const { Dashboard } = require("./src/server");
const dashboard = new Dashboard(client);
dashboard.init();

// async function upload() {
//     try {
//         const fs = require("fs");
//         const google_folder_id = "1xcXY7T6_2t_vVLUy1ir9IVzQxEe1LerO";
//         const { google } = require("googleapis");
//         const auth = new google.auth.GoogleAuth({
//             keyFile: "./Package/forenter_google_api.json",
//             scopes: ["https://www.googleapis.com/auth/drive"]
//         });

//         const driveService = google.drive({
//             version: "v3",
//             auth: auth
//         });

//         const fileMetadata = {
//             'name': "404.png",
//             parents: [google_folder_id]
//         }

//         const media = {
//             mimeType: 'image/png',
//             body: fs.createReadStream("./404image.png")
//         }

//         const response = await driveService.files.get(
//             {
//                 fileId: "1YQhWLss3IvJYfpCj5cq3i9CdxB40Mrio",
//                 alt: "media"
//             },
//             {
//                 responseType: "stream"
//             }
//         );

//         return response.data.id;
//     } catch (error) {
//         return error;
//     }
// }

// upload().then(res => console.log(res));