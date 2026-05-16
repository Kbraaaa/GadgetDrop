'use strict';

jest.mock('bcryptjs');
jest.mock('../models/Usuario', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
}));
jest.mock('../models/LockHistory', () => ({
    create: jest.fn(),
    findOne: jest.fn(),
}));
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
jest.mock('../utils/mailer', () => ({
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
}));

const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const LockHistory = require('../models/LockHistory');
const request = require('supertest');
const app = require('../app');

// Helper to build a mock DB user
function makeUser(overrides = {}) {
    return {
        id: 1,
        nombre: 'Tester',
        correo: 'tester@test.com',
        contraseña: '$2a$10$hashed',
        rol: 'cliente',
        failedLoginAttempts: 0,
        lockUntil: null,
        save: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

describe('🔑 Pruebas extra de Autenticación (cobertura de ramas)', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ── POST /api/auth/registro ────────────────────────────────────────────────

    test('registro - éxito crea usuario y retorna 201', async () => {
        Usuario.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('$2a$10$mockedHash');
        Usuario.create.mockResolvedValue({ id: 5, nombre: 'Nuevo', correo: 'nuevo@test.com' });

        const res = await request(app)
            .post('/api/auth/registro')
            .send({ nombre: 'Nuevo', correo: 'nuevo@test.com', contraseña: 'Secret123' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.mensaje).toContain('éxito');
    });

    test('registro - 409 si correo ya está registrado', async () => {
        Usuario.findOne.mockResolvedValue({ id: 1, correo: 'ya@test.com' });

        const res = await request(app)
            .post('/api/auth/registro')
            .send({ nombre: 'Test', correo: 'ya@test.com', contraseña: 'Secret123' });

        expect(res.statusCode).toBe(409);
        expect(res.body.mensaje).toContain('registrado');
    });

    test('registro - 400 si nombre es demasiado corto (< 2 chars)', async () => {
        const res = await request(app)
            .post('/api/auth/registro')
            .send({ nombre: 'X', correo: 'test@test.com', contraseña: 'Secret123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toContain('nombre');
    });

    test('registro - 400 si nombre es demasiado largo (> 50 chars)', async () => {
        const res = await request(app)
            .post('/api/auth/registro')
            .send({ nombre: 'A'.repeat(51), correo: 'test@test.com', contraseña: 'Secret123' });

        expect(res.statusCode).toBe(400);
    });

    test('registro - 400 si correo no tiene formato válido', async () => {
        const res = await request(app)
            .post('/api/auth/registro')
            .send({ nombre: 'Test', correo: 'no-es-email', contraseña: 'Secret123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toContain('correo');
    });

    test('registro - 400 si contraseña no tiene número', async () => {
        const res = await request(app)
            .post('/api/auth/registro')
            .send({ nombre: 'Test', correo: 'test@test.com', contraseña: 'SinNumero' });

        expect(res.statusCode).toBe(400);
    });

    // ── POST /api/auth/login ───────────────────────────────────────────────────

    test('login - 423 si cuenta está actualmente bloqueada', async () => {
        const lockUntil = new Date(Date.now() + 3 * 60 * 1000); // 3 min en el futuro
        Usuario.findOne.mockResolvedValue(makeUser({ lockUntil }));

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'tester@test.com', password: 'Secret123' });

        expect(res.statusCode).toBe(423);
        expect(res.body.mensaje).toContain('bloqueada');
    });

    test('login - 401 con contraseña incorrecta (quedan intentos)', async () => {
        Usuario.findOne.mockResolvedValue(makeUser({ failedLoginAttempts: 0 }));
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'tester@test.com', password: 'Wrongpass1' });

        expect(res.statusCode).toBe(401);
        expect(res.body.mensaje).toContain('intentos');
    });

    test('login - 423 cuando se agota el número máximo de intentos', async () => {
        const MAX_FAILED = Number(process.env.ACCOUNT_MAX_FAILED_ATTEMPTS || 3);
        Usuario.findOne.mockResolvedValue(makeUser({ failedLoginAttempts: MAX_FAILED - 1 }));
        bcrypt.compare.mockResolvedValue(false);
        LockHistory.create.mockResolvedValue({});

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'tester@test.com', password: 'Wrongpass1' });

        expect(res.statusCode).toBe(423);
        expect(res.body.mensaje).toContain('bloqueada');
    });

    test('login - 200 con credenciales correctas', async () => {
        Usuario.findOne.mockResolvedValue(makeUser());
        bcrypt.compare.mockResolvedValue(true);
        LockHistory.findOne.mockResolvedValue(null); // no lock record to update

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'tester@test.com', password: 'Secret123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
        expect(res.body).toHaveProperty('usuario');
    });
});
