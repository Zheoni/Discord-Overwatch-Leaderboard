//help command

const Discord = require('discord.js');
const botconfig = require('../botconfig.json')

module.exports.run = async (bot, message, args) => {
  var embed = new Discord.RichEmbed()
    .setAuthor(`${bot.user.username} help:`)
    .setColor('#551A8B')
    .addField(`${botconfig.prefix}linkow <platform: pc, xbox, psn>   <region: eu, us, asia>   <btag>`, 'Use this command to link your overwatch rank to the bot and appear in the leaderboard. Use it again to change account.')
    .addBlankField()
    .addField(`${botconfig.prefix}unlinkow`, 'Delete your data and you will no longer appear in the leaderboard')
    .addBlankField()
    .addField(`${botconfig.prefix}leaderboard <enable/disable>`, 'Places or removes the leaderboard in the current channel. The leaderboard is updated every 15 minutes.')
    .addBlankField()
    .addField(`${botconfig.prefix}leaderboard`, 'Just updates the leaderboard.');
    
  message.channel.send({embed: embed});
}

module.exports.help = {
  name: 'help',
  command: true
}
