const Discord = require('discord.js');
const fs = require('fs');
const overwatch = require('overwatch-js');

var owdata = require('../owdata.json');

module.exports.run = async (bot, message, args) => {
  const platform = args[0].toLowerCase();
  const region = args[1].toLowerCase();
  const btag = args[2].replace("#", "-");

  if(!(platform == 'pc')) return await message.reply("Sorry, the bot only support 'pc' player at this moment.");
  if(region != "eu" && region != "us" && region != "asia") return await message.reply("The region must be: 'eu', 'us' or 'asia'.");

  try{
    await overwatch.getOverall(platform, region, btag).then( (data) => {
      owdata = createLink(owdata, message.author.id, message.author.username,
                platform, region, btag, data.profile.rank);

      message.reply(`You linked "${btag.replace("-", "#")}" in "${platform}" in "${region}" to your discord accounthis bot. If it  is not correct, try the command again.`);

      var rawdata = JSON.stringify(owdata, null, 2);
      fs.writeFile('owdata.json', rawdata, (err) => {
        if(err) console.log(err)
      });
      console.log(`linkow success: ${btag} ${message.author.username}  ${data.profile.rank}sr`);
    } );
  }catch(err){
    console.log(err);
    return message.reply('The profile was not found.');
  }

  function createLink(owdata, id, user, platform, region, btag, rank){
    owdata[id] = {
      username: user,
      platform: platform,
      region: region,
      battleTag: btag,
      overwatch: {
        rank: rank
      }
    };
    return owdata;
  }

}

module.exports.help = {
  name: "linkow",
  command: true
}
