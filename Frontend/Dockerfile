# Frontend Dockerfile for React + Vite application
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies for building native modules
RUN apk add --no-cache \
    build-base \
    python3 \
    wget

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Start the application
CMD ["npm", "run", "dev"]
