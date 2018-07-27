const Discord = require('discord.js');
const fs = require('fs');
const overwatch = require('overwatch-js');
const functions = require("./functions.js");

module.exports.run = async (bot, message, args) => {
  const platform = args[0].toLowerCase();
  const region = args[1].toLowerCase();
  const btag = args[2].replace("#", "-");
  
  let owdata = functions.loadData('owdata.json');

  let guildplayers = {};
  if(owdata[message.guild.id]) guildplayers = owdata[message.guild.id];

  if(platform != 'pc') return await message.reply("Sorry, the bot only support 'pc' player at this moment.");
  if(region != "eu" && region != "us" && region != "asia") return await message.reply("The region must be: 'eu', 'us' or 'asia'.");

  try{
    await overwatch.getOverall(platform, region, btag).then( (data) => {

      let player = {
        username: message.author.username,
        platform: platform,
        region: region,
        battleTag: btag,
        overwatch: {
          rank: data.profile.rank
        }
      }

      guildplayers[message.author.id] = player;

      owdata[message.guild.id] = guildplayers;

      message.reply(`You linked "${btag.replace("-", "#")}" in "${platform}" in "${region}" to your discord accounthis bot. If it  is not correct, try the command again.`);

      functions.saveData(owdata, 'owdata.json')
      console.log(`linkow success: ${btag} ${message.author.username}  ${data.profile.rank}sr`);
    } );
  }catch(err){
    console.log(err);
    return message.reply('The profile was not found.');
  }

}

module.exports.help = {
  name: "linkow",
  command: true
}
