'use strict';

// Mock python-shell to avoid executing real Python during tests
jest.mock('python-shell', () => ({
    PythonShell: {
        run: jest.fn(),
    },
}));

jest.mock('../models/Producto', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
}));
jest.mock('../models/Carrito', () => ({
    findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), destroy: jest.fn(),
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
jest.mock('../utils/mailer', () => ({
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
}));

const { PythonShell } = require('python-shell');
const Producto = require('../models/Producto');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

const userToken = jwt.sign(
    { id: 1, nombre: 'User', correo: 'user@test.com', rol: 'usuario' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

const mockRespuestaOK = JSON.stringify({
    nombreProducto: 'Mouse Gamer X',
    recomendaciones: [
        { productoId: 2, nombre: 'Teclado Mecánico', categoria: 'Gaming', precio: 89.99, similitud: 0.92 },
        { productoId: 3, nombre: 'Auriculares Pro',  categoria: 'Gaming', precio: 79.99, similitud: 0.87 },
    ],
});

const mockRespuestaError = JSON.stringify({
    error: 'Producto no encontrado en el catálogo',
});

describe('🤖 Pruebas de Recomendaciones', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ── GET /api/recomendaciones/:id ───────────────────────────────────────────

    test('GET /api/recomendaciones/:id - retorna recomendaciones con token válido', async () => {
        PythonShell.run.mockResolvedValue([mockRespuestaOK]);

        const res = await request(app)
            .get('/api/recomendaciones/1')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('nombreProducto', 'Mouse Gamer X');
        expect(Array.isArray(res.body.recomendaciones)).toBe(true);
        expect(res.body.recomendaciones).toHaveLength(2);
    });

    test('GET /api/recomendaciones/:id - retorna 403 sin token', async () => {
        const res = await request(app).get('/api/recomendaciones/1');
        expect(res.statusCode).toBe(403);
    });

    test('GET /api/recomendaciones/:id - retorna 404 si Python devuelve error de producto', async () => {
        PythonShell.run.mockResolvedValue([mockRespuestaError]);

        const res = await request(app)
            .get('/api/recomendaciones/999')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
    });

    test('GET /api/recomendaciones/:id - retorna 400 si id no es entero positivo', async () => {
        const res = await request(app)
            .get('/api/recomendaciones/abc')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('productoId');
    });

    test('GET /api/recomendaciones/:id - retorna 400 si id es 0', async () => {
        const res = await request(app)
            .get('/api/recomendaciones/0')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
    });

    test('GET /api/recomendaciones/:id - retorna 500 si Python falla con excepción', async () => {
        PythonShell.run.mockRejectedValue(new Error('Python process crashed'));

        const res = await request(app)
            .get('/api/recomendaciones/1')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    test('GET /api/recomendaciones/:id - retorna 500 si Python no retorna resultados', async () => {
        PythonShell.run.mockResolvedValue([]); // empty results array

        const res = await request(app)
            .get('/api/recomendaciones/1')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(500);
    });

    // ── GET /api/recomendaciones/buscar ────────────────────────────────────────

    test('GET /api/recomendaciones/buscar - busca por nombre de producto', async () => {
        Producto.findOne.mockResolvedValue({ id: 1, nombre: 'Mouse Gamer X' });
        PythonShell.run.mockResolvedValue([mockRespuestaOK]);

        const res = await request(app)
            .get('/api/recomendaciones/buscar?nombre=Mouse%20Gamer%20X')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('nombreProducto');
    });

    test('GET /api/recomendaciones/buscar - retorna 400 sin parámetro nombre', async () => {
        const res = await request(app)
            .get('/api/recomendaciones/buscar')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('nombre');
    });

    test('GET /api/recomendaciones/buscar - retorna 404 si producto no existe en BD', async () => {
        Producto.findOne.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/recomendaciones/buscar?nombre=ProductoInexistente')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('productoId', null);
    });
});
