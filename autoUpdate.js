const db = require("./database");
const { leaderboardEmbeds, embedTitle } = require("./leaderboardEmbed");

const updateTime = 10000; //900000 = 15min | 1200000 = 20min | 3600000 = 1h


let interval = null;

/**
 * 
 * @param {import("discord.js").Client} client 
 */
function startUpdates(client) {
    update(client);
    interval = setInterval(() => update(client), updateTime);
}

function stopUpdates() {
    clearInterval(interval);
}

/**
 * 
 * @param {import("discord.js").Client} client 
 */
async function update(client) {
    const all = await db.leaderboard.findMany({ include: { accounts: true } });
    for (const lb of all) {
        const guild = await client.guilds.fetch(lb.guildId);
        const channel = await guild.channels.fetch(lb.channelId);
        if (channel === null || !channel.isTextBased()) continue;
        const embeds = await leaderboardEmbeds(embedTitle(lb.title, guild.name), lb.accounts);
        await channel.messages.edit(lb.messageId, { embeds });
    }
}

module.exports = { startUpdates, stopUpdates }