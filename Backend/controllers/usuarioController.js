const generarJTW = require("../helpers/generarJWT");

const bcrypt = require("bcryptjs");
const sql = require("mssql");
const { dbConexion } = require("../DB/config");

const generarToken = require("../helpers/generarToken");

const registrarUsuario = async (req, res) => {
  try {
    // Guardar un nuevo Usuario
    const { nombreUsuario, correo, contraseña } = req.body;

    // Evitar campos vacios
    if (!nombreUsuario || !correo || !contraseña) {
      return res.status(400).json({ error: "No pueden ir campos vacios" });
    }

    // Encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    const contraEncriptada = bcrypt.hashSync(contraseña, salt);

    // Genera el token de verificación
    const tokenVerificacion = generarToken();

    // Abrir la conexión
    const pool = await dbConexion();

    //Ejecutar el SP
    const result = await pool
      .request()
      .input("nombreUsuario", sql.VarChar(100), nombreUsuario)
      .input("correo", sql.VarChar(100), correo)
      .input("contraseña", sql.VarChar(255), contraEncriptada)
      .input("tokenVerificacion", sql.NVarChar, tokenVerificacion)
      .output("Mensaje", sql.VarChar(200)) // Para recibir el mensaje de salida
      .execute("Gestion.SP_Agregar_Usuario");

    // Verificar si el mensaje es de error o éxito
    const mensaje = result.output.Mensaje; // El mensaje de salida del SP
    if (mensaje === "Usuario Creado correctamente") {
      // Verificar si estamos en modo desarrollo
      const isDevelopment = process.env.DEVELOPMENT === "true";

      if (isDevelopment) {
        // Construir la URL de confirmación solo en desarrollo
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:4000";
        const confirmacionUrl = `${baseUrl}/confirm/${tokenVerificacion}`;

        // Respuesta exitosa con URL de confirmación (modo desarrollo)
        res.status(200).json({
          mensaje,
          confirmacionUrl,
        });
      } else {
        // Respuesta exitosa sin URL (modo producción)
        res.status(200).json({ mensaje });
      }
    } else if (mensaje === "El correo ya está registrado") {
      // Error de conflicto (correo duplicado)
      res.status(409).json({ error: mensaje });
    } else {
      // Otro tipo de error desde el SP
      res.status(400).json({ error: mensaje });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error en el servidor. No se pudo registrar el usuario.",
    });
  }
};

const confirmar = async (req, res) => {
  try {
    const { token } = req.params;

    // Abrir la conexión
    const pool = await dbConexion();

    // Primero verificar si el token existe en la base de datos
    const tokenCheck = await pool
      .request()
      .input("token", sql.NVarChar, token)
      .query(
        "SELECT id, nombreUsuario, correo, verificado FROM Gestion.Usuario WHERE tokenVerificacion = @token"
      );

    if (tokenCheck.recordset.length === 0) {
      // No existe el token, verificar si hay una cuenta ya verificada con un patrón similar
      // Esto es para dar un mejor mensaje de error
      return res.status(404).json({
        mensaje: "Token no válido",
        detalle:
          "El enlace puede haber expirado o ya fue utilizado. Si ya confirmaste tu cuenta, puedes iniciar sesión directamente.",
      });
    }

    // Si el token existe, ejecutar el stored procedure para confirmar
    const resultado = await pool
      .request()
      .input("tokenVerificacion", sql.NVarChar, token)
      .execute("Gestion.SP_Obtener_Usuario_Por_Token");

    const usuario = resultado.recordset[0];

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Token no válido",
        detalle: "Error interno al procesar la confirmación",
      });
    }

    // Obtener el resultado
    res.status(200).json({ mensaje: "Cuenta confirmada", usuario });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al confirmar la cuenta" });
  }
};

const Autenticar = async (req, res) => {
  const { correo, contraseña } = req.body;

  // Abrir la conexión
  const pool = await dbConexion();

  // Comprobar si el Usuario existe
  const resultado = await pool
    .request()
    .input("correo", sql.NVarChar(255), correo)
    .execute("Gestion.SP_Autenticar_Usuario");

  const usuario = resultado.recordset[0];

  if (!usuario) {
    const error = new Error("El Usuario no existe");
    return res.status(404).json({ mensaje: error.message });
  }

  // Comprobar si el Usuario está confirmado
  if (!usuario.verificado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(403).json({ mensaje: error.message });
  }

  // Comprobar la contraseña
  const esContraseñaCorrecta = await bcrypt.compare(
    contraseña,
    usuario.contraseña
  );

  if (esContraseñaCorrecta) {
    res.json({ token: generarJTW(usuario.id) });
  } else {
    const error = new Error("La contraseña es incorrecta");
    return res.status(401).json({ mensaje: error.message });
  }
};

