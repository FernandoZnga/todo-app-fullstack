/**
 * Pruebas unitarias para usuarioController
 * Utilizan mocks para evitar conexiones reales a la base de datos
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mockDbConexion, setupUserCreationSuccess, setupUserCreationDuplicate, setupUserAuthentication, mockUsuarioData, mockPool } = require('../mocks/dbMock');

// Mock de dependencias
jest.mock('../../DB/config', () => ({
  dbConexion: jest.fn()
}));

jest.mock('../../helpers/generarToken', () => jest.fn(() => 'mock_generated_token'));

const { dbConexion } = require('../../DB/config');
const generarToken = require('../../helpers/generarToken');

// Importar el controlador después de configurar los mocks
const { registrarUsuario, confirmar, Autenticar, perfil } = require('../../controllers/usuarioController');

describe('UsuarioController - Pruebas Unitarias', () => {
  let req, res, poolMock;

  beforeEach(() => {
    // Configurar objetos request y response mock
    req = {
      body: {},
      params: {},
      usuario: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Configurar pool mock
    poolMock = mockPool();
    dbConexion.mockResolvedValue(poolMock);

    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  describe('registrarUsuario', () => {
    it('debería registrar un usuario exitosamente', async () => {
      // Arrange
      req.body = {
        nombreUsuario: 'Test Usuario',
        correo: 'test@example.com',
        contraseña: 'password123'
      };

      setupUserCreationSuccess(poolMock);
      
      // Act
      await registrarUsuario(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Usuario Creado correctamente' });
      expect(dbConexion).toHaveBeenCalled();
      expect(poolMock.request).toHaveBeenCalled();
    });

    it('debería rechazar usuario con correo duplicado', async () => {
      // Arrange
      req.body = {
        nombreUsuario: 'Test Usuario',
        correo: 'existing@example.com',
        contraseña: 'password123'
      };

      setupUserCreationDuplicate(poolMock);

      // Act
      await registrarUsuario(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'El correo ya está registrado' });
    });

    it('debería validar campos obligatorios', async () => {
      // Arrange
      req.body = {
        nombreUsuario: 'Test Usuario'
        // Falta correo y contraseña
      };

      // Act
      await registrarUsuario(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No pueden ir campos vacios' });
      expect(dbConexion).not.toHaveBeenCalled();
    });

    it('debería manejar errores del servidor', async () => {
      // Arrange
      req.body = {
        nombreUsuario: 'Test Usuario',
        correo: 'test@example.com',
        contraseña: 'password123'
      };

      dbConexion.mockRejectedValue(new Error('Database error'));

      // Act
      await registrarUsuario(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Error en el servidor. No se pudo registrar el usuario.' 
      });
    });
  });

  describe('confirmar', () => {
    it('debería confirmar cuenta exitosamente', async () => {
      // Arrange
      req.params = { token: 'valid_token' };
      const mockUser = { ...mockUsuarioData, verificado: true };
      
      setupUserAuthentication(poolMock, mockUser);

      // Act
      await confirmar(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        mensaje: 'Cuenta confirmada', 
        usuario: mockUser 
      });
    });

    it('debería rechazar token inválido', async () => {
      // Arrange
      req.params = { token: 'invalid_token' };
      
      poolMock.request().execute.mockResolvedValue({ recordset: [] });

      // Act
      await confirmar(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no válido' });
    });
  });

  describe('Autenticar', () => {
    beforeEach(() => {
      // Mock bcrypt.compare
      jest.spyOn(bcrypt, 'compare');
    });

    afterEach(() => {
      bcrypt.compare.mockRestore();
    });

    it('debería autenticar usuario correctamente', async () => {
      // Arrange
      req.body = {
        correo: 'test@example.com',
        contraseña: 'password123'
      };

      const mockUser = { ...mockUsuarioData, verificado: true };
      setupUserAuthentication(poolMock, mockUser);
      bcrypt.compare.mockResolvedValue(true);

      // Mock JWT
      const mockToken = 'mock.jwt.token';
      jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

      // Act
      await Autenticar(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({ token: mockToken });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.contraseña);
    });

    it('debería rechazar usuario no verificado', async () => {
      // Arrange
      req.body = {
        correo: 'test@example.com',
        contraseña: 'password123'
      };

      const mockUser = { ...mockUsuarioData, verificado: false };
      setupUserAuthentication(poolMock, mockUser);

      // Act
      await Autenticar(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Tu cuenta no ha sido confirmada' });
    });

    it('debería rechazar contraseña incorrecta', async () => {
      // Arrange
      req.body = {
        correo: 'test@example.com',
        contraseña: 'wrongpassword'
      };

      const mockUser = { ...mockUsuarioData, verificado: true };
      setupUserAuthentication(poolMock, mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await Autenticar(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Contraseña incorrecta' });
    });

    it('debería rechazar usuario inexistente', async () => {
      // Arrange
      req.body = {
        correo: 'noexiste@example.com',
        contraseña: 'password123'
      };

      poolMock.request().execute.mockResolvedValue({ recordset: [] });

      // Act
      await Autenticar(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'El Usuario no existe' });
    });
  });

  describe('perfil', () => {
    it('debería devolver perfil del usuario autenticado', () => {
      // Arrange
      const mockUser = { 
        id: 1, 
        nombreUsuario: 'Test Usuario', 
        correo: 'test@example.com' 
      };
      req.usuario = mockUser;

      // Act
      perfil(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({ perfil: mockUser });
    });
  });
});
