const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Producto = require('../models/Producto');

const obtenerTodosLosPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            include: [{
                model: DetallePedido,
                include: [Producto]
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(pedidos);
    } catch (error) {
        console.error('❌ Error al obtener todos los pedidos:', error);
        res.status(500).json({ error: 'Error interno al obtener pedidos.' });
    }
};

module.exports = { obtenerTodosLosPedidos };
