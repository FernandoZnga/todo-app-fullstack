# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Docker Development (Recommended)

```bash
# Start all services (API + SQL Server)
sudo docker compose up --build -d

# View service status
sudo docker compose ps

# View API logs
sudo docker compose logs -f api

# View SQL Server logs  
sudo docker compose logs sqlserver

# Stop all services
sudo docker compose down

# Restart services
sudo docker compose restart

# Rebuild and start
sudo docker compose up --build
```

### Manual Development

```bash
# Install dependencies
cd Backend && npm install

# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

### Database Operations

```bash
# Connect to SQL Server container
sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!'

# Initialize database manually (if needed)
sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!' -i /docker-entrypoint-initdb.d/docker-init-db.sql
```

### Testing Commands

```bash
# Run all tests
cd Backend && npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (re-runs on changes)
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Run all tests with verbose output
npm run test:all

# Run tests inside Docker container
sudo docker exec todo-api npm test
```

### Single Test Execution

```bash
# Run specific test file
cd Backend && npx jest tests/unit/usuarioController.test.js

# Run specific test suite
npx jest --testNamePattern="should register user successfully"
```

## Architecture Overview

### High-Level Structure

This is a full-stack TODO application with:
- **Node.js/Express.js** REST API backend
- **SQL Server** database with stored procedures
- **JWT-based authentication** 
- **Docker containerization** for development and deployment

### Backend Architecture Pattern

The backend follows a **layered MVC architecture** with clear separation of concerns:

```
Backend/
├── app.js                  # Application entry point
├── models/Server.js        # Express server class with middleware setup
├── controllers/            # Business logic layer
├── routes/                 # API endpoint definitions  
├── middleware/             # Authentication & validation middleware
├── helpers/                # Utility functions (JWT, tokens)
├── DB/config.js           # Database connection management
└── tests/                 # Test suites (unit & integration)
```

### Key Architectural Patterns

**1. Server Class Pattern**
- `models/Server.js` encapsulates Express app initialization
- Handles middleware registration, route mounting, and database connection
- Clean separation of server configuration from business logic

**2. Controller-Route Pattern**  
- Controllers (`usuarioController.js`, `tareaController.js`) contain business logic
- Routes (`usuarioRoutes.js`, `tareaRoutes.js`) define endpoints and apply middleware
- Middleware (`auth.js`, `usuarioMid.js`) handles cross-cutting concerns

**3. Database Abstraction**
- `DB/config.js` manages SQL Server connection pooling
- Uses stored procedures for database operations (security best practice)
- Connection reuse through singleton pool pattern

**4. JWT Authentication Flow**
- User registration → email confirmation via token → login → JWT issuance
- `auth.js` middleware validates JWT and populates `req.usuario`
- Protected routes require authentication middleware

### Database Schema

The application uses a SQL Server database with schema `Gestion`:

**Tables:**
- `Gestion.Usuario` - User accounts with email verification
- `Gestion.Tarea` - Tasks linked to users

**Stored Procedures:**
- `SP_Agregar_Usuario` - User registration with duplicate email handling
- `SP_Autenticar_Usuario` - User login authentication
- `SP_Confirmar_Cuenta` - Email confirmation
- `SP_Agregar_Tarea` - Task creation
- `SP_Obtener_Tareas_Usuario` - Fetch user's tasks

### API Endpoints

**Authentication** (`/api/usuarios`):
- `POST /` - User registration
- `GET /confirmar/:token` - Email confirmation  
- `POST /login` - User authentication
- `GET /perfil` - Get user profile (protected)
- Password recovery endpoints

**Tasks** (`/api/tareas`):
- `POST /` - Create task (protected)
- `GET /` - Get user tasks (protected)

### Environment Configuration

**Docker Environment** (pre-configured):
- API runs on port `3000`
- SQL Server on port `1433` 
- Database: `ToDoDB`
- Credentials: `sa/TodoApp2024!`

**Manual Setup** requires `.env`:
```env
PORT=3000
DB_USER=your_sql_user
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_DATABASE=ToDoDB
JWT_SECRET=your_jwt_secret
```

### Testing Strategy

**Comprehensive test coverage** with Jest:
- **Unit tests** - Individual controller functions and middleware
- **Integration tests** - Full API endpoint testing with database
- **Mocked dependencies** - Database mocking for isolated unit tests
- **Test data cleanup** - Automatic cleanup after each test run

### Development Workflow

1. **Start with Docker** - `sudo docker compose up --build -d`
2. **Check logs** - `sudo docker compose logs -f api` 
3. **Test changes** - `sudo docker exec todo-api npm test`
4. **Database access** - Use provided sqlcmd connection string
5. **Hot reload** - Code changes automatically restart the API container

The application is designed for easy development with Docker while supporting manual setup for production deployments.
