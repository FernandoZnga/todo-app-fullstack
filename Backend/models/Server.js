const express = require('express');
const cors = require('cors');
const {dbConexion} = require('../DB/config');
const { swaggerUi, swaggerSpec } = require('../config/swagger');

class Server {

    constructor(){
        this.app = express();
        this.puerto = process.env.PORT;   

        this.usuariosPath = '/api/usuarios';
        this.tareasPath = '/api/tareas';
        
        // Conectar Base de datos
        this.conectarBD();

        // Middlewares
        this.middlewares();

        // Rutas
        this.routes();
    }

    // Métodos //

    middlewares(){
        // CORS
        this.app.use(cors());
        
        // Parse JSON
        this.app.use(express.json());
        
        // Swagger Documentation
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        
        // Redirect root to API documentation
        this.app.get('/', (req, res) => {
            res.redirect('/api-docs');
        });
    }

    // Conectar con la BD
    async conectarBD(){
        this.pool = await dbConexion();
    }

    // Rutas
    routes(){
        this.app.use(this.usuariosPath, require('../routes/usuarioRoutes'));
        this.app.use(this.tareasPath, require('../routes/tareaRoutes'));
    }



    // Escucha de la aplicación
    listen(){
        this.app.listen(this.puerto, ()=>{
            console.log(`Servidor ejecutandose correctamente en el puerto ${this.puerto}`);
        })
    }
}

module.exports = Server;