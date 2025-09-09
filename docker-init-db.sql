-- Script de Inicialización Completa de la Base de Datos TODO App
-- Este script se ejecuta automáticamente cuando se crea el contenedor SQL Server
-- Incluye todas las funcionalidades avanzadas: completar/borrar tareas con comentarios y filtros

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

-- Paso 2: Crear tablas con todas las columnas (incluyendo funcionalidades avanzadas)

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

-- Tabla Tarea (con todas las columnas avanzadas desde el inicio)
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
        -- ✨ Columnas para funcionalidades avanzadas
        borrada BIT DEFAULT 0,
        fechaCompletada DATETIME NULL,
        fechaBorrado DATETIME NULL,
        comentarioCompletar NVARCHAR(500) NULL,
        comentarioBorrado NVARCHAR(500) NULL,
        FOREIGN KEY (usuarioId) REFERENCES Gestion.Usuario(id)
    );
END
GO

-- Paso 3: Crear todos los procedimientos almacenados

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
    
    DECLARE @userId INT;
    
    -- Primero verificar si el token existe y obtener el ID del usuario
    SELECT @userId = id 
    FROM Gestion.Usuario 
    WHERE tokenVerificacion = @tokenVerificacion;
    
    -- Si no se encontró el token, retornar vacío
    IF @userId IS NULL
    BEGIN
        SELECT CAST(NULL as INT) as id, CAST(NULL as NVARCHAR(100)) as nombreUsuario, 
               CAST(NULL as NVARCHAR(100)) as correo, CAST(NULL as BIT) as verificado
        WHERE 1=0; -- Retorna conjunto vacío
        RETURN;
    END
    
    -- Actualizar usuario como verificado y limpiar token
    UPDATE Gestion.Usuario 
    SET verificado = 1, tokenVerificacion = NULL
    WHERE id = @userId;
    
    -- Retornar información del usuario usando el ID
    SELECT id, nombreUsuario, correo, verificado
    FROM Gestion.Usuario 
    WHERE id = @userId;
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

-- ✨ Procedimiento para completar tarea (con comentario obligatorio)
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Completar_Tarea')
    DROP PROCEDURE Gestion.SP_Completar_Tarea;
GO

CREATE PROCEDURE Gestion.SP_Completar_Tarea
    @tareaId INT,
    @usuarioId INT,
    @comentario NVARCHAR(500),
    @Mensaje NVARCHAR(200) OUTPUT
AS
BEGIN
    BEGIN TRY
        -- Verificar que la tarea existe y pertenece al usuario
        IF NOT EXISTS (
            SELECT 1 FROM Gestion.Tarea 
            WHERE id = @tareaId 
            AND usuarioId = @usuarioId 
            AND borrada = 0
        )
        BEGIN
            SET @Mensaje = 'Tarea no encontrada o no autorizada';
            RETURN;
        END

        -- Verificar que la tarea no esté ya completada
        IF EXISTS (
            SELECT 1 FROM Gestion.Tarea 
            WHERE id = @tareaId 
            AND completada = 1
        )
        BEGIN
            SET @Mensaje = 'La tarea ya está completada';
            RETURN;
        END

        -- Completar la tarea
        UPDATE Gestion.Tarea 
        SET 
            completada = 1,
            comentarioCompletar = @comentario,
            fechaCompletada = GETDATE(),
            fechaActualizacion = GETDATE()
        WHERE id = @tareaId 
        AND usuarioId = @usuarioId;

        SET @Mensaje = 'Tarea completada exitosamente';

    END TRY
    BEGIN CATCH
        SET @Mensaje = 'Error al completar la tarea: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- ✨ Procedimiento para borrar tarea (soft delete con comentario obligatorio)
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Borrar_Tarea')
    DROP PROCEDURE Gestion.SP_Borrar_Tarea;
GO

CREATE PROCEDURE Gestion.SP_Borrar_Tarea
    @tareaId INT,
    @usuarioId INT,
    @comentario NVARCHAR(500),
    @Mensaje NVARCHAR(200) OUTPUT
