const express = require('express');
const router = express.Router();




const verificarToken = require('../middlewares/authMiddleware');


const verificarAdmin = require('../middlewares/verificarAdmin');


const { obtenerTodosLosPedidos } = require('../controllers/adminController');
const { listarMensajes, obtenerMensaje, responderMensaje, cerrarMensaje } = require('../controllers/adminSupportController');


router.get('/pedidos', verificarToken, verificarAdmin, obtenerTodosLosPedidos);


router.get('/panel', verificarToken, verificarAdmin, (req, res) => {
    res.json({
        mensaje: `Bienvenido al panel admin, ${req.usuario.nombre}`,
        rol: req.usuario.rol
    });
});

// Support admin routes
router.get('/support', verificarToken, verificarAdmin, listarMensajes);
router.get('/support/:id', verificarToken, verificarAdmin, obtenerMensaje);
router.post('/support/:id/reply', verificarToken, verificarAdmin, responderMensaje);
router.put('/support/:id/close', verificarToken, verificarAdmin, cerrarMensaje);

module.exports = router;
