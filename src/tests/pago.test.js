'use strict';

// Mock Stripe before app loads so pagoController gets the mock instance
jest.mock('stripe', () =>
    jest.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                create: jest.fn().mockResolvedValue({
                    url: 'http://stripe.example.com/session/test_abc123',
                }),
            },
        },
    }))
);

const request = require('supertest');
const app = require('../app');

describe('💳 Pruebas de Pago (modo test)', () => {
    test('POST /api/pago/stripe - crea sesión de pago correctamente', async () => {
        const carrito = [
            {
                Producto: {
                    nombre: 'Mouse gamer',
                    imagen: 'https://via.placeholder.com/150',
                    precio: 50,
                },
                cantidad: 2,
            },
        ];

        const res = await request(app)
            .post('/api/pago/stripe')
            .send({ carrito, usuarioId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('url');
        expect(res.body.url).toContain('http');
    });

    test('POST /api/pago/stripe - maneja imagen local (sin http) en line_items', async () => {
        const carrito = [
            {
                Producto: {
                    nombre: 'Producto sin imagen web',
                    imagen: 'local/imagen.jpg',
                    precio: 30,
                },
                cantidad: 1,
            },
        ];

        const res = await request(app)
            .post('/api/pago/stripe')
            .send({ carrito, usuarioId: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('url');
    });
});
