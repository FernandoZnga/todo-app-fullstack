USE ToDoDB
GO

CREATE PROCEDURE SP_Agregar_Usuario
	@nombreUsuario VARCHAR(100),
	@correo VARCHAR(100),
	@contrase�a VARCHAR(255),
	@tokenVerificacion NVARCHAR(255),
	@mensaje VARCHAR(200) OUTPUT
AS
BEGIN
	BEGIN TRY
		-- Inicia una transaccion 
		BEGIN TRANSACTION 
		
		--Inserta un nuevo Registro en la tabla
		INSERT INTO Gestion.Usuario (nombreUsuario,correo,contrase�a, tokenVerificacion)
		VALUES						(@nombreUsuario,@correo, @contrase�a, @tokenVerificacion)
		
		COMMIT TRANSACTION

		SET @Mensaje = 'Usuario Creado correctamente'

	END TRY
	BEGIN CATCH
		-- Deshace la transacci�n si ocurre un error
        IF @@TRANCOUNT > 0
		BEGIN
			ROLLBACK TRANSACTION 
		END

		-- captura el error de la clave duplicada
		 IF ERROR_NUMBER() = 2627 OR ERROR_NUMBER() = 2601
        BEGIN
            SET @Mensaje = 'El correo ya est� registrado';
        END
		ELSE
		BEGIN

			-- Devuelve un mensaje de error personalizado
			DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
			SELECT 
				@ErrorMessage = ERROR_MESSAGE(),
				@ErrorSeverity = ERROR_SEVERITY(),
				@ErrorState = ERROR_STATE();
			RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

			 -- Establece el mensaje de error
			SET @Mensaje = 'Error al crear el usuario'
		END
	END CATCH
END

EXECUTE SP_Agregar_Usuario @nombreUsuario = 'Juan', @correo = 'juan@correo.com',@contrase�a = '123', @mensaje = 'Correcto'

