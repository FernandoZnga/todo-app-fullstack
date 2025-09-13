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

const perfil = (req, res) => {
  const { usuario } = req;

  res.json({ perfil: usuario });
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

// 🚨 VULNERABILIDAD DEMO: API2:2023 - Broken Authentication
// Endpoints vulnerables para demostración
// ¡NO USAR EN PRODUCCIÓN!

const { generarTokenBypass } = require("../helpers/generarJWT");

// 🚨 VULNERABILIDAD: Endpoint de bypass de autenticación
const bypassLogin = async (req, res) => {
  console.log('⚠️ VULNERABILIDAD: Endpoint de bypass activado');
  
  const { userId = 1, isAdmin = false } = req.body;
  
  // ¡Cualquier persona puede obtener un token sin validación!
  const token = generarTokenBypass(userId, isAdmin);
  
  res.json({
    mensaje: '🚨 BYPASS EXITOSO - Token generado sin autenticación',
    token: token,
    warning: 'ESTO ES UNA VULNERABILIDAD CRÍTICA'
  });
};

// 🚨 VULNERABILIDAD: Endpoint de información sensible
const infoSensible = (req, res) => {
  console.log('⚠️ VULNERABILIDAD: Exponiendo información sensible');
  
  res.json({
    servidor: {
      version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
      jwt_secret: process.env.JWT_SECRET || 'secret123', // ¡Expone el secreto!
      db_credentials: {
        user: process.env.DB_USER || 'sa',
        password: '***REDACTED***', // Al menos algo de seguridad
        server: process.env.DB_SERVER || 'localhost'
      }
    },
    usuarios_demo: [
      { id: 1, rol: 'admin', hint: 'Usuario administrador de prueba' },
      { id: 2, rol: 'user', hint: 'Usuario regular de prueba' }
    ],
    vulnerabilidades: {
      bypass_header: 'x-demo-bypass: vulnerable-demo',
      weak_secret: 'secret123',
      development_mode: 'x-development-mode: true',
      skip_validation: 'x-skip-db-validation: true'
    }
  });
};

// 🚨 VULNERABILIDAD: Login con validación débil
const loginDebil = async (req, res) => {
  const { correo, contraseña } = req.body;
  
  console.log('⚠️ VULNERABILIDAD: Login con validación débil');
  
  // 🚨 Acepta passwords débiles conocidas
  const passwordsDebiles = ['123456', 'password', 'admin', 'test', ''];
  
  if (passwordsDebiles.includes(contraseña)) {
    console.log('⚠️ Password débil aceptada:', contraseña);
    
    // Simular usuario sin validar en BD
    const token = generarTokenBypass(1, true);
    
    return res.json({
      mensaje: '🚨 LOGIN EXITOSO con password débil',
      token: token,
      warning: 'Se aceptó una contraseña extremadamente débil'
    });
  }
  
  // Si no es password débil, usar flujo normal (pero seguirá siendo vulnerable)
  return Autenticar(req, res);
};

module.exports = {
  registrarUsuario,
  confirmar,
  Autenticar,
  perfil,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  // Endpoints vulnerables para demo
  bypassLogin,
  infoSensible,
  loginDebil,
};
