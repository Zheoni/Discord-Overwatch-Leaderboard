const Discord = require('discord.js');

const functions = require('./functions.js');

module.exports.run = async (bot, message, args) => {
    let owdata = functions.loadData('owdata.json');
    if(owdata[message.guild.id][message.author.id]){
        await delete owdata[message.guild.id][message.author.id];
        await functions.saveData(owdata, 'owdata.json');
        return message.reply('You unlinked your btaf succesfully');
    }else return message.reply('You have not linked your btag');
}

module.exports.help = {
    name: 'unlinkow',
    command: true
}
