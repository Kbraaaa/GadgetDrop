const express = require('express');
const router = express.Router();
const { getRecomendaciones, getRecomendacionesPorNombre } = require('../controllers/recomendacionesController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/buscar', verificarToken, getRecomendacionesPorNombre);
router.get('/:productoId', verificarToken, getRecomendaciones);

module.exports = router;
