const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./Usuario');
const Producto = require('./Producto');

const Carrito = sequelize.define('Carrito', {
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'carritos',
    timestamps: true
});

Usuario.hasMany(Carrito, { foreignKey: 'usuarioId' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Producto.hasMany(Carrito, { foreignKey: 'productoId' });
Carrito.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = Carrito;


