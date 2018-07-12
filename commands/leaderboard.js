const Discord = require('discord.js');
const fs = require('fs');

var lbdata = require('../lbdata.json');

module.exports.leaver = async (bot, member) => {
  var owdata = JSON.parse(fs.readFileSync('../owdata.json'));
  delete owdata[(member.id)];

  var rawdata = JSON.stringify(owdata, null, 2);
  fs.writeFile('owdata.json', rawdata, (err) => {
    if(err) console.log(err)
  });

}

module.exports.run = async (bot, message, args) => {
  var owdata = JSON.parse(fs.readFileSync('owdata.json'));

  //This is for setting up the leaderboard in a channel
  if (args[0]){
    if(args[0].toLowerCase() === 'set'){
      if(! message.member.hasPermission("ADMINISTRATOR")) return message.reply("you don't have permissions to do that.");

      lbdata = {
          guildName: message.guild.name,
          lbGuild: message.guild.id,
          lbChannel: message.channel.id,
          lbEnable: true
      }

      if(lbdata.lbMsgId) delete lbdata.lbMsgId;

      saveData(lbdata);

      message.reply('The leaderboard has been set to this channel.'
                          + 'If you delete the first leaderboard message, you'
                          + 'will have yo set it up again. You can delete this one');

    }else return message.reply('that does nothing my friend.');
  }

  if(message.channel.id==lbdata.lbChannel){

    await showLeaderboard(bot, owdata, lbdata);
    message.delete(500);

  }else return message.reply('the leaderboard is not set up in this channel');

  saveData(lbdata);

}

module.exports.update = (bot) => {
  var rawdata = fs.readFileSync('owdata.json');
  var owdata = JSON.parse(rawdata);
  showLeaderboard(bot, owdata, lbdata);
}

module.exports.help = {
  name: "leaderboard"
}

function saveData (data) {
  var rawdata = JSON.stringify(data, null, 2);
  fs.writeFile('lbdata.json', rawdata, (err) => {
    if(err) console.log(err)
  });
}

function showLeaderboard(bot, owdata, lbdata){
  var board = new Array();

  for (p in owdata) {
    if(owdata[p].overwatch.rank){
      board.push(newPerson(owdata[p].username, owdata[p].overwatch.rank, owdata[p].battleTag));
    }
  }

  function newPerson (username, rank, btag) {
    return {
      username: username,
      rank: rank,
      owusername: btag.split('-').shift()
    };
  }

  board.sort(function(a, b){return a.rank - b.rank}).reverse();

  //console.log(board);

  let embed = new Discord.RichEmbed()
  .setAuthor(`${bot.guilds.get(lbdata.lbGuild).name} Overwatch Leaderboard`, 'https://vignette.wikia.nocookie.net/overwatch/images/c/cc/Competitive_Grandmaster_Icon.png/revision/latest?cb=20161122023845')
  .setColor('#f48642')
  .setTimestamp();

  var boardmsg = new String();
  var i;
  for(i=0; i < board.length; i++){
    switch (i) {
      case 0:
      fieldName = '🥇';
      break;
      case 1:
      fieldName = '🥈';
      break;
      case 2:
      fieldName = '🥉';
      break;
      default:
      fieldName = `${i+1}º`;
    }
    embed.addField(fieldName, `${board[i].rank}sr   |   **${board[i].username}** *(${board[i].owusername})*`);
  }
  embed.addBlankField();

  if(lbdata.lbMsgId ){
      bot.guilds.get(lbdata.lbGuild).channels.get(lbdata.lbChannel).fetchMessage(lbdata.lbMsgId).then(msg => msg.edit({embed: embed}));

  }else{
    bot.guilds.get(lbdata.lbGuild).channels.get(lbdata.lbChannel).send({embed: embed}).then((msg) => lbdata.lbMsgId = msg.id);
  }


}
