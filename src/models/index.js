const Usuario = require('./Usuario');
const Producto = require('./Producto');
const Carrito = require('./Carrito');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');

// Relación Usuario Carrito
Usuario.hasMany(Carrito, { foreignKey: 'usuarioId' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Relación Producto Carrito
Producto.hasMany(Carrito, { foreignKey: 'productoId' });
Carrito.belongsTo(Producto, { foreignKey: 'productoId' });

// Relación Pedido DetallePedido
Pedido.hasMany(DetallePedido, { foreignKey: 'pedidoId' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId' });

// Relación Producto DetallePedido
Producto.hasMany(DetallePedido, { foreignKey: 'productoId' });
DetallePedido.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = {
    Usuario,
    Producto,
    Carrito,
    Pedido,
    DetallePedido
};
