module.exports = (sequelize, DataTypes) => {
    return sequelize.define('servers', {
        serverid: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        servername: DataTypes.STRING,
        lbEnable: DataTypes.BOOLEAN,
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