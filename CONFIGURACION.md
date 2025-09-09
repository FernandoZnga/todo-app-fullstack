# 🔧 Configuración de Variables de Entorno

Este proyecto soporta dos métodos de desarrollo con diferentes archivos de configuración.

## 📂 **Archivos de Configuración**

### **`.env.docker`** (Directorio raíz)
- 🐳 **Para desarrollo con Docker** (Recomendado)
- ✅ Configuración lista para usar
- ✅ Valores pre-configurados para contenedores

### **`Backend/.env.example`** (Directorio backend)
- 🔧 **Template para desarrollo manual**
- ✅ Necesitas crear `Backend/.env` copiando este archivo
- ✅ Requiere configuración manual de base de datos local

---

## 🚀 **Método 1: Desarrollo con Docker (Recomendado)**

### Usa automáticamente: `.env.docker`

```bash
# Iniciar todos los servicios
sudo docker compose up --build -d

# Las variables se leen automáticamente desde .env.docker
# DB_SERVER se sobreescribe a "sqlserver" para Docker network
```

**✅ Ventajas:**
- Sin configuración adicional
- Base de datos incluida
- Entorno consistente

---

## 🛠️ **Método 2: Desarrollo Manual**

### Requiere crear: `Backend/.env`

```bash
# 1. Crear archivo de configuración
cd Backend
cp .env.example .env

# 2. Editar Backend/.env con tus valores:
# - DB_SERVER=localhost (o tu servidor SQL Server)
# - DB_PASSWORD=tu_contraseña_real
# - JWT_SECRET=tu_clave_secreta_única

# 3. Instalar dependencias y ejecutar
npm install
npm run dev
```

**⚠️ Requisitos adicionales:**
- SQL Server instalado localmente
- Base de datos ToDoDB creada
- Configuración manual de conexión

---

## 🔄 **Migrar entre métodos**

### De Docker a Manual:
1. `sudo docker compose down`
2. `cp Backend/.env.example Backend/.env`
3. Configurar `Backend/.env` con valores locales
4. `cd Backend && npm run dev`

### De Manual a Docker:
1. (Opcional) `rm Backend/.env`
2. `sudo docker compose up --build -d`

---

## 📋 **Variables Principales**

| Variable | Docker (.env.docker) | Manual (Backend/.env) |
|----------|---------------------|----------------------|
| `DB_SERVER` | `sqlserver` | `localhost` |
| `DB_PASSWORD` | Ver `.env.docker` | Tu contraseña |
| `JWT_SECRET` | Pre-configurado | Tu clave única |
| `PORT` | `3000` | `3000` |

---

## 🧪 **Para Testing**

```bash
# Con Docker
sudo docker exec todo-api npm test

# Manual (requiere Backend/.env)
cd Backend && npm test
```
