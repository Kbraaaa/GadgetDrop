'use strict';

jest.mock('../models/Producto', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
}));
// Other models loaded via controllers but not called in these tests
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

const Producto = require('../models/Producto');
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

describe('🖥️ Pruebas de Productos', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ── GET /api/productos ─────────────────────────────────────────────────────

    test('GET /api/productos - retorna array de productos', async () => {
        Producto.findAll.mockResolvedValue([
            { id: 1, nombre: 'Mouse Gamer', precio: 59.99, categoria: 'Gaming' },
            { id: 2, nombre: 'Teclado Pro',  precio: 89.99, categoria: 'Gaming' },
        ]);

        const res = await request(app).get('/api/productos');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
    });

    test('GET /api/productos - retorna array vacío si no hay productos', async () => {
        Producto.findAll.mockResolvedValue([]);

        const res = await request(app).get('/api/productos');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    // ── GET /api/productos/:id ─────────────────────────────────────────────────

    test('GET /api/productos/:id - retorna producto por ID', async () => {
        Producto.findByPk.mockResolvedValue({
            id: 1, nombre: 'Mouse Gamer X', precio: 59.99,
            imagen: 'https://example.com/mouse.jpg', stock: 10, categoria: 'Gaming',
        });

        const res = await request(app).get('/api/productos/1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('nombre', 'Mouse Gamer X');
    });

    test('GET /api/productos/:id - retorna 404 si no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const res = await request(app).get('/api/productos/999');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toContain('no encontrado');
    });

    // ── POST /api/productos ────────────────────────────────────────────────────

    test('POST /api/productos - crea producto con token admin', async () => {
        Producto.create.mockResolvedValue({
            id: 3, nombre: 'Auriculares Pro', precio: 120,
            imagen: 'https://example.com/auri.jpg', stock: 5, categoria: 'Gaming',
        });

        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nombre: 'Auriculares Pro', precio: 120, imagen: 'https://example.com/auri.jpg', stock: 5 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('producto');
        expect(res.body.mensaje).toContain('creado');
    });

    test('POST /api/productos - retorna 403 sin token admin (usuario normal)', async () => {
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ nombre: 'Teclado', precio: 99.99 });

        expect(res.statusCode).toBe(403);
    });

    test('POST /api/productos - retorna 403 sin ningún token', async () => {
        const res = await request(app)
            .post('/api/productos')
            .send({ nombre: 'Teclado', precio: 99.99 });

        expect(res.statusCode).toBe(403);
    });

    // ── PUT /api/productos/:id ─────────────────────────────────────────────────

    test('PUT /api/productos/:id - admin actualiza producto', async () => {
        const updated = { id: 1, nombre: 'Mouse Pro 2', precio: 75 };
        Producto.findByPk.mockResolvedValue({
            id: 1,
            nombre: 'Mouse Pro',
            update: jest.fn().mockResolvedValue(updated),
        });

        const res = await request(app)
            .put('/api/productos/1')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nombre: 'Mouse Pro 2', precio: 75 });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('actualizado');
    });

    test('PUT /api/productos/:id - retorna 404 si producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/productos/999')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nombre: 'X' });

        expect(res.statusCode).toBe(404);
    });

    // ── DELETE /api/productos/:id ──────────────────────────────────────────────

    test('DELETE /api/productos/:id - admin elimina producto', async () => {
        Producto.findByPk.mockResolvedValue({
            id: 1,
            nombre: 'Mouse',
            destroy: jest.fn().mockResolvedValue(undefined),
        });

        const res = await request(app)
            .delete('/api/productos/1')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('eliminado');
    });

    test('DELETE /api/productos/:id - retorna 404 si no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .delete('/api/productos/999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
    });
});
