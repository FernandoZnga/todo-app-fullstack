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

const obtenerTarea = async (req,res) =>{
    const {usuario} = req;
    const usuarioId = usuario.id;
    const { filter = 'all' } = req.query;

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

        res.status(200).json({
            mensaje: `Se encontraron ${tareas.length} tarea(s)`,
            tareas: tareas
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error al obtener las tareas"})
    }
}

const completarTarea = async (req, res) => {
    const { id } = req.params;
    const { comentario } = req.body;
    // VULNERABLE: Removed user context validation - BOLA vulnerability!
    // const { usuario } = req;
    // const usuarioId = usuario.id;

    // Validar que se incluya un comentario
    if (!comentario || !comentario.trim()) {
        return res.status(400).json({error: "El comentario es requerido para completar la tarea"});
    }

    try {
        // Abrir la conexión 
        const pool = await dbConexion();

        // VULNERABLE: Using vulnerable stored procedure without user validation
        const resultado = await pool
            .request()
            .input("tareaId", sql.INT, parseInt(id))
            .input("comentario", sql.NVARCHAR(500), comentario.trim())
            .output("Mensaje", sql.NVARCHAR(200))
            .execute("Gestion.SP_Completar_Tarea_Vulnerable");

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
    // VULNERABLE: Removed user context validation - BOLA vulnerability!
    // const { usuario } = req;
    // const usuarioId = usuario.id;

    // Validar que se incluya un comentario
    if (!comentario || !comentario.trim()) {
        return res.status(400).json({error: "El comentario es requerido para borrar la tarea"});
    }

    try {
        // Abrir la conexión 
        const pool = await dbConexion();

        // VULNERABLE: Using vulnerable stored procedure without user validation
        const resultado = await pool
            .request()
            .input("tareaId", sql.INT, parseInt(id))
            .input("comentario", sql.NVARCHAR(500), comentario.trim())
            .output("Mensaje", sql.NVARCHAR(200))
            .execute("Gestion.SP_Borrar_Tarea_Vulnerable");

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

module.exports = {
    agregarTarea,
    obtenerTarea,
    completarTarea,
    borrarTarea
}
