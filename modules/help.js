//help command

const Discord = require('discord.js');
const botconfig = require('../botconfig.json');
const fs = require('fs');

let commands = new Object();

module.exports.run = async (bot, message, args) => {

  fs.readdir("./modules/", (err, files) => {
    if (err) console.log(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles <= 0) return console.log("No commands found for help");

    jsfiles.forEach((f) => {
      let prop = require(`./${f}`);
      if (prop.help.command == true){
        let cmdinfo = {
          usage: prop.help.usage,
          description: prop.help.description
        }
        commands[prop.help.name] = cmdinfo;
      } 
    });

    createandsendmsg();
  });

  
  function createandsendmsg(){
    let embed = new Discord.RichEmbed()
      .setAuthor(`${bot.user.username} help:`)
      .setTitle('Note: these < > are requiered, and these [ ] are optional.')
      .setColor('#551A8B');
  
    for (let cmd in commands) {
      embed.addField(botconfig.prefix + commands[cmd].usage, commands[cmd].description);
      embed.addBlankField();
    }
  
    message.channel.send({ embed: embed });
  }
}

module.exports.help = {
  name: 'help',
  command: true,
  usage: 'help',
  description: "This embed."
}
