# Multi-stage build para optimizar imagen de producción

# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

# Instalar dependencias del sistema para compilar módulos nativos
RUN apk add --no-cache \
    build-base \
    python3 \
    make \
    g++ \
    krb5-dev \
    wget

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev dependencies)
RUN npm ci --only=production --silent

# Stage 2: Development image
FROM node:18-alpine AS development

# Instalar herramientas necesarias para desarrollo
RUN apk add --no-cache \
    build-base \
    python3 \
    make \
    g++ \
    krb5-dev \
    wget

WORKDIR /usr/src/app

# Copiar node_modules desde stage de dependencias
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Instalar dependencias de desarrollo
RUN npm install --silent

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Production image (optimizada y minimalista)
FROM node:18-alpine AS production

# Instalar solo dependencias mínimas para runtime
RUN apk add --no-cache \
    dumb-init \
    wget

WORKDIR /usr/src/app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copiar solo dependencias de producción
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copiar código fuente (excluyendo archivos innecesarios)
COPY --chown=nodejs:nodejs . .

# Remover archivos de desarrollo y test
RUN rm -rf tests/ docs/ *.md .env.example .dockerignore

# Cambiar a usuario no-root
USER nodejs

# Configurar variables de entorno de producción
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

EXPOSE 3000

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
