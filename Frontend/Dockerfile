# Multi-stage build para optimizar aplicación React + Vite

# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

WORKDIR /usr/src/app

# Instalar herramientas para compilación
RUN apk add --no-cache \
    build-base \
    python3 \
    wget

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci --silent

# Stage 2: Build application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copiar node_modules desde dependencies stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copiar código fuente
COPY . .

# Build de la aplicación para producción
RUN npm run build

# Stage 3: Development image
FROM node:18-alpine AS development

WORKDIR /usr/src/app

# Instalar dependencias para desarrollo
RUN apk add --no-cache \
    build-base \
    python3 \
    wget

# Copiar node_modules y archivos
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY . .

EXPOSE 5173

# Health check para desarrollo
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["npm", "run", "dev"]

# Stage 4: Production image (servir archivos estáticos con nginx)
FROM nginx:alpine AS production

# Instalar dependencias mínimas
RUN apk add --no-cache curl

# Copiar archivos build desde builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Configurar permisos
RUN chown -R nodejs:nodejs /usr/share/nginx/html
RUN chown -R nodejs:nodejs /var/cache/nginx
RUN chown -R nodejs:nodejs /var/log/nginx
RUN chown -R nodejs:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nodejs:nodejs /var/run/nginx.pid

# Cambiar a usuario no-root
USER nodejs

EXPOSE 80

# Health check para producción
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
