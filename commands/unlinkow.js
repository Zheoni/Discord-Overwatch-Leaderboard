const Discord = require('discord.js');
const leaderboard = require('./leaderboard.js');

var owdata = require('../owdata.json');

module.exports.run = async (bot, message, args) => {
  await message.reply(`You unlinked ${owdata[message.author.id].battleTag.replace('-', '#')} from your user.`);
  await leaderboard.leaver(bot, message.member);
}

module.exports.help = {
  name: 'unlinkow'
}
