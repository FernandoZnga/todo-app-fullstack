const sql = require("mssql");
const {dbConexion} = require("../DB/config");

const agregarTarea = async (req, res) =>{
   const {titulo, descripcion} = req.body
   const {usuario} = req;
   const usuarioId = usuario.id;


    // Evitar campos vacios
    if(!titulo || !descripcion){
        return res.status(400).json({error: "No pueden ir campos vacios"})
    }
    
    try {

        // Abrir la conexión 
        const pool = await dbConexion();

        // Ejecutar el SP
        const resultado = await pool
            .request()
            .input("usuarioId", sql.INT, usuarioId)
            .input("titulo", sql.NVARCHAR(100), titulo)
            .input("descripcion", sql.NVARCHAR(500), descripcion)
            .output("Mensaje", sql.VARCHAR(200))
            .execute("Gestion.SP_Agregar_Tarea");

        // Obtener el mensaje de salida
        const mensaje = resultado.output.mensaje || "Tarea agregada correctamente";

        res.status(200).json({mensaje});

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error al agregar la tarea"})
    }

}

// ⚠️ VULNERABILIDAD DEMO: API3:2023 - Broken Object Property Level Authorization (BOPLA)
// Esta versión expone propiedades sensibles en las respuestas de tareas
// ¡NO USAR EN PRODUCCIÓN!

const obtenerTarea = async (req,res) =>{
    const {usuario} = req;
    const usuarioId = usuario.id;
    const { filter = 'all' } = req.query;

    console.log('⚠️ VULNERABILIDAD BOPLA: Exponiendo datos sensibles en tareas');

    try {
        // Abrir la conexión 
        const pool = await dbConexion();

        // Ejecutar el SP para obtener tareas del usuario con filtros
        const resultado = await pool
            .request()
            .input("usuarioId", sql.INT, usuarioId)
            .input("filtro", sql.NVARCHAR(50), filter)
            .execute("Gestion.SP_Obtener_Tareas_Usuario_Filtros");

        const tareas = resultado.recordset;
        
        // 🚨 VULNERABILIDAD: Excessive Data Exposure en tareas
        const tareasVulnerables = tareas.map((tarea, index) => {
            return {
                // Datos legítimos
                id: tarea.id,
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                completada: tarea.completada,
                fechaCreacion: tarea.fechaCreacion,
                
                // 🚨 DATOS SENSIBLES EXPUESTOS:
                usuarioId: tarea.usuarioId, // ID del propietario
                borrada: tarea.borrada, // Estado interno
                fechaCompletada: tarea.fechaCompletada,
                fechaBorrado: tarea.fechaBorrado,
                comentarioCompletar: tarea.comentarioCompletar,
                comentarioBorrado: tarea.comentarioBorrado,
                fechaActualizacion: tarea.fechaActualizacion,
                
                // 🚨 METADATOS INTERNOS:
                internal_task_id: `TSK_${tarea.id}_${usuarioId}_${Date.now()}`,
                database_table: 'Gestion.Tarea',
                creation_method: 'SP_Agregar_Tarea',
                
                // 🚨 INFORMACIÓN DE SISTEMA:
                system_metadata: {
                    query_execution_time: Math.random() * 50,
                    database_connection: 'pool-connection-1',
                    server_timestamp: new Date().toISOString(),
                    record_position: index + 1
                },
                
                // 🚨 DATOS DE DEBUGGING:
                debug_info: {
                    sql_query: 'SP_Obtener_Tareas_Usuario_Filtros',
                    filter_applied: filter,
                    user_permissions: usuario.id === 1 ? 'admin' : 'user',
                    can_modify_others: usuario.id === 1
                }
            };
        });

        res.status(200).json({
            mensaje: `Se encontraron ${tareas.length} tarea(s)`,
            tareas: tareasVulnerables,
            
            // 🚨 METADATOS ADICIONALES SENSIBLES:
            query_metadata: {
                total_execution_time: Math.random() * 100,
                database_server: 'todo-sqlserver',
                connection_pool_status: 'active',
                user_query_count: Math.floor(Math.random() * 100),
                server_load: `${Math.floor(Math.random() * 100)}%`
            },
            
            ⚠️: 'Esta respuesta contiene información sensible que NO debería estar expuesta',
            vulnerabilidad: 'API3:2023 - Broken Object Property Level Authorization (Excessive Data Exposure)'
        });

    } catch (error) {
        console.log(error)
        
        // 🚨 VULNERABILIDAD: Exponer detalles de errores
        res.status(500).json({
            error: "Error al obtener las tareas",
            error_details: error.message,
            stack_trace: error.stack,
            sql_state: error.originalError?.info || 'N/A',
            database_connection: 'Failed',
            vulnerabilidad: 'Error Information Disclosure'
        })
    }
}

