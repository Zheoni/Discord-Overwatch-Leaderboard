const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Add an account to the leaderboard of this channel."),
    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.reply("not implemented");
    }
}