const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

// Crear pedido desde el carrito
const crearPedido = async (req, res) => {
    const { usuarioId } = req.body;

    try {
        const carrito = await Carrito.findAll({
            where: { usuarioId },
            include: Producto
        });

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const total = carrito.reduce((sum, item) => {
            return sum + item.cantidad * parseFloat(item.Producto.precio);
        }, 0);

        const nuevoPedido = await Pedido.create({
            usuarioId,
            total,
            pagado: false
        });

        for (const item of carrito) {
            await DetallePedido.create({
                pedidoId: nuevoPedido.id,
                productoId: item.Producto.id,
                cantidad: item.cantidad,
                precioUnitario: item.Producto.precio
            });
        }

        await Carrito.destroy({ where: { usuarioId } });

        res.json({ mensaje: 'Pedido creado con éxito', pedidoId: nuevoPedido.id });
    } catch (error) {
        console.error('❌ ERROR AL CREAR PEDIDO:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
};

// Crear pedido luego del pago (desde /success)
const crearPedidoDesdeStripe = async (req, res) => {
    const { usuarioId, carrito } = req.body;

    try {
        const total = carrito.reduce((sum, item) => {
            return sum + item.cantidad * parseFloat(item.Producto.precio);
        }, 0);

        const nuevoPedido = await Pedido.create({
            usuarioId,
            total,
            pagado: true
        });

        for (const item of carrito) {
            await DetallePedido.create({
                pedidoId: nuevoPedido.id,
                productoId: item.Producto.id,
                cantidad: item.cantidad,
                precioUnitario: item.Producto.precio
            });
        }

        await Carrito.destroy({ where: { usuarioId } });

        res.json({ mensaje: 'Pedido guardado luego del pago', pedidoId: nuevoPedido.id });
    } catch (err) {
        console.error('❌ Error al guardar pedido post-pago:', err);
        res.status(500).json({ error: 'No se pudo guardar el pedido' });
    }
};

// Obtener pedidos por usuario
const obtenerPedidosPorUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        const pedidos = await Pedido.findAll({
            where: { usuarioId },
            include: [{
                model: DetallePedido,
                include: [Producto]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(pedidos);
    } catch (error) {
        console.error('🔴 ERROR AL OBTENER PEDIDOS:', error);
        res.status(500).json({ error: 'Error al obtener pedidos.' });
    }
};

// Actualizar estado del pedido
const actualizarEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const pedido = await Pedido.findByPk(id);
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        pedido.estado = estado;
        await pedido.save();

        res.json({ mensaje: 'Estado del pedido actualizado correctamente', pedido });
    } catch (err) {
        console.error("❌ ERROR en crearPedidoDesdeStripe:", err);
        res.status(500).json({ error: err.message || 'Error al guardar pedido' });
    }

};

module.exports = {
    crearPedido,
    crearPedidoDesdeStripe,
    obtenerPedidosPorUsuario,
    actualizarEstadoPedido
};
