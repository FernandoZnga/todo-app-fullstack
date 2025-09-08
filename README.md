# TODO App - Task Management System

A full-stack task management application built with Node.js, Express, and SQL Server. This application allows users to register, authenticate, and manage their personal tasks with a secure API.

## 🚀 Features

- **User Management**
  - User registration with email confirmation
  - Secure login with JWT authentication  
  - Password recovery functionality
  - User profile management

- **Task Management**
  - Create and manage personal tasks
  - Secure task operations with user authentication
  - Task persistence with SQL Server database

- **Security**
  - Password hashing with bcryptjs
  - JWT-based authentication
  - Protected routes and middleware
  - Email confirmation system

## 📁 Project Structure

```
proyecto_clase/
├── Backend/                    # Backend API server
│   ├── controllers/           # Request handlers
│   │   ├── usuarioController.js
│   │   └── tareaController.js
│   ├── DB/                    # Database configuration
│   │   └── config.js
│   ├── helpers/               # Utility functions
│   │   ├── generarJWT.js
│   │   └── generarToken.js
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js
│   │   └── usuarioMid.js
│   ├── models/                # Application models
│   │   └── Server.js
│   ├── routes/                # API routes
│   │   ├── usuarioRoutes.js
│   │   └── tareaRoutes.js
│   ├── app.js                 # Application entry point
│   ├── package.json           # Dependencies and scripts
│   ├── .env                   # Environment variables
│   └── .gitignore            # Git ignore patterns
├── database-scripts/          # Database setup scripts
│   ├── DB Script.sql          # Main database schema
│   ├── SP_Crear_Usuario.sql   # User creation stored procedure
│   ├── SP_Confirmar_Cuenta.sql # Account confirmation procedure
│   ├── SP_Crear_Tarea.sql     # Task creation procedure
│   └── SP_Autenticar_Usuario.sql # User authentication procedure
└── Instrucciones.txt         # Setup instructions
```

## 🛠️ Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **SQL Server** (Express, Developer, or full version)
- **npm** (comes with Node.js)

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd proyecto_clase
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Additional Dependencies

If not already included, install the required packages:

```bash
npm install express bcryptjs cors dotenv jsonwebtoken mssql nodemon nodemailer
```

### 4. Database Setup

1. **Create Database**: Execute the scripts in the `database-scripts/` folder in this order:
   ```sql
   -- 1. Run DB Script.sql to create the database and tables
   -- 2. Run the stored procedures:
   --    - SP_Crear_Usuario.sql
   --    - SP_Confirmar_Cuenta.sql  
   --    - SP_Crear_Tarea.sql
   --    - SP_Autenticar_Usuario.sql
   ```

2. **Configure Database Connection**: 
   Edit `Backend/.env` file with your database credentials:
   ```env
   PORT=3000
   DB_USER=your_sql_server_username
   DB_PASSWORD=your_password
   DB_SERVER=your_server_instance_name
   DB_DATABASE=ToDoDB
   JWT_SECRET=your_secret_key_here
   ```

### 5. Environment Configuration

Update the `.env` file in the Backend folder:

```env
# Server Configuration
PORT=3000

# Database Configuration  
DB_USER=sa                    # Your SQL Server username
DB_PASSWORD=your_password     # Your SQL Server password
DB_SERVER=localhost           # Your SQL Server instance
DB_DATABASE=ToDoDB

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration (Optional - for future features)
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

## 🚀 Running the Application

### Development Mode
```bash
cd Backend
npm run dev
```

### Production Mode  
```bash
cd Backend
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### User Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/usuarios/` | Register new user | No |
| GET | `/api/usuarios/confirmar/:token` | Confirm user account | No |
| POST | `/api/usuarios/login` | User login | No |
| GET | `/api/usuarios/perfil` | Get user profile | Yes |
| POST | `/api/usuarios/olvide-password` | Request password reset | No |
| GET | `/api/usuarios/olvide-password/:token` | Verify reset token | No |
| POST | `/api/usuarios/olvide-password/:token` | Reset password | No |

### Task Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tareas/` | Create new task | Yes |
| GET | `/api/tareas/` | Get user tasks | Yes |

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## 🏗️ Technology Stack

- **Backend Framework**: Express.js
- **Database**: Microsoft SQL Server
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **CORS**: cors middleware
- **Development Tool**: nodemon

## 📝 Development Notes

- The application uses stored procedures for database operations
- JWT tokens are used for secure authentication
- Password hashing ensures secure user credential storage
- CORS is configured for cross-origin requests
- Environment variables manage sensitive configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Project developed as part of a class assignment
- For questions or support, please contact the development team

---

**Note**: Make sure to configure your SQL Server instance and update the connection strings in the `.env` file before running the application.
