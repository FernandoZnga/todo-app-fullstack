/**
 * Configuración global para las pruebas con Jest
 * Este archivo se ejecuta antes de cada suite de pruebas
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.DB_DATABASE = 'TestToDoDB';
process.env.DB_USER = 'sa';
process.env.DB_PASSWORD = 'TodoApp2024!';
process.env.DB_SERVER = 'localhost';

// Configurar timeout más largo para pruebas de integración
jest.setTimeout(30000);

// Configurar console para pruebas más limpias
const originalConsole = console;

beforeEach(() => {
  // Suprimir logs durante las pruebas para salida más limpia
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

afterEach(() => {
  // Restaurar console después de cada prueba
  global.console = originalConsole;
});

// Función helper para generar datos de prueba
global.generateTestUser = () => ({
  nombreUsuario: `Test User ${Date.now()}`,
  correo: `test${Date.now()}@example.com`,
  contraseña: 'testPassword123'
});

global.generateTestTask = () => ({
  titulo: `Tarea de prueba ${Date.now()}`,
  descripcion: `Descripción de prueba generada el ${new Date().toISOString()}`
});

// Función helper para limpiar base de datos de pruebas
global.cleanupTestData = async (db) => {
  try {
    if (db && db.request) {
      await db.request().query('DELETE FROM Gestion.Tarea WHERE titulo LIKE \'%prueba%\'');
      await db.request().query('DELETE FROM Gestion.Usuario WHERE correo LIKE \'%test%\'');
    }
  } catch (error) {
    console.error('Error limpiando datos de prueba:', error);
  }
};
