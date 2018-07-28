const Discord = require('discord.js');
const overwatch = require('overwatch-js');

const functions = require('./functions.js');

module.exports.run = async (bot, message, args) => {
	let lbdata = functions.loadData('lbdata.json');

	//This is for setting up the leaderboard in a channel
	if (args[0]) { //if the are an argument
		if (args[0].toLowerCase() === 'enable') {  //and is 'set'
			if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("you don't have permissions to do that.");
			//and the summoner is an admin, sets the leaderboard data
			lbdata[message.guild.id] = {
				guildName: message.guild.name,
				lbChannel: message.channel.id,
				lbEnable: true
			}

			await functions.saveData(lbdata, 'lbdata.json');//and save it

			await message.reply('The leaderboard has been set to this channel.'
				+ 'If you delete the first leaderboard message, you'
				+ 'will have yo set it up again. You can delete this one');

		} else if (args[0].toLowerCase() === 'disable') {	//and is 'disable'
			lbdata[message.guild.id].lbEnable = false;								//disables it
			await functions.saveData(lbdata, 'lbdata.json');
			return message.reply('The leaderboard has been disabled');
		} else return message.reply('that does nothing my friend.');
	}
	
	//when the command is summoned in the correct channel and its enabled
	if (lbdata[message.guild.id] && 
		message.channel.id == lbdata[message.guild.id].lbChannel && lbdata[message.guild.id].lbEnable == true) {

		await update(bot, message.guild.id); //shows the leaderboard
		message.delete(500);  //and delete the msg

	} else return message.reply('the leaderboard is not set up in this channel');


}

module.exports.update = (bot, serverid) => update(bot, serverid);


function update(bot, serverid) {

	let owdata = functions.loadData('owdata.json');

	let players = new Array();
	let i = 0;
	for (let p in owdata[serverid]) {
		players[i] = p;
		i++;
	}

	var processPlayers = function (x) {
		if (x < players.length) {

			overwatch.getOverall(owdata[serverid][players[x]].platform, owdata[serverid][players[x]].region, owdata[serverid][players[x]].battleTag).then((json) => {
				console.log(owdata[serverid][players[x]].battleTag, json.profile.rank);

				owdata[serverid][players[x]].overwatch = {
					rank: json.profile.rank
				}

				processPlayers(x + 1);
			});
		} else {
			functions.saveData(owdata, 'owdata.json');
			console.log('Overwatch data updated successfuly in server ' + serverid);
			showLeaderboard(bot, serverid);
		}
	}
	processPlayers(0);
}

module.exports.help = {
	name: "leaderboard",
	command: true,
	usage: "leaderboard	[enable/disable]",
	description: "Enables or disables the leaderboard in the current channel. The leaderboard is updated every 20 minutes. With no arguments, just updates the leaderboard."
}

function newPerson(username, rank, btag) {
	return {
		username: username,
		rank: rank,
		owusername: btag.split('-').shift()
	};
}

function showLeaderboard(bot, serverid) {
	let owdata = functions.loadData('owdata.json');
	let lbdata = functions.loadData('lbdata.json');
	let board = new Array();

	for (let p in owdata[serverid]) {
		if (owdata[serverid][p].overwatch.rank) {	//if they are ranked
			board.push(newPerson(owdata[serverid][p].username, owdata[serverid][p].overwatch.rank, owdata[serverid][p].battleTag)); //add the players to the leaderboard
		}
	}

	board.sort(function (a, b) { return a.rank - b.rank }).reverse();		//sort the leadeboard

	//console.log(board);

	let embed = new Discord.RichEmbed()	//create the embed and fill it
		.setAuthor(`${bot.guilds.get(serverid)} Overwatch Leaderboard`, 'https://vignette.wikia.nocookie.net/overwatch/images/c/cc/Competitive_Grandmaster_Icon.png/revision/latest?cb=20161122023845')
		.setColor('#F48642')
		.setTimestamp();

	let i;
	for (i = 0; i < board.length; i++) {
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
				fieldName = `${i + 1}º`;
		}
		embed.addField(fieldName, `${board[i].rank}sr   |   **${board[i].username}** *(${board[i].owusername})*`);
	}
	embed.addBlankField();

	if (lbdata[serverid].lbMsgId) {	//if there is a message

		try {
			bot.guilds.get(serverid).channels.get(lbdata[serverid].lbChannel).fetchMessage(lbdata[serverid].lbMsgId).then(msg => msg.edit({ embed: embed })); //edit it
		} catch (error) {
			console.error(error);
			console.log('There was a problem finding the lb msg');
		}

	} else {	//else send a msg and add it to the lbdata
		bot.guilds.get(serverid).channels.get(lbdata[serverid].lbChannel).send({ embed: embed }).then((msg) => {
			lbdata[serverid].lbMsgId = msg.id;
			functions.saveData(lbdata, 'lbdata.json');
		});

	}

	console.log('Leaderboard updated succesfuly in server' + serverid);
}
