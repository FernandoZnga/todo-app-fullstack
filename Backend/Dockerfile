# Usar imagen oficial de Node.js LTS
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Instalar dependencias del sistema para SQL Server y herramientas
RUN apk add --no-cache \
    build-base \
    python3 \
    make \
    g++ \
    krb5-dev \
    wget

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar permisos del directorio de trabajo
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando por defecto para desarrollo (con nodemon)
CMD ["npm", "run", "dev"]
