'use strict';

jest.mock('../models/SupportMessage', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
}));
jest.mock('../utils/mailer', () => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
}));
// Other models used by controllers loaded via app
jest.mock('../models/Carrito', () => ({
    findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), destroy: jest.fn(),
}));
jest.mock('../models/Producto', () => ({
    findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn(),
}));
jest.mock('../models/Pedido', () => ({
    findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(),
    create: jest.fn(), destroy: jest.fn(),
}));
jest.mock('../models/DetallePedido', () => ({
    create: jest.fn(), findAll: jest.fn(),
}));
jest.mock('../models/Usuario', () => ({
    findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn(),
}));
jest.mock('../models/LockHistory', () => ({
    create: jest.fn(), findOne: jest.fn(),
}));

const SupportMessage = require('../models/SupportMessage');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

const adminToken = jwt.sign(
    { id: 1, nombre: 'Admin', correo: 'admin@test.com', rol: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
);
const userToken = jwt.sign(
    { id: 2, nombre: 'User', correo: 'user@test.com', rol: 'usuario' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

// Helper: mock message object with save()
function makeMsgMock(overrides = {}) {
    return {
        id: 1, nombre: 'Ana', correo: 'ana@test.com',
        asunto: 'Consulta', mensaje: 'Hola, tengo una pregunta.',
        status: 'open', metadata: null,
        save: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

describe('📨 Pruebas de Soporte (supportController + adminSupportController)', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ── POST /api/support/message ──────────────────────────────────────────────

    test('POST /api/support/message - crea mensaje correctamente', async () => {
        SupportMessage.create.mockResolvedValue({ id: 1 });

        const res = await request(app)
            .post('/api/support/message')
            .send({ nombre: 'Ana', correo: 'ana@test.com', asunto: 'Consulta', mensaje: 'Hola' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.mensaje).toContain('recibido');
    });

    test('POST /api/support/message - retorna 400 si faltan campos obligatorios', async () => {
        const res = await request(app)
            .post('/api/support/message')
            .send({ nombre: 'Ana' }); // missing correo and mensaje

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('POST /api/support/message - retorna 400 si falta correo', async () => {
        const res = await request(app)
            .post('/api/support/message')
            .send({ nombre: 'Ana', mensaje: 'Hola' }); // missing correo

        expect(res.statusCode).toBe(400);
    });

    // ── GET /api/admin/support ─────────────────────────────────────────────────

    test('GET /api/admin/support - admin lista todos los mensajes', async () => {
        SupportMessage.findAll.mockResolvedValue([makeMsgMock(), makeMsgMock({ id: 2 })]);

        const res = await request(app)
            .get('/api/admin/support')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('mensajes');
        expect(Array.isArray(res.body.mensajes)).toBe(true);
        expect(res.body.mensajes).toHaveLength(2);
    });

    test('GET /api/admin/support - retorna 403 sin token admin', async () => {
        const res = await request(app)
            .get('/api/admin/support')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    // ── GET /api/admin/support/:id ─────────────────────────────────────────────

    test('GET /api/admin/support/:id - obtiene mensaje por ID', async () => {
        SupportMessage.findByPk.mockResolvedValue(makeMsgMock());

        const res = await request(app)
            .get('/api/admin/support/1')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('mensaje');
    });

    test('GET /api/admin/support/:id - retorna 404 si mensaje no existe', async () => {
        SupportMessage.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/admin/support/999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
    });

    // ── POST /api/admin/support/:id/reply ─────────────────────────────────────

    test('POST /api/admin/support/:id/reply - admin responde mensaje', async () => {
        SupportMessage.findByPk.mockResolvedValue(makeMsgMock());

        const res = await request(app)
            .post('/api/admin/support/1/reply')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ reply: 'Gracias por contactarnos, lo revisaremos.' });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('enviada');
    });

    test('POST /api/admin/support/:id/reply - retorna 400 si falta el campo reply', async () => {
        SupportMessage.findByPk.mockResolvedValue(makeMsgMock());

        const res = await request(app)
            .post('/api/admin/support/1/reply')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({}); // no reply field

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('reply');
    });

    test('POST /api/admin/support/:id/reply - retorna 404 si mensaje no existe', async () => {
        SupportMessage.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/admin/support/999/reply')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ reply: 'Respuesta' });

        expect(res.statusCode).toBe(404);
    });

    // ── PUT /api/admin/support/:id/close ──────────────────────────────────────

    test('PUT /api/admin/support/:id/close - admin cierra el ticket', async () => {
        SupportMessage.findByPk.mockResolvedValue(makeMsgMock());

        const res = await request(app)
            .put('/api/admin/support/1/close')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('Cerrado');
    });

    test('PUT /api/admin/support/:id/close - retorna 404 si mensaje no existe', async () => {
        SupportMessage.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/admin/support/999/close')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
    });
});
