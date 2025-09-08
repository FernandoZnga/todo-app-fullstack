CREATE DATABASE ToDoDB;
GO

USE ToDoDB
GO

CREATE SCHEMA Gestion;
GO


CREATE TABLE Gestion.Usuario (
	id INT PRIMARY KEY IDENTITY (1,1),
	nombreUsuario NVARCHAR(100) NOT NULL,
	correo NVARCHAR(255) NOT NULL UNIQUE,
	contraseña NVARCHAR(255) NOT NULL,
	verificado BIT NOT NULL DEFAULT 0,
	tokenVerificacion NVARCHAR(255),
	fechaCreacionUsuario DATETIME DEFAULT GETDATE()
)

CREATE TABLE Gestion.Tarea (
	id INT PRIMARY KEY IDENTITY(1,1),
	usuarioId INT,
	titulo NVARCHAR(100) NOT NULL,
	descripcion NVARCHAR(500) NOT NULL,
	completado BIT NOT NULL DEFAULT 0,
	fechaCreacionTarea DATETIME DEFAULT GETDATE(),
	fechaActualizacionTarea DATETIME NULL,
	fechaEliminacionTarea DATETIME NULL,

	-- Restricciones --
	CONSTRAINT FK_Usuario FOREIGN KEY (usuarioId) REFERENCES Gestion.Usuario(id)
)
GO

INSERT INTO Gestion.Usuario(nombreUsuario, correo, constraseña, verificado, tokenVerificacion)
VALUES						('prueba_proyecto', 'prueba_proyecto@gmail.com', '123', 1, 'qwe123@_');

INSERT INTO Gestion.Tarea(usuarioId, titulo, descripcion, completado)
VALUES						(1, 'Ir al Gym', 'Realizar toda la rutina', 0)

SELECT * FROM Gestion.Usuario
SELECT * FROM Gestion.Tarea



