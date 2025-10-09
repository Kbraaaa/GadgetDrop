const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gadgetdrop_db', 'postgres', '16052222771', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

module.exports = sequelize;
