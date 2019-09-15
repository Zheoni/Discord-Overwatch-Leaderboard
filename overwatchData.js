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