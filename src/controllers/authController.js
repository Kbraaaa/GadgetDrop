const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const LockHistory = require('../models/LockHistory');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registrarUsuario = async (req, res) => {
    try {
        // Aceptar nombres de campos en español e inglés para compatibilidad con tests
        const { nombre, correo, contraseña, email, password } = req.body;

        const correoFinal = correo || email;
        const contraseñaFinal = contraseña || password;

        if (!nombre || !correoFinal || !contraseñaFinal) {
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
        }
        if (nombre.trim().length < 2 || nombre.trim().length > 50) {
            return res.status(400).json({ mensaje: 'El nombre debe tener entre 2 y 50 caracteres' });
        }
        if (!EMAIL_RE.test(correoFinal)) {
            return res.status(400).json({ mensaje: 'El correo no tiene un formato válido' });
        }
        if (contraseñaFinal.length < 8 || !/\d/.test(contraseñaFinal)) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres y un número' });
        }

        const existe = await Usuario.findOne({ where: { correo: correoFinal } });
        if (existe) {
            return res.status(409).json({ mensaje: 'El correo ya está registrado' });
        }

        const hash = await bcrypt.hash(contraseñaFinal, 10);

        const nuevoUsuario = await Usuario.create({
            nombre,
            correo: correoFinal,
            contraseña: hash
        });

        res.status(201).json({
            mensaje: 'Usuario registrado con éxito',
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                correo: nuevoUsuario.correo
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
};

const loginUsuario = async (req, res) => {
    try {
        // Aceptar email/password además de correo/contraseña
        const { correo, contraseña, email, password } = req.body;
        const correoFinal = correo || email;
        const contraseñaFinal = contraseña || password;

        if (!correoFinal || !contraseñaFinal) {
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
        }
        if (!EMAIL_RE.test(correoFinal)) {
            return res.status(400).json({ mensaje: 'El correo no tiene un formato válido' });
        }
        if (contraseñaFinal.length < 6) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const usuario = await Usuario.findOne({ where: { correo: correoFinal } });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Correo no registrado' });
        }

        const MAX_FAILED = Number(process.env.ACCOUNT_MAX_FAILED_ATTEMPTS || 3);
        const LOCK_MINUTES = Number(process.env.ACCOUNT_LOCKOUT_MINUTES || 3);

        if (usuario.lockUntil && new Date() < new Date(usuario.lockUntil)) {
            const remainMs = new Date(usuario.lockUntil) - new Date();
            const remainSec = Math.ceil(remainMs / 1000);
            return res.status(423).json({ mensaje: `Cuenta bloqueada. Intenta de nuevo en ${remainSec} segundos` });
        }

        const esValida = await bcrypt.compare(contraseñaFinal, usuario.contraseña);
        if (!esValida) {
            usuario.failedLoginAttempts = (usuario.failedLoginAttempts || 0) + 1;
            if (usuario.failedLoginAttempts >= MAX_FAILED) {
                usuario.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
                usuario.failedLoginAttempts = 0; // reset after locking
                await usuario.save();

                try {
                    await LockHistory.create({ usuarioId: usuario.id, failedAttempts: MAX_FAILED, lockUntil: usuario.lockUntil });
                } catch (e) {
                    console.error('Error creando LockHistory:', e);
                }

                return res.status(423).json({ mensaje: `Cuenta bloqueada por ${LOCK_MINUTES} minutos debido a múltiples intentos fallidos` });
            } else {
                await usuario.save();
                const remaining = MAX_FAILED - usuario.failedLoginAttempts;
                return res.status(401).json({ mensaje: `Contraseña incorrecta. Te quedan ${remaining} intentos antes del bloqueo` });
            }
        }

        usuario.failedLoginAttempts = 0;
        usuario.lockUntil = null;
        await usuario.save();

        // marcar como desbloqueado el último registro de LockHistory si existe
        try {
            const lh = await LockHistory.findOne({ where: { usuarioId: usuario.id, unlockedAt: null }, order: [['createdAt', 'DESC']] });
            if (lh) {
                lh.unlockedAt = new Date();
                await lh.save();
            }
        } catch (e) {
            console.error('Error actualizando LockHistory:', e);
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '2h' }
        );

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario
};
