const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const { roleRankString, getPlayerData } = require("../overwatchData");
const db = require("../database");
const { battleTagOption, normalizeBattleTag } = require("../commonOptions");
const { getLeaderboardWithAccounts } = require("../leaderboardServices");
const { createAccount } = require("../accountServices");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join to the leaderboard of this channel.")
    .addStringOption(battleTagOption),
  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const battleTag = interaction.options.getString("battle-tag", true);
    const playerId = normalizeBattleTag(battleTag);
    if (playerId === null) {
      return interaction.reply({
        content: "This channel doesn't have an active leaderboard.",
        ephemeral: true,
      });
    }

    console.log("interaction " + interaction);

    const leaderboard = await getLeaderboardWithAccounts(interaction.channelId);

    console.log("leaderboard " + leaderboard);

    await interaction.deferReply({ ephemeral: true });

    let data = null;
    try {
      data = await getPlayerData(playerId);
    } catch (error) {
      return interaction.editReply({
        ephemeral: true,
        content: "Failed to fetch player data",
      });
    }

    if (data === null || data === undefined) {
      return interaction.editReply({
        content:
          "There is no competitive data of this player, try again after getting a rank.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${battleTag}`)
      .setDescription("Current rank")
      .addFields(
        { name: "🛡️ Tank", value: roleRankString(data.tank) },
        { name: "⚔️ Damage", value: roleRankString(data.damage) },
        { name: "💉 Support", value: roleRankString(data.support) }
      );

    const response = await createAccount({
      account: {
        battleTag,
        playerId,
        userId: interaction.user.id,
        leaderboardChannelId: leaderboard.channelId,
      },
    });

    // const response = await fetch(`${SUPABASE_URL}/Account`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     apikey: `${SUPABASE_KEY}`,
    //     Authorization: `Bearer ${SUPABASE_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     battleTag,
    //     playerId,
    //     userId: interaction.user.id,
    //     leaderboardChannelId: leaderboard.channelId,
    //   }),
    // });

    await interaction.editReply({
      ephemeral: true,
      content: `${battleTag} has joined the leaderboard!`,
      embeds: [embed],
    });
  },
};
