const jwt = require("jsonwebtoken")

// ⚠️ VULNERABILIDAD DEMO: API2:2023 - Broken Authentication
// Esta versión genera JWTs vulnerables
// ¡NO USAR EN PRODUCCIÓN!

const generarJTW = (id) => {
    // 🚨 VULNERABILIDAD 1: JWT sin expiración
    console.log('⚠️ Generando JWT vulnerable sin expiración');
    
    // 🚨 VULNERABILIDAD 2: Secreto débil como fallback
    let secret = process.env.JWT_SECRET || 'secret123'; // Secreto débil
    
    // 🚨 VULNERABILIDAD 3: Forzar secreto débil para la demo
    if (process.env.DEMO_WEAK_JWT === 'true') {
        console.log('⚠️ Usando secreto débil para demo');
        secret = 'secret123';
    }
    
    // 🚨 VULNERABILIDAD 4: Algoritmo débil
    const options = {
        algorithm: 'HS256' // Debería usar HS512 o RS256
        // Sin expiresIn = token nunca expira
    };
    
    // 🚨 VULNERABILIDAD 5: Incluir información sensible en el payload
    const payload = {
        id,
        user_id: id, // Campo duplicado
        userId: id,  // Otro formato
        admin: id === 1, // ¡Información de rol en el JWT!
        timestamp: Date.now(),
        server_info: {
            version: '1.0.0-vulnerable',
            environment: process.env.NODE_ENV || 'development'
        }
    };
    
    return jwt.sign(payload, secret, options);
};

// 🚨 VULNERABILIDAD 6: Función de bypass para testing
const generarTokenBypass = (userId = 1, isAdmin = false) => {
    console.log('⚠️ Generando token de bypass - ¡EXTREMADAMENTE INSEGURO!');
    return jwt.sign({
        id: userId,
        admin: isAdmin,
        bypass: true,
        iat: Math.floor(Date.now() / 1000)
    }, 'secret123'); // Secreto hardcodeado
};

module.exports = generarJTW;
module.exports.generarTokenBypass = generarTokenBypass;
