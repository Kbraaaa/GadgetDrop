// src/app.js
// Cargar variables de entorno lo antes posible
require('dotenv').config();

// Cargar variables de entorno lo antes posible para que controladores (ej. Stripe) las vean

const express = require('express');
const cors = require('cors');
const carritoRoutes = require('./routes/carritoRoutes');
const authRoutes = require('./routes/authRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/pedidos', require('./routes/pedidoRoutes'));

app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pago', pagoRoutes);
app.use('/api/productos', productoRoutes);

module.exports = app;
