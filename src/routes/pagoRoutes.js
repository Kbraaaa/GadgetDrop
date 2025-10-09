const express = require('express');
const router = express.Router();
const { crearSesionPago } = require('../controllers/pagoController');

router.post('/stripe', crearSesionPago);

module.exports = router;
