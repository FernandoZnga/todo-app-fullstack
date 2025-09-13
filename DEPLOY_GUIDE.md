# 🚀 Guía Completa de Deploy en DigitalOcean App Platform

Esta guía te llevará paso a paso a través del proceso completo de deploy de tu aplicación TODO en DigitalOcean App Platform.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Archivos de Configuración](#archivos-de-configuración)
3. [Preparación del Repositorio](#preparación-del-repositorio)
4. [Configuración de DigitalOcean](#configuración-de-digitalocean)
5. [Variables de Entorno](#variables-de-entorno)
6. [Deploy Automático](#deploy-automático)
7. [Post-Deploy](#post-deploy)
8. [Troubleshooting](#troubleshooting)
9. [Comandos Útiles](#comandos-útiles)

## ✅ Requisitos Previos

### Cuentas Necesarias
- [ ] Cuenta de GitHub
- [ ] Cuenta de DigitalOcean
- [ ] Repositorio GitHub configurado y actualizado

### Herramientas Locales
- [ ] Git instalado
- [ ] Node.js v18+ instalado
- [ ] npm instalado
- [ ] Acceso a terminal/bash

### Verificación Rápida
```bash
# Verificar versiones
node --version  # Debería mostrar v18+
npm --version
git --version

# Verificar que estás en el directorio correcto
ls -la  # Debería mostrar Backend/, Frontend/, docker-compose.yml
```

## 📁 Archivos de Configuración

El proceso de preparación ha creado los siguientes archivos:

### Archivos Principales
- `.do/app.yaml` - Configuración principal de DigitalOcean App Platform
- `.env.production.example` - Variables de entorno de ejemplo
- `DEPLOY_GUIDE.md` - Esta guía
- `scripts/deploy.sh` - Script automatizado de configuración
- `scripts/validate.sh` - Script de validación

### Dockerfiles Optimizados
- `Backend/Dockerfile` - Multi-stage build para el backend
- `Frontend/Dockerfile` - Multi-stage build para el frontend
- `Frontend/nginx.conf` - Configuración de nginx para producción

### Scripts de Base de Datos
- `Backend/migrate.js` - Script de migración de base de datos
- `database-scripts/actualizar-base-datos.sql` - Script de actualización de BD

## 🔧 Preparación del Repositorio

### 1. Ejecutar Script de Configuración

```bash
# Hacer ejecutables los scripts
chmod +x scripts/deploy.sh
chmod +x scripts/validate.sh

# Configurar para tu repositorio (REEMPLAZA con tu info)
./scripts/deploy.sh --repo tu-usuario/tu-repositorio --branch main
```

### 2. Validar Configuración

```bash
# Verificar que todo esté correctamente configurado
./scripts/validate.sh
```

### 3. Commit y Push

```bash
# Agregar todos los archivos
git add .

# Commit con mensaje descriptivo
git commit -m "Configure DigitalOcean App Platform deployment

- Add .do/app.yaml configuration
- Optimize Dockerfiles for production
- Add deployment scripts and validation
- Update .gitignore for security
- Add comprehensive deployment documentation"

# Push al repositorio
git push origin main
```

## 🌊 Configuración de DigitalOcean

### 1. Crear Nueva App

1. **Acceder a DigitalOcean:**
   - Ir a https://cloud.digitalocean.com/apps
   - Click en "Create App"

2. **Seleccionar Fuente:**
   - Elegir "GitHub"
   - Autorizar acceso si es necesario
   - Seleccionar tu repositorio
   - Seleccionar branch `main` (o tu branch principal)

3. **Configuración Automática:**
   - DigitalOcean detectará automáticamente el archivo `.do/app.yaml`
   - Verificar que aparezcan 3 servicios: `api`, `frontend`, y base de datos

### 2. Configurar Servicios

DigitalOcean debe detectar:

#### Frontend (React/Vite)
- **Tipo:** Static Site
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `dist`
- **Root Directory:** `/Frontend`

#### Backend (Node.js/Express)
- **Tipo:** Web Service
- **Build Command:** `npm install && npm run build`
- **Run Command:** `npm start`
- **Root Directory:** `/Backend`
- **Port:** 3000

#### Base de Datos
- **Tipo:** Database
- **Engine:** PostgreSQL 15
- **Plan:** Development (puedes actualizar después)

### 3. Verificar Configuración

Antes de continuar, verifica que:
- [ ] Los 3 servicios aparecen correctamente
- [ ] El build command y run command son correctos
- [ ] Los directorios raíz están bien configurados
- [ ] Las rutas HTTP están asignadas correctamente

## 🔐 Variables de Entorno

### 1. Variables Automáticas

DigitalOcean configura automáticamente:
- `DATABASE_HOST`
- `DATABASE_PORT` 
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

### 2. Variables que DEBES Configurar

En el panel de DigitalOcean, añade estas variables **como ENCRYPTED**:

```bash
# CRÍTICO - Seguridad JWT
JWT_SECRET=tu-secreto-jwt-super-seguro-de-64-caracteres-minimo

# Email (si usas notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion

# Opcional - Configuraciones adicionales
LOG_LEVEL=info
NODE_ENV=production
```

### 3. Generar JWT Secret Seguro

```bash
# Generar un secret aleatorio seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Configurar Variables en DigitalOcean

1. En el panel de la app, ir a **Settings → App-Level Environment Variables**
2. Agregar cada variable:
   - **Key:** JWT_SECRET
   - **Value:** [tu-secret-generado]
   - **Type:** Encrypted ✅
3. Repetir para todas las variables sensibles

## 🚀 Deploy Automático

### 1. Revisar y Deploy

1. **Revisar Configuración:**
   - Verificar que todos los servicios estén configurados
   - Confirmar variables de entorno
   - Verificar que el repositorio y branch son correctos

2. **Iniciar Deploy:**
   - Click en "Create Resources"
   - DigitalOcean comenzará el build automáticamente

### 2. Monitorear el Build

El proceso incluirá:
- ✅ Clone del repositorio
- ✅ Build del Frontend (React/Vite)
- ✅ Build del Backend (Node.js)
- ✅ Configuración de base de datos PostgreSQL
- ✅ Deploy de todos los servicios

### 3. Tiempos Esperados

- **Primera vez:** 5-10 minutos
- **Deploys posteriores:** 3-5 minutos
- **Solo Frontend:** 2-3 minutos
- **Solo Backend:** 2-4 minutos

## 📝 Post-Deploy

### 1. Verificar URLs

Después del deploy, obtendrás:
- **Frontend URL:** `https://tu-app-xxxxx.ondigitalocean.app`
- **Backend URL:** `https://tu-app-xxxxx.ondigitalocean.app` (rutas `/api/*`)

### 2. Configurar Dominios (Opcional)

Si tienes un dominio personalizado:
1. Ir a Settings → Domains
2. Agregar tu dominio
3. Configurar DNS según las instrucciones

### 3. Configurar Base de Datos

La migración de base de datos debería ejecutarse automáticamente. Si necesitas ejecutarla manualmente:

```bash
# Acceder al worker de migración en DigitalOcean
# Esto se ejecuta automáticamente, pero puedes monitorearlo
```

### 4. Primeras Pruebas

```bash
# Probar el frontend
curl https://tu-app-xxxxx.ondigitalocean.app

# Probar la API
curl https://tu-app-xxxxx.ondigitalocean.app/api/health

# Probar registro de usuario
curl -X POST https://tu-app-xxxxx.ondigitalocean.app/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","contraseña":"TestPass123"}'
```

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. Build Falla
```
Error: Build command failed
```
**Solución:**
- Verificar que `package.json` tenga el script `build`
- Verificar dependencias en `package.json`
- Revisar logs detallados en DigitalOcean

#### 2. Error de Variables de Entorno
```
Error: JWT_SECRET is not defined
```
**Solución:**
- Verificar que JWT_SECRET esté configurado como Encrypted
- Regenerar y reconfigurar el secret
- Redeploy la aplicación

#### 3. Error de Base de Datos
```
Error: Connection to database failed
```
**Solución:**
- Verificar que la base de datos PostgreSQL esté creada
- Verificar las variables de conexión automáticas
- Revisar el script de migración

#### 4. Frontend no Carga
```
Error: Cannot GET /
```
**Solución:**
- Verificar configuración de nginx
- Verificar que `dist` folder se está generando
- Verificar rutas en el archivo `.do/app.yaml`

### Logs y Debugging

```bash
# Ver logs en tiempo real (desde panel DigitalOcean)
# 1. Ir a tu app
# 2. Click en "Runtime Logs"
# 3. Seleccionar servicio (api, frontend, db-migrations)

# Logs específicos por servicio:
# - api: Logs del backend Node.js
# - frontend: Logs del build de React/Vite  
# - db-migrations: Logs de migración de base de datos
```

### Reintentar Deploy

Si algo sale mal:
1. Ir a Deployments en tu app
2. Click en "Force Rebuild and Deploy"
3. Esperar a que complete

## 📋 Comandos Útiles

### Desarrollo Local
```bash
# Validar configuración antes de commit
./scripts/validate.sh

# Ejecutar validación completa
npm run test --prefix Backend
npm run build --prefix Frontend

# Verificar Docker builds localmente
docker build -t todo-api ./Backend --target production
docker build -t todo-frontend ./Frontend --target production
```

### Configuración de Deploy
```bash
# Reconfigurar para nuevo repositorio
./scripts/deploy.sh --repo nuevo-usuario/nuevo-repo --branch main

# Backup de configuración
cp .do/app.yaml .do/app.yaml.backup.$(date +%Y%m%d)

# Restaurar configuración
cp .do/app.yaml.backup .do/app.yaml
```

### Monitoreo
```bash
# Verificar health checks
curl https://tu-app.ondigitalocean.app/health
curl https://tu-app.ondigitalocean.app/api/health

# Test de carga básica
for i in {1..10}; do
  curl -s https://tu-app.ondigitalocean.app/api/health > /dev/null
  echo "Request $i completed"
done
```

## 🎯 Próximos Pasos

### Optimizaciones Post-Deploy

1. **Monitoreo:**
   - Configurar alerts en DigitalOcean
   - Monitorear uso de recursos
   - Configurar uptime monitoring

2. **Performance:**
   - Considerar CDN para assets estáticos
   - Optimizar imágenes y assets
   - Implementar caching estratégico

3. **Seguridad:**
   - Configurar SSL/TLS personalizado
   - Implementar rate limiting
   - Revisar headers de seguridad

4. **Escalabilidad:**
   - Monitorear y ajustar recursos
   - Considerar auto-scaling
   - Optimizar queries de base de datos

### Automatización Adicional

```bash
# Crear script de deploy automático con GitHub Actions
# (próximo paso recomendado)
```

## 📞 Soporte

### Recursos Útiles
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

### Contacto
Si encuentras problemas específicos con esta configuración:
1. Revisar logs en DigitalOcean
2. Verificar con `./scripts/validate.sh`
3. Consultar la documentación oficial
4. Revisar GitHub Issues del proyecto

---

## ✅ Checklist Final

Antes de marcar como completado:

- [ ] Repositorio en GitHub actualizado
- [ ] Script `./scripts/deploy.sh` ejecutado exitosamente  
- [ ] Script `./scripts/validate.sh` pasa sin errores
- [ ] App creada en DigitalOcean App Platform
- [ ] Variables de entorno configuradas (especialmente JWT_SECRET)
- [ ] Deploy completado exitosamente
- [ ] Frontend accesible en URL asignada
- [ ] API responde en `/api/health`
- [ ] Base de datos funcionando correctamente
- [ ] Pruebas básicas de funcionalidad completadas

¡Felicidades! 🎉 Tu aplicación TODO está desplegada y lista para uso en producción.

---

*Generado automáticamente por el script de deploy para proyecto_clase*
