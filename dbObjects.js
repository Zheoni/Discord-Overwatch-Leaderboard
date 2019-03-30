const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Accounts = sequelize.import('models/Accounts.js');
const Leaderboards = sequelize.import('models/Leaderboards.js');
const Servers = sequelize.import('models/Servers.js');

Leaderboards.belongsTo(Accounts, { foreignKey: 'battleTag', as: 'account' });

module.exports = { Accounts, Leaderboards, Servers };