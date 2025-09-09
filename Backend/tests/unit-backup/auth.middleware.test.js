/**
 * Pruebas unitarias para middleware de autenticación
 */

const jwt = require('jsonwebtoken');
const { mockDbConexion, setupUserAuthentication, mockUsuarioData, mockPool } = require('../mocks/dbMock');

// Mock de dependencias
jest.mock('../../DB/config', () => ({
  dbConexion: jest.fn()
}));

const { dbConexion } = require('../../DB/config');
const checkAuth = require('../../middleware/auth');

describe('Auth Middleware - Pruebas Unitarias', () => {
  let req, res, next, poolMock;

  beforeEach(() => {
    // Configurar objetos request, response y next mock
    req = {
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Configurar pool mock
    poolMock = mockPool();
    dbConexion.mockResolvedValue(poolMock);

    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  describe('checkAuth', () => {
    it('debería permitir acceso con token JWT válido', async () => {
      // Arrange
      const mockToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'test_secret');
      req.headers.authorization = `Bearer ${mockToken}`;
      
      const mockUser = {
        id: 1,
        nombreUsuario: 'Test Usuario',
        correo: 'test@example.com'
      };
      
      poolMock.request().query.mockResolvedValue({ recordset: [mockUser] });

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(req.usuario).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('debería rechazar request sin header Authorization', async () => {
      // Arrange
      // No se establece req.headers.authorization

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no válido o inexistente' });
      expect(next).not.toHaveBeenCalled();
      expect(req.usuario).toBeUndefined();
    });

    it('debería rechazar header Authorization sin Bearer', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat token_here';

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no válido o inexistente' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería rechazar token JWT inválido', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid.jwt.token';

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no válido' });
      expect(next).not.toHaveBeenCalled();
      expect(req.usuario).toBeUndefined();
    });

    it('debería rechazar token expirado', async () => {
      // Arrange
      const expiredToken = jwt.sign(
        { id: 1, exp: Math.floor(Date.now() / 1000) - 3600 }, // Expirado hace 1 hora
        process.env.JWT_SECRET || 'test_secret'
      );
      req.headers.authorization = `Bearer ${expiredToken}`;

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no válido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería rechazar cuando el usuario no existe en la base de datos', async () => {
      // Arrange
      const validToken = jwt.sign({ id: 999 }, process.env.JWT_SECRET || 'test_secret');
      req.headers.authorization = `Bearer ${validToken}`;
      
      poolMock.request().query.mockResolvedValue({ recordset: [] }); // Usuario no encontrado

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Usuario no encontrado' });
      expect(next).not.toHaveBeenCalled();
      expect(req.usuario).toBeUndefined();
    });

    it('debería manejar errores de base de datos', async () => {
      // Arrange
      const validToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'test_secret');
      req.headers.authorization = `Bearer ${validToken}`;
      
      poolMock.request().query.mockRejectedValue(new Error('Database error'));

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no válido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería validar que el token contenga el campo id', async () => {
      // Arrange
      const tokenWithoutId = jwt.sign({ email: 'test@example.com' }, process.env.JWT_SECRET || 'test_secret');
      req.headers.authorization = `Bearer ${tokenWithoutId}`;

      const mockUser = { id: 1, nombreUsuario: 'Test Usuario', correo: 'test@example.com' };
      poolMock.request().query.mockResolvedValue({ recordset: [mockUser] });

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(dbConexion).toHaveBeenCalled();
      expect(poolMock.request().input).toHaveBeenCalledWith('usuarioId', expect.anything(), undefined);
    });

    it('debería usar el ID correcto del token para buscar el usuario', async () => {
      // Arrange
      const userId = 42;
      const validToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_secret');
      req.headers.authorization = `Bearer ${validToken}`;
      
      const mockUser = { id: userId, nombreUsuario: 'Test Usuario 42', correo: 'test42@example.com' };
      poolMock.request().query.mockResolvedValue({ recordset: [mockUser] });

      // Act
      await checkAuth(req, res, next);

      // Assert
      expect(poolMock.request().input).toHaveBeenCalledWith('usuarioId', expect.anything(), userId);
      expect(req.usuario).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('debería procesar múltiples requests consecutivos correctamente', async () => {
      // Arrange
      const token1 = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'test_secret');
      const token2 = jwt.sign({ id: 2 }, process.env.JWT_SECRET || 'test_secret');
      
      const user1 = { id: 1, nombreUsuario: 'Usuario 1', correo: 'user1@example.com' };
      const user2 = { id: 2, nombreUsuario: 'Usuario 2', correo: 'user2@example.com' };

      // Primer request
      req.headers.authorization = `Bearer ${token1}`;
      poolMock.request().query.mockResolvedValueOnce({ recordset: [user1] });
      
      await checkAuth(req, res, next);
      
      expect(req.usuario).toEqual(user1);
      expect(next).toHaveBeenCalledTimes(1);

      // Limpiar para segundo request
      jest.clearAllMocks();
      req = { headers: { authorization: `Bearer ${token2}` } };
      
      // Segundo request
      poolMock.request().query.mockResolvedValueOnce({ recordset: [user2] });
      
      await checkAuth(req, res, next);
      
      expect(req.usuario).toEqual(user2);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
