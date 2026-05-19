const express = require('express');
const router = express.Router();
const { crearMensaje, getMisTickets } = require('../controllers/supportController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/message', crearMensaje);
router.get('/mis-tickets', verificarToken, getMisTickets);

module.exports = router;
