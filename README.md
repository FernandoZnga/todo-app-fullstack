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
  - **✨ Completar tareas con comentario obligatorio**
  - **✨ Borrar tareas (soft delete) con comentario obligatorio**
  - **✨ Sistema avanzado de filtros** (pendientes, completadas, borradas)
  - **✨ Historial completo** con fechas de creación, completado y borrado
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
│   ├── actualizar-base-datos.sql # Script de actualización con nuevas funcionalidades
│   ├── SP_Crear_Usuario.sql   # Procedimiento almacenado para crear usuario
│   ├── SP_Confirmar_Cuenta.sql # Procedimiento de confirmación de cuenta
│   ├── SP_Crear_Tarea.sql     # Procedimiento de creación de tarea
│   ├── SP_Completar_Tarea.sql # ✨ Procedimiento para completar tareas
│   ├── SP_Borrar_Tarea.sql    # ✨ Procedimiento para borrar tareas (soft delete)
│   ├── SP_Obtener_Tareas_Usuario_Filtros.sql # ✨ Procedimiento con filtros avanzados
│   └── SP_Autenticar_Usuario.sql # Procedimiento de autenticación de usuario
└── Instrucciones.txt         # Instrucciones de configuración
```

## 🚀 Quick Start

### 🆕 **Para Empleados Nuevos (Primera Instalación)**

#### Prerrequisitos
- **Docker** y **Docker Compose** instalados
- **Git** instalado
- Al menos **4GB de RAM** disponible
- Tu usuario debe estar en el grupo `docker` (sin necesidad de `sudo`)

#### Pasos de Instalación (Solo Primera Vez)

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd proyecto_clase

# 2. Levantar todos los servicios (primera vez toma más tiempo)
docker compose up --build -d

# 3. Verificar que todo esté funcionando
docker compose ps

# 4. Verificar logs si hay problemas
docker compose logs -f api
```

**🎉 ¡Listo!** 
- **API**: http://localhost:3000
- **Documentación**: http://localhost:3000/api-docs
- **Base de datos**: `localhost:1433` (usuario: `sa`, password: `TodoApp2024!`)

---

### 👨‍💻 **Para Developers Existentes (Uso Diario)**

#### Comandos Diarios

```bash
# Iniciar el proyecto (cada mañana)
cd proyecto_clase
docker compose up -d

# Verificar que esté corriendo
docker compose ps

# Al final del día, detener servicios (opcional)
docker compose down
```

#### Comandos Útiles para Desarrollo

```bash
# Ver logs en tiempo real
docker compose logs -f api

# Reiniciar solo la API (después de cambios importantes)
docker compose restart api

# Reconstruir después de cambios en dependencias
docker compose up --build -d

# Ejecutar pruebas
docker exec todo-api npm test

# Acceder a la base de datos
docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!'
```

---

### 🆘 **Problemas Comunes (Troubleshooting)**

#### ❌ "Cannot connect to the Docker daemon"
```bash
# Verificar que Docker esté corriendo
sudo systemctl start docker

# Agregar tu usuario al grupo docker (solo primera vez)
sudo usermod -aG docker $USER
# Después ejecuta: newgrp docker o reinicia la sesión
```

#### ❌ "Port 3000 is already in use"
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000

# Detener otros contenedores
docker compose down
```

#### ❌ "SQL Server not ready"
```bash
# El SQL Server toma tiempo en inicializar (30-60 segundos)
# Verificar logs:
docker compose logs sqlserver

# Si persiste, reiniciar:
docker compose down
docker compose up -d
```

#### ❌ "API returns 500 errors"
```bash
# Revisar logs de la API
docker compose logs -f api

