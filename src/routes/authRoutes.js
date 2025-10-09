const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/registro', registrarUsuario);
module.exports = router;
