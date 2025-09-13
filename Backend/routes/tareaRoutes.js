const {Router} = require('express');
const {agregarTarea, obtenerTarea, completarTarea, borrarTarea, actualizarTareaMasiva, crearTareaAdmin} = require('../controllers/tareaController')
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
 *     summary: ✨ Obtener tareas del usuario con filtros avanzados
 *     description: Permite obtener tareas del usuario autenticado con diferentes filtros para mostrar tareas pendientes, completadas, borradas o todas.
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *           enum: [all, pending, completed, deleted, all_including_deleted]
 *           default: all
 *         description: ✨ Filtro para el tipo de tareas a mostrar
 *         examples:
 *           all:
 *             summary: Tareas activas (predeterminado)
 *             value: all
 *           pending:
 *             summary: Solo tareas pendientes
 *             value: pending
 *           completed:
 *             summary: Solo tareas completadas
 *             value: completed
 *           deleted:
 *             summary: Solo tareas borradas
 *             value: deleted
 *           all_including_deleted:
 *             summary: Todas las tareas incluyendo borradas
 *             value: all_including_deleted
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

/**
 * @swagger
 * /api/tareas/{id}/completar:
 *   put:
 *     summary: Completar una tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comentario
 *             properties:
 *               comentario:
 *                 type: string
 *                 maxLength: 500
 *                 description: Comentario sobre la finalización de la tarea
 *             example:
 *               comentario: "Tarea finalizada correctamente, todos los objetivos cumplidos"
 *     responses:
 *       200:
 *         description: Tarea completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               mensaje: "Tarea completada exitosamente"
 *       400:
 *         description: Error en los datos de entrada o estado de la tarea
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               comentarioRequerido:
 *                 summary: Comentario faltante
 *                 value:
 *                   error: "El comentario es requerido para completar la tarea"
 *               tareaYaCompletada:
 *                 summary: Tarea ya completada
 *                 value:
 *                   error: "La tarea ya está completada"
 *               tareaBorrada:
 *                 summary: Tarea borrada
 *                 value:
 *                   error: "La tarea está borrada"
 *       403:
 *         description: Token no válido o inexistente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Token no válido o inexistente"
 *       404:
 *         description: Tarea no encontrada o no pertenece al usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Tarea no encontrada o no autorizada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Error al completar la tarea"
 */
router.put('/:id/completar', checkAuth, completarTarea)

/**
 * @swagger
 * /api/tareas/{id}/borrar:
 *   delete:
 *     summary: Borrar una tarea (borrado lógico)
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comentario
 *             properties:
 *               comentario:
 *                 type: string
 *                 maxLength: 500
 *                 description: Comentario sobre el motivo del borrado
 *             example:
 *               comentario: "Tarea cancelada por cambio en las prioridades del proyecto"
 *     responses:
 *       200:
 *         description: Tarea borrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               mensaje: "Tarea borrada exitosamente"
 *       400:
 *         description: Error en los datos de entrada o estado de la tarea
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               comentarioRequerido:
 *                 summary: Comentario faltante
 *                 value:
 *                   error: "El comentario es requerido para borrar la tarea"
 *               tareaYaBorrada:
 *                 summary: Tarea ya borrada
 *                 value:
 *                   error: "La tarea ya está borrada"
 *       403:
 *         description: Token no válido o inexistente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Token no válido o inexistente"
 *       404:
 *         description: Tarea no encontrada o no pertenece al usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Tarea no encontrada o no autorizada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Error al borrar la tarea"
 */
router.delete('/:id/borrar', checkAuth, borrarTarea)

// 🚨 RUTAS VULNERABLES PARA DEMO - API3:2023 Broken Object Property Level Authorization (BOPLA)
// ¡NO USAR EN PRODUCCIÓN!

/**
 * 🚨 VULNERABILIDAD: Mass Assignment en tareas
 * Permite modificar cualquier campo de tarea incluyendo usuarioId, fechas, etc.
 */
router.put('/:id/actualizar-masivo', checkAuth, actualizarTareaMasiva)

/**
 * 🚨 VULNERABILIDAD: Crear tarea con propiedades administrativas
 * Permite establecer fechas, estados, y otros campos normalmente restringidos
 */
router.post('/crear-admin', checkAuth, crearTareaAdmin)

module.exports = router;
