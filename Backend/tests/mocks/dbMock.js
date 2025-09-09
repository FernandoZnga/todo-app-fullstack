/**
 * Mocks para la base de datos SQL Server
 * Utilizado para pruebas unitarias sin conexión real a BD
 */

const mockRequest = () => ({
  input: jest.fn().mockReturnThis(),
  output: jest.fn().mockReturnThis(),
  execute: jest.fn(),
  query: jest.fn()
});

const mockPool = () => ({
  request: jest.fn(() => mockRequest()),
  connect: jest.fn(),
  close: jest.fn()
});

// Mock de datos de usuario para pruebas
const mockUsuarioData = {
  id: 1,
  nombreUsuario: 'Test Usuario',
  correo: 'test@example.com',
  contraseña: '$2a$10$hashedPassword',
  verificado: true,
  tokenVerificacion: 'mock_token_123'
};

// Mock de datos de tarea para pruebas
const mockTareaData = {
  id: 1,
  usuarioId: 1,
  titulo: 'Tarea de prueba',
  descripcion: 'Descripción de prueba',
  completada: false,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
};

// Mock exitoso para creación de usuario
const mockSuccessfulUserCreation = {
  output: {
    Mensaje: 'Usuario Creado correctamente'
  }
};

// Mock de error para usuario duplicado
const mockDuplicateUserError = {
  output: {
    Mensaje: 'El correo ya está registrado'
  }
};

// Mock exitoso para creación de tarea
const mockSuccessfulTaskCreation = {
  output: {
    Mensaje: 'Tarea creada correctamente'
  }
};

// Mock de recordset para consultas SELECT
const mockRecordset = (data = []) => ({
  recordset: Array.isArray(data) ? data : [data]
});

const dbMocks = {
  mockRequest,
  mockPool,
  mockUsuarioData,
  mockTareaData,
  mockSuccessfulUserCreation,
  mockDuplicateUserError,
  mockSuccessfulTaskCreation,
  mockRecordset,
  
  // Mock completo de la conexión de base de datos
  mockDbConexion: () => {
    const poolInstance = mockPool();
    return Promise.resolve(poolInstance);
  },
  
  // Configurar mocks para diferentes escenarios
  setupUserCreationSuccess: (poolMock) => {
    poolMock.request().execute.mockResolvedValue(mockSuccessfulUserCreation);
  },
  
  setupUserCreationDuplicate: (poolMock) => {
    poolMock.request().execute.mockResolvedValue(mockDuplicateUserError);
  },
  
  setupUserAuthentication: (poolMock, userData = mockUsuarioData) => {
    poolMock.request().execute.mockResolvedValue(mockRecordset(userData));
  },
  
  setupTaskCreation: (poolMock) => {
    poolMock.request().execute.mockResolvedValue(mockSuccessfulTaskCreation);
  },
  
  setupTaskRetrieval: (poolMock, tasks = [mockTareaData]) => {
    poolMock.request().execute.mockResolvedValue(mockRecordset(tasks));
  }
};

module.exports = dbMocks;
