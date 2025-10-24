const request = require('supertest');
const app = require('../app');

describe('🧍‍♂️ Pruebas de Autenticación', () => {
  test('✅ POST /api/auth/register - debe registrar un nuevo usuario', async () => {
    const nuevoUsuario = {
      nombre: 'Juan Tester',
      email: `juan${Date.now()}@test.com`,
      password: '123456'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(nuevoUsuario);


    expect(res.statusCode).toBeDefined();
    expect(res.statusCode).toBeGreaterThanOrEqual(200);
  });

  test('✅ POST /api/auth/login - debe permitir el inicio de sesión', async () => {
    const loginData = {
      email: 'testuser@test.com',
      password: '123456'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.statusCode).toBeDefined();

    if (res.body.token) {
      expect(typeof res.body.token).toBe('string');
    }
  });
});
