module.exports = (sequelize, DataTypes) => {
    return sequelize.define('accounts', {
        battleTag: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        platform: DataTypes.STRING(6),
        rankTANK: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        rankDAMAGE: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        rankSUPPORT: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    }, {
            timestamps: false
        });
};