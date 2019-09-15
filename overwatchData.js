const fetch = require('node-fetch');

module.exports.fetchAPI = function (btag, platform) {
    const link = `http://ovrstat.com/stats/${platform}/${btag}`;

    return new Promise(async function (resolve, reject) {
        try {
            const data = await fetch(link).then((response) => response.json());
            if (data.message === "Player not found") reject(Error(data.message));
            resolve(data);
        } catch (err) {
            reject(Error("Problem with API"));
        }
    });
}

module.exports.getRanks = function(data) {
    let tank = null, dps = null, supp = null;

    if (data.ratings) {

        for (let i = 0; i < data.ratings.length; ++i) {
            switch (data.ratings[i].role) {
                case "tank":
                    tank = data.ratings[i].level;
                    break;
                case "damage":
                    dps = data.ratings[i].level;
                    break;
                case "support":
                    supp = data.ratings[i].level;
                    break;
            }
        }
    }
    return {
        TANK: tank,
        DAMAGE: dps,
        SUPPORT: supp
    }
}