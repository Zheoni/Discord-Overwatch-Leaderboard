const Discord = require('discord.js');
const overwatch = require('overwatch-js');
const functions = require("./functions.js");

module.exports.run = async (bot, message, args) => {
  let platform, region, btag;
  if(args[0] && args[1] && args[2]){
    platform = args[0].toLowerCase();
    region = args[1].toLowerCase();
    btag = args[2].replace("#", "-");
  }else return await message.reply("Make sure you follow thr scheme !linkow <platflom> <region> <btag>");

  //verify the args
  if (platform != 'pc') return await message.reply("Sorry, the bot only support 'pc' player at this moment."); //because
  if (region != "eu" && region != "us" && region != "asia") return await message.reply("The region must be: 'eu', 'us' or 'asia'.");
  
  //aks the api for the data
  try {
    await overwatch.getOverall(platform, region, btag).then((data) => {
      //create the player
      let player = {
        username: message.author.username,
        platform: platform,
        region: region,
        battleTag: btag,
        overwatch: {
          rank: data.profile.rank
        }
      }

      //console.log(data);

      addPlayer(player);

      let embed = createEmbed(data);
      
      message.reply({embed:embed});
      
      console.log(`linkow success: ${btag} ${message.author.username}  ${data.profile.rank}sr`);
    });
  } catch (err) {
    console.log(err);
    return message.reply('The profile was not found... or some other weird error. Try again later.');
  }
  
  function addPlayer(player) {
    let owdata = functions.loadData('owdata.json');
    
    let guildplayers = {};   //auxiliar object of all the players in the server
    if (owdata[message.guild.id]) guildplayers = owdata[message.guild.id];
    
    guildplayers[message.author.id] = player; //add it to the rest
    
    owdata[message.guild.id] = guildplayers;  //add the server to the rest
    
    functions.saveData(owdata, 'owdata.json');
  }

}

module.exports.help = {
  name: "linkow",
  command: true,
  usage: "linkow  <platform: pc, xbox, psn>  <region: eu, us, asia>  <btag>",
  description: "Links your overwatch rank to the bot and appear in the leaderboard. Use it again to change account if you want."
}

function createEmbed(data) {
  let embed = new Discord.RichEmbed()
    .setAuthor(data.profile.nick, data.profile.rankPicture)
    .setThumbnail(data.profile.avatar)
    .setDescription('You linked your ow profile with the bot, in the next leaderboard update you will appear with' + 
      ' a rank of **' + data.profile.rank + '**')
    .addField('Note:','If you want to change the linked account, run the command again')
    .addField('All stats:', `Click [here](${data.profile.url})`);
  return embed;
}