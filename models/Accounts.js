module.exports = (sequelize, DataTypes) => {
    return sequelize.define('accounts', {
        battleTag: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        platform: DataTypes.STRING(6),
        region: DataTypes.STRING(6),
        rank: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    }, {
            timestamps: false
        });
};