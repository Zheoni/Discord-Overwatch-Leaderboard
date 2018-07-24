const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const leaderboard = require('./modules/leaderboard.js');
const functions = require('./modules/functions.js');

const bot = new Discord.Client();

bot.login(botconfig.token); //login the bot with the token

//When the bot turns ready when turned on
bot.on("ready", () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} server(s)! (more than 1 cause problems)`);
  bot.user.setActivity(`you -> ${botconfig.prefix}help 👀`, { type: 'WATCHING' });
  updateLeaderboard(); //start the updating routine
});

//Every msg sent to the server
bot.on("message", async message => {

  if(! message.content.startsWith(botconfig.prefix)) return; //if the msg does not starst with the prefix, ignore it
  //if (message.author.bot) return; //if the author is a bot, ignore the msg.

  let args = message.content.slice(botconfig.prefix.length).trim().split(' ');  //args is an array of the words after the command
  let cmd = args.shift().toLowerCase(); //cmd is the command executed (without the prefix)
  let cmdfile;
  try {
    cmdfile = require(`./modules/${cmd}.js`);  //finds the command module
  } catch (error) {
    return console.log('command ' + cmd + ' not found');
  }
  if(cmdfile && cmdfile.help.command){           //if the module exist and its a command
    cmdfile.run(bot, message, args);                                    //execute it
    console.log(cmd + ' executed by ' + message.author.username);   //log it
  }
});

//When someone leaves the server
bot.on("guildMemberRemove", async member => {
  let owdata = functions.loadData('owdata.json');
  if(owdata[member.id]) delete owdata[member.id]; //if the bot has data of the player, deletes it
  functions.saveData(owdata, 'owdata.json');
  console.log(`Deleted ${member.user.username} data, because he left the server`);
});

function updateLeaderboard() {
  setInterval( () => {
    console.log('started updating');
    let lbdata = functions.loadData('lbdata.json');
    if(lbdata.lbEnable) leaderboard.update(bot);   //if the leaderboard is enabled, update the data
    else console.log('the leaderboard is not enabled');
  }, 900000); //900000 = 15min | 3600000 = 1h
}
