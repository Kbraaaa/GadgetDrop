const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const productoRoutes = require('./routes/productoRoutes');
app.use('/api/productos', productoRoutes);

const carritoRoutes = require('./routes/carritoRoutes');
app.use('/api/carrito', carritoRoutes);

const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/api/pedidos', pedidoRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const pagoRoutes = require('./routes/pagoRoutes');
app.use('/api/pagos', pagoRoutes);

const sequelize = require('./config/db');
sequelize.sync()
    .then(() => console.log('🟢 Base de datos sincronizada'))
    .catch(err => console.error('🔴 Error al conectar con la base de datos:', err));

app.listen(process.env.PORT || 5000, () => {
    console.log('Servidor ejecutandose en http://localhost:5000');

    require('./models');
});
