USE ToDoDB
GO

CREATE PROCEDURE SP_Autenticar_Usuario
	@correo NVARCHAR(255)
AS
BEGIN
	SELECT * FROM Gestion.Usuario WHERE correo = @correo
END


SELECT * FROM Gestion.Usuario Where correo = 'prueba_proyecto@gmail.com'