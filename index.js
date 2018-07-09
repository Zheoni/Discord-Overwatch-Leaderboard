const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const prefix = botconfig.prefix;

const bot = new Discord.Client();

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setActivity("i'm learning");
});

bot.on("message", async message => {

  let args = message.content.slice(botconfig.prefix.length).trim().split(' ');
  let cmd = args.shift().toLowerCase();

  // This is the command handler
  try {

    let cmdFile = require(`./commands/${cmd}.js`);
    cmdFile.run(bot, message, args);

  } catch (e) {
    console.log(e.stack);
  }

});

bot.login(botconfig.token);
