-- VULNERABLE Stored Procedure para borrar una tarea SIN verificar ownership
-- ⚠️  ESTA ES LA VERSIÓN VULNERABLE PARA DEMOSTRACIÓN - NO USAR EN PRODUCCIÓN
USE ToDoDB;
GO

CREATE OR ALTER PROCEDURE Gestion.SP_Borrar_Tarea_Vulnerable
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

        -- ⚠️ VULNERABILIDAD: Borrar la tarea SIN validar el propietario
        UPDATE Gestion.Tarea 
        SET 
            borrada = 1,
            comentarioBorrado = @comentario,
            fechaBorrado = GETDATE(),
            fechaActualizacion = GETDATE()
        WHERE id = @tareaId;  -- ⚠️ FALTA: AND usuarioId = @usuarioId

        SET @Mensaje = 'Tarea borrada exitosamente';

    END TRY
    BEGIN CATCH
        SET @Mensaje = 'Error al borrar la tarea: ' + ERROR_MESSAGE();
    END CATCH
END;
GO
