const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pedido = sequelize.define('Pedido', {
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'pendiente'
    },
    externalId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

}, {
    tableName: 'pedidos'
});

module.exports = Pedido;

