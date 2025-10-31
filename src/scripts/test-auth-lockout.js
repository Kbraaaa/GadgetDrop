const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const Usuario = require('../models/Usuario');
const { loginUsuario } = require('../controllers/authController');

async function ensureDb() {
    try {
        await sequelize.authenticate();
        // Asegurar que las columnas nuevas existen en la tabla (solo en dev)
        await sequelize.sync({ alter: true });
        console.log('DB connected and synced (alter:true)');
    } catch (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
}

function makeReq(correo, contraseña) {
    return { body: { correo, contraseña } };
}

function makeRes() {
    const out = {};
    out.status = function (code) { this.statusCode = code; return this; };
    out.json = function (obj) { this.body = obj; return this; };
    return out;
}

async function run() {
    await ensureDb();

    const correo = `test-lockout+${Date.now()}@example.com`;
    const plainPass = 'MiPassSegura123!';

    // borrar si existe
    await Usuario.destroy({ where: { correo } });

    const hash = await bcrypt.hash(plainPass, 10);
    const user = await Usuario.create({ nombre: 'Test Lock', correo, contraseña: hash });
    console.log('Usuario creado:', correo);

    // Realizar intentos fallidos
    for (let i = 1; i <= 3; i++) {
        const req = makeReq(correo, 'wrongpassword');
        const res = makeRes();
        await loginUsuario(req, res);
        console.log(`Intento ${i}: status=${res.statusCode}, body=`, res.body);
    }

    // Verificar en DB lockUntil
    const after = await Usuario.findOne({ where: { correo } });
    console.log('failedLoginAttempts:', after.failedLoginAttempts, 'lockUntil:', after.lockUntil);

    // Forzar desbloqueo (poner lockUntil al pasado)
    after.lockUntil = new Date(Date.now() - 1000);
    after.failedLoginAttempts = 0;
    await after.save();
    console.log('Forzado desbloqueo en DB');

    // Intento correcto
    const reqOk = makeReq(correo, plainPass);
    const resOk = makeRes();
    await loginUsuario(reqOk, resOk);
    console.log('Intento correcto: status=', resOk.statusCode, 'body=', resOk.body && (resOk.body.mensaje || resOk.body));

    // limpiar
    await Usuario.destroy({ where: { correo } });
    console.log('Usuario de prueba eliminado');

    process.exit(0);
}

run().catch(err => {
    console.error('Error en test:', err);
    process.exit(1);
});