const completarTarea = async (req, res) => {
    const { id } = req.params;
    const { comentario } = req.body;
    const { usuario } = req;
    const usuarioId = usuario.id;

    // Validar que se incluya un comentario
    if (!comentario || !comentario.trim()) {
        return res.status(400).json({error: "El comentario es requerido para completar la tarea"});
    }

    try {
        // Abrir la conexión 
        const pool = await dbConexion();

        // Ejecutar el SP para completar la tarea
        const resultado = await pool
            .request()
            .input("tareaId", sql.INT, parseInt(id))
            .input("usuarioId", sql.INT, usuarioId)
            .input("comentario", sql.NVARCHAR(500), comentario.trim())
            .output("Mensaje", sql.NVARCHAR(200))
            .execute("Gestion.SP_Completar_Tarea");

        const mensaje = resultado.output.Mensaje;
        
        if (mensaje === 'Tarea completada exitosamente') {
            res.status(200).json({mensaje});
        } else {
            res.status(400).json({error: mensaje});
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error al completar la tarea"});
    }
};

const borrarTarea = async (req, res) => {
    const { id } = req.params;
    const { comentario } = req.body;
    const { usuario } = req;
    const usuarioId = usuario.id;

    // Validar que se incluya un comentario
    if (!comentario || !comentario.trim()) {
        return res.status(400).json({error: "El comentario es requerido para borrar la tarea"});
    }

    try {
        // Abrir la conexión 
        const pool = await dbConexion();

        // Ejecutar el SP para borrar la tarea
        const resultado = await pool
            .request()
            .input("tareaId", sql.INT, parseInt(id))
            .input("usuarioId", sql.INT, usuarioId)
            .input("comentario", sql.NVARCHAR(500), comentario.trim())
            .output("Mensaje", sql.NVARCHAR(200))
            .execute("Gestion.SP_Borrar_Tarea");

        const mensaje = resultado.output.Mensaje;
        
        if (mensaje === 'Tarea borrada exitosamente') {
            res.status(200).json({mensaje});
        } else {
            res.status(400).json({error: mensaje});
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error al borrar la tarea"});
    }
};

// 🚨 VULNERABILIDAD DEMO: Mass Assignment en tareas
const actualizarTareaMasiva = async (req, res) => {
    console.log('⚠️ VULNERABILIDAD BOPLA: Mass Assignment en tareas detectado');
    
    const { id } = req.params;
    const { usuario } = req;
    const datosActualizacion = req.body;
    
    console.log('⚠️ Datos recibidos para actualización de tarea:', Object.keys(datosActualizacion));
    
    // 🚨 VULNERABILIDAD: Permitir actualizar CUALQUIER campo de tarea sin validación
    const camposPermitidos = [
        'titulo', 'descripcion', 'completada', // Campos legítimos
        // 🚨 CAMPOS SENSIBLES QUE NO DEBERÍAN SER MODIFICABLES:
        'usuarioId', 'fechaCreacion', 'fechaActualizacion', 'id',
        'borrada', 'fechaCompletada', 'fechaBorrado',
        'comentarioCompletar', 'comentarioBorrado'
    ];
    
    try {
        const pool = await dbConexion();
        
        // Obtener tarea original para comparación
        const tareaOriginal = await pool
            .request()
            .input('tareaId', sql.Int, parseInt(id))
            .query('SELECT * FROM Gestion.Tarea WHERE id = @tareaId');
            
        if (tareaOriginal.recordset.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        // 🚨 CONSTRUIR QUERY DINÁMICO SIN VALIDACIÓN DE PROPIEDAD
        let setParts = [];
        let request = pool.request().input('tareaId', sql.Int, parseInt(id));
        
        Object.keys(datosActualizacion).forEach((campo, index) => {
            if (camposPermitidos.includes(campo)) {
                const paramName = `param${index}`;
                setParts.push(`${campo} = @${paramName}`);
                
                // Determinar tipo de dato
                let valor = datosActualizacion[campo];
                if (campo === 'completada' || campo === 'borrada') {
                    request = request.input(paramName, sql.Bit, valor === true || valor === 'true');
                } else if (campo === 'id' || campo === 'usuarioId') {
                    request = request.input(paramName, sql.Int, parseInt(valor));
                } else if (campo.includes('fecha')) {
                    request = request.input(paramName, sql.DateTime, valor ? new Date(valor) : null);
                } else {
                    request = request.input(paramName, sql.NVarChar(500), valor);
                }
                
                console.log(`⚠️ Permitiendo modificación de campo sensible de tarea: ${campo} = ${valor}`);
            }
        });
        
        if (setParts.length === 0) {
            return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
        }
        
        // 🚨 EJECUTAR QUERY SIN VALIDACIÓN DE PROPIEDAD
        const queryUpdate = `UPDATE Gestion.Tarea SET ${setParts.join(', ')} WHERE id = @tareaId`;
        console.log('⚠️ Query de tarea ejecutado:', queryUpdate);
        
        await request.query(queryUpdate);
        
        // Obtener tarea actualizada
        const tareaActualizada = await pool
            .request()
            .input('tareaId', sql.Int, parseInt(id))
            .query('SELECT * FROM Gestion.Tarea WHERE id = @tareaId');
        
        res.json({
            mensaje: '🚨 TAREA ACTUALIZADA - Mass Assignment exitoso',
            tarea_original: tareaOriginal.recordset[0],
            tarea_actualizada: tareaActualizada.recordset[0],
            campos_modificados: Object.keys(datosActualizacion),
            warning: 'Se permitieron modificaciones de campos sensibles de tarea',
            
            // 🚨 EXPONER INFORMACIÓN ADICIONAL SENSIBLE:
            system_info: {
                query_executed: queryUpdate,
                execution_time: Math.random() * 100,
                user_permissions: usuario.id === 1 ? 'admin' : 'user',
                bypassed_validations: [
                    'ownership_check',
                    'field_permission_validation',
                    'business_logic_rules'
                ]
            },
            
            vulnerabilidad: 'API3:2023 - Broken Object Property Level Authorization (Mass Assignment)'
        });
        
    } catch (error) {
        console.log('⚠️ Error en mass assignment de tarea:', error);
        res.status(500).json({ 
            error: 'Error al actualizar tarea',
            detalle_sensible: error.message,
            sql_error: error.originalError?.info,
            stack: error.stack
        });
    }
};

// 🚨 VULNERABILIDAD: Crear tarea con propiedades administrativas
const crearTareaAdmin = async (req, res) => {
    console.log('⚠️ VULNERABILIDAD BOPLA: Creación de tarea con propiedades administrativas');
    
    const { usuario } = req;
    const datosCompletos = req.body;
    
    // 🚨 VULNERABILIDAD: Permitir establecer cualquier propiedad al crear
    const {
        titulo = 'Tarea por defecto',
        descripcion = 'Descripción por defecto',
        // 🚨 PROPIEDADES QUE NO DEBERÍAN SER CONTROLABLES:
        usuarioId = usuario.id,
        completada = false,
        borrada = false,
        fechaCreacion,
        fechaCompletada,
        fechaBorrado,
        comentarioCompletar = '',
        comentarioBorrado = '',
        // 🚨 PROPIEDADES ADMINISTRATIVAS:
        is_priority = false,
        admin_notes = '',
        internal_category = 'user_task'
    } = datosCompletos;
    
    try {
        const pool = await dbConexion();
        
        // 🚨 QUERY DIRECTO PERMITIENDO ESTABLECER CAMPOS SENSIBLES
        const resultado = await pool
            .request()
            .input('usuarioId', sql.Int, parseInt(usuarioId))
            .input('titulo', sql.NVarChar(100), titulo)
            .input('descripcion', sql.NVarChar(500), descripcion)
            .input('completada', sql.Bit, completada)
            .input('borrada', sql.Bit, borrada)
            .input('fechaCreacion', sql.DateTime, fechaCreacion ? new Date(fechaCreacion) : new Date())
            .input('fechaCompletada', sql.DateTime, fechaCompletada ? new Date(fechaCompletada) : null)
            .input('fechaBorrado', sql.DateTime, fechaBorrado ? new Date(fechaBorrado) : null)
            .input('comentarioCompletar', sql.NVarChar(500), comentarioCompletar)
            .input('comentarioBorrado', sql.NVarChar(500), comentarioBorrado)
            .query(`
                INSERT INTO Gestion.Tarea (
                    usuarioId, titulo, descripcion, completada, borrada,
                    fechaCreacion, fechaCompletada, fechaBorrado,
                    comentarioCompletar, comentarioBorrado
                ) VALUES (
                    @usuarioId, @titulo, @descripcion, @completada, @borrada,
                    @fechaCreacion, @fechaCompletada, @fechaBorrado,
                    @comentarioCompletar, @comentarioBorrado
                );
                SELECT SCOPE_IDENTITY() as nuevaTareaId;
            `);
        
        const nuevaTareaId = resultado.recordset[0].nuevaTareaId;
        
        // Obtener la tarea recién creada
        const nuevaTarea = await pool
            .request()
            .input('tareaId', sql.Int, nuevaTareaId)
            .query('SELECT * FROM Gestion.Tarea WHERE id = @tareaId');
        
        res.status(201).json({
            mensaje: '🚨 TAREA CREADA CON PROPIEDADES ADMINISTRATIVAS',
            tarea: nuevaTarea.recordset[0],
            propiedades_establecidas: Object.keys(datosCompletos),
            
            // 🚨 INFORMACIÓN SENSIBLE ADICIONAL:
            admin_capabilities: {
                can_set_any_user: true,
                can_set_dates: true,
                can_pre_complete: true,
                can_pre_delete: true,
                bypassed_business_rules: [
                    'user_ownership_validation',
                    'status_workflow_validation',
                    'date_consistency_checks'
                ]
            },
            
            warning: '¡Se permitieron establecer propiedades que normalmente son solo-lectura!',
            vulnerabilidad: 'API3:2023 - BOPLA (Administrative Property Assignment)'
        });
        
    } catch (error) {
        console.log('⚠️ Error en creación administrativa:', error);
        res.status(500).json({
            error: 'Error al crear tarea con propiedades administrativas',
            sql_details: error.message,
            attempted_properties: Object.keys(datosCompletos)
        });
    }
};

module.exports = {
    agregarTarea,
    obtenerTarea,
    completarTarea,
    borrarTarea,
    // Endpoints vulnerables BOPLA
    actualizarTareaMasiva,
    crearTareaAdmin
}
