'use strict';

// Tests for crearPedidoDesdeStripe (POST /api/pedidos/pagado)
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
    findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), destroy: jest.fn(),
}));
jest.mock('../models/Producto', () => ({
    findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn(), decrement: jest.fn(),
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

const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Carrito = require('../models/Carrito');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const sequelize = require('../config/db');

const request = require('supertest');
const app = require('../app');

// Carrito items matching the structure used by crearPedidoDesdeStripe
const mockCarritoPayload = [
    { cantidad: 2, Producto: { id: 1, nombre: 'Mouse Gamer', precio: 50 } },
    { cantidad: 1, Producto: { id: 2, nombre: 'Teclado Pro', precio: 120 } },
];

describe('💳 Pruebas de crearPedidoDesdeStripe (POST /api/pedidos/pagado)', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        sequelize.transaction = jest.fn().mockResolvedValue({
            commit: jest.fn().mockResolvedValue(undefined),
            rollback: jest.fn().mockResolvedValue(undefined),
        });
    });

    test('POST /api/pedidos/pagado - crea pedido pagado con carrito del body', async () => {
        Pedido.findAll.mockResolvedValue([]);      // no pedidos recientes
        Pedido.findOne.mockResolvedValue(null);    // no externalId duplicado
        Pedido.create.mockResolvedValue({ id: 88, total: 220, pagado: true });
        DetallePedido.create.mockResolvedValue({});
        Producto.findAll.mockResolvedValue([
            { id: 1, nombre: 'Mouse Gamer', stock: 10 },
            { id: 2, nombre: 'Teclado Pro', stock: 5 },
        ]);
        Producto.decrement.mockResolvedValue([1]);
        Carrito.destroy.mockResolvedValue(1);
        Usuario.findByPk.mockResolvedValue(null);  // no email needed

        const res = await request(app)
            .post('/api/pedidos/pagado')
            .send({
                usuarioId: 1,
                carrito: mockCarritoPayload,
                externalId: 'cs_test_abc123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pedidoId', 88);
        expect(res.body.mensaje).toContain('pago');
    });

    test('POST /api/pedidos/pagado - evita duplicado por externalId', async () => {
        Pedido.findAll.mockResolvedValue([]);
        Pedido.findOne.mockResolvedValue({ id: 10 }); // externalId ya existe

        const res = await request(app)
            .post('/api/pedidos/pagado')
            .send({
                usuarioId: 1,
                carrito: mockCarritoPayload,
                externalId: 'cs_test_already_exists',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pedidoId', 10);
        expect(res.body.mensaje).toContain('registrado');
    });

    test('POST /api/pedidos/pagado - evita pedido reciente duplicado', async () => {
        const mockPedidoReciente = {
            id: 20,
            createdAt: new Date(),  // ahora mismo → dentro de 120s
            DetallePedidos: [
                { productoId: 1, cantidad: 2, precioUnitario: 50 },
                { productoId: 2, cantidad: 1, precioUnitario: 120 },
            ],
        };

        Pedido.findAll.mockResolvedValue([mockPedidoReciente]);

        const res = await request(app)
            .post('/api/pedidos/pagado')
            .send({ usuarioId: 1, carrito: mockCarritoPayload });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toContain('registrado');
    });

    test('POST /api/pedidos/pagado - crea pedido sin externalId', async () => {
        Pedido.findAll.mockResolvedValue([]);
        Pedido.create.mockResolvedValue({ id: 99, total: 220, pagado: true });
        DetallePedido.create.mockResolvedValue({});
        Producto.findAll.mockResolvedValue([
            { id: 1, nombre: 'Mouse Gamer', stock: 10 },
            { id: 2, nombre: 'Teclado Pro', stock: 5 },
        ]);
        Producto.decrement.mockResolvedValue([1]);
        Carrito.destroy.mockResolvedValue(1);
        Usuario.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/pedidos/pagado')
            .send({ usuarioId: 2, carrito: mockCarritoPayload });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pedidoId', 99);
    });

    test('POST /api/pedidos/pagado - envía email de confirmación si usuario tiene correo', async () => {
        const { sendOrderConfirmation } = require('../utils/mailer');
        Pedido.findAll.mockResolvedValue([]);
        Pedido.create.mockResolvedValue({ id: 101, total: 50 });
        DetallePedido.create.mockResolvedValue({});
        Producto.findAll.mockResolvedValue([{ id: 1, nombre: 'Mouse', stock: 10 }]);
        Producto.decrement.mockResolvedValue([1]);
        Carrito.destroy.mockResolvedValue(1);
        // Mock user with email
        Usuario.findByPk.mockResolvedValue({ id: 1, correo: 'buyer@test.com', nombre: 'Buyer' });

        await request(app)
            .post('/api/pedidos/pagado')
            .send({
                usuarioId: 1,
                carrito: [{ cantidad: 1, Producto: { id: 1, nombre: 'Mouse', precio: 50 } }],
            });

        // Fire-and-forget — wait briefly for async IIFE to complete
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(sendOrderConfirmation).toHaveBeenCalled();
    });
});
