const mysqlConnection = require('../config/conexion');

//CREAR RECORDATORIO
exports.crear = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();
    


    try {

        await conn.query(
            `INSERT INTO tbl_recordatorios (
                mensaje_recordatorio,    
                id_tipo_item_fk, 
                id_frecuencia_fk
                )
             VALUES (?, ?, ?)`,
            [
                req.body.mensaje_recordatorio,
                req.body.id_tipo_item_fk,
                req.body.id_frecuencia_fk
            ]
        );

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Recordatorio creado con éxito'
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });


    } finally {
        conn.release();
    }
};

//VER LISTA DE RECORDATORIOS
exports.ver = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        const [recordatorios] = await conn.query(
            `SELECT * FROM tbl_recordatorios ORDER BY id_recordatorio_pk DESC`
        );

        res.status(200).json({
            Consulta: true,
            recordatorios: recordatorios || []
        });
    } catch (error) {
        res.status(500).json({ Consulta: false, error: error.message });
    } finally {
        conn.release();
    }
};

//ACTUALIZAR RECORDATORIO
exports.actualizar = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();

    try {
        const { id_recordatorio } = req.body;

        await conn.query(
            `UPDATE tbl_recordatorios
             SET mensaje_recordatorio = COALESCE(?, mensaje_recordatorio),
                 programada_para = COALESCE(?, programada_para),
                 ultimo_envio = COALESCE(?, ultimo_envio),
                 intentos = COALESCE(?, intentos),
                 ultimo_error = COALESCE(?, ultimo_error),
                 id_estado_programacion_fk = COALESCE(?, id_estado_programacion_fk),
                 id_cliente_fk = COALESCE(?, id_cliente_fk),
                 id_tipo_item_fk = COALESCE(?, id_tipo_item_fk),
                 id_frecuencia_fk = COALESCE(?, id_frecuencia_fk)
             WHERE id_recordatorio_pk = ?`,
            [
                req.body.mensaje_recordatorio || null,
                req.body.ultimo_envio || null,
                req.body.intentos || null,
                req.body.ultimo_error || null,
                req.body.id_estado_programacion_fk || null,
                req.body.id_cliente_fk || null,
                req.body.id_tipo_item_fk || null,
                req.body.id_frecuencia_fk || null,
                id_recordatorio
            ]
        );

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Recordatorio actualizado con éxito',
            id_recordatorio
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};


//ELIMINAR RECORDATORIO
exports.eliminar = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.body;

        await conn.query(`DELETE FROM tbl_recordatorios WHERE id_recordatorio_pk = ?`, [id]);
        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'Recordatorio eliminado con éxito',
            id
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }



};


exports.verCatalogo = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let filas; //VARIABLE DE APOYO 
        
        switch (req.query.tipo_catalogo) {

            case 'FRECUENCIA':
                [filas] = await conn.query(`
                    SELECT * FROM cat_frecuencia_recordatorio ORDER BY id_frecuencia_record_pk DESC`);
                break;


            case 'TELEFONO':
                [filas] = await conn.query(`
                    SELECT telefono_cliente FROM tbl_clientes`);
                break;

                
            case 'ESTADO':
                [filas] = await conn.query(`
                    SELECT id_estado_pk , nombre_estado FROM cat_estados WHERE dominio = 'RECORDATORIO'`);
                break;


            case 'TIPO_SERVICIO':

                [filas] = await conn.query(
                    `SELECT id_tipo_item_pk, nombre_tipo_item FROM cat_tipo_item where nombre_tipo_item != 'PRODUCTOS'`);
                break;

            default:
               throw new Error('Tipo de catalogo no válido');
        }

        res.json({
            Consulta: true,
            servicios: filas || []
        });

    } catch (error) {
        res.json({
            Consulta: false,
            error: error.message
        });

    } finally {
    
        conn.release();
    }  
};