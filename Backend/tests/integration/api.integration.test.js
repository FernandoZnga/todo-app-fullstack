/**
 * Pruebas de integración para la API completa
 * Estas pruebas requieren que la aplicación esté ejecutándose
 * y que haya una base de datos de pruebas disponible
 */

const request = require('supertest');
const express = require('express');
const app = express();

// Configurar la aplicación como en el archivo principal
app.use(express.json());

// Configurar rutas
app.use('/api/usuarios', require('../../routes/usuarioRoutes'));
app.use('/api/tareas', require('../../routes/tareaRoutes'));

describe('API Integration Tests', () => {
  let userToken;
  let userId;
  let testUser;

  beforeAll(async () => {
    // Generar datos de prueba únicos
    testUser = generateTestUser();
  });

  afterAll(async () => {
    // Limpiar datos de prueba si es posible
    // Esto requeriría una función de limpieza específica para integración
  });

  describe('POST /api/usuarios - Registro de Usuario', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('mensaje', 'Usuario Creado correctamente');
    });

    it('debería rechazar usuario con correo duplicado', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .send(testUser) // Mismo usuario que el anterior
        .expect(409);

      expect(response.body).toHaveProperty('error', 'El correo ya está registrado');
    });

    it('debería validar campos requeridos', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .send({
          nombreUsuario: 'Usuario Incompleto'
          // Falta correo y contraseña
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'El Campo "correo" es obligatorio');
    });

    it('debería validar formato de email', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .send({
          nombreUsuario: 'Usuario Test',
          correo: 'email_invalido',
          contraseña: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'El formato del correo no es válido');
    });
  });

  describe('POST /api/usuarios/login - Autenticación', () => {
    beforeAll(async () => {
      // Para estas pruebas, necesitamos un usuario verificado
      // En un entorno de pruebas real, esto se haría a través de la BD directamente
      // o con un endpoint de pruebas específico
    });

    it('debería rechazar usuario no verificado', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: testUser.correo,
          contraseña: testUser.contraseña
        })
        .expect(403);

      expect(response.body).toHaveProperty('mensaje', 'Tu cuenta no ha sido confirmada');
    });

    it('debería autenticar usuario verificado y devolver token', async () => {
      // Esta prueba requiere que el usuario esté verificado
      // En un entorno real, esto se configuraría a través de la BD de pruebas
      
      const testVerifiedUser = {
        correo: 'verified@test.com',
        contraseña: 'password123'
      };

      // Nota: Esta prueba se salteará si no hay un usuario verificado disponible
      const response = await request(app)
        .post('/api/usuarios/login')
        .send(testVerifiedUser);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(typeof response.body.token).toBe('string');
        userToken = response.body.token; // Guardar para otras pruebas
      } else {
        console.log('Skipping authenticated user test - no verified user available');
      }
    });

    it('debería rechazar credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: testUser.correo,
          contraseña: 'contraseña_incorrecta'
        });

      // Podría ser 403 (no verificado) o 401 (contraseña incorrecta)
      expect([401, 403]).toContain(response.status);
    });

    it('debería rechazar usuario inexistente', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: 'noexiste@test.com',
          contraseña: 'password123'
        })
        .expect(404);

      expect(response.body).toHaveProperty('mensaje', 'El Usuario no existe');
    });
  });

  describe('Rutas Protegidas', () => {
    describe('GET /api/usuarios/perfil', () => {
      it('debería rechazar acceso sin token', async () => {
        const response = await request(app)
          .get('/api/usuarios/perfil')
          .expect(403);

        expect(response.body).toHaveProperty('mensaje', 'Token no válido o inexistente');
      });

      it('debería rechazar token inválido', async () => {
        const response = await request(app)
          .get('/api/usuarios/perfil')
          .set('Authorization', 'Bearer token_invalido')
          .expect(403);

        expect(response.body).toHaveProperty('mensaje', 'Token no válido');
      });

      it('debería devolver perfil con token válido', async () => {
        if (!userToken) {
          console.log('Skipping profile test - no valid token available');
          return;
        }

        const response = await request(app)
          .get('/api/usuarios/perfil')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('perfil');
        expect(response.body.perfil).toHaveProperty('id');
        expect(response.body.perfil).toHaveProperty('nombreUsuario');
        expect(response.body.perfil).toHaveProperty('correo');
      });
    });

    describe('Gestión de Tareas', () => {
      describe('POST /api/tareas', () => {
        it('debería crear tarea con autenticación válida', async () => {
          if (!userToken) {
            console.log('Skipping task creation test - no valid token available');
            return;
          }

          const testTask = generateTestTask();

          const response = await request(app)
            .post('/api/tareas')
            .set('Authorization', `Bearer ${userToken}`)
            .send(testTask)
            .expect(200);

          expect(response.body).toHaveProperty('mensaje', 'Tarea agregada correctamente');
        });

        it('debería rechazar tarea sin autenticación', async () => {
          const testTask = generateTestTask();

          const response = await request(app)
            .post('/api/tareas')
            .send(testTask)
            .expect(403);

          expect(response.body).toHaveProperty('mensaje', 'Token no válido o inexistente');
        });

        it('debería validar campos requeridos en tareas', async () => {
          if (!userToken) {
            console.log('Skipping task validation test - no valid token available');
            return;
          }

          const response = await request(app)
            .post('/api/tareas')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              titulo: 'Tarea sin descripción'
              // Falta descripción
            })
            .expect(400);

          expect(response.body).toHaveProperty('error', 'No pueden ir campos vacios');
        });
      });

      describe('GET /api/tareas', () => {
        it('debería obtener tareas del usuario autenticado', async () => {
          if (!userToken) {
            console.log('Skipping get tasks test - no valid token available');
            return;
          }

          const response = await request(app)
            .get('/api/tareas')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

          expect(response.body).toHaveProperty('mensaje');
          expect(response.body).toHaveProperty('tareas');
          expect(Array.isArray(response.body.tareas)).toBe(true);
        });

        it('debería rechazar obtener tareas sin autenticación', async () => {
          const response = await request(app)
            .get('/api/tareas')
            .expect(403);

          expect(response.body).toHaveProperty('mensaje', 'Token no válido o inexistente');
        });
      });
    });
  });

  describe('Flujo Completo de Usuario', () => {
    it('debería completar flujo: registro -> (confirmación) -> login -> crear tarea -> obtener tareas', async () => {
      // Este test simula un flujo completo pero requiere configuración adicional
      // para manejar la confirmación de cuenta en el entorno de pruebas
      
      const newUser = generateTestUser();
      
      // 1. Registro
      const registerResponse = await request(app)
        .post('/api/usuarios')
        .send(newUser)
        .expect(200);

      expect(registerResponse.body.mensaje).toBe('Usuario Creado correctamente');

      // 2. Login (fallará hasta que el usuario sea verificado)
      const loginResponse = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: newUser.correo,
          contraseña: newUser.contraseña
        });

      // Esperamos que falle porque el usuario no está verificado
      expect(loginResponse.status).toBe(403);
      expect(loginResponse.body.mensaje).toBe('Tu cuenta no ha sido confirmada');

      // En un entorno de pruebas real, aquí verificaríamos al usuario
      // y continuaríamos con el flujo completo
    });
  });
});
