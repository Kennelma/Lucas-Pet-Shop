
import cron from 'node-cron';
const mysqlConnection = require('../config/conexion');

cron.schedule('0 0 * * *', async () => {

  const conn = await pool.getConnection();
  try {
    await conn.query(`
      UPDATE tbl_lotes_medicamentos
      SET estado_lote_fk = 'VENCIDO'
      WHERE fecha_vencimiento <= CURDATE()
    `);


    await conn.query(`
      INSERT INTO tbl_notificaciones (nombre_notificacion, plantilla_id_fk)
      SELECT CONCAT('Lote ', codigo_lote, ' vencido'), 4
      FROM tbl_lotes_medicamentos
      WHERE fecha_vencimiento <= CURDATE()
        AND id_lote_medicamentos_pk NOT IN (
          SELECT id_lote_fk FROM tbl_notificaciones WHERE plantilla_id_fk = 4
        )
    `);

    await conn.query(`
      INSERT INTO tbl_notificaciones (nombre_notificacion, plantilla_id_fk)
      SELECT CONCAT('Lote ', codigo_lote, ' por vencer (30 días)'), 1
      FROM tbl_lotes_medicamentos
      WHERE DATEDIFF(fecha_vencimiento, CURDATE()) <= 30
        AND DATEDIFF(fecha_vencimiento, CURDATE()) > 0
        AND id_lote_medicamentos_pk NOT IN (
          SELECT id_lote_fk FROM tbl_notificaciones WHERE plantilla_id_fk = 1
        )
    `);


    await conn.query(`
      INSERT INTO tbl_notificaciones (nombre_notificacion, plantilla_id_fk)
      SELECT CONCAT('Lote ', codigo_lote, ' por vencer (60 días)'), 2
      FROM tbl_lotes_medicamentos
      WHERE DATEDIFF(fecha_vencimiento, CURDATE()) <= 60
        AND DATEDIFF(fecha_vencimiento, CURDATE()) > 30
        AND id_lote_medicamentos_pk NOT IN (
          SELECT id_lote_fk FROM tbl_notificaciones WHERE plantilla_id_fk = 2
        )
    `);


    await conn.query(`
      INSERT INTO tbl_notificaciones (nombre_notificacion, plantilla_id_fk)
      SELECT CONCAT('Lote ', codigo_lote, ' por vencer (90 días)'), 3
      FROM tbl_lotes_medicamentos
      WHERE DATEDIFF(fecha_vencimiento, CURDATE()) <= 90
        AND DATEDIFF(fecha_vencimiento, CURDATE()) > 60
        AND id_lote_medicamentos_pk NOT IN (
          SELECT id_lote_fk FROM tbl_notificaciones WHERE plantilla_id_fk = 3
        )
    `);

    console.log('✅ Job completado correctamente.');
  } catch (err) {
    console.error('Error en job:', err);
  } finally {
    conn.release();
  }
});