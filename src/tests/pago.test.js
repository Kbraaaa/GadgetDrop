const request = require('supertest');
const app = require('../app');

describe('💳 Pruebas de Pago (modo test)', () => {
    test('✅ POST /api/pago - debe simular correctamente la creación de sesión de pago', async () => {
        const carrito = [
            {
                Producto: {
                    nombre: 'Mouse gamer',
                    imagen: 'https://via.placeholder.com/150',
                    precio: 50
                },
                cantidad: 2
            }
        ];

        const res = await request(app)
            .post('/api/pago')
            .send({ carrito, usuarioId: 1 });

        // Validar respuesta esperada
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('url');
        expect(res.body.url).toContain('http');
    });
});
