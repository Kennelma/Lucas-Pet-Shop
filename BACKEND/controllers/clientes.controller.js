
const mysqlConnection = require('../config/conexion');


// ENDPOINT DE INGRESAR CLIENTES
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try {

        const fechaRegistro = new Date();

        await conn.query(
        `INSERT INTO tbl_clientes (nombre_cliente, apellido_cliente, identidad_cliente, telefono_cliente, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
        [
           req.body.nombre_cliente,
           req.body.apellido_cliente,
           req.body.identidad_cliente,
           req.body.telefono_cliente,
           fechaRegistro
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


//ENDPOINT DE VER LISTA DE CLIENTES
exports.ver = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        //SE EJECUTA EL PROCEDIMIENTO
        const [clientes] = await conn.query(`SELECT * FROM tbl_clientes ORDER BY id_cliente_pk DESC`);

        res.status(200).json({
            Consulta: true,
            clientes: clientes || []
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

        const { id_cliente } = req.body;

        await conn.query(
                `UPDATE tbl_clientes
                SET nombre_cliente = COALESCE(?, nombre_cliente),
                    apellido_cliente = COALESCE(?, apellido_cliente),
                    identidad_cliente = COALESCE(?, identidad_cliente),
                    telefono_cliente = COALESCE(?, telefono_cliente)
                WHERE id_cliente_pk = ?`,
            [
                req.body.nombre_cliente || null,
                req.body.apellido_cliente || null,
                req.body.identidad_cliente || null,
                req.body.telefono_cliente || null,
                id_cliente
            ]
        );

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Cliente actualizado con éxito',
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


    try {
        await conn.beginTransaction();

        const { id } = req.body;

        await conn.query(`DELETE FROM tbl_clientes WHERE id_cliente_pk = ?`, [id]);

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

