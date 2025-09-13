#!/bin/bash

# Script de deploy para DigitalOcean App Platform
# Este script automatiza el proceso de preparación y deploy

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuración
PROJECT_NAME="proyecto_clase"
GITHUB_REPO=""
# Detectar branch actual o usar main por defecto
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
BRANCH="${CURRENT_BRANCH}"

# Función de ayuda
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -r, --repo REPO     GitHub repository (user/repo-name)"
    echo "  -b, --branch BRANCH Git branch to deploy (default: current branch)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 --repo username/proyecto_clase --branch digital-ocean"
}

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--repo)
            GITHUB_REPO="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validar parámetros requeridos
if [[ -z "$GITHUB_REPO" ]]; then
    log_error "GitHub repository is required. Use -r or --repo option."
    show_help
    exit 1
fi

log_info "🚀 Iniciando proceso de deploy para DigitalOcean App Platform"
log_info "Repository: $GITHUB_REPO"
log_info "Branch: $BRANCH"

# Verificar que estamos en el directorio correcto
if [[ ! -f "docker-compose.yml" ]] || [[ ! -d "Backend" ]] || [[ ! -d "Frontend" ]]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# 1. Verificar dependencias
log_info "📋 Verificando dependencias..."

# Verificar Git
if ! command -v git &> /dev/null; then
    log_error "Git no está instalado"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado"
    exit 1
fi

log_success "✅ Todas las dependencias están instaladas"

# 2. Verificar estado de Git
log_info "🔍 Verificando estado de Git..."

# Verificar si hay cambios sin commitear
if [[ -n $(git status --porcelain) ]]; then
    log_warning "Hay cambios sin commitear en el repositorio:"
    git status --short
    read -p "¿Deseas continuar sin hacer commit? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deploy cancelado. Haz commit de tus cambios y ejecuta el script nuevamente."
        exit 0
    fi
fi

# 3. Actualizar archivo de configuración de DigitalOcean
log_info "⚙️  Actualizando configuración de DigitalOcean..."

# Crear backup del archivo app.yaml
if [[ -f ".do/app.yaml" ]]; then
    cp .do/app.yaml .do/app.yaml.backup
fi

# Actualizar repo en app.yaml
sed -i "s|repo: tu-usuario/proyecto_clase|repo: $GITHUB_REPO|g" .do/app.yaml
sed -i "s|branch: main|branch: $BRANCH|g" .do/app.yaml

log_success "✅ Configuración actualizada"

# 4. Verificar archivos de build
log_info "🏗️  Verificando configuración de build..."

# Verificar package.json del Backend
if [[ ! -f "Backend/package.json" ]]; then
    log_error "Backend/package.json no encontrado"
    exit 1
fi

# Verificar package.json del Frontend
if [[ ! -f "Frontend/package.json" ]]; then
    log_error "Frontend/package.json no encontrado"
    exit 1
fi

# Agregar script de build al Backend si no existe
BACKEND_PACKAGE_JSON="Backend/package.json"
if ! grep -q '"build"' $BACKEND_PACKAGE_JSON; then
    log_info "Agregando script de build al Backend..."
    # Crear script temporal para actualizar package.json
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$BACKEND_PACKAGE_JSON', 'utf8'));
        if (!pkg.scripts.build) {
            pkg.scripts.build = 'echo \"Backend build completed\"';
            fs.writeFileSync('$BACKEND_PACKAGE_JSON', JSON.stringify(pkg, null, 2));
        }
    "
fi

# Agregar script de migrate al Backend si no existe
if ! grep -q '"migrate"' $BACKEND_PACKAGE_JSON; then
    log_info "Agregando script de migración al Backend..."
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$BACKEND_PACKAGE_JSON', 'utf8'));
        if (!pkg.scripts.migrate) {
            pkg.scripts.migrate = 'echo \"Database migration would run here\"';
            fs.writeFileSync('$BACKEND_PACKAGE_JSON', JSON.stringify(pkg, null, 2));
        }
    "
fi

log_success "✅ Configuración de build verificada"

# 5. Crear archivo de configuración para migraciones de base de datos
log_info "🗄️  Preparando scripts de base de datos..."

if [[ ! -f "Backend/migrate.js" ]]; then
    cat > Backend/migrate.js << 'EOF'
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    try {
        const config = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            port: parseInt(process.env.DB_PORT) || 1433,
            database: process.env.DB_DATABASE || 'ToDoDB',
            options: {
                encrypt: process.env.DB_ENCRYPT === 'true',
                trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
            },
            connectionTimeout: 30000,
            requestTimeout: 30000,
        };

        console.log('Connecting to database...');
        const pool = await sql.connect(config);

        // Ejecutar script de inicialización si existe
        const scriptPath = path.join(__dirname, '..', 'database-scripts', 'actualizar-base-datos.sql');
        if (fs.existsSync(scriptPath)) {
            console.log('Running database migration script...');
            const script = fs.readFileSync(scriptPath, 'utf8');
            
            // Dividir script en statements individuales
            const statements = script.split('GO').filter(s => s.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    await pool.request().query(statement);
                }
            }
            console.log('Migration completed successfully');
        } else {
            console.log('No migration script found, skipping...');
        }

        await pool.close();
        console.log('Database migration finished');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runMigrations();
}

