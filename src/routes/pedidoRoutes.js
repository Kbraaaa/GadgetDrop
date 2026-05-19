const express = require('express');
const router = express.Router();
const {
    crearPedido,
    obtenerPedidosPorUsuario,
    actualizarEstadoPedido,
    crearPedidoDesdeStripe
} = require('../controllers/pedidoController');

const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/verificarAdmin');

router.post('/pagado', crearPedidoDesdeStripe);
router.post('/', crearPedido);
router.get('/usuario/:usuarioId', verificarToken, obtenerPedidosPorUsuario);
router.put('/:id/estado', verificarToken, verificarAdmin, actualizarEstadoPedido);

module.exports = router;
