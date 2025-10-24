const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// registro
const registrarUsuario = async (req, res) => {
    try {
        // Aceptar nombres de campos en español e inglés para compatibilidad con tests
        const { nombre, correo, contraseña, email, password } = req.body;

        const correoFinal = correo || email;
        const contraseñaFinal = contraseña || password;

        if (!nombre || !correoFinal || !contraseñaFinal) {
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
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

// login
const loginUsuario = async (req, res) => {
    try {
        // Aceptar email/password además de correo/contraseña
        const { correo, contraseña, email, password } = req.body;
        const correoFinal = correo || email;
        const contraseñaFinal = contraseña || password;

        if (!correoFinal || !contraseñaFinal) {
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
        }

        const usuario = await Usuario.findOne({ where: { correo: correoFinal } });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Correo no registrado' });
        }
        const esValida = await bcrypt.compare(contraseñaFinal, usuario.contraseña);
        if (!esValida) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        // token
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

