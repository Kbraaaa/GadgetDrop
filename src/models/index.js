const Usuario = require('./Usuario');
const Producto = require('./Producto');
const Carrito = require('./Carrito');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');
const LockHistory = require('./LockHistory');

Usuario.hasMany(Carrito, { foreignKey: 'usuarioId' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Producto.hasMany(Carrito, { foreignKey: 'productoId' });
Carrito.belongsTo(Producto, { foreignKey: 'productoId' });
Pedido.hasMany(DetallePedido, { foreignKey: 'pedidoId' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId' });
Producto.hasMany(DetallePedido, { foreignKey: 'productoId' });
DetallePedido.belongsTo(Producto, { foreignKey: 'productoId' });

// Lock history
Usuario.hasMany(LockHistory, { foreignKey: 'usuarioId' });
LockHistory.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = {
    Usuario,
    Producto,
    Carrito,
    Pedido,
    DetallePedido
    , LockHistory
};
