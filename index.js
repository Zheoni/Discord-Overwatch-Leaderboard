const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const filesystem = require("fs");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

//Command Loader
filesystem.readdir("./commands", (err, files) => {
  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0) return console.log("No commands were found.");

  jsfile.forEach((f, i=0) => {
    let aux = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(aux.help.name, props);
  });

  console.log(`${jsfile.length} command(s) loaded`);
});

//When the bots turns ready when turned on
bot.on("ready", async () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
  bot.user.setActivity("i'm learning");
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

bot.login(botconfig.token);
