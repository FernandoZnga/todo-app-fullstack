-- Script de Actualización de la Base de Datos ToDoDB
-- Agrega nuevas columnas y stored procedures para completar/borrar tareas
USE ToDoDB;
GO

-- Paso 1: Actualizar la tabla Tarea para agregar nuevas columnas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Gestion.Tarea') AND name = 'borrada')
BEGIN
    ALTER TABLE Gestion.Tarea ADD borrada BIT DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Gestion.Tarea') AND name = 'fechaCompletada')
BEGIN
    ALTER TABLE Gestion.Tarea ADD fechaCompletada DATETIME NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Gestion.Tarea') AND name = 'fechaBorrado')
BEGIN
    ALTER TABLE Gestion.Tarea ADD fechaBorrado DATETIME NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Gestion.Tarea') AND name = 'comentarioCompletar')
BEGIN
    ALTER TABLE Gestion.Tarea ADD comentarioCompletar NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Gestion.Tarea') AND name = 'comentarioBorrado')
BEGIN
    ALTER TABLE Gestion.Tarea ADD comentarioBorrado NVARCHAR(500) NULL;
END
GO

-- Paso 2: Crear/Actualizar stored procedure para completar tarea
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

-- Paso 3: Crear/Actualizar stored procedure para borrar tarea
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

-- Paso 4: Crear/Actualizar stored procedure para obtener tareas con filtros
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

PRINT 'Base de datos actualizada correctamente con nuevas funcionalidades de completar/borrar tareas.';
GO
