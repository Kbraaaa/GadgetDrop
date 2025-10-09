const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

// Agregar producto al carrito
const agregarAlCarrito = async (req, res) => {
    const { usuarioId, productoId, cantidad } = req.body;
    try {
        const itemExistente = await Carrito.findOne({
            where: { usuarioId, productoId }
        });

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
            await itemExistente.save();
            return res.json({ mensaje: 'Cantidad actualizada', carrito: itemExistente });
        }

        const nuevoItem = await Carrito.create({ usuarioId, productoId, cantidad });
        res.status(201).json({ mensaje: 'Producto agregado al carrito', carrito: nuevoItem });
    } catch (error) {
        console.error('🔴 ERROR AL AGREGAR AL CARRITO:', error); // <--- importante
        res.status(500).json({ error: 'Error al agregar al carrito' });
    }
};

// Obtener el carrito de un usuario
const obtenerCarrito = async (req, res) => {
    const { usuarioId } = req.params;
    try {
        const items = await Carrito.findAll({
            where: { usuarioId },
            include: [Producto]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
};

// Eliminar un producto del carrito
const eliminarDelCarrito = async (req, res) => {
    const { id } = req.params;
    try {
        await Carrito.destroy({ where: { id } });
        res.json({ mensaje: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar del carrito' });
    }
};
// Actualizar la cantidad de un producto en el carrito
const actualizarCantidad = async (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    try {
        const item = await Carrito.findByPk(id);
        if (!item) {
            return res.status(404).json({ mensaje: 'Ítem no encontrado' });
        }

        if (cantidad < 1) {
            return res.status(400).json({ mensaje: 'La cantidad debe ser al menos 1' });
        }

        item.cantidad = cantidad;
        await item.save();

        res.json({ mensaje: 'Cantidad actualizada', item });
    } catch (error) {
        console.error('❌ Error al actualizar cantidad:', error);
        res.status(500).json({ mensaje: 'Error al actualizar cantidad' });
    }
};

module.exports = {
    agregarAlCarrito,
    obtenerCarrito,
    eliminarDelCarrito,
    actualizarCantidad
};
