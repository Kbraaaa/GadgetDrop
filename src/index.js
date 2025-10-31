const app = require('./app');
const sequelize = require('./config/db');

const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
sequelize.sync(syncOptions)
    .then(() => console.log('🟢 Base de datos sincronizada'))
    .catch(err => console.error('🔴 Error al conectar con la base de datos:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    require('./models');
});