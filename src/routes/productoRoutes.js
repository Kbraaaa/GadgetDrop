const express = require('express');
const router = express.Router();
const {
    crearProducto,
    obtenerProductos,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController');

// Obtener todos los productos
router.get('/', obtenerProductos);

// Crear nuevo producto
router.post('/', crearProducto);

// Actualizar producto
router.put('/:id', actualizarProducto);

// Eliminar producto
router.delete('/:id', eliminarProducto);

module.exports = router;
