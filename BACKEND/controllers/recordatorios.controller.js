
const mysqlConnection = require('../config/conexion');
const moment = require('moment');


exports.verCatalogo = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let filas; //VARIABLE DE APOYO

        switch (req.query.tipo_catalogo) {

            case 'FRECUENCIA':   //ME TRAE TODAS LAS FRECUENCIAS
                [filas] = await conn.query(`
                    SELECT
                        id_frecuencia_record_pk,
                        frecuencia_recordatorio
                    FROM cat_frecuencia_recordatorio
                    ORDER BY id_frecuencia_record_pk DESC`);
                break;


            case 'TELEFONO': //ME TRAE TODOS LOS TELEFONOS DE LOS CLIENTES REGISTRADOS
                [filas] = await conn.query(`
                    SELECT
                        telefono_cliente
                    FROM tbl_clientes`);
                break;

            case 'ESTADO':
                [filas] = await conn.query(`
                    SELECT
                        id_estado_pk,
                        nombre_estado
                    FROM cat_estados
                    WHERE dominio = 'RECORDATORIO'`);
                break;

            case 'TIPO_SERVICIO':
                [filas] = await conn.query(`
                    SELECT
                        id_tipo_item_pk,
                        nombre_tipo_item
                    FROM cat_tipo_item
                    WHERE nombre_tipo_item != 'PRODUCTOS'`);
                break;

            default:
               throw new Error('Tipo de catalogo no válido');
        }

        res.json({
            Consulta: true,
            Catalogo: filas || []
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

//CREAR RECORDATORIO
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try {

        const { tipo_item, frecuencia, fecha_programacion, mensaje} = req.body;

        //fecha programacion =  CUANDO SE EMPIEZA A ENVIAR
        //ultimo envio = ULTIMA VEZ QUE SE ENVIO
        //proximo envio = CUANDO SE DEBE ENVIAR DE NUEVO
        //intentos = CUANTOS INTENTOS DE ENVIO SE HAN HECHO
        //id_estado_programacion_fk = ENVIADO, PENDIENTE, FALLIDO, ETC.


        let proximo_envio, ultimo_envio;

        const [filas_frecuencia] = await conn.query(`
            SELECT
                id_frecuencia_record_pk,
                frecuencia_recordatorio
            FROM cat_frecuencia_recordatorio
            WHERE id_frecuencia_record_pk = ?`,[frecuencia] );


        switch (filas_frecuencia[0]?.frecuencia_recordatorio) {

            case 'UNA SOLA VEZ':

                proximo_envio = fecha_programacion;
                ultimo_envio = fecha_programacion;

                //ESTADO ENVIADO

                
                break;

            case 'SEMANAL':

                break;

            case 'QUINCENAL':

                break;


            case 'MENSUAL':

                break;


            case 'BIMESTRAL':

                break;

            case 'TRIMESTRAL':

                break;

            default:
                break;
        }

        await conn.query(
            `INSERT INTO tbl_recordatorios (
                id_tipo_item_fk,
                id_frecuencia_fk,
                fecha_programación,
                mensaje_recordatorio,
                ultimo_envio,
                proximo_envio,
                intentos,
                id_estado_programacion_fk
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                tipo_item,
                frecuencia,
                fecha_programacion,
                mensaje,
                req.body.ultimo_envio,
                req.body.proximo_envio,
                req.body.intentos,
                req.body.id_estado_programacion_fk
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
             SET
                mensaje_recordatorio = COALESCE(?, mensaje_recordatorio),
                ultimo_envio = COALESCE(?, ultimo_envio),
                proximo_envio = COALESCE(?, proximo_envio),
                intentos = COALESCE(?, intentos),
                id_estado_programacion_fk = COALESCE(?, id_estado_programacion_fk),
                id_tipo_item_fk = COALESCE(?, id_tipo_item_fk),
                id_frecuencia_fk = COALESCE(?, id_frecuencia_fk)
             WHERE id_recordatorio_pk = ?`,
            [
                req.body.mensaje_recordatorio || null,
                req.body.ultimo_envio || null,
                req.body.proximo_envio || null,
                req.body.intentos || null,
                req.body.id_estado_programacion_fk || null,
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
