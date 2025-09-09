-- Stored Procedure para obtener tareas del usuario con filtros
USE ToDoDB;
GO

CREATE OR ALTER PROCEDURE Gestion.SP_Obtener_Tareas_Usuario_Filtros
    @usuarioId INT,
    @filtro NVARCHAR(50) = 'all' -- 'all', 'pending', 'completed', 'deleted'
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
            (@filtro = 'deleted' AND borrada = 1)
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
