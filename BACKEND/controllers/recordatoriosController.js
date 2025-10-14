const mysqlConnection = require('../config/conexion');

// CREAR
exports.crear = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();
    try {
        const { mensaje_recordatorio, programada_para, id_estado_programacion_fk, id_cliente_fk, id_tipo_item_fk, id_frecuencia_fk } = req.body;
        const [result] = await conn.query(
            `INSERT INTO tbl_recordatorios 
            (mensaje_recordatorio, programada_para, ultimo_envio, intentos, ultimo_error, id_estado_programacion_fk, id_cliente_fk, id_tipo_item_fk, id_frecuencia_fk, activo)
            VALUES (?, ?, NULL, 0, NULL, ?, ?, ?, ?, 1)`,
            [mensaje_recordatorio, programada_para, id_estado_programacion_fk, id_cliente_fk, id_tipo_item_fk, id_frecuencia_fk]
        );
        await conn.commit();
        res.status(200).json({ Consulta: true, mensaje: 'Recordatorio creado con éxito', id_recordatorio: result.insertId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};

// VER RECORDATORIOS ACTIVOS
exports.ver = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        const [result] = await conn.query(`CALL sp_ver_recordatorios_activos()`);
        res.status(200).json({ Consulta: true, recordatorios: result[0] || [] });
    } catch (err) {
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};

// ACTUALIZAR
exports.actualizar = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();
    try {
        const { id_recordatorio_pk } = req.body;
        await conn.query(`
            UPDATE tbl_recordatorios
            SET mensaje_recordatorio = COALESCE(?, mensaje_recordatorio),
                programada_para = COALESCE(?, programada_para),
                id_estado_programacion_fk = COALESCE(?, id_estado_programacion_fk),
                id_cliente_fk = COALESCE(?, id_cliente_fk),
                id_tipo_item_fk = COALESCE(?, id_tipo_item_fk),
                id_frecuencia_fk = COALESCE(?, id_frecuencia_fk),
                activo = COALESCE(?, activo)
            WHERE id_recordatorio_pk = ?`,
            [
                req.body.mensaje_recordatorio || null,
                req.body.programada_para || null,
                req.body.id_estado_programacion_fk || null,
                req.body.id_cliente_fk || null,
                req.body.id_tipo_item_fk || null,
                req.body.id_frecuencia_fk || null,
                req.body.activo || null,
                id_recordatorio_pk
            ]
        );
        await conn.commit();
        res.status(200).json({ Consulta: true, mensaje: 'Recordatorio actualizado con éxito', id_recordatorio_pk });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};

// ELIMINAR
exports.eliminar = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();
    try {
        const { id } = req.body;
        await conn.query(`DELETE FROM tbl_recordatorios WHERE id_recordatorio_pk = ?`, [id]);
        await conn.commit();
        res.status(200).json({ Consulta: true, mensaje: 'Recordatorio eliminado con éxito', id });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};

// TRAER TIPOS DE ITEM
exports.verTiposItem = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        const [tipos] = await conn.query(`SELECT * FROM tbl_tipos_item ORDER BY id_tipo_item_pk ASC`);
        res.status(200).json({ Consulta: true, tipos: tipos || [] });
    } catch (err) {
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};

// TRAER FRECUENCIAS
exports.verFrecuencias = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        const [frecuencias] = await conn.query(`SELECT * FROM cat_frecuencia_recordatorio ORDER BY id_frecuencia_record_pk ASC`);
        res.status(200).json({ Consulta: true, frecuencias: frecuencias || [] });
    } catch (err) {
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};
