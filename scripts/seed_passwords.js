require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');
const Usuario = require('../src/models/Usuario');

const NUEVA_CONTRASEÑA = 'Gadget2026*';
const SALT_ROUNDS = 10;

async function resetPasswords() {
    await sequelize.authenticate();

    const usuarios = await Usuario.findAll();
    const hash = await bcrypt.hash(NUEVA_CONTRASEÑA, SALT_ROUNDS);

    await Promise.all(
        usuarios.map(u => u.update({ contraseña: hash }))
    );

    console.log(`✅ Total de usuarios actualizados: ${usuarios.length}`);
    console.log(`🔑 Nueva contraseña para todos: ${NUEVA_CONTRASEÑA}`);
    console.log(`⚠️  Recuerda cambiarla después de hacer login`);

    await sequelize.close();
}

resetPasswords().catch(err => {
    console.error('❌ Error al resetear contraseñas:', err.message);
    process.exit(1);
});
