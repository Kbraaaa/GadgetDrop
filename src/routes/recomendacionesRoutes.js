const express = require('express');
const router = express.Router();
const { getRecomendaciones, getRecomendacionesPorNombre, getPrediccionDemanda } = require('../controllers/recomendacionesController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/verificarAdmin');

router.get('/buscar', verificarToken, getRecomendacionesPorNombre);
router.get('/demanda', verificarToken, verificarAdmin, getPrediccionDemanda);
router.get('/demanda/:productoId', verificarToken, verificarAdmin, getPrediccionDemanda);
router.get('/:productoId', verificarToken, getRecomendaciones);

module.exports = router;
