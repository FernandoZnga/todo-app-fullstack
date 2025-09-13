# 🌊 DigitalOcean App Platform - Branch de Deploy

Esta es la branch `digital-ocean` que contiene toda la configuración necesaria para hacer deploy del proyecto TODO en DigitalOcean App Platform.

## 🎯 Propósito de esta Branch

Esta branch mantiene **separada** toda la configuración de producción/deploy del código principal, permitiendo:
- ✅ Mantener el código de desarrollo limpio en `main`
- ✅ Poder probar configuraciones de deploy sin afectar desarrollo
- ✅ Hacer merge controlado cuando la configuración esté probada
- ✅ Mantener diferentes estrategias de deploy por branch

## 📁 Archivos Específicos de Deploy

### Configuración Principal
- **`.do/app.yaml`** - Configuración de DigitalOcean App Platform
- **`.env.production.example`** - Variables de entorno para producción  
- **`DEPLOY_GUIDE.md`** - Guía completa paso a paso

### Scripts de Automatización
- **`scripts/deploy.sh`** - Configuración automática de deploy
- **`scripts/validate.sh`** - Validación pre-deploy

### Docker Optimizado
- **`Backend/Dockerfile`** - Multi-stage build optimizado
- **`Frontend/Dockerfile`** - Multi-stage build con nginx
- **`Frontend/nginx.conf`** - Configuración nginx para producción

### Seguridad
- **`.gitignore`** actualizado para archivos sensibles de deploy

## 🚀 Cómo usar esta Branch

### 1. Preparar Deploy
```bash
# Ya estás en la branch digital-ocean
git branch  # Verificar que estás en digital-ocean

# Configurar para tu repositorio GitHub
./scripts/deploy.sh --repo tu-usuario/proyecto_clase

# Validar que todo esté correcto
./scripts/validate.sh
```

### 2. Subir a GitHub
```bash
# Commit cualquier cambio de configuración
git add .
git commit -m "Configure deployment for my repository"

# Push de la branch digital-ocean
git push origin digital-ocean
```

### 3. Deploy en DigitalOcean
1. Ir a https://cloud.digitalocean.com/apps
2. Crear nueva app desde GitHub
3. Seleccionar **branch: digital-ocean**
4. DigitalOcean detectará automáticamente `.do/app.yaml`

## 🔄 Workflow Recomendado

### Para Desarrollo Normal
```bash
# Cambiar a main para desarrollo
git checkout main

# Hacer tus cambios normales
# ... desarrollo ...
git add .
git commit -m "Add new feature"
git push origin main
```

### Para Cambios de Deploy
```bash
# Cambiar a digital-ocean para configuración
git checkout digital-ocean

# Merge cambios de main si necesario
git merge main

# Hacer cambios de configuración de deploy
# ... cambios en .do/app.yaml, scripts, etc ...
git add .
git commit -m "Update deployment configuration"
git push origin digital-ocean
```

### Para Sincronizar con Main
```bash
# Cuando la configuración esté probada y funcionando
git checkout main
git merge digital-ocean

# O hacer cherry-pick de commits específicos
git cherry-pick <commit-hash-from-digital-ocean>
```

## ⚙️ Configuración Actual

### Servicios Configurados
- **Frontend**: React/Vite con nginx
- **Backend**: Node.js/Express
- **Database**: PostgreSQL administrada
- **Worker**: Migración automática de base de datos

### Branch de Deploy
- **Branch actual**: `digital-ocean`
- **Detección automática**: El script detecta la branch actual
- **Configuración**: Optimizada para DigitalOcean App Platform

### Variables de Entorno Requeridas
```bash
JWT_SECRET=tu-secreto-jwt-seguro
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion
```

## 🔍 Validación

Antes de hacer deploy:
```bash
# Verificar que todo esté configurado correctamente
./scripts/validate.sh

# Debería mostrar:
# ✅ Todos los archivos necesarios
# ✅ Configuración JSON válida
# ✅ Scripts requeridos presentes
# ✅ Estado de Git correcto
```

## 📖 Documentación Completa

Para la guía paso a paso completa, ver: **`DEPLOY_GUIDE.md`**

## 🤝 Contribuir a la Configuración de Deploy

Si encuentras mejoras para la configuración de deploy:

1. Hacer cambios en esta branch (`digital-ocean`)
2. Probar con `./scripts/validate.sh`
3. Commit con mensaje descriptivo
4. Push a `origin digital-ocean`
5. Crear Pull Request desde `digital-ocean` hacia `main`

## 🆘 Troubleshooting Rápido

### Error: "Repository not configured"
```bash
./scripts/deploy.sh --repo tu-usuario/proyecto_clase
```

### Error: "Validation failed"
```bash
./scripts/validate.sh
# Ver errores específicos y corregir
```

### Error: "Branch not found"
```bash
git push origin digital-ocean  # Subir branch a GitHub
```

---

## 🎯 Próximos Pasos

1. **Configurar tu repositorio**: `./scripts/deploy.sh --repo tu-usuario/proyecto_clase`
2. **Validar**: `./scripts/validate.sh`
3. **Push branch**: `git push origin digital-ocean`
4. **Deploy en DigitalOcean**: Usar branch `digital-ocean`
5. **Probar aplicación desplegada**
6. **Merge a main cuando esté probado**: `git checkout main && git merge digital-ocean`

¡Esta branch está lista para deploy en DigitalOcean! 🌊

---

*Branch: `digital-ocean` | Configuración para DigitalOcean App Platform*
