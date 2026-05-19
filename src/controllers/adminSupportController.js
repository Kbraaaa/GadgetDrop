const SupportMessage = require('../models/SupportMessage');
const mailer = require('../utils/mailer');

async function listarMensajes(req, res) {
    try {
        const mensajes = await SupportMessage.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ mensajes });
    } catch (e) {
        console.error('Error listar mensajes soporte:', e);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

async function obtenerMensaje(req, res) {
    try {
        const id = req.params.id;
        const mensaje = await SupportMessage.findByPk(id);
        if (!mensaje) return res.status(404).json({ error: 'No encontrado' });
        res.json({ mensaje });
    } catch (e) {
        console.error('Error obtener mensaje:', e);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

async function responderMensaje(req, res) {
    try {
        const id = req.params.id;
        const { reply, close } = req.body;
        const mensaje = await SupportMessage.findByPk(id);
        if (!mensaje) return res.status(404).json({ error: 'No encontrado' });

        if (!reply) return res.status(400).json({ error: 'El campo reply es requerido' });

        const subject = `Re: ${mensaje.asunto || 'Soporte'}`;
        const html = `<p>Hola ${mensaje.nombre},</p><p>${reply.replace(/\n/g, '<br/>')}</p><hr/><p>Mensaje original:</p><p>${mensaje.mensaje.replace(/\n/g, '<br/>')}</p>`;
        const text = `${reply}\n\n---\nMensaje original:\n${mensaje.mensaje}`;

        let correoEnviado = false;
        try {
            await mailer.sendMail({ to: mensaje.correo, subject, html, text });
            correoEnviado = true;
        } catch (e) {
            console.error('Error enviando respuesta soporte:', e);
        }

        const meta = mensaje.metadata || {};
        if (!meta.replies) meta.replies = [];
        meta.replies.push({
            by: req.usuario ? req.usuario.id : null,
            text: reply,
            at: new Date(),
            emailEnviado: correoEnviado,
        });
        meta.lastReply = meta.replies[meta.replies.length - 1];
        if (!correoEnviado) meta.emailError = true;
        if (close) mensaje.status = 'closed';
        mensaje.metadata = meta;
        await mensaje.save();

        res.json({ mensaje: 'Respuesta enviada', emailEnviado: correoEnviado });
    } catch (e) {
        console.error('Error responder mensaje:', e);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

async function cerrarMensaje(req, res) {
    try {
        const id = req.params.id;
        const mensaje = await SupportMessage.findByPk(id);
        if (!mensaje) return res.status(404).json({ error: 'No encontrado' });
        mensaje.status = 'closed';
        await mensaje.save();
        res.json({ mensaje: 'Cerrado' });
    } catch (e) {
        console.error('Error cerrar mensaje:', e);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

module.exports = { listarMensajes, obtenerMensaje, responderMensaje, cerrarMensaje };
