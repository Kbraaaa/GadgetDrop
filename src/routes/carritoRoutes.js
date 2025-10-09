const express = require('express');
const router = express.Router();
const {
    agregarAlCarrito,
    obtenerCarrito,
    eliminarDelCarrito,
    actualizarCantidad
} = require('../controllers/carritoController');

router.post('/', agregarAlCarrito);
router.get('/:usuarioId', obtenerCarrito);
router.delete('/:id', eliminarDelCarrito);
router.put('/:id', actualizarCantidad);

module.exports = router;
