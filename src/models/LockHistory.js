const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LockHistory = sequelize.define('LockHistory', {
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    failedAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    unlockedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'lock_histories',
    timestamps: true
});

module.exports = LockHistory;
