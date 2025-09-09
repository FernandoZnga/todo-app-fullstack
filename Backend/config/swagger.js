const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TODO App API',
    version: '1.0.0',
    description: '✨ API REST avanzada para gestión de tareas con autenticación JWT, base de datos SQL Server, completar/borrar tareas con comentarios y sistema de filtros avanzados',
    contact: {
      name: 'Equipo de Desarrollo',
      email: 'desarrollo@todoapp.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el token JWT en el formato: Bearer {token}'
      }
    },
    schemas: {
      Usuario: {
        type: 'object',
        required: ['nombreUsuario', 'correo', 'contraseña'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del usuario',
            example: 1
          },
          nombreUsuario: {
            type: 'string',
            description: 'Nombre completo del usuario',
            example: 'Juan Pérez',
            minLength: 2,
            maxLength: 100
          },
          correo: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico del usuario',
            example: 'juan@example.com',
            maxLength: 100
          },
          contraseña: {
            type: 'string',
            description: 'Contraseña del usuario (mínimo 6 caracteres)',
            example: 'miPassword123',
            minLength: 6
          },
          verificado: {
            type: 'boolean',
            description: 'Indica si el usuario ha confirmado su email',
            example: true
          },
          fechaCreacion: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de registro del usuario'
          }
        }
      },
      UsuarioResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          nombreUsuario: {
            type: 'string',
            example: 'Juan Pérez'
          },
          correo: {
            type: 'string',
            example: 'juan@example.com'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['correo', 'contraseña'],
        properties: {
          correo: {
            type: 'string',
            format: 'email',
            example: 'juan@example.com'
          },
          contraseña: {
            type: 'string',
            example: 'miPassword123'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token para autenticación',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      },
      Tarea: {
        type: 'object',
        required: ['titulo', 'descripcion'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único de la tarea',
            example: 1
          },
          titulo: {
            type: 'string',
            description: 'Título de la tarea',
            example: 'Completar proyecto',
            maxLength: 100
          },
          descripcion: {
            type: 'string',
            description: 'Descripción detallada de la tarea',
            example: 'Terminar la implementación de la API REST',
            maxLength: 500
          },
          completada: {
            type: 'boolean',
            description: 'Estado de completitud de la tarea',
            example: false
          },
          usuarioId: {
            type: 'integer',
            description: 'ID del usuario propietario',
            example: 1
          },
          fechaCreacion: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación de la tarea',
            example: '2024-01-15T10:30:00.000Z'
          },
          fechaActualizacion: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de última actualización',
            example: '2024-01-15T10:30:00.000Z'
          },
          borrada: {
            type: 'boolean',
            description: '✨ Indica si la tarea fue borrada (soft delete)',
            example: false
          },
          fechaCompletada: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '✨ Fecha y hora cuando la tarea fue completada',
            example: '2024-01-16T14:20:00.000Z'
          },
          fechaBorrado: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '✨ Fecha y hora cuando la tarea fue borrada',
            example: null
          },
          comentarioCompletar: {
            type: 'string',
            nullable: true,
            maxLength: 500,
            description: '✨ Comentario obligatorio al completar la tarea',
            example: 'Tarea finalizada correctamente, todos los objetivos cumplidos'
          },
          comentarioBorrado: {
            type: 'string',
            nullable: true,
            maxLength: 500,
            description: '✨ Comentario obligatorio al borrar la tarea',
            example: null
          }
        }
      },
      TareaRequest: {
        type: 'object',
        required: ['titulo', 'descripcion'],
        properties: {
          titulo: {
            type: 'string',
            example: 'Completar proyecto'
          },
          descripcion: {
            type: 'string',
            example: 'Terminar la implementación de la API REST'
          }
        }
      },
      CompletarTareaRequest: {
        type: 'object',
        required: ['comentario'],
        properties: {
          comentario: {
            type: 'string',
            maxLength: 500,
            description: '✨ Comentario obligatorio explicando la completitud de la tarea',
            example: 'Tarea finalizada correctamente, todos los objetivos cumplidos y entregables revisados.'
          }
        }
      },
      BorrarTareaRequest: {
        type: 'object',
        required: ['comentario'],
        properties: {
          comentario: {
            type: 'string',
            maxLength: 500,
            description: '✨ Comentario obligatorio explicando el motivo del borrado',
            example: 'Tarea cancelada por cambio en las prioridades del proyecto y nuevos requerimientos.'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Descripción del error'
          },
          mensaje: {
            type: 'string',
            example: 'Mensaje de error'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          mensaje: {
            type: 'string',
            example: 'Operación exitosa'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Usuarios',
      description: 'Operaciones relacionadas con usuarios y autenticación'
    },
    {
      name: 'Tareas',
      description: '✨ Operaciones avanzadas para la gestión de tareas: crear, listar con filtros, completar con comentarios y borrar (soft delete) con comentarios'
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './controllers/*.js'], // Paths to files containing OpenAPI definitions
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
