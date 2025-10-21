
const mysqlConnection = require('../config/conexion');


// ENDPOINT DE INGRESAR PET GROOMERS
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try {

        await conn.query(
        `INSERT INTO tbl_estilistas_caninos (
            nombre_estilista,
            apellido_estilista,
            identidad_estilista
        ) VALUES (?, ?, ?);`,
        [   
           req.body.nombre_estilista,  
           req.body.apellido_estilista,
           req.body.identidad_estilista
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


//ENDPOINT DE VER LISTA DE PET GROOMERS
exports.ver = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        //SE EJECUTA EL PROCEDIMIENTO
        const [estilistas] = await conn.query(`SELECT * FROM tbl_estilistas_caninos ORDER BY id_estilista_pk DESC`);

        res.status(200).json({
            Consulta: true,
            estilistas: estilistas || []
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



//ENDPOINT ACTUALIZAR PET GROOMERS
exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try{

        const { id_estilista } = req.body;

        await conn.query(
                `UPDATE tbl_estilistas_caninos
                SET nombre_estilista = COALESCE(?, nombre_estilista),
                    apellido_estilista = COALESCE(?, apellido_estilista),
                    identidad_estilista = COALESCE(?, identidad_estilista)
                WHERE id_estilista_pk = ?`,
            [
                req.body.nombre_estilista || null,
                req.body.apellido_estilista || null,
                req.body.identidad_estilista || null,
                id_estilista
            ]
        );

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Estilista actualizado con éxito',
            id_estilista
            
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

//ENDPOINT PARA ELIMINAR PET GROOMERS
exports.eliminar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();


    try {
        await conn.beginTransaction();

        const { id } = req.body;

        await conn.query(`DELETE FROM tbl_estilistas_caninos WHERE id_estilista_pk = ?`, [id]);

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'Estilista eliminado con éxito',
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
