const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SupportMessage = sequelize.define('SupportMessage', {
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    asunto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('open','closed'),
        defaultValue: 'open'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'support_messages',
    timestamps: true
});

module.exports = SupportMessage;
