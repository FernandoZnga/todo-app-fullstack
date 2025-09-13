const {Router} = require('express');
const {registrarUsuario, confirmar, Autenticar, perfil, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil, infoSistema, debugQueries} = require('../controllers/usuarioController');
const checkAuth = require('../middleware/auth');
const {validarCorreo} = require('../middleware/usuarioMid');

const router = Router();

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreUsuario
 *               - correo
 *               - contraseña
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 example: "Juan Pérez"
 *                 minLength: 2
 *                 maxLength: 100
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               contraseña:
 *                 type: string
 *                 example: "miPassword123"
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               mensaje: "Usuario Creado correctamente"
 *       400:
 *         description: Campos vacíos o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No pueden ir campos vacios"
 *       409:
 *         description: El correo ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "El correo ya está registrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validarCorreo, registrarUsuario)

/**
 * @swagger
 * /api/usuarios/confirmar/{token}:
 *   get:
 *     summary: Confirmar cuenta de usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmación enviado por email
 *         example: "abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Cuenta confirmada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Cuenta confirmada"
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioResponse'
 *       404:
 *         description: Token no válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Token no válido"
 *       500:
 *         description: Error al confirmar la cuenta
 */
router.get('/confirmar/:token', confirmar)

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Contraseña incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Contraseña incorrecta"
 *       403:
 *         description: Cuenta no confirmada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Tu cuenta no ha sido confirmada"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "El Usuario no existe"
 */
router.post('/login', Autenticar)

/**
 * @swagger
 * /api/usuarios/olvide-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               mensaje: "Hemos enviado un correo con las instrucciones"
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/olvide-password', olvidePassword)

/**
 * @swagger
 * /api/usuarios/olvide-password/{token}:
 *   get:
 *     summary: Verificar token de recuperación de contraseña
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación de contraseña
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               mensaje: "Token válido y el usuario existe"
 *       404:
 *         description: Token inválido o usuario no encontrado
 */
router.get('/olvide-password/:token', comprobarToken)

/**
 * @swagger
 * /api/usuarios/olvide-password/{token}:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación de contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "nuevaPassword123"
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token y contraseña son requeridos
 *       404:
 *         description: Token inválido
 */
router.post('/olvide-password/:token', nuevoPassword)

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 perfil:
 *                   $ref: '#/components/schemas/UsuarioResponse'
 *       403:
 *         description: Token no válido o inexistente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Token no válido o inexistente"
 *       404:
 *         description: Usuario no encontrado
 */
// Rutas Privadas
router.get('/perfil', checkAuth, perfil)

// 🚨 RUTAS VULNERABLES PARA DEMO - API3:2023 Broken Object Property Level Authorization (BOPLA)
// ¡NO USAR EN PRODUCCIÓN!

/**
 * 🚨 VULNERABILIDAD: Mass Assignment en perfil de usuario
 * Permite modificar campos sensibles como verificado, rol, etc.
 */
router.put('/actualizar-perfil', checkAuth, actualizarPerfil)

/**
 * 🚨 VULNERABILIDAD: Exposición de información del sistema
 * Expone estadísticas de BD, configuración del servidor, etc.
 */
router.get('/info-sistema', infoSistema)

/**
 * 🚨 VULNERABILIDAD: Debug de queries SQL
 * Expone estructura de BD, queries utilizadas, etc.
 */
router.get('/debug-queries', debugQueries)

module.exports = router;
