# Aplicación TODO - Sistema de Gestión de Tareas

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

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd proyecto_clase
```

### 2. Instalar Dependencias del Backend

```bash
cd Backend
npm install
```

### 3. Instalar Dependencias Adicionales

Si no están ya incluidas, instala los paquetes requeridos:

```bash
npm install express bcryptjs cors dotenv jsonwebtoken mssql nodemon nodemailer
```

### 4. Configuración de la Base de Datos

1. **Crear Base de Datos**: Ejecuta los scripts en la carpeta `database-scripts/` en este orden:
   ```sql
   -- 1. Ejecutar DB Script.sql para crear la base de datos y tablas
   -- 2. Ejecutar los procedimientos almacenados:
   --    - SP_Crear_Usuario.sql
   --    - SP_Confirmar_Cuenta.sql  
   --    - SP_Crear_Tarea.sql
   --    - SP_Autenticar_Usuario.sql
   ```

2. **Configurar Conexión a la Base de Datos**: 
   Edita el archivo `Backend/.env` con tus credenciales de base de datos:
   ```env
   PORT=3000
   DB_USER=tu_usuario_sql_server
   DB_PASSWORD=tu_contraseña
   DB_SERVER=nombre_instancia_servidor
   DB_DATABASE=ToDoDB
   JWT_SECRET=tu_clave_secreta_aqui
   ```

### 5. Configuración del Entorno

Actualiza el archivo `.env` en la carpeta Backend:

```env
# Configuración del Servidor
PORT=3000

# Configuración de la Base de Datos  
DB_USER=sa                    # Tu nombre de usuario de SQL Server
DB_PASSWORD=tu_contraseña     # Tu contraseña de SQL Server
DB_SERVER=localhost           # Tu instancia de SQL Server
DB_DATABASE=ToDoDB

# Configuración JWT
JWT_SECRET=tu_clave_secreta_jwt

# Configuración de Email (Opcional - para características futuras)
EMAIL_USER=tu_email@dominio.com
EMAIL_PASS=tu_contraseña_app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
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
