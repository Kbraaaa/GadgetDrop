const app = require('./app');
const sequelize = require('./config/db');

// Sincronizar base de datos
sequelize.sync()
    .then(() => console.log('🟢 Base de datos sincronizada'))
    .catch(err => console.error('🔴 Error al conectar con la base de datos:', err));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    require('./models');
});