const Discord = require('discord.js');
const overwatch = require('overwatch-js');

const functions = require('./functions.js');

module.exports.run = async (bot, message, args) => {
  let lbdata = functions.loadData('lbdata.json');

  //This is for setting up the leaderboard in a channel
  if (args[0]){ //if the are an argument
	if(args[0].toLowerCase() === 'set'){  //and is 'set'
	  if(! message.member.hasPermission("ADMINISTRATOR")) return message.reply("you don't have permissions to do that.");
	  //and the summoner is an admin, sets the leaderboard data
	  lbdata = {
		  guildName: message.guild.name,
		  lbGuild: message.guild.id,
		  lbChannel: message.channel.id,
		  lbEnable: true
	  }

	  //if(lbdata.lbMsgId) delete lbdata.lbMsgId;

	  //saveData(lbdata);
	  await functions.saveData(lbdata, 'lbdata.json');//and save it

	  message.reply('The leaderboard has been set to this channel.'
						  + 'If you delete the first leaderboard message, you'
						  + 'will have yo set it up again. You can delete this one');

	}else return message.reply('that does nothing my friend.');
  }

  if(message.channel.id==lbdata.lbChannel){ //when the command is summoned in the correct channel
	
	await showLeaderboard(bot); //shows the leaderboard
	message.delete(500);  //and delete the msg

  }else return message.reply('the leaderboard is not set up in this channel');
  
  
}

module.exports.update = function (bot) {

	let owdata = functions.loadData('owdata.json');

	let players = new Array();
	let i = 0;
	for (let p in owdata) {
		players[i] = p;
		i++;
	}

	var processPlayers = function (x) {
		if (x < players.length) {

			overwatch.getOverall(owdata[players[x]].platform, owdata[players[x]].region, owdata[players[x]].battleTag).then((json) => {
				console.log(owdata[players[x]].battleTag, json.profile.rank);

				owdata[players[x]].overwatch = {
					rank: json.profile.rank
				}

				processPlayers(x + 1);
			});
		} else {
			functions.saveData(owdata, 'owdata.json');
			console.log('Overwatch data updated successfuly');
			showLeaderboard(bot);
			console.log('Leaderboard updated succesfuly')
		}
	}
	processPlayers(0);
}

module.exports.help = {
  name: "leaderboard",
  command: true
}

function newPerson (username, rank, btag) {
  return {
	username: username,
	rank: rank,
	owusername: btag.split('-').shift()
  };
}

function showLeaderboard(bot){
  let owdata = functions.loadData('owdata.json');
  let lbdata = functions.loadData('lbdata.json');
  let board = new Array();

  for (let p in owdata) {
	if(owdata[p].overwatch.rank){	//if they are ranked
	  board.push(newPerson(owdata[p].username, owdata[p].overwatch.rank, owdata[p].battleTag)); //add the players to the leaderboard
	}
  }
  
  board.sort(function(a, b){return a.rank - b.rank}).reverse();		//sort the leadeboard
  
  //console.log(board);
  
  let embed = new Discord.RichEmbed()	//create the embed and fill it
  .setAuthor(`${bot.guilds.get(lbdata.lbGuild).name} Overwatch Leaderboard`, 'https://vignette.wikia.nocookie.net/overwatch/images/c/cc/Competitive_Grandmaster_Icon.png/revision/latest?cb=20161122023845')
  .setColor('#f48642')
  .setTimestamp();
  
  let i;
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
  
  if(lbdata.lbMsgId ){	//if there is a message
	bot.guilds.get(lbdata.lbGuild).channels.get(lbdata.lbChannel).fetchMessage(lbdata.lbMsgId).then(msg => msg.edit({embed: embed})); //edit it
	
  }else{	//else send a msg and add it to the lbdata
	bot.guilds.get(lbdata.lbGuild).channels.get(lbdata.lbChannel).send({embed: embed}).then((msg) => {
	  lbdata.lbMsgId = msg.id;
	  functions.saveData(lbdata, 'lbdata.json');
	});

  }

}
