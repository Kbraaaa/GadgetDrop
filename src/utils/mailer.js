const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

let transporter = null;
const templateCache = new Map();

async function initTransport() {
    if (transporter) return transporter;

    const provider = process.env.EMAIL_PROVIDER || 'smtp';
    const fromAddress = process.env.EMAIL_FROM || 'no-reply@gadgetdrop.example';

    if (provider === 'smtp' && process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
        });
    } else {
        // development: use Ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
        console.log('Mailer: using Ethereal test account. Messages will be available at the test URL.');
    }

    transporter.defaultFrom = fromAddress;
    return transporter;
}

async function sendMail({ to, subject, text, html }) {
    const t = await initTransport();
    const msg = {
        from: process.env.EMAIL_FROM || t.defaultFrom,
        to,
        subject,
        text,
        html
    };
    const info = await t.sendMail(msg);

    // If using Ethereal, print preview URL
    try {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log('Preview message URL:', preview);
    } catch (e) {
        // ignore
    }

    return info;
}

function renderOrderHtml(order, items) {
    const rows = items.map(i => `<tr><td style="padding:6px 8px;border:1px solid #eee">${i.nombre}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:center">${i.cantidad}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:right">$${Number(i.precioUnitario).toFixed(2)}</td></tr>`).join('');
    const total = Number(order.total).toFixed(2);
    return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
      <h2>Confirmación de pedido #${order.id}</h2>
      <p>Gracias por tu compra. Aquí tienes los detalles de tu pedido:</p>
      <table style="border-collapse:collapse;width:100%;max-width:600px"> 
        <thead>
          <tr>
            <th style="padding:6px 8px;border:1px solid #eee;text-align:left">Producto</th>
            <th style="padding:6px 8px;border:1px solid #eee">Cantidad</th>
            <th style="padding:6px 8px;border:1px solid #eee;text-align:right">Precio unitario</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p style="margin-top:12px;font-weight:600">Total: $${total}</p>
      <p style="color:#666;font-size:13px">Fecha del pedido: ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
      <hr/>
      <p style="font-size:12px;color:#999">GadgetDrop</p>
    </div>
    `;
}

function loadTemplate(templateName) {
    if (templateCache.has(templateName)) return templateCache.get(templateName);

    const tplPath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    try {
        const source = fs.readFileSync(tplPath, 'utf8');
        const compiled = handlebars.compile(source);
        templateCache.set(templateName, compiled);
        return compiled;
    } catch (e) {
        // Template not found or read error
        return null;
    }
}

async function sendOrderConfirmation(to, datos) {
    try {
        const subject = `Confirmación de pedido #${datos.pedidoId}`;

        const tpl = loadTemplate('order-confirmation');
        if (tpl) {
            const html = tpl(datos);
            const textLines = [
                `Pedido #${datos.pedidoId}`,
                `Estado: ${datos.estado}`,
                `Total: $${datos.total}`,
                `Fecha: ${datos.fecha}`
            ];
            (datos.items || []).forEach(i =>
                textLines.push(`${i.nombre} x${i.cantidad} - $${i.precioUnitario} (subtotal: $${i.subtotal})`)
            );
            return await sendMail({ to, subject, html, text: textLines.join('\n') });
        }

        // Fallback to inline renderer
        const html = renderOrderHtml(
            { id: datos.pedidoId, total: datos.total, createdAt: null },
            datos.items || []
        );
        const text = `Tu pedido #${datos.pedidoId} fue recibido. Total: $${datos.total}`;
        return await sendMail({ to, subject, html, text });
    } catch (error) {
        console.error('ERROR enviando correo:', error.message);
        console.error('Destinatario:', to);
        console.error('Stack:', error.stack);
        throw error;
    }
}

module.exports = {
    sendMail,
    sendOrderConfirmation
};
