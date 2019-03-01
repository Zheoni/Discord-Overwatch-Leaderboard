module.exports = (sequelize, DataTypes) => {
    sequelize.define('leaderboards', {
        guild_id: DataTypes.STRING,
        btag: DataTypes.STRING,
        username: DataTypes.STRING
    }, {
            timestamps: false
        });
}