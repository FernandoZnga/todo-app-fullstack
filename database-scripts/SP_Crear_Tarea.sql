CREATE PROCEDURE SP_Agregar_Tarea
	@usuarioId INT,
	@titulo NVARCHAR(100),
	@descripcion NVARCHAR(500),
	@mensaje VARCHAR(200) OUTPUT
AS
BEGIN
		INSERT INTO Gestion.Tarea (usuarioId, titulo, descripcion, completado, fechaCreacionTarea)
		VALUES					  (@usuarioId, @titulo, @descripcion, 0, GETDATE());
END

EXECUTE SP_Agregar_Tarea @usuarioId = 1027, @titulo = 'Programar', @descripcion = 'Avanzar en las tareas pendientes', @mensaje = 'Tarea creada correctamente'