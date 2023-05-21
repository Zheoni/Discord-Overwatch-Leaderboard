/**
 * 
 * @param {import("discord.js").SlashCommandStringOption} option 
 */
function battleTagOption(option) {
    return option
        .setName("battle-tag")
        .setDescription("Player battle tag")
        .setRequired(true)
        .setMinLength(6) // 1 char + 1 # + 4 numbers
        .setMaxLength(64)
}

/**
 * 
 * @param {string} battleTag 
 */
function normalizeBattleTag(battleTag) {
    const pos = battleTag.lastIndexOf("#");
    if (pos < 1) {
        return null;
    }
    const playerId = battleTag.substring(0, pos) + "-" + battleTag.substring(pos + 1);
    return playerId;
}

module.exports = { battleTagOption, normalizeBattleTag }