// ⚠️ VULNERABILIDAD DEMO: API3:2023 - Broken Object Property Level Authorization (BOPLA)
// Esta versión expone propiedades sensibles que no deberían ser visibles
// ¡NO USAR EN PRODUCCIÓN!

const perfil = async (req, res) => {
  const { usuario } = req;
  
  console.log('⚠️ VULNERABILIDAD BOPLA: Exponiendo datos sensibles en perfil');
  
  // Abrir la conexión para obtener más datos sensibles
  const pool = await dbConexion();
  const resultado = await pool
    .request()
    .input('usuarioId', sql.Int, usuario.id)
    .query('SELECT * FROM Gestion.Usuario WHERE id = @usuarioId');
  
  const usuarioCompleto = resultado.recordset[0];
  
  // 🚨 VULNERABILIDAD 1: Excessive Data Exposure
  // Exponer información sensible que NO debería estar en la respuesta
  const perfilVulnerable = {
    // Datos legítimos
    id: usuarioCompleto.id,
    nombreUsuario: usuarioCompleto.nombreUsuario,
    correo: usuarioCompleto.correo,
    
    // 🚨 DATOS SENSIBLES EXPUESTOS:
    contraseña_hash: usuarioCompleto.contraseña, // ¡NUNCA exponer!
    tokenVerificacion: usuarioCompleto.tokenVerificacion, // Token secreto
    verificado: usuarioCompleto.verificado, // Info interna
    fechaCreacion: usuarioCompleto.fechaCreacion,
    fechaActualizacion: usuarioCompleto.fechaActualizacion,
    
    // 🚨 METADATOS INTERNOS:
    internal_user_id: `USR_${usuarioCompleto.id}_${Date.now()}`,
    database_table: 'Gestion.Usuario',
    server_version: '1.0.0-vulnerable',
    
    // 🚨 INFORMACIóN DEL SISTEMA:
    system_info: {
      node_version: process.version,
      platform: process.platform,
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      jwt_algorithm: 'HS256'
    },
    
    // 🚨 CAMPOS ADMINISTRATIVOS:
    is_admin: usuarioCompleto.id === 1, // Lógica de rol expuesta
    role_level: usuarioCompleto.id === 1 ? 'admin' : 'user',
    permissions: usuarioCompleto.id === 1 ? ['read', 'write', 'delete', 'admin'] : ['read', 'write'],
    
    // 🚨 DATOS DE DEBUGGING:
    debug_info: {
      sql_query_executed: 'SELECT * FROM Gestion.Usuario WHERE id = @usuarioId',
      execution_time_ms: Math.random() * 100,
      database_connection_pool: 'active',
      last_query_timestamp: new Date().toISOString()
    }
  };
  
  res.json({ 
    perfil: perfilVulnerable,
    ⚠️: 'Esta respuesta contiene información sensible que NO debería estar expuesta',
    vulnerabilities: [
      'Excessive Data Exposure',
      'Internal System Information Leak',
      'Database Schema Exposure',
      'Administrative Role Logic Exposed'
    ]
  });
};

