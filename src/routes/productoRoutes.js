const express = require('express');
const router = express.Router();
const {
    crearProducto,
    obtenerProductos,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController');

const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/verificarAdmin');

router.get('/', obtenerProductos);
router.post('/', verificarToken, verificarAdmin, crearProducto);
router.put('/:id', verificarToken, verificarAdmin, actualizarProducto);
router.delete('/:id', verificarToken, verificarAdmin, eliminarProducto);
router.get('/', obtenerProductos);

router.post('/', verificarToken, verificarAdmin, crearProducto);

router.put('/:id', verificarToken, verificarAdmin, actualizarProducto);

router.delete('/:id', verificarToken, verificarAdmin, eliminarProducto);

module.exports = router;
