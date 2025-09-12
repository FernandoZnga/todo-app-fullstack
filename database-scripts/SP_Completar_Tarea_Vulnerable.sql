-- VULNERABLE Stored Procedure para completar una tarea SIN verificar ownership
-- ⚠️  ESTA ES LA VERSIÓN VULNERABLE PARA DEMOSTRACIÓN - NO USAR EN PRODUCCIÓN
USE ToDoDB;
GO

CREATE OR ALTER PROCEDURE Gestion.SP_Completar_Tarea_Vulnerable
    @tareaId INT,
    @comentario NVARCHAR(500),
    @Mensaje NVARCHAR(200) OUTPUT
AS
BEGIN
    BEGIN TRY
        -- ⚠️ VULNERABILIDAD: NO verificamos que la tarea pertenezca al usuario
        -- FALTA: WHERE usuarioId = @usuarioId
        
        -- Solo verificar que la tarea existe (SIN validar ownership)
        IF NOT EXISTS (
            SELECT 1 FROM Gestion.Tarea 
            WHERE id = @tareaId 
            AND borrada = 0
        )
        BEGIN
            SET @Mensaje = 'Tarea no encontrada';
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

        -- ⚠️ VULNERABILIDAD: Completar la tarea SIN validar el propietario
        UPDATE Gestion.Tarea 
        SET 
            completada = 1,
            comentarioCompletar = @comentario,
            fechaCompletada = GETDATE(),
            fechaActualizacion = GETDATE()
        WHERE id = @tareaId;  -- ⚠️ FALTA: AND usuarioId = @usuarioId

        SET @Mensaje = 'Tarea completada exitosamente';

    END TRY
    BEGIN CATCH
        SET @Mensaje = 'Error al completar la tarea: ' + ERROR_MESSAGE();
    END CATCH
END;
GO
