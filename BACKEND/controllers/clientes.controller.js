
const mysqlConnection = require('../config/conexion');


// ENDPOINT DE INGRESAR CLIENTES
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

    try {
        
        await conn.query('CALL sp_insert_cliente (?,?,?,?)',
            [
                req.body.nombre_cliente, 
                req.body.apellido_cliente,
                req.body.identidad_cliente, 
                req.body.telefono_cliente
            ]
        );

        await conn.commit(); //CONFIRMO LA TRANSACCIÓN

        res.status(200).json({
            Consulta: true,
            mensaje: 'Registro realizado con éxito',
        });

    } catch (err) {
        await conn.rollback(); //REVIERTO LA CONSULTA SI HAY ERROR
        res.status(500).json({
            Consulta: false,
            error: err.message
        });

    } finally {
        conn.release(); //LIBERO LA CONEXION
    }
};


//ENDPOINT DE VER LISTA DE CLIENTES
exports.ver = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        //SE EJECUTA EL PROCEDIMIENTO
        const [rows] = await conn.query('CALL sp_select_clientes()');

        res.status(200).json({
            Consulta: true,
            clientes: rows [0] || []
        });

    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });

    } finally {
        conn.release(); //SE LIBERA LA CONEXIÓN
    }
};


//ENDPOINT ACTUALIZAR CLIENTES
exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try{

        const {id_cliente} = req.body;

        await conn.query('CALL sp_update_cliente (?,?,?,?,?)',
            [
                id_cliente,
                req.body.nombre_cliente || null,  
                req.body.apellido_cliente || null,
                req.body.identidad_cliente || null,
                req.body.telefono_cliente || null
            ]
        );

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Servicio actualizado con éxito',
            id_cliente
            
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

//ENDPOINT PARA ELIMINAR CLIENTES 
exports.eliminar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();
   
    const { id } = req.body;


    try {
        await conn.beginTransaction();

        await conn.query('CALL sp_delete_cliente(?)', [id]);

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'Cliente eliminado con éxito',
            id
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