# Verificar que la base de datos esté inicializada
docker compose ps
```



## 📚 Documentación de la API

### 📄 **Swagger UI - Documentación Interactiva**

**🌐 Accede a la documentación completa en**: http://localhost:3000/api-docs

La documentación incluye:
- ✨ **Interfaz interactiva** para probar endpoints
- 🔐 **Autenticación JWT** integrada
- 📝 **Ejemplos completos** de requests/responses
- 🔍 **Validación de esquemas** en tiempo real
- 📦 **Exportación OpenAPI 3.0**

### 🚦 **Endpoints Disponibles**

#### Autenticación de Usuario (`/api/usuarios`)
- `POST /api/usuarios` - Registrar nuevo usuario
- `GET /api/usuarios/confirmar/:token` - Confirmar cuenta 
- `POST /api/usuarios/login` - Inicio de sesión
- `GET /api/usuarios/perfil` - Obtener perfil (🔒 Protegido)
- `POST /api/usuarios/olvide-password` - Solicitar recuperación
- `GET /api/usuarios/olvide-password/:token` - Verificar token
- `POST /api/usuarios/olvide-password/:token` - Restablecer contraseña

#### Gestión de Tareas (`/api/tareas`)
- `POST /api/tareas` - Crear nueva tarea (🔒 Protegido)
- `GET /api/tareas` - Obtener tareas del usuario con filtros (🔒 Protegido)
- **✨ `PUT /api/tareas/:id/completar`** - Completar tarea con comentario (🔒 Protegido)
- **✨ `DELETE /api/tareas/:id/borrar`** - Borrar tarea con comentario (🔒 Protegido)

> **💡 Tip**: Usa la documentación interactiva en `/api-docs` para probar los endpoints directamente desde el navegador.

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
# Obtener todas las tareas activas (por defecto)
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer TU_TOKEN_JWT"

# Obtener solo tareas pendientes
curl -X GET "http://localhost:3000/api/tareas?filter=pending" \
  -H "Authorization: Bearer TU_TOKEN_JWT"

# Obtener solo tareas completadas
curl -X GET "http://localhost:3000/api/tareas?filter=completed" \
  -H "Authorization: Bearer TU_TOKEN_JWT"

# Obtener solo tareas borradas
curl -X GET "http://localhost:3000/api/tareas?filter=deleted" \
  -H "Authorization: Bearer TU_TOKEN_JWT"

# Obtener todas las tareas (incluyendo borradas)
curl -X GET "http://localhost:3000/api/tareas?filter=all_including_deleted" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

#### 6. ✨ Completar una tarea (requiere comentario)
```bash
curl -X PUT http://localhost:3000/api/tareas/1/completar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "comentario": "Tarea completada exitosamente. Se cumplió con todos los objetivos planteados."
  }'
```

#### 7. ✨ Borrar una tarea (requiere comentario)
```bash
curl -X DELETE http://localhost:3000/api/tareas/1/borrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "comentario": "Tarea cancelada debido a cambios en las prioridades del proyecto."
  }'
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

### Backend
- **Framework**: Express.js 4.21.x
- **Base de Datos**: Microsoft SQL Server 2022
- **Autenticación**: JWT (JSON Web Tokens)
- **Hash de Contraseñas**: bcryptjs
- **✨ Gestión Avanzada de Tareas**: Completar/Borrar con comentarios obligatorios
- **✨ Sistema de Filtros**: Múltiples filtros para tareas (pendientes, completadas, borradas)
- **✨ Borrado Lógico**: Soft delete con historial completo
- **✨ Auditoria**: Fechas y comentarios de todas las operaciones
- **Documentación API**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Desarrollo**: nodemon (hot reload)

### DevOps & Herramientas
- **Containerización**: Docker + Docker Compose
- **CORS**: Habilitado para desarrollo
- **Variables de Entorno**: dotenv
- **Gestión de Dependencias**: npm

---

## 🛠️ Apéndice: Instalación Manual (Sin Docker)

<details>
<summary>Click para expandir las instrucciones de instalación manual</summary>

### Prerrequisitos
- Node.js (v14 o superior)
- SQL Server (Express, Developer, o versión completa)
- npm (viene con Node.js)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd proyecto_clase
   ```

2. **Instalar dependencias**
   ```bash
   cd Backend
   npm install
   ```

3. **Configurar base de datos**
   - Instalar SQL Server localmente
   - Ejecutar script `docker-init-db.sql`
   - Crear archivo `Backend/.env`:
     ```env
     PORT=3000
     DB_USER=tu_usuario_sql_server
     DB_PASSWORD=tu_contraseña
     DB_SERVER=localhost
     DB_DATABASE=ToDoDB
     JWT_SECRET=tu_clave_secreta_aqui
     ```

4. **Ejecutar aplicación**
   ```bash
   npm run dev  # Desarrollo
   npm start    # Producción
   ```

</details>

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crea branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

ISC License - Ver archivo LICENSE para más detalles.

## 👥 Equipo

Desarrollado como proyecto académico.  
Para soporte: contacta al equipo de desarrollo.

---

**🚀 ¡Happy Coding!** - Recuerda revisar la [documentación interactiva](http://localhost:3000/api-docs) después de iniciar la aplicación.
