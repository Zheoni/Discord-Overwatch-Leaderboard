const Discord = require('discord.js');
const api = require("../overwatchData");

const { Accounts, Leaderboards, Servers } = require("../dbObjects");

module.exports.run = async (bot, message, args) => {
	if (args[0]) { //if the are an argument
		if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("you don't have permissions to do that.");
		if (args[0].toLowerCase() === 'enable') {  //and is 'enable'
			// and the summoner is an admin, sets the leaderboard data
			let canMultiple = false;
			if (args[1] && args[1] === 'multiple') {
				canMultiple = true;
			}

			const msg = await message.channel.send("Setting up leaderboard...");

			Servers.upsert({
				serverid: message.guild.id,
				lbEnable: true,
				lbChannel: msg.channel.id,
				lbMsgId: msg.id,
				lbAllowMultiple: canMultiple
			});

			showLeaderboard(bot, message.guild.id);

			return await message.reply('The leaderboard has been set to this channel. '
				+ 'If you delete the first leaderboard message, you '
				+ 'will have yo set it up again. You can delete this one');
		} else if (args[0].toLowerCase() === 'disable') {	//and is 'disable'
			Servers.upsert({
				serverid: message.guild.id,
				lbEnable: false
			});
			return await message.reply('The leaderboard has been disabled');
		} else return await message.reply('That does nothing');
	}

	const guild = await Servers.findOne({
		where: {
			serverid: message.guild.id
		}
	});

	if (guild && guild.lbEnable == true) {
		message.delete();
		showLeaderboard(bot, guild.serverid);
	} else {
		await message.reply('The leaderboard is not enabled');
	}
}

module.exports.update = async function () {
	const players = await Accounts.findAll();
	for (let i = 0; i < players.length; i++) {
		api.fetchAPI(players[i].battleTag, players[i].platform, players[i].region).then((data) => {
			console.log(players[i].battleTag, data.rating);
			Accounts.update({ rank: data.rating }, { where: { battleTag: players[i].battleTag } });
		}).catch((error) => {
			console.error(error);
			console.log("Cannot fetch " + players[i].battleTag);
		});
	}
};

module.exports.help = {
	name: "leaderboard",
	command: true,
	usage: "leaderboard	[enable/disable] [multiple]",
	description: "Enables or disables the leaderboard in the current channel. The leaderboard is updated every 20 minutes. With no arguments, just updates the leaderboard. 'multiple' allow one user to add more accounts"
}

function newPerson(username, rank, btag) {
	return {
		username: username,
		rank: rank,
		owusername: btag.replace('-', '#')
	};
}

async function showLeaderboard(bot, serverid) {
	let board = [];

	{
		const players = await Leaderboards.findAll({
			where: {
				guild_id: serverid
			},
			include: ['account']
		});
		for (let i = 0; i < players.length; i++) {
			console.log(players[i].btag, players[i].account.rank);
			if (players[i].account.rank != 0) {
				const entry = newPerson(players[i].username,
					players[i].account.rank,
					players[i].btag);
				board.push(entry);
			}
		}
	}

	board.sort(function (a, b) { return a.rank - b.rank }).reverse();		//sort the leadeboard

	//console.log(board);

	let embed = new Discord.RichEmbed()	//create the embed and fill it
		.setAuthor(`${bot.guilds.get(serverid)} Overwatch Leaderboard`, 'https://vignette.wikia.nocookie.net/overwatch/images/c/cc/Competitive_Grandmaster_Icon.png/revision/latest?cb=20161122023845')
		.setColor('#F48642')
		.setTimestamp();

	let i, fieldName;
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
		embed.addField(fieldName, `${board[i].rank}sr   |   **${board[i].owusername}** *(${board[i].username})*`);
	}
	embed.addBlankField();

	const guild = await Servers.findByPk(serverid);

	if (guild.lbMsgId) {	//if there is a message
		try {
			bot.guilds.get(serverid).channels.get(guild.lbChannel).fetchMessage(guild.lbMsgId).then(msg => msg.edit({ embed: embed })); //edit it
		} catch (error) {
			console.error(error);
			console.log('There was a problem finding the leaderboards message');
		}
	} else {
		console.log("ERROR: No leaderboard message");
	}

	console.log('Leaderboard updated succesfuly in server ' + serverid);
}
