#!/bin/bash

# Script de validación para DigitalOcean App Platform
# Valida que todos los archivos y configuraciones estén correctos antes del deploy

# No usar set -e para permitir manejo manual de errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Contadores
ERRORS=0
WARNINGS=0

validate_file() {
    local file=$1
    local description=$2
    
    if [[ -f "$file" ]]; then
        log_success "✅ $description: $file"
    else
        log_error "❌ $description: $file (NOT FOUND)"
        ((ERRORS++))
    fi
}

validate_json() {
    local file=$1
    local description=$2
    
    if [[ -f "$file" ]]; then
        # Intentar validar JSON con diferentes herramientas
        if command -v jq &> /dev/null; then
            if jq . "$file" > /dev/null 2>&1; then
                log_success "✅ $description: $file (valid JSON)"
            else
                log_error "❌ $description: $file (INVALID JSON)"
                ((ERRORS++))
            fi
        elif command -v python3 &> /dev/null; then
            if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
                log_success "✅ $description: $file (valid JSON)"
            else
                log_error "❌ $description: $file (INVALID JSON)"
                ((ERRORS++))
            fi
        elif command -v node &> /dev/null; then
            if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
                log_success "✅ $description: $file (valid JSON)"
            else
                log_error "❌ $description: $file (INVALID JSON)"
                ((ERRORS++))
            fi
        else
            log_success "✅ $description: $file (file exists, JSON validation skipped - no validator found)"
        fi
    else
        log_error "❌ $description: $file (NOT FOUND)"
        ((ERRORS++))
    fi
}

log_info "🔍 Validando configuración para DigitalOcean App Platform..."

# 1. Validar estructura de proyecto
log_info "📁 Validando estructura de proyecto..."

validate_file "docker-compose.yml" "Docker Compose config"
validate_file ".do/app.yaml" "DigitalOcean config"
validate_file ".env.production.example" "Production environment template"
validate_file "Backend/Dockerfile" "Backend Dockerfile"
validate_file "Frontend/Dockerfile" "Frontend Dockerfile"
validate_file "Frontend/nginx.conf" "Nginx configuration"

# 2. Validar package.json files
log_info "📦 Validando archivos package.json..."

validate_json "Backend/package.json" "Backend package.json"
validate_json "Frontend/package.json" "Frontend package.json"

# 3. Verificar scripts requeridos en Backend
log_info "🔧 Verificando scripts de Backend..."

if [[ -f "Backend/package.json" ]]; then
    BACKEND_PKG="Backend/package.json"
    
    if grep -q '"start"' "$BACKEND_PKG"; then
        log_success "✅ Script 'start' encontrado"
    else
        log_error "❌ Script 'start' no encontrado en Backend/package.json"
        ((ERRORS++))
    fi
    
    if grep -q '"build"' "$BACKEND_PKG"; then
        log_success "✅ Script 'build' encontrado"
    else
        log_warning "⚠️  Script 'build' no encontrado (se creará automáticamente)"
        ((WARNINGS++))
    fi
    
    if grep -q '"migrate"' "$BACKEND_PKG"; then
        log_success "✅ Script 'migrate' encontrado"
    else
        log_warning "⚠️  Script 'migrate' no encontrado (se creará automáticamente)"
        ((WARNINGS++))
    fi
fi

# 4. Verificar scripts requeridos en Frontend
log_info "🎨 Verificando scripts de Frontend..."

if [[ -f "Frontend/package.json" ]]; then
    FRONTEND_PKG="Frontend/package.json"
    
    if grep -q '"build"' "$FRONTEND_PKG"; then
        log_success "✅ Script 'build' encontrado"
    else
        log_error "❌ Script 'build' no encontrado en Frontend/package.json"
        ((ERRORS++))
    fi
    
    if grep -q '"dev"' "$FRONTEND_PKG"; then
        log_success "✅ Script 'dev' encontrado"
    else
        log_warning "⚠️  Script 'dev' no encontrado"
        ((WARNINGS++))
    fi
fi

# 5. Validar configuración de DigitalOcean
log_info "🌊 Validando configuración de DigitalOcean..."

