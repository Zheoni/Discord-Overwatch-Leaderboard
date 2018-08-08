const Discord = require('discord.js');

const functions = require('./functions.js');

module.exports.run = async (bot, message, args) => {
    let owdata = functions.loadData('owdata.json');
    if (owdata[message.guild.id]) {
        if (owdata[message.guild.id][message.author.id]) {
            await delete owdata[message.guild.id][message.author.id];
            await functions.saveData(owdata, 'owdata.json');
            return message.reply('You unlinked your btag succesfully');
        } else return message.reply('You have not linked your btag');
    } else return message.reply('This server has no one with its profile linked, not even you!');
}

module.exports.help = {
    name: 'unlinkow',
    command: true,
    usage: "unlinkow",
    description: "Delete your data and you will no longer appear in the leaderboard."
}
