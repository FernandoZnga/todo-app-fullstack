# 🤝 Contributing to TODO App

¡Gracias por tu interés en contribuir a este proyecto! Aquí están las guías para participar.

## 🚀 **Getting Started**

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (para desarrollo manual)
- Git

### Setup
```bash
# Clonar el repositorio
git clone <repository-url>
cd proyecto_clase

# Levantar servicios con Docker
sudo docker compose up --build -d

# Verificar que todo funciona
sudo docker exec todo-api npm test
```

## 🧪 **Testing**

Este proyecto usa una **estrategia híbrida de testing**:

```bash
# Tests rápidos (30s)
npm run test:quick

# Suite completa (75s)  
npm test

# Tests específicos
npm run test:smoke        # Validación básica
npm run test:integration  # Funcionalidad completa
```

### Test Requirements
- **Todos los tests deben pasar** antes de hacer PR
- **Nuevas features** deben incluir tests apropiados
- **Smoke tests** para validación básica
- **Integration tests** para funcionalidad completa

## 📋 **Development Workflow**

### 1. **Fork & Branch**
```bash
# Fork en GitHub, luego clonar
git clone <your-fork-url>
cd proyecto_clase

# Crear branch para tu feature
git checkout -b feature/tu-nueva-feature
```

### 2. **Development**
```bash
# Durante desarrollo - verificación rápida
npm run test:quick

# Antes de commit - validación completa
npm test
```

### 3. **Pull Request**
- Hacer PR desde tu branch a `master`
- Incluir descripción clara de cambios
- Asegurar que todos los tests pasan
- Seguir formato de commits (ver abajo)

## 📝 **Commit Guidelines**

Usar formato descriptivo con emojis:

```
🔧 feat: add new task filtering feature
🐛 fix: resolve authentication token validation
🧪 test: add integration tests for user registration
📚 docs: update API documentation
```

### Prefijos Recomendados:
- `🔧 feat:` - Nueva funcionalidad
- `🐛 fix:` - Corrección de bugs
- `🧪 test:` - Tests
- `📚 docs:` - Documentación
- `🎨 style:` - Cambios de estilo
- `♻️ refactor:` - Refactoring
- `⚡ perf:` - Mejoras de rendimiento

## 🏗️ **Project Structure**

```
proyecto_clase/
├── Backend/           # API Node.js + Express
├── Frontend/          # Cliente React
├── database-scripts/  # Scripts SQL
├── .env.docker       # Variables Docker
├── docker-compose.yml # Configuración contenedores
└── README.md         # Documentación principal
```

## 🎯 **Areas de Contribución**

### **High Priority:**
- 🧪 Unit tests (están en backup, necesitan mocks arreglados)
- 🔐 Mejoras de seguridad
- 🎨 UI/UX improvements
- 📊 Nuevas features de gestión de tareas

### **Medium Priority:**
- 📱 Responsive design
- 🌐 Internacionalización
- ⚡ Performance optimizations
- 🔔 Notificaciones

### **Low Priority:**
- 🎨 Themes/customización
- 📈 Analytics
- 🔌 Integraciones externas

## 🐛 **Bug Reports**

Al reportar bugs, incluye:

1. **Descripción clara** del problema
2. **Pasos para reproducir**
3. **Comportamiento esperado**
4. **Comportamiento actual**
5. **Versión/commit** donde ocurre
6. **Logs relevantes** (si aplica)

## 💡 **Feature Requests**

Para nuevas features:

1. **Describe el problema** que resuelve
2. **Propón una solución**
3. **Considera alternativas**
4. **Piensa en testing** - ¿cómo validarías la feature?

## 📖 **Documentation**

- **API changes**: Actualizar Swagger/OpenAPI docs
- **Setup changes**: Actualizar README.md
- **New features**: Agregar a documentación relevante
- **Configuration**: Actualizar CONFIGURACION.md

## ⚙️ **Environment Variables**

- **Docker**: Usar `.env.docker` (para desarrollo)
- **Manual**: Crear `Backend/.env` desde `Backend/.env.example`
- **Never commit** archivos `.env` con credenciales reales
- **Document** nuevas variables en README

## 🔍 **Code Review Process**

1. **Automated checks** deben pasar (tests, linting)
2. **Manual review** por maintainers
3. **Testing validation** en entorno local
4. **Documentation check** si aplica

## 🙋‍♂️ **Getting Help**

- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas generales
- **Documentation**: Revisar README.md y docs/

## 📜 **Code of Conduct**

- **Sé respetuoso** con otros colaboradores
- **Constructive feedback** en reviews
- **Focus on the code**, no en las personas
- **Help others learn** y crecer

---

**¡Gracias por contribuir! 🚀**

Tu participación hace que este proyecto sea mejor para todos.
