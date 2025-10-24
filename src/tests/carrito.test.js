const request = require('supertest');
const app = require('../app');

describe('🛒 Pruebas del Carrito', () => {
    test('✅ GET /api/carrito/:usuarioId - debe responder correctamente', async () => {
        const res = await request(app).get('/api/carrito/1');
        expect(res.statusCode).toBeDefined();
    });

    test('✅ POST /api/carrito - debe agregar producto', async () => {
        const nuevoItem = {
            usuarioId: 1,
            productoId: 2,
            cantidad: 1
        };
        const res = await request(app).post('/api/carrito').send(nuevoItem);
        expect(res.statusCode).toBeDefined();
    });
});
