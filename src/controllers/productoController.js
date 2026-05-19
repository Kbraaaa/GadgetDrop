const Producto = require('../models/Producto');

const crearProducto = async (req, res) => {
    try {
        const producto = await Producto.create(req.body);
        res.status(201).json({ mensaje: 'Producto creado', producto });
    } catch (error) {
        console.error('❌ Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        console.error('❌ Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll();
        res.json(productos);
    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await producto.update(req.body);
        res.json({ mensaje: 'Producto actualizado', producto });
    } catch (error) {
        console.error('❌ Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await producto.destroy();
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto
};
