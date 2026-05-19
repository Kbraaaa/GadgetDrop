const SupportMessage = require('../models/SupportMessage');
const mailer = require('../utils/mailer');

async function crearMensaje(req, res) {
    try {
        const { usuarioId, nombre, correo, asunto, mensaje } = req.body;
        if (!nombre || !correo || !mensaje) return res.status(400).json({ error: 'Faltan campos requeridos' });

        const nuevo = await SupportMessage.create({ usuarioId: usuarioId || null, nombre, correo, asunto, mensaje, metadata: { ip: req.ip } });

        const supportTo = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@gadgetdrop.example';
        const subject = `[Soporte] ${asunto ? asunto : 'Nuevo mensaje de soporte'}`;
        const text = `Nuevo mensaje de soporte\n\nDe: ${nombre} <${correo}>\nAsunto: ${asunto || '-'}\n\nMensaje:\n${mensaje}\n\nId interno: ${nuevo.id}`;
        const html = `<p>Nuevo mensaje de soporte</p><p><strong>De:</strong> ${nombre} &lt;${correo}&gt;</p><p><strong>Asunto:</strong> ${asunto || '-'}</p><p><strong>Mensaje:</strong><br/>${mensaje.replace(/\n/g, '<br/>')}</p><p><small>Id: ${nuevo.id}</small></p>`;

        try {
            await mailer.sendMail({ to: supportTo, subject, text, html });
        } catch (e) {
            console.error('Error enviando notificación de soporte:', e);
        }

        res.status(201).json({ mensaje: 'Mensaje recibido', id: nuevo.id });
    } catch (error) {
        console.error('Error crear mensaje soporte:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

async function getMisTickets(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const mensajes = await SupportMessage.findAll({
            where: { usuarioId },
            order: [['createdAt', 'DESC']],
        });
        const tickets = mensajes.map(m => {
            const meta = m.metadata || {};
            const replies = (meta.replies || []).map(r => ({
                text: r.text,
                at: r.at,
                emailEnviado: r.emailEnviado,
            }));
            return {
                id: m.id,
                asunto: m.asunto,
                mensaje: m.mensaje,
                status: m.status,
                createdAt: m.createdAt,
                replies,
            };
        });
        res.json({ tickets });
    } catch (error) {
        console.error('Error obteniendo mis tickets:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

module.exports = { crearMensaje, getMisTickets };
