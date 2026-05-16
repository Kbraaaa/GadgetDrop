const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');
const { limitAuth } = require('../middlewares/seguridad');

router.post('/register', limitAuth, registrarUsuario);
router.post('/login', limitAuth, loginUsuario);
router.post('/registro', limitAuth, registrarUsuario);
module.exports = router;
