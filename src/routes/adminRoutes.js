const express = require('express');
const router = express.Router();




const verificarToken = require('../middlewares/authMiddleware');


const verificarAdmin = require('../middlewares/verificarAdmin');


const { obtenerTodosLosPedidos } = require('../controllers/adminController');


router.get('/pedidos', verificarToken, verificarAdmin, obtenerTodosLosPedidos);


router.get('/panel', verificarToken, verificarAdmin, (req, res) => {
    res.json({
        mensaje: `Bienvenido al panel admin, ${req.usuario.nombre}`,
        rol: req.usuario.rol
    });
});

module.exports = router;
