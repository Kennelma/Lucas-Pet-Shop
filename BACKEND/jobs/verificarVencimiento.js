import cron from 'node-cron';
const mysqlConnection = require('../config/conexion');

cron.schedule('0 0 * * *', { timezone: 'America/Tegucigalpa' }, async () => {

  const conn = await mysqlConnection.getConnection();
  try {
    await conn.beginTransaction();

    //SE OBTIENEN EL ID DEL ESTADO 'CADUCADO'
    const [[cad]] = await conn.query(`
      SELECT
        id_estado_pk AS id
      FROM cat_estados
      WHERE dominio = 'LOTE_MEDICAMENTO' AND nombre_estado = 'CADUCADO'
      LIMIT 1
    `);



    //SE ACTUALIZAN LOS LOTES CADUCADOS
    await conn.query(
      `UPDATE tbl_lotes_medicamentos l
      SET l.estado_lote_fk = ?
      WHERE l.fecha_vencimiento < CURDATE()
        AND (l.estado_lote_fk IS NULL OR l.estado_lote_fk <> ?)
      `,
      [cad.id, cad.id]
    );


    //Helper para insertar notifs sin duplicar
    async function insertNotif(rangeSqlCond, plantillaId, titulo) {
      await conn.query(
        `
        INSERT INTO tbl_notificaciones (nombre_notificacion, plantilla_id_fk, id_lote_fk)
        SELECT
          CONCAT('Lote ', l.codigo_lote, ' ${titulo}') AS nombre_notificacion,
          ? AS plantilla_id_fk,
          l.id_lote_medicamentos_pk AS id_lote_fk
        FROM tbl_lotes_medicamentos l
        LEFT JOIN tbl_notificaciones n
          ON n.id_lote_fk = l.id_lote_medicamentos_pk
         AND n.plantilla_id_fk = ?
        WHERE ${rangeSqlCond}
          AND n.id_lote_fk IS NULL
        `,
        [plantillaId, plantillaId]
      );
    }

    //3) Notificación: VENCIDO (plantilla 4)
    await insertNotif(
      `l.fecha_vencimiento < CURDATE()`,
      4,
      'vencido'
    );

    //4) Notificación: por vencer 0–30 días (plantilla 1)
    await insertNotif(
      `DATEDIFF(l.fecha_vencimiento, CURDATE()) BETWEEN 1 AND 30`,
      1,
      'por vencer (30 días)'
    );

    //5) Notificación: por vencer 31–60 días (plantilla 2)
    await insertNotif(
      `DATEDIFF(l.fecha_vencimiento, CURDATE()) BETWEEN 31 AND 60`,
      2,
      'por vencer (60 días)'
    );

    //6) Notificación: por vencer 61–90 días (plantilla 3)
    await insertNotif(
      `DATEDIFF(l.fecha_vencimiento, CURDATE()) BETWEEN 61 AND 90`,
      3,
      'por vencer (90 días)'
    );

    await conn.commit();
    console.log('Job completado correctamente.');
  } catch (err) {
    await conn.rollback();
    console.error('Error en job:', err);
  } finally {
    conn.release();
  }
});