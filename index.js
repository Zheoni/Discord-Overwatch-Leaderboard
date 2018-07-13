const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const overwatch = require('overwatch-js');

const leaderboard = require('./commands/leaderboard.js');
//const unlinkow = require('./commands/unlinkow.js');
var lbdata = require('./lbdata.json');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

//Command Loader
fs.readdir("./commands", (err, files) => {
  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0) return console.log("No commands were found.");

  jsfile.forEach((f, i=0) => {
    let aux = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(aux.help.name, aux);
  });

  console.log(`${jsfile.length} command(s) loaded`);
});

//When the bots turns ready when turned on
bot.on("ready", () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} server(s)! (more than 1 cause problems)`);
  //bot.user.setActivity("I'm watching over you :eyes:");

  updateLeaderboard();
});

//Every msg sent to the server
bot.on("message", async message => {

  if(! message.content.startsWith(botconfig.prefix)) return; //if the msg does not starst with the prefix, ignore it
  //if (message.author.bot) return; //if the author is a bot, ignore the msg.

  let args = message.content.slice(botconfig.prefix.length).trim().split(' ');
  let cmd = args.shift().toLowerCase();

  let commandFile = bot.commands.get(cmd);
  if(commandFile) commandFile.run(bot, message, args);
});

/*
bot.on("guildMemberRemove", async member => {
  unlinkow.leaver(bot, member); //removes the player data
});
*/

bot.login(botconfig.token);

function updateLeaderboard() {
  console.log('started updating');
  if(lbdata.lbEnable) updateOvewatchData();
  else console.log('the leaderboard is not enabled');

  setTimeout(updateLeaderboard, 900000); //900000 = 15min | 3600000 = 1h
}

function updateOvewatchData(){

  var owdata = JSON.parse(fs.readFileSync('owdata.json'));

  var players = new Array();
  var i=0;
  for(p in owdata){
    players[i] = p;
    i++;
  }

  var processPlayers = function(x){
    if(x < players.length) {

        overwatch.getOverall(owdata[players[x]].platform, owdata[players[x]].region,owdata[players[x]].battleTag).then((json) => {
          console.log(owdata[players[x]].battleTag, json.profile.rank);
          owdata[players[x]].overwatch = {
            rank: json.profile.rank
          }
          processPlayers(x+1);
        });
    }else{
      saveData(owdata);
      console.log('Overwatch data updated successfuly');
      leaderboard.update(bot);
      console.log('Leaderboard updated succesfuly')
    }
  }
  processPlayers(0);
}

function saveData (data) {
  var rawdata = JSON.stringify(data, null, 2);
  fs.writeFileSync('owdata.json', rawdata + '\n', (err) => {
    if(err) console.log(err)
  });
}
