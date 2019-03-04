const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const bot = new Discord.Client();

const lb = require("./modules/leaderboard");
const { Servers, Leaderboards, Accounts } = require("./dbObjects");
const updateTime = 1200000; //900000 = 15min | 1200000 = 20min | 3600000 = 1h
//When the bot turns ready when turned on
bot.once("ready", () => {
    console.log(`${bot.user.username} is online on ${bot.guilds.size} server(s)!`);
    bot.user.setActivity(`over you -> ${botconfig.prefix}help 👀`, { type: 'WATCHING' });
    //start the updating routine
    updateSequence();
    setInterval(updateSequence, updateTime);
});

//Every msg sent to the server
bot.on("message", async message => {

    if (!message.content.startsWith(botconfig.prefix)) return; //if the msg does not starst with the prefix, ignore it
    if (message.author.bot) return; //if the author is a bot, ignore the msg.

    //args is an array of the words after the command
    let args = message.content.slice(botconfig.prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase(); //cmd is the command executed (without the prefix)
    let cmdfile;
    try {
        cmdfile = require(`./modules/${cmd}.js`);  //finds the command module
    } catch (error) {
        return console.log('command ' + cmd + ' not found');
    }
    if (cmdfile && cmdfile.help.command) {           //if the module exist and its a command
        cmdfile.run(bot, message, args);
        console.log(cmd + ' executed by ' + message.author.username + ' in ' + message.guild.name);   //log it
    }
});

//When someone leaves the server
bot.on("guildMemberRemove", async function deleteMember(member) {
    const Op = require('sequelize').Op;
    let toRemove = [];
    await Leaderboards.findAll({
        where: {
            guild_id: member.guild.id,
            user_id: member.id
        }
    }).then((btags) => {
        for (let i = 0; i < btags.length; i++) {
            toRemove.push(btags[i].btag);
        }
    });

    await Leaderboards.destroy({
        where: {
            guild_id: member.guild.id,
            user_id: member.id
        }
    });

    await Accounts.destroy({
        where: {
            battleTag: {
                [Op.in]: toRemove
            }
        }
    });

    console.log(`Deleted ${member.user.username} data, because he left the server ${member.guild.name}`);
});

//When a guild id left/deleted
bot.on("guildDelete", async function deleteGuild(guild) {
    const Op = require('sequelize').Op;
    let toRemove = [];
    await Leaderboards.findAll({
        where: {
            guild_id: guild.id
        }
    }).then((btags) => {
        for (let i = 0; i < btags.length; i++) {
            toRemove.push(btags[i].btag);
        }
    });

    await Leaderboards.destroy({
        where: {
            guild_id: guild.id
        }
    });

    await Accounts.destroy({
        where: {
            battleTag: {
                [Op.in]: toRemove
            }
        }
    });

    await Servers.destroy({
        where: {
            serverid: guild.id
        }
    })

    console.log(`Left the server ${guild.name} and deleted its data`);
});

bot.on("error", error => console.error(error));

function showAllLeaderboards() {
    Servers.findAll().then((guilds) => {
        for (let i = 0; i < guilds.length; i++) {
            const serverid = guilds[i].serverid;
            lb.showLeaderboard(bot, serverid);
        }
    });
}

function updateSequence() {
    console.log("Updating player's data");
    lb.update();
    console.log("Showing all leaderboards");
    showAllLeaderboards();
}

bot.login(botconfig.token); //login the bot with the token