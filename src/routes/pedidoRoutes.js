const express = require('express');
const router = express.Router();
const { crearPedido, obtenerPedidosPorUsuario, actualizarEstadoPedido, crearPedidoDesdeStripe } = require('../controllers/pedidoController');

router.post('/pagado', crearPedidoDesdeStripe);

router.post('/', crearPedido);
router.get('/usuario/:usuarioId', obtenerPedidosPorUsuario);
router.put('/:id/estado', actualizarEstadoPedido);

module.exports = router;
