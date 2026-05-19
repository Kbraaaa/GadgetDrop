require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { helmetConfig, limitGeneral, speedLimiter, hppConfig, xssConfig } = require('./middlewares/seguridad');
const carritoRoutes = require('./routes/carritoRoutes');
const authRoutes = require('./routes/authRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const productoRoutes = require('./routes/productoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recomendacionesRoutes = require('./routes/recomendacionesRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmetConfig);
app.use(hppConfig);
app.use(xssConfig);
app.use(speedLimiter);
app.use(limitGeneral);
app.use('/api/pedidos', require('./routes/pedidoRoutes'));

app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pago', pagoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/recomendaciones', recomendacionesRoutes);

module.exports = app;
