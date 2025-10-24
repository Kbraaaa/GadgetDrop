// src/tests/pedidos.test.js
const request = require('supertest');
const app = require('../app');

describe('📦 Pruebas de Pedidos', () => {
    const pedidoEjemplo = {
        usuarioId: 1,
        productos: [
            { productoId: 1, cantidad: 2, precio: 50 },
            { productoId: 2, cantidad: 1, precio: 120 }
        ],
        total: 220
    };

    test('POST /api/pedidos - debe crear un pedido correctamente', async () => {
        const res = await request(app)
            .post('/api/pedidos')
            .send(pedidoEjemplo);


        expect([200, 201]).toContain(res.statusCode);
        expect(res.body).toHaveProperty('pedido');
        expect(res.body.pedido.total).toBe(220);
    });

    test('✅ GET /api/pedidos/:usuarioId - debe obtener los pedidos de un usuario', async () => {
        const res = await request(app)
            .get('/api/pedidos/usuario/1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body.pedidos)).toBe(true);
    });
});
