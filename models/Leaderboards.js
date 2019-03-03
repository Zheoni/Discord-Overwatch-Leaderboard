module.exports = (sequelize, DataTypes) => {
    return sequelize.define('leaderboards', {
        guild_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        btag: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        username: DataTypes.STRING
    }, {
            timestamps: false
        });
}