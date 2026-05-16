const express = require('express');
const router = express.Router();
const { getRecomendaciones, getRecomendacionesPorNombre, getPrediccionDemanda } = require('../controllers/recomendacionesController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/buscar', verificarToken, getRecomendacionesPorNombre);
router.get('/demanda', verificarToken, getPrediccionDemanda);
router.get('/demanda/:productoId', verificarToken, getPrediccionDemanda);
router.get('/:productoId', verificarToken, getRecomendaciones);

module.exports = router;
