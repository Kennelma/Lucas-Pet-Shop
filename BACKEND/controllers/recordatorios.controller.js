
// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         IMPORTS Y CONEXIÓN MYSQL                         ║
// ╚════════════════════════════════════════════════════════════════════════════╝
const mysqlConnection = require('../config/conexion');

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                          VER CATALOGO (GENÉRICO)                         ║
// ╚════════════════════════════════════════════════════════════════════════════╝
exports.verCatalogo = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        let filas;

        switch (req.query.tipo_catalogo) {

            case 'FRECUENCIA':
                [filas] = await conn.query(`
                    SELECT id_frecuencia_record_pk, frecuencia_recordatorio
                    FROM cat_frecuencia_recordatorio
                    ORDER BY id_frecuencia_record_pk DESC
                `);
                break;

            case 'TELEFONO':
                [filas] = await conn.query(`
                    SELECT telefono_cliente
                    FROM tbl_clientes
                `);
                break;

            case 'ESTADO':
                [filas] = await conn.query(`
                    SELECT id_estado_pk, nombre_estado
                    FROM cat_estados
                    WHERE dominio = 'RECORDATORIO'
                `);
                break;

            case 'TIPO_SERVICIO':
                [filas] = await conn.query(`
                    SELECT id_tipo_item_pk, nombre_tipo_item
                    FROM cat_tipo_item
                    WHERE nombre_tipo_item != 'PRODUCTOS'
                `);

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

        //TRAIGO EL ID DEL ESTADO PENDIENTE
        const [estados] = await conn.query(`
            SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'RECORDATORIO' AND nombre_estado = 'PENDIENTE'
            LIMIT 1
        `);

        const pendiente_id = estados[0].id_estado_pk;

        const [frecuency] = await conn.query(`
            SELECT dias_intervalo
            FROM cat_frecuencia_recordatorio
            WHERE id_frecuencia_record_pk = ?
            LIMIT 1
        `, [frecuencia]);


        const diasIntervalo = frecuency[0].dias_intervalo;






        const [result] = await conn.query(
            `INSERT INTO tbl_recordatorios (
                mensaje_recordatorio,
                programada_para,
                proximo_envio,
                id_estado_programacion_fk,
                id_tipo_item_fk,
                id_frecuencia_fk
            ) VALUES (?, ?, DATE_ADD(?, INTERVAL ? DAY), ?, ?, ?)`,
            [
                mensaje,
                programada_para,
                programada_para,
                diasIntervalo,
                estadoId,
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
// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        VER LISTA DE RECORDATORIOS                        ║
// ╚════════════════════════════════════════════════════════════════════════════╝
exports.ver = async (req, res) => {
  const conn = await mysqlConnection.getConnection();
  try {
    const [recordatorios] = await conn.query(`
      SELECT
        r.*,
        f.dias_intervalo,
        f.frecuencia_recordatorio AS frecuencia_nombre,
        e.nombre_estado,
        COALESCE(
          r.proximo_envio,
          DATE_ADD(r.programada_para, INTERVAL f.dias_intervalo DAY)
        ) AS proximo_envio
      FROM tbl_recordatorios r
      JOIN cat_frecuencia_recordatorio f ON r.id_frecuencia_fk = f.id_frecuencia_record_pk
      JOIN cat_estados e ON r.id_estado_programacion_fk = e.id_estado_pk
      ORDER BY r.id_recordatorio_pk DESC
    `);

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



// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        ACTUALIZAR RECORDATORIO                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝


exports.actualizar = async (req, res) => {
  const conn = await mysqlConnection.getConnection();
  await conn.beginTransaction();
  try {
    const {
      id_recordatorio,
      mensaje_recordatorio,
      programada_para,
      id_tipo_item_fk,
      id_frecuencia_fk,
      activo
    } = req.body;

    if (!id_recordatorio) throw new Error('id_recordatorio es requerido');

    // Obtener el estado PENDIENTE
    const [estadoPendiente] = await conn.query(`
      SELECT id_estado_pk
      FROM cat_estados
      WHERE dominio = 'RECORDATORIO' AND nombre_estado = 'PENDIENTE'
      LIMIT 1
    `);

    const idEstadoPendiente = estadoPendiente?.[0]?.id_estado_pk;

    // Recalcula proximo_envio si llega programada_para o id_frecuencia_fk
    await conn.query(`
      UPDATE tbl_recordatorios r
      JOIN cat_frecuencia_recordatorio f
        ON f.id_frecuencia_record_pk = COALESCE(?, r.id_frecuencia_fk)
      SET
        r.mensaje_recordatorio = COALESCE(?, r.mensaje_recordatorio),
        r.programada_para     = COALESCE(?, r.programada_para),
        r.id_tipo_item_fk     = COALESCE(?, r.id_tipo_item_fk),
        r.id_frecuencia_fk    = COALESCE(?, r.id_frecuencia_fk),
        r.activo              = COALESCE(?, r.activo),
        r.id_estado_programacion_fk = ?,
        r.intentos = 0,
        r.ultimo_envio = NULL,
        r.proximo_envio       = CASE
          WHEN ? IS NOT NULL OR ? IS NOT NULL
            THEN DATE_ADD(COALESCE(?, r.programada_para), INTERVAL f.dias_intervalo DAY)
          ELSE r.proximo_envio
        END
      WHERE r.id_recordatorio_pk = ?`,
      [
        id_frecuencia_fk,
        mensaje_recordatorio ?? null,
        programada_para ?? null,
        id_tipo_item_fk ?? null,
        id_frecuencia_fk ?? null,
        (activo === 0 || activo === 1) ? activo : null,
        idEstadoPendiente,
        programada_para ?? null,
        id_frecuencia_fk ?? null,
        programada_para ?? null,
        id_recordatorio
      ]
    );

    await conn.commit();
    res.status(200).json({ Consulta: true, mensaje: 'Recordatorio actualizado con éxito', id_recordatorio });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ Consulta: false, error: err.message });
  } finally {
    conn.release();
  }
};

exports.eliminar = async (req, res) => {
  const conn = await mysqlConnection.getConnection();
  await conn.beginTransaction();

  try {
    const { id_recordatorio } = req.body;

    await conn.query(`
      DELETE FROM tbl_recordatorios
      WHERE id_recordatorio_pk = ?
    `, [id_recordatorio]);

    await conn.commit();
    res.status(200).json({
        Consulta: true,
        mensaje: 'Recordatorio eliminado con éxito',
        id_recordatorio
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
