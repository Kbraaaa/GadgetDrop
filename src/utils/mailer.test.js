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

        const order = { id: 42, total: 99.9, createdAt: Date.now() };
        const items = [{ nombre: 'Producto Test', cantidad: 2, precioUnitario: 49.95 }];

        await expect(mailer.sendOrderConfirmation('to@example.com', order, items)).resolves.toBeDefined();

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        const sent = sendMailMock.mock.calls[0][0];
        expect(sent.to).toBe('to@example.com');
        expect(sent.subject).toContain(`#${order.id}`);
        // The template or fallback should include product name and order id
        expect(sent.html).toEqual(expect.stringContaining('Producto Test'));
        expect(sent.html).toEqual(expect.stringContaining(`pedido #${order.id}`.replace('#', '#')));
    });
});
