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

    try {
        // Abrir la conexión 
        const pool = await dbConexion();

        // Ejecutar el SP para obtener tareas del usuario
        const resultado = await pool
            .request()
            .input("usuarioId", sql.INT, usuarioId)
            .execute("Gestion.SP_Obtener_Tareas_Usuario");

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

module.exports = {
    agregarTarea,
    obtenerTarea
}