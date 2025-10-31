const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

const crearPedido = async (req, res) => {
    const { usuarioId, externalId } = req.body;

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

        if (externalId) {
            const existente = await Pedido.findOne({ where: { externalId } });
            if (existente) return res.json({ mensaje: 'Pedido ya registrado', pedidoId: existente.id });
        }

        const normalizeCarrito = items => {
            return items
                .map(it => ({ productoId: it.Producto?.id || it.productoId, cantidad: Number(it.cantidad), precioUnitario: Number(it.Producto?.precio ?? it.precioUnitario) }))
                .sort((a, b) => a.productoId - b.productoId);
        };

        const carritoNorm = normalizeCarrito(carrito || []);
        const now = new Date();
        const WINDOW_SECONDS = 120;

        const recientes = await Pedido.findAll({
            where: { usuarioId },
            include: [{ model: DetallePedido }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const isSameDetalles = (car, detalles) => {
            const detNorm = (detalles || []).map(d => ({ productoId: d.productoId, cantidad: Number(d.cantidad), precioUnitario: Number(d.precioUnitario) })).sort((a, b) => a.productoId - b.productoId);
            if (car.length !== detNorm.length) return false;
            for (let i = 0; i < car.length; i++) {
                if (car[i].productoId !== detNorm[i].productoId) return false;
                if (Number(car[i].cantidad) !== Number(detNorm[i].cantidad)) return false;
                if (Math.abs(Number(car[i].precioUnitario) - Number(detNorm[i].precioUnitario)) > 0.01) return false;
            }
            return true;
        };

        for (const ped of recientes) {
            const ageSeconds = (now - new Date(ped.createdAt)) / 1000;
            if (ageSeconds <= WINDOW_SECONDS) {
                if (isSameDetalles(carritoNorm, ped.DetallePedidos)) {
                    return res.json({ mensaje: 'Pedido ya registrado recientemente', pedidoId: ped.id });
                }
            } else break;
        }

        const nuevoPedido = await Pedido.create({
            usuarioId,
            externalId: externalId || null,
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

const crearPedidoDesdeStripe = async (req, res) => {
    const { usuarioId, carrito, externalId } = req.body;

    try {
        const normalizeCarrito = items => {
            return items
                .map(it => ({ productoId: it.Producto?.id || it.productoId, cantidad: Number(it.cantidad), precioUnitario: Number(it.Producto?.precio ?? it.precioUnitario) }))
                .sort((a, b) => a.productoId - b.productoId);
        };

        const carritoNorm = normalizeCarrito(carrito || []);
        const now = new Date();
        const WINDOW_SECONDS = 120;

        const recientes = await Pedido.findAll({
            where: { usuarioId },
            include: [{ model: DetallePedido }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const isSameDetalles = (car, detalles) => {
            const detNorm = (detalles || []).map(d => ({ productoId: d.productoId, cantidad: Number(d.cantidad), precioUnitario: Number(d.precioUnitario) })).sort((a, b) => a.productoId - b.productoId);
            if (car.length !== detNorm.length) return false;
            for (let i = 0; i < car.length; i++) {
                if (car[i].productoId !== detNorm[i].productoId) return false;
                if (Number(car[i].cantidad) !== Number(detNorm[i].cantidad)) return false;
                // allow small float diffs in price
                if (Math.abs(Number(car[i].precioUnitario) - Number(detNorm[i].precioUnitario)) > 0.01) return false;
            }
            return true;
        };

        for (const ped of recientes) {
            const ageSeconds = (now - new Date(ped.createdAt)) / 1000;
            if (ageSeconds <= WINDOW_SECONDS) {
                if (isSameDetalles(carritoNorm, ped.DetallePedidos)) {
                    return res.json({ mensaje: 'Pedido ya registrado recientemente', pedidoId: ped.id });
                }
            } else {
                break;
            }
        }
        if (externalId) {
            const existente = await Pedido.findOne({ where: { externalId } });
            if (existente) return res.json({ mensaje: 'Pedido ya registrado', pedidoId: existente.id });
        }

        const total = carrito.reduce((sum, item) => {
            return sum + item.cantidad * parseFloat(item.Producto.precio);
        }, 0);

        const nuevoPedido = await Pedido.create({
            usuarioId,
            externalId: externalId || null,
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

const obtenerPedidosPorUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        if (req.usuario && req.usuario.id && req.usuario.id.toString() !== usuarioId.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado: solo puedes ver tus propios pedidos' });
        }

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
