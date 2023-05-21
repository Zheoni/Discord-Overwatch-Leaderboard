const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { battleTagOption, normalizeBattleTag } = require("../commonOptions");
const db = require("../database");
const { leaderboardEmbeds, embedTitle } = require("../leaderboardEmbed");
const { getPlayerData } = require("../overwatchData");

/**
 * 
 * @param {import("discord.js").SlashCommandStringOption} option 
 */
function title(option) {
    return option.setName("title").setDescription("Title of the leaderboard").setMaxLength(128);
}

/**
 * 
 * @param {import("discord.js").SlashCommandBooleanOption} option 
 */
function splitRoles(option) {
    return option.setName("split-roles").setDescription("Split the leaderboard into 3, one for each role");
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Manages this channel leaderboard")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Creates a new leaderboard in this channel")
                .addStringOption(title)
                .addBooleanOption(splitRoles)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("edit")
                .setDescription("Edit the options of a leaderboard without removing it")
                .addStringOption(title)
                .addBooleanOption(splitRoles)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("destroy")
                .setDescription("Deletes the leaderboard of this channel")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("update")
                .setDescription("Force an update of the leaderboard")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Manually add an account to the leaderboard")
                .addStringOption(battleTagOption)
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription("Discord user associated with this account")
                        .setRequired(false)
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName("remove")
                .setDescription("Manually remove users from the leaderboard")
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("account")
                        .setDescription("Remove an (battle.net) account")
                        .addStringOption(battleTagOption)
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("user")
                        .setDescription("Remove all accounts associated with a discord user")
                        .addUserOption(option =>
                            option
                                .setName("user")
                                .setDescription("Discord to remove")
                                .setRequired(true)
                        )
                )
        )
    ,
    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup();
        if (subcommand === "create") {
            return createLeaderboard(interaction);
        } else if (subcommand === "edit") {
            return editLeaderboard(interaction);
        } else if (subcommand === "destroy") {
            return destroyLeaderboard(interaction);
        } else if (subcommand === "update") {
            return update(interaction);
        } else if (subcommand === "add") {
            return addAccount(interaction);
        } else if (group === "remove" && subcommand === "account") {
            return removeAccount(interaction);
        } else if (group === "remove" && subcommand === "user") {
            return removeUser(interaction);
        }
    }
}

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function createLeaderboard(interaction) {
    const leaderboard = await db.leaderboard.findUnique({
        where: {
            channelId: interaction.channelId
        },
    });
    if (leaderboard !== null) {
        return interaction.reply({ content: "This channel already has a leaderboard, remove it first.", ephemeral: true });
    }

    const title = interaction.options.getString("title");
    const splitRoles = interaction.options.getBoolean("split-roles") ?? false;

    const embeds = await leaderboardEmbeds(embedTitle(title, interaction.guild.name), [], splitRoles);
    const msg = await interaction.channel.send({ embeds });

    await db.leaderboard.create({
        data: {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            messageId: msg.id,
            title,
            splitRoles
        }
    });

    await interaction.reply({ content: "Leaderboard created and ready to add accounts!", ephemeral: true });
}

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function editLeaderboard(interaction) {
    const leaderboard = await db.leaderboard.findUnique({
        where: {
            channelId: interaction.channelId
        },
    });
    if (leaderboard === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    const newTitle = interaction.options.getString("title");
    const splitRoles = interaction.options.getBoolean("split-roles");
    if (newTitle === null && splitRoles === null) {
        return interaction.reply({ content: "Nothing to update", ephemeral: true });
    }

    const updated = await db.leaderboard.update({
        where: {
            channelId: interaction.channelId,
        },
        data: {
            title: newTitle ?? undefined,
            splitRoles: splitRoles ?? undefined
        },
        include: {
            accounts: true
        }
    });

    await interaction.reply({ content: "Options updated! The leaderboard should update soon.", ephemeral: true });
    const embeds = await leaderboardEmbeds(embedTitle(updated.title, interaction.guild.name), updated.accounts);
    await interaction.channel.messages.edit(updated.messageId, { embeds });
}

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function destroyLeaderboard(interaction) {
    const leaderboard = await db.leaderboard.findUnique({
        where: {
            channelId: interaction.channelId
        },
    });
    if (leaderboard === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    await db.leaderboard.delete({
        where: {
            channelId: interaction.channelId
        }
    });
    await interaction.reply({ content: "Leaderboard removed from this channel", ephemeral: true });
    await interaction.channel.messages.delete(leaderboard.messageId);
}

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function update(interaction) {
    const leaderboard = await db.leaderboard.findUnique({
        where: {
            channelId: interaction.channelId
        },
        include: {
            accounts: true
        }
    });
    if (leaderboard === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
        const embeds = await leaderboardEmbeds(embedTitle(leaderboard.title, interaction.guild.name), leaderboard.accounts);
        await interaction.channel.messages.edit(leaderboard.messageId, { embeds });
    } catch (error) {
        console.error(error);
        return interaction.editReply({ content: "Failed to update :pensive:" });
    }
    await interaction.editReply({ content: "Updated!" });
}

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function addAccount(interaction) {
    const leaderboard = await db.leaderboard.findUnique({
        where: {
            channelId: interaction.channelId
        },
    });
    if (leaderboard === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    const battleTag = interaction.options.getString("battle-tag", true);
    const playerId = normalizeBattleTag(battleTag);
    if (playerId === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        await getPlayerData(playerId);
    } catch (error) {
        return interaction.editReply({ ephemeral: true, content: "Failed to fetch player data" });
    }

    const user = interaction.options.getUser("user");

    await db.account.create({
        data: {
            battleTag,
            playerId,
            userId: user?.id,
            leaderboardChannelId: leaderboard.channelId,
        }
    });

    await interaction.reply({ content: "Player added", ephemeral: true });
}

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function removeUser(interaction) {
    const leaderboard = await db.leaderboard.findUnique({
        where: {
            channelId: interaction.channelId
        },
    });
    if (leaderboard === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    const user = interaction.options.getUser("user", true);

    const deleted = await db.account.deleteMany({
        where: {
            userId: user.id,
            leaderboardChannelId: leaderboard.channelId
        }
    });

    await interaction.reply({ content: `Deleted ${deleted.count} accounts from ${user.username}`, ephemeral: true });
}

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function removeAccount(interaction) {
    const leaderboard = await db.leaderboard.findUnique({
        where: {
            channelId: interaction.channelId
        },
    });
    if (leaderboard === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    const battleTag = interaction.options.getString("account", true);
    const playerId = normalizeBattleTag(battleTag);
    if (playerId === null) {
        return interaction.reply({ content: "This channel doesn't have an active leaderboard.", ephemeral: true });
    }

    const _deleted = await db.account.deleteMany({
        where: {
            playerId,
            leaderboardChannelId: leaderboard.channelId
        }
    });
    await interaction.reply({ content: `Deleted`, ephemeral: true });
}