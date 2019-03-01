const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    operatorsAliases: false,
    storage: 'database.sqlite',
});

sequelize.import('models/Accounts.js');
sequelize.import('models/Leaderboards.js');
sequelize.import('models/Servers.js');

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => { sequelize.close() }).catch(console.error);