/**
 * @typedef {"bronze"|"silver"|"gold"|"platinum"|"diamond"|"master"|"grandmaster"} Division
 */

/**
 * @typedef {1|2|3|4|5} Tier
 */

/**
 * @typedef {object} Role
 * @property {Division} division
 * @property {Tier} tier
 */

/**
 * @typedef {object} Competitive
 * @property {Role?} tank
 * @property {Role?} damage
 * @property {Role?} support
 */

/**
 * 
 * @param {string} playerId battle tag with # replaced with -
 */
async function getPlayerData(playerId) {
    const url = `https://overfast-api.tekrop.fr/players/${playerId}/summary`;

    const response = await fetch(url);
    const data = await response.json();

    /**
     * @type {Competitive?}
     */
    const competitive = data.competitive?.pc ?? data.competitive?.console

    return competitive;
}

/**
 * 
 * @param {Role?} roleData 
 */
function roleRankString(roleData) {
    if (!roleData) return "Unranked";
    const division = roleData.division.substring(0, 1).toUpperCase() + roleData.division.substring(1);
    return `${division} ${roleData.tier}`;
}

const DIVISIONS = {
    "bronze": 0,
    "silver": 1500,
    "gold": 2000,
    "platinum": 2500,
    "diamond": 3000,
    "master": 3500,
    "grandmaster": 4000
};

const TIERS = {
    1: 400,
    2: 300,
    3: 200,
    4: 100,
    5: 0
};

/**
 * 
 * @param {Role?} role 
 */
function getSkillRating(role) {
    if (!role) return null;
    return DIVISIONS[role.division] + TIERS[role.tier]
}

/**
 * 
 * @param {Competitive?} competitive 
 */
function getTotalSkillRating(competitive) {
    if (!competitive) return null;

    if (
        competitive.tank === null
        && competitive.damage === null
        && competitive.support === null
    ) return null;

    return getSkillRating(competitive.tank) ?? 0
        + getSkillRating(competitive.damage) ?? 0
        + getSkillRating(competitive.support) ?? 0;
}

/**
 * 
 * @param {Competitive?} competitive 
 */
function getAverageSkillRating(competitive) {
    const total = getTotalSkillRating(competitive);
    if (!total) return null;
    return total / 3;
}

module.exports = { getPlayerData, roleRankString, getSkillRating, getTotalSkillRating, getAverageSkillRating };