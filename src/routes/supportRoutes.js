const express = require('express');
const router = express.Router();
const { crearMensaje } = require('../controllers/supportController');

// POST /api/support/message
router.post('/message', crearMensaje);

module.exports = router;
