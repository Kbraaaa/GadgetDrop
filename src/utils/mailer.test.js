const path = require('path');

jest.mock('nodemailer', () => ({
    createTestAccount: jest.fn(),
    createTransport: jest.fn(),
    getTestMessageUrl: jest.fn()
}));

const nodemailer = require('nodemailer');

describe('mailer.sendOrderConfirmation', () => {
    let sendMailMock;

    beforeEach(() => {
        sendMailMock = jest.fn().mockResolvedValue({ messageId: 'msg-123', accepted: ['to@example.com'] });
        nodemailer.createTestAccount.mockResolvedValue({ smtp: { host: 'smtp.ethereal.email', port: 587, secure: false }, user: 'u', pass: 'p' });
        nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
        nodemailer.getTestMessageUrl.mockReturnValue('https://ethereal.test/preview');

        // Clear Node require cache for mailer so it picks up mocks in each run
        const mailerPath = path.join(__dirname, 'mailer.js');
        delete require.cache[require.resolve(mailerPath)];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call sendMail with rendered HTML (uses handlebars template)', async () => {
        const mailer = require('./mailer');

        const datos = {
            pedidoId: 42,
            total: '99.90',
            estado: 'Pendiente',
            fecha: '15 de mayo de 2026',
            nombre: 'Test User',
            items: [{ nombre: 'Producto Test', cantidad: 2, precioUnitario: '49.95', subtotal: '99.90' }],
        };

        await expect(mailer.sendOrderConfirmation('to@example.com', datos)).resolves.toBeDefined();

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        const sent = sendMailMock.mock.calls[0][0];
        expect(sent.to).toBe('to@example.com');
        expect(sent.subject).toContain(`#${datos.pedidoId}`);
        expect(sent.html).toEqual(expect.stringContaining('Producto Test'));
        expect(sent.html).toEqual(expect.stringContaining(`#${datos.pedidoId}`));
    });
});