if [[ -f ".do/app.yaml" ]]; then
    # Verificar que no tenga valores placeholder
    if grep -q "tu-usuario/proyecto_clase" ".do/app.yaml"; then
        log_error "❌ Archivo .do/app.yaml contiene valores placeholder (tu-usuario/proyecto_clase)"
        log_error "   Ejecuta: ./scripts/deploy.sh --repo tu-usuario/tu-repo"
        ((ERRORS++))
    else
        log_success "✅ Configuración de repositorio actualizada"
    fi
    
    # Verificar estructura básica del YAML
    if command -v python3 &> /dev/null; then
        if python3 -c "import yaml; yaml.safe_load(open('.do/app.yaml'))" 2>/dev/null; then
            log_success "✅ Archivo .do/app.yaml tiene formato YAML válido"
        else
            log_error "❌ Archivo .do/app.yaml tiene formato YAML inválido"
            ((ERRORS++))
        fi
    fi
fi

# 6. Verificar dependencias
log_info "🔗 Verificando dependencias del sistema..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "✅ Node.js: $NODE_VERSION"
else
    log_warning "⚠️  Node.js no está instalado (recomendado para desarrollo local)"
    ((WARNINGS++))
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "✅ npm: v$NPM_VERSION"
else
    log_warning "⚠️  npm no está instalado (recomendado para desarrollo local)"
    ((WARNINGS++))
fi

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    log_success "✅ $GIT_VERSION"
else
    log_error "❌ Git no está instalado"
    ((ERRORS++))
fi

# 7. Verificar estado de Git
log_info "📝 Verificando estado de Git..."

if git rev-parse --git-dir > /dev/null 2>&1; then
    log_success "✅ Repositorio Git inicializado"
    
    # Verificar remote origin
    if git remote get-url origin > /dev/null 2>&1; then
        ORIGIN=$(git remote get-url origin)
        log_success "✅ Remote origin configurado: $ORIGIN"
    else
        log_warning "⚠️  Remote origin no configurado"
        ((WARNINGS++))
    fi
    
    # Verificar cambios sin commitear
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "⚠️  Hay cambios sin commitear:"
        git status --short | head -10
        ((WARNINGS++))
    else
        log_success "✅ No hay cambios sin commitear"
    fi
else
    log_error "❌ No es un repositorio Git"
    ((ERRORS++))
fi

# 8. Verificar archivos de base de datos
log_info "🗄️  Verificando scripts de base de datos..."

validate_file "database-scripts/actualizar-base-datos.sql" "Database update script"
validate_file "docker-init-db.sql" "Docker DB init script"

if [[ -f "Backend/migrate.js" ]]; then
    log_success "✅ Script de migración: Backend/migrate.js"
else
    log_warning "⚠️  Script de migración no encontrado (se creará automáticamente)"
    ((WARNINGS++))
fi

# 9. Verificar .gitignore
log_info "🙈 Verificando .gitignore..."

if [[ -f ".gitignore" ]]; then
    if grep -q ".env.production" ".gitignore"; then
        log_success "✅ .env.production está en .gitignore"
    else
        log_warning "⚠️  .env.production no está en .gitignore"
        ((WARNINGS++))
    fi
    
    if grep -q "node_modules" ".gitignore"; then
        log_success "✅ node_modules está en .gitignore"
    else
        log_warning "⚠️  node_modules no está en .gitignore"
        ((WARNINGS++))
    fi
else
    log_warning "⚠️  Archivo .gitignore no encontrado"
    ((WARNINGS++))
fi

# 10. Resumen final
echo ""
log_info "📊 Resumen de validación:"
echo ""

if [[ $ERRORS -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
    log_success "🎉 ¡Validación exitosa! Tu proyecto está listo para deploy."
    echo ""
    log_info "Próximos pasos:"
    echo "  1. Hacer commit de los cambios: git add . && git commit -m 'Configure deployment'"
    echo "  2. Push al repositorio: git push origin main"
    echo "  3. Ir a DigitalOcean App Platform y crear una nueva app"
    echo ""
    exit 0
elif [[ $ERRORS -eq 0 ]]; then
    log_success "✅ Validación completada con $WARNINGS advertencias."
    log_warning "Revisa las advertencias arriba, pero puedes proceder con el deploy."
    echo ""
    exit 0
else
    log_error "❌ Validación falló con $ERRORS errores y $WARNINGS advertencias."
    log_error "Corrige los errores antes de proceder con el deploy."
    echo ""
    exit 1
fi
