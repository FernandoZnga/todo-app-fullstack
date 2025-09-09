/**
 * Pruebas unitarias para tareaController
 * Utilizan mocks para evitar conexiones reales a la base de datos
 */

const { mockDbConexion, setupTaskCreation, setupTaskRetrieval, mockTareaData, mockPool } = require('../mocks/dbMock');

// Mock de dependencias
jest.mock('../../DB/config', () => ({
  dbConexion: jest.fn()
}));

const { dbConexion } = require('../../DB/config');

// Importar el controlador después de configurar los mocks
const { agregarTarea, obtenerTarea } = require('../../controllers/tareaController');

describe('TareaController - Pruebas Unitarias', () => {
  let req, res, poolMock;

  beforeEach(() => {
    // Configurar objetos request y response mock
    req = {
      body: {},
      query: {}, // ✨ Agregar query object para evitar errores
      usuario: {
        id: 1,
        nombreUsuario: 'Test Usuario',
        correo: 'test@example.com'
      }
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

  describe('agregarTarea', () => {
    it('debería crear una tarea exitosamente', async () => {
      // Arrange
      req.body = {
        titulo: 'Nueva tarea',
        descripcion: 'Descripción de la nueva tarea'
      };

      setupTaskCreation(poolMock);
      
      // Act
      await agregarTarea(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Tarea agregada correctamente' });
      expect(dbConexion).toHaveBeenCalled();
      expect(poolMock.request).toHaveBeenCalled();
    });

    it('debería validar campos obligatorios', async () => {
      // Arrange
      req.body = {
        titulo: 'Tarea sin descripción'
        // Falta descripción
      };

      // Act
      await agregarTarea(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No pueden ir campos vacios' });
      expect(dbConexion).not.toHaveBeenCalled();
    });

    it('debería validar que no falte el título', async () => {
      // Arrange
      req.body = {
        descripcion: 'Descripción sin título'
        // Falta título
      };

      // Act
      await agregarTarea(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No pueden ir campos vacios' });
      expect(dbConexion).not.toHaveBeenCalled();
    });

    it('debería pasar el ID del usuario autenticado', async () => {
      // Arrange
      const usuarioId = 42;
      req.usuario.id = usuarioId;
      req.body = {
        titulo: 'Tarea de usuario específico',
        descripcion: 'Esta tarea debe asociarse al usuario correcto'
      };

      const requestMock = poolMock.request();
      setupTaskCreation(poolMock);

      // Act
      await agregarTarea(req, res);

      // Assert
      expect(requestMock.input).toHaveBeenCalledWith('usuarioId', expect.anything(), usuarioId);
      expect(requestMock.input).toHaveBeenCalledWith('titulo', expect.anything(), 'Tarea de usuario específico');
      expect(requestMock.input).toHaveBeenCalledWith('descripcion', expect.anything(), 'Esta tarea debe asociarse al usuario correcto');
    });

    it('debería manejar errores del servidor', async () => {
      // Arrange
      req.body = {
        titulo: 'Tarea con error',
        descripcion: 'Esta tarea causará un error de servidor'
      };

      dbConexion.mockRejectedValue(new Error('Database connection error'));

      // Act
      await agregarTarea(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al agregar la tarea' });
    });
  });

  describe('obtenerTarea', () => {
    it('debería obtener tareas del usuario exitosamente', async () => {
      // Arrange
      const mockTasks = [
        { ...mockTareaData, id: 1, titulo: 'Tarea 1' },
        { ...mockTareaData, id: 2, titulo: 'Tarea 2' }
      ];

      setupTaskRetrieval(poolMock, mockTasks);

      // Act
      await obtenerTarea(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Se encontraron 2 tarea(s)',
        tareas: mockTasks
      });
      expect(dbConexion).toHaveBeenCalled();
    });

    it('debería manejar usuario sin tareas', async () => {
      // Arrange
      setupTaskRetrieval(poolMock, []); // Sin tareas

      // Act
      await obtenerTarea(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Se encontraron 0 tarea(s)',
        tareas: []
      });
    });

    it('debería usar el ID del usuario autenticado', async () => {
      // Arrange
      const usuarioId = 99;
      req.usuario.id = usuarioId;

      const requestMock = poolMock.request();
      setupTaskRetrieval(poolMock, [mockTareaData]);

      // Act
      await obtenerTarea(req, res);

      // Assert
      expect(requestMock.input).toHaveBeenCalledWith('usuarioId', expect.anything(), usuarioId);
      expect(requestMock.input).toHaveBeenCalledWith('filtro', expect.anything(), 'all'); // Default filter
      expect(requestMock.execute).toHaveBeenCalledWith('Gestion.SP_Obtener_Tareas_Usuario_Filtros');
    });

    it('debería manejar errores del servidor', async () => {
      // Arrange
      dbConexion.mockRejectedValue(new Error('Database connection error'));

      // Act
      await obtenerTarea(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener las tareas' });
    });

    it('debería formatear correctamente el mensaje con singular', async () => {
      // Arrange
      setupTaskRetrieval(poolMock, [mockTareaData]); // Una sola tarea

      // Act
      await obtenerTarea(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Se encontraron 1 tarea(s)',
        tareas: [mockTareaData]
      });
    });
  });
});
