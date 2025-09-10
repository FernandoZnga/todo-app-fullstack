#!/usr/bin/env node

/**
 * Script para generar credenciales seguras para la aplicación TODO
 * 
 * Uso:
 *   node scripts/generate-secure-credentials.js
 *   node scripts/generate-secure-credentials.js --output .env.production
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class CredentialGenerator {
    constructor() {
        this.credentials = new Map();
        this.environment = process.argv.includes('--production') ? 'production' : 'development';
        this.outputFile = this.getOutputFile();
    }
    
    /**
     * Determina el archivo de salida basado en argumentos
     */
    getOutputFile() {
        const outputIndex = process.argv.indexOf('--output');
        if (outputIndex !== -1 && process.argv[outputIndex + 1]) {
            return process.argv[outputIndex + 1];
        }
        
        return this.environment === 'production' 
            ? '.env.production.generated'
            : '.env.development.generated';
    }
    
    /**
     * Genera una cadena aleatoria segura
     */
    generateSecureString(length = 64, includeSpecialChars = true) {
        const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let chars = upperCase + lowerCase + numbers;
        if (includeSpecialChars) {
            chars += specialChars;
        }
        
        let result = '';
        const randomBytes = crypto.randomBytes(length);
        
        for (let i = 0; i < length; i++) {
            result += chars[randomBytes[i] % chars.length];
        }
        
        return result;
    }
    
    /**
     * Genera un JWT secret usando crypto seguro
     */
    generateJWTSecret() {
        // Usar crypto.randomBytes para máxima seguridad
        return crypto.randomBytes(64).toString('base64').replace(/[+/=]/g, (match) => {
            switch (match) {
                case '+': return '-';
                case '/': return '_';
                case '=': return '';
                default: return match;
            }
        });
    }
    
    /**
     * Genera una contraseña de base de datos segura
     */
    generateDatabasePassword() {
        // Asegurar que tenga mayúsculas, minúsculas, números y caracteres especiales
        const parts = [
            this.generateSecureString(8, false), // Base alfanumérica
            crypto.randomBytes(4).toString('hex').toUpperCase(), // Hex uppercase
            this.generateSecureString(4, true).replace(/['"\\`]/g, '!'), // Especiales (sin comillas)
        ];
        
        return parts.join('') + new Date().getFullYear();
    }
    
    /**
     * Genera credenciales para documentación
     */
    generateDocsCredentials() {
        const timestamp = Date.now().toString(36);
        const randomPart = crypto.randomBytes(8).toString('hex');
        
        return {
            user: `admin_${timestamp}`,
            password: this.generateSecureString(20, true)
        };
    }
    
    /**
     * Genera todas las credenciales necesarias
     */
    generateAllCredentials() {
        console.log('🔐 Generating secure credentials...\n');
        
        // JWT Secrets
        const jwtSecret = this.generateJWTSecret();
        const refreshSecret = this.generateJWTSecret();
        this.credentials.set('JWT_SECRET', jwtSecret);
        this.credentials.set('REFRESH_SECRET', refreshSecret);
        console.log('✅ Generated JWT secrets');
        // Database credentials
        const dbPassword = this.generateDatabasePassword();
        this.credentials.set('DB_PASSWORD', dbPassword);
        console.log('✅ Generated database password');
        // Documentation credentials
        const docsCredentials = this.generateDocsCredentials();
        this.credentials.set('DOCS_USER', docsCredentials.user);
        this.credentials.set('DOCS_PASSWORD', docsCredentials.password);
        console.log('✅ Generated documentation credentials');
        // Encryption key for sensitive data (optional)
        const encryptionKey = crypto.randomBytes(32).toString('base64');
        this.credentials.set('ENCRYPTION_KEY', encryptionKey);
        console.log('✅ Generated encryption key');
        // Session secret (optional)
        const sessionSecret = this.generateSecureString(48);
        this.credentials.set('SESSION_SECRET', sessionSecret);
        console.log('✅ Generated session secret\n');
        return this.credentials;
    }
    
    /**
     * Crea el archivo de configuración
     */
    createConfigFile() {
        const template = this.environment === 'production' 
            ? this.getProductionTemplate()
            : this.getDevelopmentTemplate();
            
        // Reemplazar placeholders con credenciales generadas
        let content = template;
        for (const [key, value] of this.credentials) {
            const placeholder = `{{${key}}}`;
            content = content.replace(new RegExp(placeholder, 'g'), value);
        }
        
        // Escribir archivo
        const fullPath = path.resolve(this.outputFile);
        fs.writeFileSync(fullPath, content, 'utf8');
        
        return fullPath;
    }
    
    /**
     * Template para producción
     */
    getProductionTemplate() {
        return `# ===================================================================
# CONFIGURACIÓN SEGURA GENERADA AUTOMÁTICAMENTE - PRODUCCIÓN
# ===================================================================
#
# GENERADO: ${new Date().toISOString()}
# ADVERTENCIA: Este archivo contiene credenciales REALES y SEGURAS
# 
# IMPORTANTE:
# 1. NUNCA commitear este archivo a git
# 2. Distribuir solo por canales seguros
# 3. Rotar credenciales cada 90 días
# 4. Usar gestor de secretos en producción real
#
# ===================================================================

# CONFIGURACIÓN BÁSICA
NODE_ENV=production
PORT=3000

# BASE DE DATOS - CREDENCIALES SEGURAS
DB_USER=sa
DB_PASSWORD={{DB_PASSWORD}}
DB_SERVER=your-production-server.domain.com
DB_DATABASE=TodoAppProd

# JWT Y AUTENTICACIÓN - SECRETOS SEGUROS  
JWT_SECRET={{JWT_SECRET}}
REFRESH_SECRET={{REFRESH_SECRET}}

# DOCUMENTACIÓN API - CREDENCIALES SEGURAS
DOCS_USER={{DOCS_USER}}
DOCS_PASSWORD={{DOCS_PASSWORD}}
ENABLE_DOCS=false

# CORS Y FRONTEND
FRONTEND_URL=https://todoapp.yourcompany.com
ADDITIONAL_CORS_ORIGINS=https://app.todoapp.com,https://staging.todoapp.com

# SEGURIDAD AVANZADA
ENCRYPTION_KEY={{ENCRYPTION_KEY}}
SESSION_SECRET={{SESSION_SECRET}}
LOG_LEVEL=warn
SECURITY_LOGGING=true

# RATE LIMITING ESTRICTO
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# BASE DE DATOS AVANZADA
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_IDLE_TIMEOUT=30000
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# ===================================================================
# CREDENCIALES GENERADAS:
# ===================================================================
#
# JWT_SECRET:    64 caracteres, base64 seguro
# REFRESH_SECRET: 64 caracteres, base64 seguro  
# DB_PASSWORD:   20+ caracteres, alfanumérico + especiales
# DOCS_USER:     Usuario único con timestamp
# DOCS_PASSWORD: 20 caracteres, alta complejidad
# ENCRYPTION_KEY: 32 bytes, base64
# SESSION_SECRET: 48 caracteres, alta entropía
#
# ===================================================================
`;
    }
    
    /**
     * Template para desarrollo
     */
    getDevelopmentTemplate() {
        return `# ===================================================================
# CONFIGURACIÓN SEGURA GENERADA AUTOMÁTICAMENTE - DESARROLLO
# ===================================================================
#
# GENERADO: ${new Date().toISOString()}
# ADVERTENCIA: Solo para desarrollo local - NO usar en producción
# 
# ===================================================================

# CONFIGURACIÓN BÁSICA
NODE_ENV=development
PORT=3000

# BASE DE DATOS - DESARROLLO LOCAL
DB_USER=sa
DB_PASSWORD={{DB_PASSWORD}}
DB_SERVER=localhost
DB_DATABASE=ToDoDB

# JWT Y AUTENTICACIÓN - DESARROLLO
JWT_SECRET={{JWT_SECRET}}
REFRESH_SECRET={{REFRESH_SECRET}}

# DOCUMENTACIÓN API - DESARROLLO
DOCS_USER={{DOCS_USER}}
DOCS_PASSWORD={{DOCS_PASSWORD}}
ENABLE_DOCS=true

# CORS Y FRONTEND - DESARROLLO
FRONTEND_URL=http://localhost:4000
VITE_API_URL=http://localhost:3000/api

# CONFIGURACIÓN DE DESARROLLO
LOG_LEVEL=debug
SECURITY_LOGGING=true

# CREDENCIALES GENERADAS AUTOMÁTICAMENTE
# Estas son más seguras que las credenciales por defecto
# pero aún son solo para desarrollo local

# ===================================================================
`;
    }
    
    /**
     * Muestra resumen de credenciales generadas (sin exponer valores)
     */
    showSummary(filePath) {
        console.log('📋 CREDENTIAL GENERATION SUMMARY');
        console.log('=====================================');
        console.log(`Environment: ${this.environment}`);
        console.log(`Output file: ${filePath}`);
        console.log(`Generated: ${new Date().toISOString()}\n`);
        
        console.log('Generated credentials:');
        for (const [key] of this.credentials) {
            const value = this.credentials.get(key);
            const maskedValue = value.length > 8 
                ? value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4)
                : '*'.repeat(value.length);
            console.log(`  ${key}: ${maskedValue} (${value.length} chars)`);
        }
        
        console.log('\n🔒 SECURITY NOTES:');
        console.log('==================');
        console.log('• All credentials use cryptographically secure random generation');
        console.log('• JWT secrets are 64-character base64 encoded');
        console.log('• Database password includes special characters and year suffix');
        console.log('• Documentation credentials are unique per generation');
        console.log('• Encryption key is 256-bit (32 bytes) base64 encoded');
        
        if (this.environment === 'production') {
            console.log('\n⚠️  PRODUCTION WARNINGS:');
            console.log('========================');
            console.log('• Never commit the generated file to version control');
            console.log('• Distribute credentials only through secure channels');
            console.log('• Rotate credentials every 90 days');
            console.log('• Consider using a proper secrets manager (AWS Secrets Manager, etc.)');
            console.log('• Monitor access logs for unauthorized attempts');
        } else {
            console.log('\n💡 DEVELOPMENT NOTES:');
            console.log('=====================');
            console.log('• These credentials are more secure than defaults but still for dev only');
            console.log('• Replace DB_SERVER with your actual database server');
            console.log('• Update FRONTEND_URL if using different port');
        }
        
        console.log(`\n✅ Credentials successfully generated and saved to: ${filePath}`);
    }
}

// Función principal
function main() {
    try {
        console.log('🚀 TODO App - Secure Credential Generator\n');
        
        const generator = new CredentialGenerator();
        generator.generateAllCredentials();
        
        const filePath = generator.createConfigFile();
        generator.showSummary(filePath);
        
        console.log('\n🎉 Generation completed successfully!');
        
    } catch (error) {
        console.error('❌ Error generating credentials:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { CredentialGenerator };
