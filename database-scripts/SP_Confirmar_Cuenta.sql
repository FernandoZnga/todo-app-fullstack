USE ToDoDB
GO

ALTER PROCEDURE SP_Obtener_Usuario_Por_Token
	@tokenVerificacion NVARCHAR(255)
AS 
BEGIN

	-- ACTUALIZAR EL ESTADO DE VERIFICADO
	UPDATE Gestion.Usuario
	SET verificado = 1, tokenVerificacion = NULL
	OUTPUT INSERTED.*  -- Retorna todos los campos del registro que se acaba de actualizar
	WHERE tokenVerificacion = @tokenVerificacion
END

SELECT * FROM Gestion.Usuario 
