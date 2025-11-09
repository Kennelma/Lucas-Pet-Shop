
const mysqlConnection = require('../config/conexion');

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
        res.status(500).json({
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
        const { tipo_item, frecuencia, programada_para, mensaje } = req.body;

        // Al crear solo guardas la configuración:
        // - programada_para = fecha que eligió el usuario (primera vez que se envía)
        // - ultimo_envio = NULL (aún no se ha enviado)
        // - intentos = 0
        // - id_estado_programacion_fk = 1 (PENDIENTE)

        const [estado] = await conn.query(`
            SELECT id_estado_pk AS estado
            FROM cat_estados
            WHERE dominio = 'RECORDATORIO' AND nombre_estado = 'PENDIENTE'
            LIMIT 1
        `);

        const [result] = await conn.query(
            `INSERT INTO tbl_recordatorios (
                mensaje_recordatorio,
                programada_para,
                id_estado_programacion_fk,
                id_tipo_item_fk,
                id_frecuencia_fk
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                mensaje,
                programada_para,
                estado[0].estado,
                tipo_item,
                frecuencia
            ]
        );

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Recordatorio creado con éxito',
            id: result.insertId
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

//VER LISTA DE RECORDATORIOS
exports.ver = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {

        //TRAIGO TODOS LOS RECORDATORIOS CON PROXIMO_ENVIO CALCULADO
        const [recordatorios] = await conn.query(`
            SELECT
                r.*,
                f.dias_intervalo,
                CASE
                    WHEN r.ultimo_envio IS NULL THEN r.programada_para
                    ELSE DATE_ADD(r.ultimo_envio, INTERVAL f.dias_intervalo DAY)
                END AS proximo_envio
            FROM tbl_recordatorios r
            JOIN cat_frecuencia_recordatorio f ON r.id_frecuencia_fk = f.id_frecuencia_record_pk
            ORDER BY r.id_recordatorio_pk DESC
        `);

        //PROCESO SOLO LOS RECORDATORIOS PENDIENTES DE ENVIAR
        for (const rec of recordatorios) {

            // Verifico si está pendiente de enviar
            if (rec.activo === 1 && (
                (rec.ultimo_envio === null && rec.programada_para <= new Date()) ||
                (rec.ultimo_envio !== null && rec.proximo_envio <= new Date())
            )) {

                try {

                    const [estado] = await conn.query(`
                        SELECT id_estado_pk AS estado
                        FROM cat_estados
                        WHERE dominio = 'RECORDATORIO' AND nombre_estado = 'ENVIADO'
                        LIMIT 1
                    `);

                    const nuevoEstado = estado[0].estado;

                    await enviarRecordatorio(rec);

                    await conn.query(`
                        UPDATE tbl_recordatorios
                        SET ultimo_envio = NOW(),
                            intentos = 0,
                            id_estado_programacion_fk = ?
                        WHERE id_recordatorio_pk = ?`,
                        [nuevoEstado, rec.id_recordatorio_pk]
                    );

                } catch (error) {

                    const [estado] = await conn.query(`
                        SELECT id_estado_pk AS estado
                        FROM cat_estados
                        WHERE dominio = 'RECORDATORIO' AND nombre_estado = 'FALLIDO'
                        LIMIT 1
                    `);

                    const estadoFallido = estado[0].estado;
                    const nuevoIntentos = rec.intentos + 1;

                    await conn.query(`
                        UPDATE tbl_recordatorios
                        SET intentos = ?,
                            id_estado_programacion_fk = ?,
                            activo = if(? >= 3, 0, 1)
                        WHERE id_recordatorio_pk = ?`,
                        [nuevoIntentos, estadoFallido, nuevoIntentos, rec.id_recordatorio_pk]);

                }
            }
        }

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
                programada_para = COALESCE(?, programada_para),
                id_tipo_item_fk = COALESCE(?, id_tipo_item_fk),
                id_frecuencia_fk = COALESCE(?, id_frecuencia_fk),
                activo = COALESCE(?, activo)
             WHERE id_recordatorio_pk = ?`,
            [
                req.body.mensaje_recordatorio || null,
                req.body.programada_para || null,
                req.body.id_tipo_item_fk || null,
                req.body.id_frecuencia_fk || null,
                req.body.activo || null,
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

        await conn.query(`
            DELETE FROM tbl_recordatorios
            WHERE id_recordatorio_pk = ?`, [id]);

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




