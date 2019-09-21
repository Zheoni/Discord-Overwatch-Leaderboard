const Discord = require('discord.js');
const ow = require("../overwatchData");
const { Accounts, Servers, Leaderboards } = require("../dbObjects");

module.exports.run = async (bot, message, args) => {
	let platform, btag;
	if (args[0] && args[1]) {
		platform = args[0].toLowerCase();
		btag = args[1].replace("#", "-");
	} else return await message.reply("addAccount  [platform: pc, xbl, psn]  [BattleTag]");

	//verify the args
	if (platform != 'pc' && platform != 'xbl' && platform != 'psn')
		return await message.reply("The platform musb be 'pc', 'xbl', 'psn'.");

	//aks the api for the data
	let data;
	try {
		let auxmsg = await message.channel.send("Searching profile...");

		data = await ow.fetchAPI(btag, platform);

		await auxmsg.delete();
	} catch (error) {
		console.error(error);
		console.log("Cannot fetch " + btag);
		return message.reply('The profile was not found... or some other weird error. Try again later.');
	}

	const ranks = ow.getRanks(data);
	const added = await addPlayer(btag, platform, ranks);
	if (added) {
		let embed = createEmbed(data, ranks);
		console.log(`linkow success: ${btag} ${message.author.username}`);
		await message.reply({ embed: embed });
	} else {
		await message.reply("The leaderboard is not set up or it does not allow multiple accounts.");
	}

	async function addPlayer(btag, platform, ranks) {

		const canMultiple = await Servers.findByPk(message.guild.id).then((guild) => {
			if (guild) return guild.lbAllowMultiple;
			else return false;
		});

		const count = await Leaderboards.count({
			where: {
				guild_id: message.guild.id,
				user_id: message.author.id,
			}
		});

		if (count == 0 || canMultiple) {
			Accounts.upsert({
				battleTag: btag,
				platform: platform,
				rankTANK: ranks.TANK,
				rankDAMAGE: ranks.DAMAGE,
				rankSUPPORT: ranks.SUPPORT
			});
			Leaderboards.upsert({
				guild_id: message.guild.id,
				battleTag: btag,
				user_id: message.author.id,
				username: message.author.username
			});
			return true;
		} else return false;
	}

}

module.exports.help = {
	name: "addAccount",
	command: true,
	usage: "addAccount  [platform: pc, xbl, psn]  [BattleTag]",
	description: "Links your overwatch rank to the bot and appear in the leaderboard. Use it again to change account if you want."
}

function createEmbed(data, ranks) {
	let embed = new Discord.RichEmbed()
		.setAuthor(data.name)
		.setThumbnail(data.icon)
		.setDescription(`You linked your ow profile with the bot, in the next leaderboard update you will appear with
			a rank of **🛡${ranks.TANK || " -"} 🔫${ranks.DAMAGE || " -"} 💉${ranks.SUPPORT || " -"}**`);

	if (data.ratings) {
		const idx = (Math.floor(Math.random() * 10)) % data.ratings.length;
		embed.setAuthor(embed.author.name, data.ratings[idx].rankIcon);
	}

	return embed;
}