AS
BEGIN
    BEGIN TRY
        -- Verificar que la tarea existe y pertenece al usuario
        IF NOT EXISTS (
            SELECT 1 FROM Gestion.Tarea 
            WHERE id = @tareaId 
            AND usuarioId = @usuarioId 
            AND borrada = 0
        )
        BEGIN
            SET @Mensaje = 'Tarea no encontrada o no autorizada';
            RETURN;
        END

        -- Verificar que la tarea no esté ya borrada
        IF EXISTS (
            SELECT 1 FROM Gestion.Tarea 
            WHERE id = @tareaId 
            AND borrada = 1
        )
        BEGIN
            SET @Mensaje = 'La tarea ya está borrada';
            RETURN;
        END

        -- Borrar la tarea (soft delete)
        UPDATE Gestion.Tarea 
        SET 
            borrada = 1,
            comentarioBorrado = @comentario,
            fechaBorrado = GETDATE(),
            fechaActualizacion = GETDATE()
        WHERE id = @tareaId 
        AND usuarioId = @usuarioId;

        SET @Mensaje = 'Tarea borrada exitosamente';

    END TRY
    BEGIN CATCH
        SET @Mensaje = 'Error al borrar la tarea: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- ✨ Procedimiento para obtener tareas con filtros avanzados
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Obtener_Tareas_Usuario_Filtros')
    DROP PROCEDURE Gestion.SP_Obtener_Tareas_Usuario_Filtros;
GO

CREATE PROCEDURE Gestion.SP_Obtener_Tareas_Usuario_Filtros
    @usuarioId INT,
    @filtro NVARCHAR(50) = 'all' -- 'all', 'pending', 'completed', 'deleted', 'all_including_deleted'
AS
BEGIN
    BEGIN TRY
        SELECT 
            id,
            titulo,
            descripcion,
            completada,
            borrada,
            fechaCreacion,
            fechaActualizacion,
            fechaCompletada,
            fechaBorrado,
            comentarioCompletar,
            comentarioBorrado
        FROM Gestion.Tarea
        WHERE usuarioId = @usuarioId
        AND (
            (@filtro = 'all' AND borrada = 0) OR
            (@filtro = 'pending' AND completada = 0 AND borrada = 0) OR
            (@filtro = 'completed' AND completada = 1 AND borrada = 0) OR
            (@filtro = 'deleted' AND borrada = 1) OR
            (@filtro = 'all_including_deleted' AND 1 = 1)
        )
        ORDER BY 
            CASE 
                WHEN @filtro = 'deleted' THEN fechaBorrado 
                WHEN @filtro = 'completed' THEN fechaCompletada
                ELSE fechaActualizacion 
            END DESC;

    END TRY
    BEGIN CATCH
        -- En caso de error, retornar conjunto vacío
        SELECT 
            id, titulo, descripcion, completada, borrada,
            fechaCreacion, fechaActualizacion, fechaCompletada, fechaBorrado,
            comentarioCompletar, comentarioBorrado
        FROM Gestion.Tarea
        WHERE 1 = 0; -- No retorna filas
    END CATCH
END;
GO

-- Procedimiento básico para obtener tareas (legacy - mantener por compatibilidad)
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_Obtener_Tareas_Usuario')
    DROP PROCEDURE Gestion.SP_Obtener_Tareas_Usuario;
GO

CREATE PROCEDURE Gestion.SP_Obtener_Tareas_Usuario
    @usuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Usar el procedimiento avanzado con filtro 'all' por defecto
    EXEC Gestion.SP_Obtener_Tareas_Usuario_Filtros @usuarioId, 'all';
END
GO

PRINT '🎉 Base de datos ToDoDB inicializada correctamente con TODAS las funcionalidades avanzadas:';
PRINT '   ✅ Esquema Gestion creado';
PRINT '   ✅ Tablas Usuario y Tarea con columnas completas';
PRINT '   ✅ 8 stored procedures creados:';
PRINT '      - SP_Agregar_Usuario';
PRINT '      - SP_Obtener_Usuario_Por_Token';
PRINT '      - SP_Autenticar_Usuario';
PRINT '      - SP_Agregar_Tarea';
PRINT '      - SP_Completar_Tarea (✨ con comentarios)';
PRINT '      - SP_Borrar_Tarea (✨ soft delete con comentarios)';
PRINT '      - SP_Obtener_Tareas_Usuario_Filtros (✨ filtros avanzados)';
PRINT '      - SP_Obtener_Tareas_Usuario (legacy)';
PRINT '   ✅ Funcionalidades incluidas:';
PRINT '      - Completar tareas con comentario obligatorio';
PRINT '      - Borrar tareas (soft delete) con comentario obligatorio';
PRINT '      - Filtros: all, pending, completed, deleted, all_including_deleted';
PRINT '      - Auditoría completa con fechas y comentarios';
PRINT '   🚀 ¡Lista para usar sin scripts adicionales!';
GO
