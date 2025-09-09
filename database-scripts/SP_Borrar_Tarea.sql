-- Stored Procedure para borrar una tarea (soft delete) con comentario
USE ToDoDB;
GO

CREATE OR ALTER PROCEDURE Gestion.SP_Borrar_Tarea
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
            SET @Mensaje = 'Tarea no encontrada o no pertenece al usuario';
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
