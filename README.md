# Aplicación TODO - Sistema de Gestión de Tareas

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)](https://github.com/usuario/proyecto_clase)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.x-lightgrey.svg)](https://expressjs.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red.svg)](https://www.microsoft.com/sql-server/)
[![Docker](https://img.shields.io/badge/Docker-supported-blue.svg)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green.svg)](https://jestjs.io/)
[![API](https://img.shields.io/badge/API-REST-blue.svg)](https://restfulapi.net/)
[![Spanish](https://img.shields.io/badge/Lang-Espa%C3%B1ol-yellow.svg)](#)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/usuario/proyecto_clase/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

Una aplicación de gestión de tareas full-stack construida con Node.js, Express y SQL Server. Esta aplicación permite a los usuarios registrarse, autenticarse y gestionar sus tareas personales con una API segura.

## 🚀 Características

- **Gestión de Usuarios**
  - Registro de usuarios con confirmación por email
  - Inicio de sesión seguro con autenticación JWT  
  - Funcionalidad de recuperación de contraseña
  - Gestión de perfil de usuario

- **Gestión de Tareas**
  - Crear y gestionar tareas personales
  - Operaciones seguras de tareas con autenticación de usuario
  - Persistencia de tareas con base de datos SQL Server

- **Seguridad**
  - Hash de contraseñas con bcryptjs
  - Autenticación basada en JWT
  - Rutas protegidas y middleware
  - Sistema de confirmación por email

## 📁 Estructura del Proyecto

```
proyecto_clase/
├── Backend/                    # Servidor API del backend
│   ├── controllers/           # Manejadores de peticiones
│   │   ├── usuarioController.js
│   │   └── tareaController.js
│   ├── DB/                    # Configuración de la base de datos
│   │   └── config.js
│   ├── helpers/               # Funciones de utilidad
│   │   ├── generarJWT.js
│   │   └── generarToken.js
│   ├── middleware/            # Middleware personalizado
│   │   ├── auth.js
│   │   └── usuarioMid.js
│   ├── models/                # Modelos de la aplicación
│   │   └── Server.js
│   ├── routes/                # Rutas de la API
│   │   ├── usuarioRoutes.js
│   │   └── tareaRoutes.js
│   ├── app.js                 # Punto de entrada de la aplicación
│   ├── package.json           # Dependencias y scripts
│   ├── .env                   # Variables de entorno
│   └── .gitignore            # Patrones de ignorado de Git
├── database-scripts/          # Scripts de configuración de BD
│   ├── DB Script.sql          # Esquema principal de la base de datos
│   ├── SP_Crear_Usuario.sql   # Procedimiento almacenado para crear usuario
│   ├── SP_Confirmar_Cuenta.sql # Procedimiento de confirmación de cuenta
│   ├── SP_Crear_Tarea.sql     # Procedimiento de creación de tarea
│   └── SP_Autenticar_Usuario.sql # Procedimiento de autenticación de usuario
└── Instrucciones.txt         # Instrucciones de configuración
```

## 🛠️ Prerrequisitos

Antes de ejecutar esta aplicación, asegúrate de tener:

- **Node.js** (v14 o superior)
- **SQL Server** (Express, Developer, o versión completa)
- **npm** (viene con Node.js)

## ⚙️ Instalación

### 🐳 Opción 1: Usando Docker (Recomendado)

**Requisitos previos:**
- Docker y Docker Compose instalados
- Al menos 4GB de RAM disponible

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd proyecto_clase

# 2. Levantar todos los servicios con Docker
sudo docker compose up --build -d

# 3. Verificar que los servicios estén ejecutándose
sudo docker compose ps

# 4. Ver logs si es necesario
sudo docker compose logs api
sudo docker compose logs sqlserver
```

**¡Listo!** La aplicación estará disponible en `http://localhost:3000`

#### Comandos útiles de Docker:

```bash
# Detener todos los servicios
sudo docker compose down

# Reiniciar servicios
sudo docker compose restart

# Ver logs de un servicio específico
sudo docker compose logs -f api

# Ejecutar comandos en el contenedor SQL Server
sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!'

# Reconstruir las imágenes
sudo docker compose up --build
```

### 💻 Opción 2: Instalación Manual

#### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd proyecto_clase
```

#### 2. Instalar Dependencias del Backend

```bash
cd Backend
npm install
```

#### 3. Configuración de la Base de Datos

1. **Instalar SQL Server** localmente
2. **Crear Base de Datos**: Ejecuta el script `docker-init-db.sql` que incluye toda la configuración necesaria
3. **Configurar Conexión**: Edita el archivo `Backend/.env`:
   ```env
   PORT=3000
   DB_USER=tu_usuario_sql_server
   DB_PASSWORD=tu_contraseña
   DB_SERVER=localhost
   DB_DATABASE=ToDoDB
   JWT_SECRET=tu_clave_secreta_aqui
   ```

#### 4. Ejecutar la Aplicación

```bash
cd Backend
npm run dev
```

## 🚀 Ejecutar la Aplicación

### Modo Desarrollo
```bash
cd Backend
npm run dev
```

### Modo Producción  
```bash
cd Backend
npm start
```

El servidor se iniciará en `http://localhost:3000`

## 🐳 Configuración Docker

### Servicios Incluidos

El proyecto incluye un setup completo con Docker Compose:

- **📊 API Node.js** (`todo-api`)
  - Puerto: `3000`
  - Hot reload habilitado para desarrollo
  - Variables de entorno preconfiguradas

- **📋 SQL Server** (`todo-sqlserver`)
  - Puerto: `1433`
  - Usuario: `sa`
  - Contraseña: `TodoApp2024!`
  - Base de datos: `ToDoDB`
  - Inicialización automática de esquemas y procedimientos

### Variables de Entorno Docker

Las variables están preconfiguradas en `docker-compose.yml`:

```yaml
environment:
  - PORT=3000
  - DB_USER=sa
  - DB_PASSWORD=TodoApp2024!
  - DB_SERVER=sqlserver
  - DB_DATABASE=ToDoDB
  - JWT_SECRET=mi_clave_secreta_super_segura_2024
```

### Desarrollo con Docker

```bash
# Desarrollo con hot reload
sudo docker compose up -d

# Ver logs en tiempo real
sudo docker compose logs -f api

# Acceder a la base de datos
sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!'

# Reiniciar solo la API
sudo docker compose restart api
```

## 📚 Endpoints de la API

### Autenticación de Usuario

| Método | Endpoint | Descripción | Autenticación Requerida |
|--------|----------|-------------|---------------------------|
| POST | `/api/usuarios/` | Registrar nuevo usuario | No |
| GET | `/api/usuarios/confirmar/:token` | Confirmar cuenta de usuario | No |
| POST | `/api/usuarios/login` | Inicio de sesión de usuario | No |
| GET | `/api/usuarios/perfil` | Obtener perfil de usuario | Sí |
| POST | `/api/usuarios/olvide-password` | Solicitar restablecimiento de contraseña | No |
| GET | `/api/usuarios/olvide-password/:token` | Verificar token de restablecimiento | No |
| POST | `/api/usuarios/olvide-password/:token` | Restablecer contraseña | No |

### Gestión de Tareas

| Método | Endpoint | Descripción | Autenticación Requerida |
|--------|----------|-------------|---------------------------|
| POST | `/api/tareas/` | Crear nueva tarea | Sí |
| GET | `/api/tareas/` | Obtener tareas del usuario | Sí |

## 🔐 Autenticación

La aplicación usa JWT (JSON Web Tokens) para autenticación. Incluye el token en el header de Authorization:

```
Authorization: Bearer tu_token_jwt_aqui
```

### Ejemplos de Uso

#### 1. Registrar un nuevo usuario
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "Juan Pérez",
    "correo": "juan@example.com",
    "contraseña": "miPassword123"
  }'
```

#### 2. Confirmar cuenta
```bash
curl -X GET "http://localhost:3000/api/usuarios/confirmar/TOKEN_AQUI"
```

#### 3. Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan@example.com",
    "contraseña": "miPassword123"
  }'
```

#### 4. Crear una tarea (requiere autenticación)
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "titulo": "Completar proyecto",
    "descripcion": "Terminar la implementación de la API REST"
  }'
```

#### 5. Obtener tareas del usuario
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 🧪 Pruebas (Testing)

El proyecto incluye un suite completo de pruebas automatizadas con Jest para garantizar la calidad del código.

### Tipos de Pruebas

- **📊 Pruebas Unitarias**: Testean funciones individuales y componentes aislados
- **🔗 Pruebas de Integración**: Testean la interacción entre componentes y endpoints
- **🌐 Pruebas de Middleware**: Verifican autenticación y validaciones

### Estructura de Pruebas

```
Backend/tests/
├── unit/                    # Pruebas unitarias
│   ├── usuarioController.test.js
│   ├── tareaController.test.js
│   └── auth.middleware.test.js
├── integration/             # Pruebas de integración
│   └── api.integration.test.js
├── mocks/                  # Mocks para BD y servicios
│   └── dbMock.js
├── helpers/                # Utilidades para pruebas
└── setup.js                # Configuración global de Jest
```

### Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con modo watch (se re-ejecuta al cambiar código)
npm run test:watch

# Generar reporte de cobertura de código
npm run test:coverage

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar solo pruebas de integración
npm run test:integration

# Ejecutar todas las pruebas con salida detallada
npm run test:all
```

### Ejecutar Pruebas con Docker

```bash
# Ejecutar pruebas dentro del contenedor
sudo docker exec todo-api npm test

# Ejecutar con cobertura
sudo docker exec todo-api npm run test:coverage

# Ver resultados de cobertura
sudo docker exec todo-api cat coverage/lcov-report/index.html
```

### Cobertura de Pruebas

Las pruebas cubren:

- ✅ **Controladores**: 100% de funciones principales
- ✅ **Middleware**: Autenticación y validaciones
- ✅ **Rutas**: Todos los endpoints de la API
- ✅ **Manejo de errores**: Casos de error y excepciones
- ✅ **Validaciones**: Campos requeridos y formatos

### Ejemplos de Pruebas

#### Prueba Unitaria (Usuario)
```javascript
it('debería registrar un usuario exitosamente', async () => {
  const response = await registrarUsuario(req, res);
  
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ 
    mensaje: 'Usuario Creado correctamente' 
  });
});
```

#### Prueba de Integración (API)
```javascript
it('debería crear tarea con autenticación válida', async () => {
  const response = await request(app)
    .post('/api/tareas')
    .set('Authorization', `Bearer ${token}`)
    .send({ titulo: 'Test', descripcion: 'Tarea de prueba' })
    .expect(200);
    
  expect(response.body.mensaje).toBe('Tarea agregada correctamente');
});
```

### CI/CD y Automatización

Las pruebas se pueden integrar fácilmente en pipelines de CI/CD:

```yaml
# GitHub Actions ejemplo
- name: Run Tests
  run: |
    cd Backend
    npm install
    npm run test:all
```

### Configuración de Testing

Jest está configurado en `package.json` con:

- **Entorno**: Node.js
- **Timeout**: 30 segundos para pruebas de integración
- **Cobertura**: Incluye todos los archivos `.js` excepto `node_modules`
- **Setup**: Configuración global en `tests/setup.js`

### Datos de Prueba

Las pruebas utilizan:

- **Mocks de BD**: Para pruebas unitarias sin conexión real
- **Datos generados**: Usuarios y tareas únicos por ejecución
- **Limpieza automática**: Datos de prueba se limpian después de cada test

## 🏗️ Stack de Tecnologías

- **Framework Backend**: Express.js
- **Base de Datos**: Microsoft SQL Server
- **Autenticación**: JWT (JSON Web Tokens)
- **Hash de Contraseñas**: bcryptjs
- **Gestión de Entorno**: dotenv
- **CORS**: middleware cors
- **Herramienta de Desarrollo**: nodemon

## 📝 Notas de Desarrollo

- La aplicación usa procedimientos almacenados para operaciones de base de datos
- Los tokens JWT se usan para autenticación segura
- El hash de contraseñas asegura el almacenamiento seguro de credenciales
- CORS está configurado para peticiones de origen cruzado
- Las variables de entorno gestionan configuración sensible

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -am 'Añadir alguna característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia ISC.

## 👥 Autores

- Proyecto desarrollado como parte de una tarea de clase
- Para preguntas o soporte, contacta al equipo de desarrollo

---

**Nota**: Asegúrate de configurar tu instancia de SQL Server y actualizar las cadenas de conexión en el archivo `.env` antes de ejecutar la aplicación.
