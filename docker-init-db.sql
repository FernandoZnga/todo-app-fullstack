-- Script de Inicialización Completa de la Base de Datos TODO App
-- Este script se ejecuta automáticamente cuando se crea el contenedor SQL Server

-- Paso 1: Crear la base de datos y esquemas
USE master;
GO

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ToDoDB')
BEGIN
    CREATE DATABASE ToDoDB;
END
GO

-- Usar la base de datos ToDoDB
USE ToDoDB;
GO

-- Crear esquema si no existe
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Gestion')
BEGIN
    EXEC('CREATE SCHEMA Gestion');
END
GO

-- Paso 2: Crear tablas
-- Tabla Usuario
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuario' AND xtype='U')
BEGIN
    CREATE TABLE Gestion.Usuario (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombreUsuario NVARCHAR(100) NOT NULL,
        correo NVARCHAR(100) NOT NULL UNIQUE,
        contraseña NVARCHAR(255) NOT NULL,
        verificado BIT DEFAULT 0,
        tokenVerificacion NVARCHAR(255) NULL,
        fechaCreacion DATETIME DEFAULT GETDATE()
    );
END
GO

-- Tabla Tarea
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tarea' AND xtype='U')
BEGIN
    CREATE TABLE Gestion.Tarea (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuarioId INT NOT NULL,
        titulo NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(500) NULL,
        completada BIT DEFAULT 0,
        fechaCreacion DATETIME DEFAULT GETDATE(),
        fechaActualizacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (usuarioId) REFERENCES Gestion.Usuario(id)
    );
END
GO

-- Paso 3: Crear procedimientos almacenados

-- Procedimiento para crear usuario
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Agregar_Usuario')
    DROP PROCEDURE Gestion.SP_Agregar_Usuario;
GO

CREATE PROCEDURE Gestion.SP_Agregar_Usuario
    @nombreUsuario NVARCHAR(100),
    @correo NVARCHAR(100),
    @contraseña NVARCHAR(255),
    @tokenVerificacion NVARCHAR(255),
    @Mensaje NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verificar si el correo ya existe
        IF EXISTS (SELECT 1 FROM Gestion.Usuario WHERE correo = @correo)
        BEGIN
            SET @Mensaje = 'El correo ya está registrado';
            RETURN;
        END

        -- Insertar el nuevo usuario
        INSERT INTO Gestion.Usuario (nombreUsuario, correo, contraseña, tokenVerificacion)
        VALUES (@nombreUsuario, @correo, @contraseña, @tokenVerificacion);

        SET @Mensaje = 'Usuario Creado correctamente';
    END TRY
    BEGIN CATCH
        SET @Mensaje = 'Error al crear el usuario: ' + ERROR_MESSAGE();
    END CATCH
END
GO

-- Procedimiento para obtener usuario por token
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Obtener_Usuario_Por_Token')
    DROP PROCEDURE Gestion.SP_Obtener_Usuario_Por_Token;
GO

CREATE PROCEDURE Gestion.SP_Obtener_Usuario_Por_Token
    @tokenVerificacion NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Actualizar usuario como verificado y limpiar token
    UPDATE Gestion.Usuario 
    SET verificado = 1, tokenVerificacion = NULL
    WHERE tokenVerificacion = @tokenVerificacion;
    
    -- Retornar información del usuario
    SELECT id, nombreUsuario, correo, verificado
    FROM Gestion.Usuario 
    WHERE tokenVerificacion = @tokenVerificacion OR (verificado = 1 AND @tokenVerificacion IS NOT NULL);
END
GO

-- Procedimiento para autenticar usuario
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Autenticar_Usuario')
    DROP PROCEDURE Gestion.SP_Autenticar_Usuario;
GO

CREATE PROCEDURE Gestion.SP_Autenticar_Usuario
    @correo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, nombreUsuario, correo, contraseña, verificado
    FROM Gestion.Usuario
    WHERE correo = @correo;
END
GO

-- Procedimiento para crear tarea
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Agregar_Tarea')
    DROP PROCEDURE Gestion.SP_Agregar_Tarea;
GO

CREATE PROCEDURE Gestion.SP_Agregar_Tarea
    @usuarioId INT,
    @titulo NVARCHAR(100),
    @descripcion NVARCHAR(500),
    @Mensaje NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO Gestion.Tarea (usuarioId, titulo, descripcion)
        VALUES (@usuarioId, @titulo, @descripcion);
        
        SET @Mensaje = 'Tarea creada correctamente';
    END TRY
    BEGIN CATCH
        SET @Mensaje = 'Error al crear la tarea: ' + ERROR_MESSAGE();
    END CATCH
END
GO

-- Procedimiento para obtener tareas de un usuario
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Obtener_Tareas_Usuario')
    DROP PROCEDURE Gestion.SP_Obtener_Tareas_Usuario;
GO

CREATE PROCEDURE Gestion.SP_Obtener_Tareas_Usuario
    @usuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, titulo, descripcion, completada, fechaCreacion, fechaActualizacion
    FROM Gestion.Tarea
    WHERE usuarioId = @usuarioId
    ORDER BY fechaCreacion DESC;
END
GO

PRINT 'Base de datos ToDoDB inicializada correctamente con todas las tablas y procedimientos almacenados.';
GO
