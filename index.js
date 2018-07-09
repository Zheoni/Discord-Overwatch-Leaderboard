const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const bot = new Discord.Client();

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setActivity("i'm learning");
});

bot.on("message", async message => {

  if(! message.content.startsWith(botconfig.prefix)) return; //if the msg does not starst with the prefix, ignore it
  //if (message.author.bot) return; //if the author is a bot, ignore the msg.

  let args = message.content.slice(botconfig.prefix.length).trim().split(' ');
  let cmd = args.shift().toLowerCase();

  //console.log(message.content);
  //console.log(args);
  //console.log(cmd);

  // This is the command handler
  try {

    let cmdFile = require(`./commands/${cmd}.js`);
    cmdFile.run(bot, message, args);

  } catch (e) {
    console.log(e.stack);
  }

});

bot.login(botconfig.token);
