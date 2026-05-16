'use strict';

jest.mock('../models/Carrito', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn(),
}));
jest.mock('../models/Producto', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
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

const Carrito = require('../models/Carrito');
const request = require('supertest');
const app = require('../app');

describe('🛒 Pruebas completas del Carrito', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ── POST /api/carrito ──────────────────────────────────────────────────────

    test('POST /api/carrito - crea nuevo item si no existe en carrito', async () => {
        Carrito.findOne.mockResolvedValue(null); // no existe
        Carrito.create.mockResolvedValue({
            id: 1, usuarioId: 1, productoId: 2, cantidad: 3,
        });

        const res = await request(app)
            .post('/api/carrito')
            .send({ usuarioId: 1, productoId: 2, cantidad: 3 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('carrito');
        expect(res.body.mensaje).toContain('agregado');
    });

    test('POST /api/carrito - actualiza cantidad si item ya existe', async () => {
        const mockItem = {
            id: 1, usuarioId: 1, productoId: 2, cantidad: 2,
            save: jest.fn().mockResolvedValue(undefined),
        };
        Carrito.findOne.mockResolvedValue(mockItem);

        const res = await request(app)
            .post('/api/carrito')
            .send({ usuarioId: 1, productoId: 2, cantidad: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('actualizada');
        expect(mockItem.save).toHaveBeenCalled();
    });

    // ── GET /api/carrito/:usuarioId ────────────────────────────────────────────

    test('GET /api/carrito/:usuarioId - retorna items del carrito', async () => {
        Carrito.findAll.mockResolvedValue([
            { id: 1, usuarioId: 1, productoId: 2, cantidad: 1, Producto: { id: 2, nombre: 'Mouse', precio: 50 } },
        ]);

        const res = await request(app).get('/api/carrito/1');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
    });

    test('GET /api/carrito/:usuarioId - retorna array vacío si no hay items', async () => {
        Carrito.findAll.mockResolvedValue([]);

        const res = await request(app).get('/api/carrito/99');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    // ── DELETE /api/carrito/:id ────────────────────────────────────────────────

    test('DELETE /api/carrito/:id - elimina item del carrito', async () => {
        Carrito.destroy.mockResolvedValue(1);

        const res = await request(app).delete('/api/carrito/5');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('eliminado');
    });

    // ── PUT /api/carrito/:id ───────────────────────────────────────────────────

    test('PUT /api/carrito/:id - actualiza cantidad correctamente', async () => {
        const mockItem = {
            id: 1, cantidad: 2,
            save: jest.fn().mockResolvedValue(undefined),
        };
        Carrito.findByPk.mockResolvedValue(mockItem);

        const res = await request(app)
            .put('/api/carrito/1')
            .send({ cantidad: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('actualizada');
        expect(mockItem.save).toHaveBeenCalled();
    });

    test('PUT /api/carrito/:id - retorna 404 si item no existe', async () => {
        Carrito.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/carrito/999')
            .send({ cantidad: 3 });

        expect(res.statusCode).toBe(404);
        expect(res.body.mensaje).toContain('encontrado');
    });

    test('PUT /api/carrito/:id - retorna 400 si cantidad es 0', async () => {
        Carrito.findByPk.mockResolvedValue({ id: 1, cantidad: 2, save: jest.fn() });

        const res = await request(app)
            .put('/api/carrito/1')
            .send({ cantidad: 0 });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toContain('cantidad');
    });

    test('PUT /api/carrito/:id - retorna 400 si cantidad es negativa', async () => {
        Carrito.findByPk.mockResolvedValue({ id: 1, cantidad: 2, save: jest.fn() });

        const res = await request(app)
            .put('/api/carrito/1')
            .send({ cantidad: -1 });

        expect(res.statusCode).toBe(400);
    });
});
