const Discord = require('discord.js');
const { Accounts, Leaderboards } = require("../dbObjects");

module.exports.run = async (bot, message, args) => {
    if (args[0]) {
        Leaderboards.destroy({where: {
            guild_id: message.guild.id,
            user_id: message.author.id,
            btag: args[0].replace('#', '-')
        }});
        Leaderboards.findAndCount({where: {
            btag: args[0].replace('#', '-')
        }}).then((result) => {
            if (result.count == 0) {
                Accounts.destroy({where: {
                        battleTag: args[0].replace('#', '-')
                    }
                })
            }
        });
    } else return message.reply(usage);
}

module.exports.help = {
    name: 'unlinkow',
    command: true,
    usage: "unlinkow [battletag]; or: unlinkow all",
    description: "Delete your data and you will no longer appear in the leaderboard."
}
