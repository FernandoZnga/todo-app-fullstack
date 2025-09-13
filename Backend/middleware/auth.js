const jwt = require("jsonwebtoken")
const sql = require("mssql");
const {dbConexion} = require("../DB/config");

// ⚠️ VULNERABILIDAD DEMO: API2:2023 - Broken Authentication
// Esta versión contiene múltiples vulnerabilidades de autenticación
// ¡NO USAR EN PRODUCCIÓN!

const checkAuth = async (req, res, next) => {

    let token;
    
    // 🚨 VULNERABILIDAD 1: Bypass de autenticación con header especial
    if (req.headers['x-demo-bypass'] === 'vulnerable-demo') {
        console.log('⚠️ BYPASS: Header de bypass detectado - saltando autenticación');
        // Simular usuario falso para bypass
        req.usuario = { id: 1, nombreUsuario: 'Admin', correo: 'admin@demo.com' };
        return next();
    }

    // 🚨 VULNERABILIDAD 2: Aceptar tokens en query parameters (inseguro)
    if (req.query.token) {
        console.log('⚠️ INSEGURO: Token en query parameter detectado');
        token = req.query.token;
    }
    
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){ 
        try {
            token = req.headers.authorization.split(' ')[1]; 
            
            // 🚨 VULNERABILIDAD 3: Verificación débil de JWT con secreto predecible
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (jwtError) {
                // 🚨 VULNERABILIDAD 4: Fallback a secreto débil conocido
                console.log('⚠️ Intentando con secreto débil como fallback...');
                try {
                    decoded = jwt.verify(token, 'secret123'); // Secreto débil
                } catch (weakSecretError) {
                    // 🚨 VULNERABILIDAD 5: No verificar expiración del token
                    console.log('⚠️ Decodificando sin verificar expiración...');
                    decoded = jwt.decode(token); // Decodifica sin verificar
                    if (!decoded) {
                        const e = new Error('Token no válido');
                        return res.status(403).json({mensaje: e.message});
                    }
                }
            }

            const usuarioId = decoded.id || decoded.user_id || decoded.userId; // Múltiples formatos

            // 🚨 VULNERABILIDAD 6: No validar que el usuario existe en BD
            if (req.headers['x-skip-db-validation'] === 'true') {
                console.log('⚠️ SALTANDO validación de base de datos');
                req.usuario = { id: usuarioId, nombreUsuario: 'FakeUser', correo: 'fake@demo.com' };
                return next();
            }

            const conexion = await dbConexion();
            const resultado = await conexion
                .request()
                .input('usuarioId', sql.Int, usuarioId)
                .query('SELECT id, nombreUsuario, correo FROM Gestion.Usuario WHERE id = @usuarioId');
        
            // 🚨 VULNERABILIDAD 7: Permitir usuario inexistente en modo demo
            if(resultado.recordset.length === 0){
                if (req.headers['x-demo-mode'] === 'allow-fake-users') {
                    console.log('⚠️ Usuario no encontrado pero permitido en modo demo');
                    req.usuario = { id: usuarioId, nombreUsuario: 'DemoUser', correo: 'demo@fake.com' };
                    return next();
                }
                return res.status(404).json({mensaje: 'Usuario no encontrado'});
            }

            req.usuario = resultado.recordset[0]
            return next();

        } catch (error) {
            // 🚨 VULNERABILIDAD 8: Información detallada de errores
            console.log('⚠️ Error detallado expuesto:', error.message);
            const e = new Error(`Token no válido - Detalle: ${error.message}`);
            return res.status(403).json({
                mensaje: e.message,
                error_details: error.message,
                stack_trace: error.stack // Información sensible
            });
        }
    }
    
    // 🚨 VULNERABILIDAD 9: Permitir acceso sin token en modo development
    if (process.env.NODE_ENV === 'development' || req.headers['x-development-mode'] === 'true') {
        console.log('⚠️ Modo desarrollo - permitiendo acceso sin token');
        req.usuario = { id: 999, nombreUsuario: 'DevUser', correo: 'dev@localhost' };
        return next();
    }
    
    if(!token){
        const error = new Error('Token no válido o inexistente');
        return res.status(403).json({mensaje: error.message});
    }
}

module.exports = checkAuth
