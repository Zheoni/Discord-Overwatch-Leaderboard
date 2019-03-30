module.exports = (sequelize, DataTypes) => {
    return sequelize.define('servers', {
        guild_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        lbEnable: DataTypes.BOOLEAN,
        lbChannel: DataTypes.STRING,
        lbMsgId: DataTypes.STRING,
        lbAllowMultiple: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
            timestamps: false
        });
};