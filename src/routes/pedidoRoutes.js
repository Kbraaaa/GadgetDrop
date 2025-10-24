const express = require('express');
const router = express.Router();
const {
    crearPedido,
    obtenerPedidosPorUsuario,
    actualizarEstadoPedido,
    crearPedidoDesdeStripe
} = require('../controllers/pedidoController');

// Desde Stripe (cuando el pago se confirma)
router.post('/pagado', crearPedidoDesdeStripe);

// Crear un pedido manual (modo test o sin Stripe)
router.post('/', crearPedido);

// Consultar pedidos de un usuario
router.get('/usuario/:usuarioId', obtenerPedidosPorUsuario);

// Actualizar el estado de un pedido
router.put('/:id/estado', actualizarEstadoPedido);

module.exports = router;
