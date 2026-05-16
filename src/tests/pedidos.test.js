'use strict';

// Explicit factories prevent Jest from executing real model files.
// Carrito.js has inline Sequelize associations that fail with auto-mocks.
jest.mock('../models/Pedido', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
}));
jest.mock('../models/DetallePedido', () => ({
    create: jest.fn(),
    findAll: jest.fn(),
}));
jest.mock('../models/Carrito', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
}));
jest.mock('../models/Producto', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    decrement: jest.fn(),
}));
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
jest.mock('../utils/mailer', () => ({
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
}));

const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const sequelize = require('../config/db');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

const userToken = jwt.sign(
    { id: 1, nombre: 'Test User', correo: 'user@test.com', rol: 'usuario' },
    JWT_SECRET,
    { expiresIn: '1h' }
);
const adminToken = jwt.sign(
    { id: 99, nombre: 'Admin Test', correo: 'admin@test.com', rol: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

describe('📦 Pruebas de Pedidos', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        sequelize.transaction = jest.fn().mockResolvedValue({
            commit: jest.fn().mockResolvedValue(undefined),
            rollback: jest.fn().mockResolvedValue(undefined),
        });
    });

    // ── POST /api/pedidos ──────────────────────────────────────────────────────

    test('POST /api/pedidos - crea pedido con carrito válido en BD', async () => {
        const mockCarrito = [
            { cantidad: 2, Producto: { id: 1, nombre: 'Mouse', precio: 50, stock: 10 } },
            { cantidad: 1, Producto: { id: 2, nombre: 'Teclado', precio: 120, stock: 5 } },
        ];

        Carrito.findAll.mockResolvedValue(mockCarrito);
        Pedido.findAll.mockResolvedValue([]);         // sin pedidos recientes
        Pedido.create.mockResolvedValue({ id: 42, total: 220 });
        DetallePedido.create.mockResolvedValue({});
        Producto.decrement.mockResolvedValue([1]);
        Carrito.destroy.mockResolvedValue(1);

        const res = await request(app)
            .post('/api/pedidos')
            .send({ usuarioId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pedidoId', 42);
        expect(res.body.mensaje).toContain('éxito');
    });

    test('POST /api/pedidos - retorna 400 si stock insuficiente', async () => {
        const mockCarrito = [
            { cantidad: 5, Producto: { id: 1, nombre: 'Mouse', precio: 50, stock: 2 } },
        ];

        Carrito.findAll.mockResolvedValue(mockCarrito);

        const res = await request(app)
            .post('/api/pedidos')
            .send({ usuarioId: 1 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('Stock insuficiente para: Mouse');
    });

    test('POST /api/pedidos - retorna 400 si carrito está vacío', async () => {
        Carrito.findAll.mockResolvedValue([]);

        const res = await request(app)
            .post('/api/pedidos')
            .send({ usuarioId: 1 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('vacío');
    });

    test('POST /api/pedidos - detecta pedido duplicado reciente y lo omite', async () => {
        const mockCarrito = [
            { cantidad: 1, Producto: { id: 1, nombre: 'Mouse', precio: 50, stock: 10 } },
        ];
        const mockPedidoReciente = {
            id: 10,
            createdAt: new Date(),      // dentro de la ventana de 120 s
            DetallePedidos: [
                { productoId: 1, cantidad: 1, precioUnitario: 50 },
            ],
        };

        Carrito.findAll.mockResolvedValue(mockCarrito);
        Pedido.findAll.mockResolvedValue([mockPedidoReciente]);

        const res = await request(app)
            .post('/api/pedidos')
            .send({ usuarioId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('registrado');
    });

    // ── GET /api/pedidos/usuario/:id ───────────────────────────────────────────

    test('GET /api/pedidos/usuario/:id - retorna pedidos del usuario autenticado', async () => {
        Pedido.findAll.mockResolvedValue([
            { id: 1, total: 220, DetallePedidos: [] },
            { id: 2, total: 50,  DetallePedidos: [] },
        ]);

        const res = await request(app)
            .get('/api/pedidos/usuario/1')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
    });

    test('GET /api/pedidos/usuario/:id - retorna 403 sin token', async () => {
        const res = await request(app).get('/api/pedidos/usuario/1');
        expect(res.statusCode).toBe(403);
    });

    test('GET /api/pedidos/usuario/:id - retorna 403 al acceder a pedidos ajenos', async () => {
        // Token id=1, intenta ver usuario id=2
        const res = await request(app)
            .get('/api/pedidos/usuario/2')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    // ── GET /api/admin/pedidos ─────────────────────────────────────────────────

    test('GET /api/admin/pedidos - admin obtiene todos los pedidos', async () => {
        Pedido.findAll.mockResolvedValue([
            { id: 1, total: 100, DetallePedidos: [] },
            { id: 2, total: 200, DetallePedidos: [] },
        ]);

        const res = await request(app)
            .get('/api/admin/pedidos')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/admin/pedidos - retorna 403 sin rol admin', async () => {
        const res = await request(app)
            .get('/api/admin/pedidos')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    // ── PUT /api/pedidos/:id/estado ────────────────────────────────────────────

    test('PUT /api/pedidos/:id/estado - admin actualiza estado del pedido', async () => {
        Pedido.findByPk.mockResolvedValue({
            id: 1,
            estado: 'pendiente',
            save: jest.fn().mockResolvedValue(undefined),
        });

        const res = await request(app)
            .put('/api/pedidos/1/estado')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ estado: 'enviado' });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('actualizado');
    });

    test('PUT /api/pedidos/:id/estado - retorna 404 si pedido no existe', async () => {
        Pedido.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/pedidos/999/estado')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ estado: 'enviado' });

        expect(res.statusCode).toBe(404);
    });
});
