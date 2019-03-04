module.exports = (sequelize, DataTypes) => {
    return sequelize.define('leaderboards', {
        guild_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        btag: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        username: DataTypes.STRING
    }, {
            timestamps: false
        });
}