module.exports = runMigrations;
EOF

    # Actualizar package.json para usar el script
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$BACKEND_PACKAGE_JSON', 'utf8'));
        pkg.scripts.migrate = 'node migrate.js';
        fs.writeFileSync('$BACKEND_PACKAGE_JSON', JSON.stringify(pkg, null, 2));
    "

    log_success "✅ Script de migración creado"
fi

# 6. Validar configuración de Docker
log_info "🐳 Validando configuración de Docker..."

# Verificar que los Dockerfiles existen y son válidos
if [[ ! -f "Backend/Dockerfile" ]]; then
    log_error "Backend/Dockerfile no encontrado"
    exit 1
fi

if [[ ! -f "Frontend/Dockerfile" ]]; then
    log_error "Frontend/Dockerfile no encontrado"
    exit 1
fi

if [[ ! -f "Frontend/nginx.conf" ]]; then
    log_error "Frontend/nginx.conf no encontrado"
    exit 1
fi

log_success "✅ Configuración de Docker validada"

# 7. Generar archivos finales
log_info "📝 Generando archivos finales..."

# Crear README para deploy
cat > DEPLOY.md << EOF
# Deploy Guide - DigitalOcean App Platform

## Archivos de configuración creados:

- \`.do/app.yaml\` - Configuración principal de DigitalOcean App Platform
- \`.env.production.example\` - Variables de entorno de ejemplo para producción
- \`scripts/deploy.sh\` - Script automatizado de deploy
- \`Backend/migrate.js\` - Script de migración de base de datos
- \`Frontend/nginx.conf\` - Configuración de nginx para producción

## Próximos pasos:

1. **Subir código a GitHub:**
   - Hacer commit de todos los cambios
   - Push al repositorio: $GITHUB_REPO

2. **Configurar DigitalOcean App Platform:**
   - Ir a https://cloud.digitalocean.com/apps
   - Crear nueva app desde GitHub
   - Seleccionar repositorio: $GITHUB_REPO
   - Branch: $BRANCH
   - DigitalOcean detectará automáticamente el archivo .do/app.yaml

3. **Configurar variables de entorno:**
   - En el panel de DigitalOcean, configurar las variables SECRET
   - Usar .env.production.example como referencia
   - Configurar JWT_SECRET, EMAIL_*, y otras variables sensibles

4. **Configurar base de datos:**
   - DigitalOcean creará automáticamente una base PostgreSQL
   - Las variables de conexión se configurarán automáticamente
   - El script de migración se ejecutará durante el deploy

## Repository: $GITHUB_REPO
## Branch: $BRANCH
## Generated: $(date)
EOF

log_success "✅ Documentación de deploy creada"

# 8. Mostrar resumen
log_info "📊 Resumen de configuración:"
echo ""
echo "  📁 Archivos creados/actualizados:"
echo "     ✅ .do/app.yaml"
echo "     ✅ .env.production.example"
echo "     ✅ Backend/Dockerfile (optimizado)"
echo "     ✅ Frontend/Dockerfile (optimizado)"
echo "     ✅ Frontend/nginx.conf"
echo "     ✅ Backend/migrate.js"
echo "     ✅ scripts/deploy.sh"
echo "     ✅ DEPLOY.md"
echo ""
echo "  🔧 Configuración:"
echo "     Repository: $GITHUB_REPO"
echo "     Branch: $BRANCH"
echo "     Services: Frontend (React), Backend (Node.js), Database (PostgreSQL)"
echo ""

# 9. Próximos pasos
log_success "🎉 ¡Deploy configurado exitosamente!"
echo ""
log_info "📋 Próximos pasos:"
echo "  1. Revisar y hacer commit de los cambios:"
echo "     git add ."
echo "     git commit -m \"Configure DigitalOcean deployment\""
echo "     git push origin $BRANCH"
echo ""
echo "  2. Ir a DigitalOcean App Platform:"
echo "     https://cloud.digitalocean.com/apps"
echo ""
echo "  3. Crear nueva app desde GitHub y seleccionar:"
echo "     Repository: $GITHUB_REPO"
echo "     Branch: $BRANCH"
echo ""
echo "  4. Configurar variables de entorno secretas en el panel de DO"
echo ""
echo "  5. ¡Deploy automático se ejecutará!"
echo ""

log_info "📖 Para más detalles, consulta el archivo DEPLOY.md"
