const Discord = require('discord.js');
const api = require("../overwatchData");
const { Accounts, Servers, Leaderboards } = require("../dbObjects");

module.exports.run = async (bot, message, args) => {
	let platform, region, btag;
	if (args[0] && args[1] && args[2]) {
		platform = args[0].toLowerCase();
		region = args[1].toLowerCase();
		btag = args[2].replace("#", "-");
	} else return await message.reply("Make sure you follow thr scheme !linkow <platflom> <region> <btag>");

	//verify the args
	if (platform != 'pc')
		return await message.reply("Sorry, the bot only support 'pc' player at this moment."); //because
	if (region != "eu" && region != "us" && region != "asia")
		return await message.reply("The region must be: 'eu', 'us' or 'asia'.");

	//aks the api for the data
	const data = await api.fetchAPI(btag, platform, region).then((data) => {
		return data;
	}).catch((error) => {
		console.error(error);
		console.log("Cannot fetch " + players[i].battleTag);
		return message.reply('The profile was not found... or some other weird error. Try again later.');
	});
	
	const added = await addPlayer(btag, platform, region, data.rating);
	if (added) {
		let embed = createEmbed(data);
		console.log(`linkow success: ${btag} ${message.author.username}  ${data.rating}sr`);
		await message.reply({ embed: embed });
	} else {
		await message.reply("The leaderboard does not allow multiple accounts, ask your server admind to change that.");
	}
	
	async function addPlayer(btag, platform, region, rank) {
		const canMultiple = await Servers.findByPk(message.guild.id).then((guild) => {
			return guild.lbAllowMultiple;
		});
		
		const count = await Leaderboards.count({where: {
			guild_id: message.guild.id,
			user_id: message.author.id,
		}});

		if(count == 0 || canMultiple) {
			Accounts.upsert({
				battleTag: btag,
				platform: platform,
				region: region,
				rank: rank
			});
			Leaderboards.upsert({
				guild_id: message.guild.id,
				btag: btag,
				user_id: message.author.id,
				username: message.author.username
			});
			return true;
		} else return false;
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
		.setAuthor(data.name, data.ratingIcon)
		.setThumbnail(data.icon)
		.setDescription('You linked your ow profile with the bot, in the next leaderboard update you will appear with' +
			' a rank of **' + data.rating + '**')
		.addField('Note:', 'If you want to change the linked account, run the command again')
	return embed;
}