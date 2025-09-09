USE ToDoDB
GO

CREATE PROCEDURE Gestion.SP_Completar_Tarea
    @tareaId INT,
    @usuarioId INT,
    @comentario NVARCHAR(500),
    @Mensaje NVARCHAR(200) OUTPUT
AS
BEGIN
    BEGIN TRY
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

        IF EXISTS (
            SELECT 1 FROM Gestion.Tarea 
            WHERE id = @tareaId 
            AND completada = 1
        )
        BEGIN
            SET @Mensaje = 'La tarea ya está completada';
            RETURN;
        END

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
END
GO
