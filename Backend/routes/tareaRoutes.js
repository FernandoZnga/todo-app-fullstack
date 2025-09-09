const {Router} = require('express');
const {agregarTarea, obtenerTarea} = require('../controllers/tareaController')
const checkAuth = require('../middleware/auth')

const router = Router();

/**
 * @swagger
 * /api/tareas:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TareaRequest'
 *     responses:
 *       200:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               mensaje: "Tarea agregada correctamente"
 *       400:
 *         description: Campos vacíos o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No pueden ir campos vacios"
 *       403:
 *         description: Token no válido o inexistente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Token no válido o inexistente"
 *       500:
 *         description: Error al agregar la tarea
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Error al agregar la tarea"
 */
// Rutas Privadas
router.post('/',checkAuth, agregarTarea)

/**
 * @swagger
 * /api/tareas:
 *   get:
 *     summary: Obtener todas las tareas del usuario autenticado
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Se encontraron 2 tarea(s)"
 *                 tareas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tarea'
 *             examples:
 *               conTareas:
 *                 summary: Usuario con tareas
 *                 value:
 *                   mensaje: "Se encontraron 2 tarea(s)"
 *                   tareas:
 *                     - id: 1
 *                       titulo: "Completar proyecto"
 *                       descripcion: "Terminar la implementación de la API REST"
 *                       completada: false
 *                       usuarioId: 1
 *                       fechaCreacion: "2024-01-15T10:30:00.000Z"
 *                       fechaActualizacion: "2024-01-15T10:30:00.000Z"
 *                     - id: 2
 *                       titulo: "Documentar API"
 *                       descripcion: "Crear documentación con Swagger"
 *                       completada: true
 *                       usuarioId: 1
 *                       fechaCreacion: "2024-01-16T09:15:00.000Z"
 *                       fechaActualizacion: "2024-01-16T14:20:00.000Z"
 *               sinTareas:
 *                 summary: Usuario sin tareas
 *                 value:
 *                   mensaje: "Se encontraron 0 tarea(s)"
 *                   tareas: []
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Usuario no encontrado"
 *       500:
 *         description: Error al obtener las tareas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Error al obtener las tareas"
 */
router.get('/',checkAuth, obtenerTarea)

module.exports = router;