const olvidePassword = async (req, res) => {
  const { correo } = req.body;

  /* Buscar el correo en la BD */

  // Crear la conexión
  const pool = await dbConexion();

  const resultado = await pool
    .request()
    .input("correo", sql.NVarChar(255), correo)
    .query("SELECT * FROM Gestion.Usuario Where correo = @correo");

  // Verifica si el usuario no fue encontrado
  if (resultado.recordset.length === 0) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  //Obtener el usuario encontrado mediante el correo
  existeUsuario = resultado.recordset[0];

  //Actualiza el registro en la BD
  try {
    const token = generarToken();
    /* const usuarioActualizadoToken =  */ await pool
      .request() // Revisar esta linea si sirve o no
      .input("token", sql.NVarChar(255), token)
      .input("correo", sql.NVarChar(255), correo)
      .query(
        "UPDATE Gestion.Usuario SET tokenVerificacion = @token WHERE correo = @correo"
      );

    res.json({ mensaje: "Hemos enviado un correo con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const pool = await dbConexion();
  const tokenValido = await pool
    .request()
    .input("token", sql.NVarChar(255), token)
    .query("SELECT * FROM Gestion.Usuario WHERE tokenVerificacion = @token");

  // Verificar si el token es valido entonces que el usuario exista
  /*En este caso no se pone un Try Catch porque no se hace ningun cambio en la BD solo es para validar si fue encontrado o no*/
  if (tokenValido.recordset.length === 0) {
    res.status(404).json({ mensaje: "Usuario no encontrado" });
  } else {
    return res
      .status(200)
      .json({ mensaje: "Token válido y el usuario existe" });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Validar que se hayan enviado el token y la nueva contraseña
  if (!token || !password) {
    return res
      .status(400)
      .json({ mensaje: "Token y contraseña son requeridos." });
  }

  const pool = await dbConexion();
  const usuario = await pool
    .request()
    .input("token", sql.NVarChar(255), token)
    .query("SELECT * FROM Gestion.Usuario WHERE tokenVerificacion = @token");

  if (usuario.recordset.length === 0) {
    const error = new Error("Hubo un error");
    res.status(400).json({ mensaje: error.message });
  }

  try {
    // Encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    const nuevaContraEncriptada = bcrypt.hashSync(password, salt);

    // Actualizar la contraseña y el token del usuario
    await pool
      .request()
      .input("nuevaContraEncriptada", sql.NVarChar(255), nuevaContraEncriptada)
      .input("token", sql.NVarChar(255), token)
      .query(
        "UPDATE Gestion.Usuario SET contraseña = @nuevaContraEncriptada, tokenVerificacion = NULL WHERE tokenVerificacion = @token"
      );

    res.status(200).json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log(error);
  }
};

// 🚨 VULNERABILIDAD DEMO: Mass Assignment - Actualizar perfil vulnerable
const actualizarPerfil = async (req, res) => {
  console.log('⚠️ VULNERABILIDAD BOPLA: Mass Assignment detectado');
  
  const { usuario } = req;
  const datosActualizacion = req.body;
  
  console.log('⚠️ Datos recibidos para actualización:', Object.keys(datosActualizacion));
  
  // 🚨 VULNERABILIDAD: Permitir actualizar CUALQUIER campo sin validación
  const camposPermitidos = [
    'nombreUsuario', 'correo', // Campos legítimos
    // 🚨 CAMPOS SENSIBLES QUE NO DEBERÍAN SER MODIFICABLES:
    'verificado', 'id', 'contraseña', 'tokenVerificacion',
    'fechaCreacion', 'fechaActualizacion', 'is_admin', 'role_level'
  ];
  
  try {
    const pool = await dbConexion();
    
    // 🚨 CONSTRUIR QUERY DINÁMICO SIN VALIDACIÓN (PELIGROSO)
    let setParts = [];
    let request = pool.request().input('usuarioId', sql.Int, usuario.id);
    
    Object.keys(datosActualizacion).forEach((campo, index) => {
      if (camposPermitidos.includes(campo)) {
        const paramName = `param${index}`;
        setParts.push(`${campo} = @${paramName}`);
        
        // Determinar tipo de dato
        let valor = datosActualizacion[campo];
        if (campo === 'verificado' || campo === 'is_admin') {
          request = request.input(paramName, sql.Bit, valor === true || valor === 'true');
        } else if (campo === 'id') {
          request = request.input(paramName, sql.Int, parseInt(valor));
        } else {
          request = request.input(paramName, sql.NVarChar(255), valor);
        }
        
        console.log(`⚠️ Permitiendo modificación de campo sensible: ${campo} = ${valor}`);
      }
    });
    
    if (setParts.length === 0) {
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }
    
    // 🚨 EJECUTAR QUERY SIN VALIDACIÓN DE SEGURIDAD
    const queryUpdate = `UPDATE Gestion.Usuario SET ${setParts.join(', ')} WHERE id = @usuarioId`;
    console.log('⚠️ Query ejecutado:', queryUpdate);
    
    await request.query(queryUpdate);
    
    // Obtener usuario actualizado
    const usuarioActualizado = await pool
      .request()
      .input('usuarioId', sql.Int, usuario.id)
      .query('SELECT * FROM Gestion.Usuario WHERE id = @usuarioId');
    
    res.json({
      mensaje: '🚨 PERFIL ACTUALIZADO - Mass Assignment exitoso',
      usuario_anterior: usuario,
      usuario_actualizado: usuarioActualizado.recordset[0],
      campos_modificados: Object.keys(datosActualizacion),
      warning: 'Se permitieron modificaciones de campos sensibles',
      vulnerabilidad: 'API3:2023 - Broken Object Property Level Authorization (Mass Assignment)'
    });
    
  } catch (error) {
    console.log('⚠️ Error en mass assignment:', error);
    res.status(500).json({ 
      error: 'Error al actualizar perfil',
      detalle_sensible: error.message // 🚨 Exponer detalles de error
    });
  }
};

// 🚨 VULNERABILIDAD: Endpoint de información del sistema (BOPLA)
const infoSistema = async (req, res) => {
  console.log('⚠️ VULNERABILIDAD BOPLA: Exponiendo información del sistema');
  
  // 🚨 Exponer información detallada del sistema
  const pool = await dbConexion();
  
  // Obtener estadísticas de la base de datos
  const stats = await pool.request().query(`
    SELECT 
      COUNT(*) as total_usuarios,
      MAX(fechaCreacion) as ultimo_registro,
      MIN(fechaCreacion) as primer_registro
    FROM Gestion.Usuario
  `);
  
  const tasksStats = await pool.request().query(`
    SELECT 
      COUNT(*) as total_tareas,
      SUM(CASE WHEN completada = 1 THEN 1 ELSE 0 END) as tareas_completadas,
      SUM(CASE WHEN borrada = 1 THEN 1 ELSE 0 END) as tareas_borradas
    FROM Gestion.Tarea
  `);
  
  res.json({
    mensaje: '🚨 INFORMACIÓN DEL SISTEMA EXPUESTA',
    
    // 🚨 INFORMACIÓN DE BASE DE DATOS:
    database: {
      name: 'ToDoDB',
      schema: 'Gestion',
      tables: ['Usuario', 'Tarea'],
      statistics: {
        usuarios: stats.recordset[0],
        tareas: tasksStats.recordset[0]
      },
      connection_string_hint: 'localhost:1433',
      default_credentials: { user: 'sa', password: 'You wish!' }
    },
    
    // 🚨 INFORMACIÓN DEL SERVIDOR:
    servidor: {
      version: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
      pid: process.pid,
      environment: process.env.NODE_ENV,
      working_directory: process.cwd()
    },
    
    // 🚨 CONFIGURACIÓN DE SEGURIDAD:
    security: {
      jwt_secret_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      jwt_algorithm: 'HS256',
      password_hashing: 'bcrypt',
      session_timeout: 'No configurado',
      rate_limiting: 'Deshabilitado'
    },
    
    // 🚨 ENDPOINTS VULNERABLES:
    endpoints_vulnerables: {
      mass_assignment: '/api/usuarios/actualizar-perfil',
      info_sistema: '/api/usuarios/info-sistema',
      debug_queries: '/api/usuarios/debug-queries',
      admin_panel: '/api/usuarios/admin-panel'
    },
    
    ⚠️: 'Esta información NO debería estar expuesta públicamente',
    vulnerabilidad: 'API3:2023 - Broken Object Property Level Authorization (System Info Exposure)'
  });
};

// 🚨 VULNERABILIDAD: Debug de queries SQL (BOPLA)
const debugQueries = async (req, res) => {
  console.log('⚠️ VULNERABILIDAD BOPLA: Exponiendo estructura de queries SQL');
  
  const pool = await dbConexion();
  
  // 🚨 Exponer consultas SQL usadas en la aplicación
  const queries = {
    obtener_usuario: "SELECT * FROM Gestion.Usuario WHERE id = @usuarioId",
    autenticar: "SELECT * FROM Gestion.Usuario WHERE correo = @correo",
    crear_usuario: "INSERT INTO Gestion.Usuario (nombreUsuario, correo, contraseña, tokenVerificacion) VALUES (@nombreUsuario, @correo, @contraseña, @tokenVerificacion)",
    obtener_tareas: "SELECT * FROM Gestion.Tarea WHERE usuarioId = @usuarioId",
    mass_assignment: "UPDATE Gestion.Usuario SET {campos_dinamicos} WHERE id = @usuarioId"
  };
  
  // Ejecutar query de ejemplo para mostrar estructura
  try {
    const ejemplo = await pool.request()
      .query("SELECT TOP 1 * FROM Gestion.Usuario");
      
    const estructuraTabla = await pool.request()
      .query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Usuario' AND TABLE_SCHEMA = 'Gestion'
      `);
    
    res.json({
      mensaje: '🚨 INFORMACIÓN DE DEBUG SQL EXPUESTA',
      
      queries_utilizadas: queries,
      
      estructura_tabla_usuario: estructuraTabla.recordset,
      
      ejemplo_registro: ejemplo.recordset[0] || {},
      
      procedures_disponibles: [
        'SP_Agregar_Usuario',
        'SP_Autenticar_Usuario', 
        'SP_Confirmar_Cuenta',
        'SP_Obtener_Usuario_Por_Token',
        'SP_Agregar_Tarea',
        'SP_Obtener_Tareas_Usuario_Filtros',
        'SP_Completar_Tarea',
        'SP_Borrar_Tarea'
      ],
      
      ⚠️: 'Estructura de base de datos completamente expuesta',
      vulnerabilidad: 'API3:2023 - BOPLA (Database Schema Exposure)'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error ejecutando debug',
      sql_error: error.message, // 🚨 Exponer errores SQL
      stack: error.stack
    });
  }
};

module.exports = {
  registrarUsuario,
  confirmar,
  Autenticar,
  perfil,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  // Endpoints vulnerables BOPLA
  actualizarPerfil,
  infoSistema,
  debugQueries,
};
