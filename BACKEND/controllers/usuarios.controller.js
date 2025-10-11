const mysqlConnection = require('../config/conexion');

// ENDPOINT DE INGRESAR USUARIOS
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try {

        await conn.query(
        `INSERT INTO tbl_usuarios (nombre_cliente, apellido_cliente, identidad_cliente, telefono_cliente) VALUES (?, ?, ?, ?)`,
        [   
           req.body.usuario,  
           req.body.email_usuario,
           req.body.contrasena_usuario,
           req.body.telefono_cliente 
        ]                
        );

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'Registro realizado con éxito',
        });

    } catch (err) {

        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }
};
