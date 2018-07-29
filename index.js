const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const leaderboard = require('./modules/leaderboard.js');
const functions = require('./modules/functions.js');

const bot = new Discord.Client();

const updateTime = 1200000 //900000 = 15min | 1200000 = 20min | 3600000 = 1h
const commandUpdaterTime = 250

let commandsQueue = new Array();
let ready = true;

bot.login(botconfig.token); //login the bot with the token

//When the bot turns ready when turned on
bot.on("ready", () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} server(s)!`);
  bot.user.setActivity(`over you -> ${botconfig.prefix}help 👀`, { type: 'WATCHING' });
  updateSequence(); //start the updating routine
  setInterval(commandRunner, commandUpdaterTime);
});

//Every msg sent to the server
bot.on("message", async message => {

  if (!message.content.startsWith(botconfig.prefix)) return; //if the msg does not starst with the prefix, ignore it
  //if (message.author.bot) return; //if the author is a bot, ignore the msg.

   //args is an array of the words after the command
  let args = message.content.slice(botconfig.prefix.length).trim().split(' '); 
  let cmd = args.shift().toLowerCase(); //cmd is the command executed (without the prefix)
  let cmdfile;
  try {
    cmdfile = require(`./modules/${cmd}.js`);  //finds the command module
  } catch (error) {
    console.log(error);
    return console.log('command ' + cmd + ' not found');
  }
  if (cmdfile && cmdfile.help.command) {           //if the module exist and its a command
    commandsQueue.push({ file: cmdfile, message: message, args: args }); //add it to the queue
    console.log(cmd + ' executed by ' + message.author.username + ' in ' + message.guild.name);   //log it
  }
});

//When someone leaves the server
bot.on("guildMemberRemove", async member => {
  let owdata = functions.loadData('owdata.json');
  //if the bot has data of the player, deletes it
  if (owdata[member.guild.id][member.id]) delete owdata[member.guild.id][member.id];
  functions.saveData(owdata, 'owdata.json');
  console.log(`Deleted ${member.user.username} data, because he left the server ${member.guild.name}`);
});

function updateSequence() {
  console.log('Started auto-update loop:');
  let servers;
  let finished_count = 0;

  function updateLeaderboard() {
    console.log('Updating all servers data & leaderboard');
    //check if the data is available
    if(ready == false) return console.log('Tried to auto-update but a command was working');
    //if it is:
    let lbdata = functions.loadData('lbdata.json');
    servers = Object.keys(lbdata);
    if(servers.length <= 0) return console.log('There are no servers to update');
    ready = false;
    for(let i = 0; i < servers.length; i++){
      console.log('server id: ' + servers[i]);
      //if the leaderboard is enabled, update the data of the server and when finished, call 'finished'
      if (lbdata[servers[i]].lbEnable) leaderboard.update(bot, servers[i], finished);
      else console.log('the leaderboard is not enabled in ' + servers[i]);
    }
  }

  function finished(){  //when all servers has been updated, set ready to true
    finished_count++;
    if(finished_count >= servers.length){
      ready = true;
    }
  }

  updateLeaderboard();
  setInterval(updateLeaderboard, updateTime); 
}

async function commandRunner() {
  //console.log(commandsQueue.length, ready);
  if (commandsQueue.length > 0 && ready == true) {
    ready = false;
    let toRun = commandsQueue.shift()
    await toRun.file.run(bot, toRun.message, toRun.args);
    ready = true;
  }
}