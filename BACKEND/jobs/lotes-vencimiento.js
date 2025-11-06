const cron = require('node-cron');
const mysqlConnection = require('../config/conexion');

cron.schedule('0 */5 * * * *', async () => { //CADA 5 MINUTOS

  const conn = await mysqlConnection.getConnection();

  try {

    await conn.beginTransaction();

    //OBTENGO EL ID DEL ESTADO 'CADUCADO' PARA LOTES DE MEDICAMENTOS
    const [estado] = await conn.query(`
      SELECT id_estado_pk AS id
      FROM cat_estados
      WHERE dominio = 'LOTE_MEDICAMENTO'
        AND nombre_estado = 'CADUCADO'
      LIMIT 1
    `);

    //LOTES YA VENCIDOS, ACTUALIZO SU ESTADO A 'CADUCADO' A TODOS ESOS LOTES
    await conn.query(`
      UPDATE tbl_lotes_medicamentos
      SET estado_lote_fk = ?
      WHERE fecha_vencimiento <= CURDATE()
        AND estado_lote_fk != ?`,
      [estado[0].id, estado[0].id]
    );

    //OBTENGO LOS IDS DE TIPO DE NOTIFICACIONES PARA LOTES VENCIDOS Y POR VENCER
    const [tipos_notificaciones] = await conn.query(`
    SELECT
      id_tipo_notificacion_pk,
      nombre_tipo_notificacion
    FROM cat_tipo_notificacion
    WHERE nombre_tipo_notificacion IN ('LOTE_VENCIDO', 'LOTE_PROXIMO_VENCER')
    `);

    //VALIDACION DE TIPOS DE NOTIFICACIONES
    const tiposMap = {};
    if (tipos_notificaciones.length === 0) {
      throw new Error('TIPOS DE NOTIFICACIONES PARA LOTES NO ENCONTRADOS');
    } else {
      tipos_notificaciones.forEach(tn => {
        tiposMap[tn.nombre_tipo_notificacion] = {
          id: tn.id_tipo_notificacion_pk
        };
      });
    }

    //OBTENGO LOS LOTES VENCIDOS PARA CREAR NOTIFICACIONES
    const [lotes_vencidos] = await conn.query(`
        SELECT
          l.id_lote_medicamentos_pk,
          p.nombre_producto,
          l.codigo_lote,
          l.fecha_vencimiento,
          DATEDIFF(CURDATE(), l.fecha_vencimiento) as dias_vencido
        FROM tbl_lotes_medicamentos l
        INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
        INNER JOIN tbl_productos p ON m.id_producto_fk = p.id_producto_pk
        WHERE l.fecha_vencimiento < CURDATE()
        AND l.estado_lote_fk = ?
      `, [estado[0].id]);

    const fecha_creacion = new Date(); //FECHA DEL SISTEMA DONDE CORRE NODE

    //CREO NOTIFICACIONES PARA LOTES VENCIDOS
    if (lotes_vencidos.length > 0) {
      for (let i = 0; i < lotes_vencidos.length; i++) {
        const L = lotes_vencidos[i];
        const mensaje = `EL MEDICAMENTO ${L.nombre_producto}, TIENE EL ${L.codigo_lote} VENCIDO. ES NECESARIO TOMAR ACCIÓN`;
        const tipo_notificacion_fk = tiposMap['LOTE_VENCIDO'].id;

        // ---- INSERT ATÓMICO: SOLO SI NO EXISTE UNA ACTIVA PARA ESTE LOTE ----
        await conn.query(`
          INSERT INTO tbl_notificaciones (mensaje_notificacion, fecha_creacion, tipo_notificacion_fk)
          SELECT ?, ?, ?
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1
            FROM tbl_notificaciones
            WHERE tipo_notificacion_fk = ?
              AND mensaje_notificacion LIKE CONCAT('%', ?, '%') -- usa el codigo_lote como llave
              AND leido = FALSE
            LIMIT 1
          )
        `, [mensaje, fecha_creacion, tipo_notificacion_fk, tipo_notificacion_fk, L.codigo_lote]);
        // ---------------------------------------------------------------------
      }
    }

    //BLOQUE PARA CREAR NOTIFICACIONES DE LOTES POR VENCER EN 30, 60 Y 90 DÍAS
    const [lotes_proximos_vencer] = await conn.query(`
      SELECT
        l.id_lote_medicamentos_pk,
        p.nombre_producto,
        l.codigo_lote,
        l.fecha_vencimiento,
        DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_para_vencer
      FROM tbl_lotes_medicamentos l
      INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
      INNER JOIN tbl_productos p ON m.id_producto_fk = p.id_producto_pk
      WHERE DATEDIFF(l.fecha_vencimiento, CURDATE()) IN (30, 60, 90)
        AND l.estado_lote_fk != ?
      `, [estado[0].id]);

    if (lotes_proximos_vencer.length > 0) {
      for (let i = 0; i < lotes_proximos_vencer.length; i++) {
        const L = lotes_proximos_vencer[i];
        const mensaje = `EL MEDICAMENTO ${L.nombre_producto} CON EL ${L.codigo_lote}, SE VENCE EN ${L.dias_para_vencer} DÍAS (FECHA ${L.fecha_vencimiento.toISOString ? L.fecha_vencimiento.toISOString().slice(0,10) : L.fecha_vencimiento}).`;
        const tipo_notificacion_fk = tiposMap['LOTE_PROXIMO_VENCER'].id;

        // ---- INSERT ATÓMICO: SOLO SI NO EXISTE UNA ACTIVA PARA ESTE LOTE ----
        await conn.query(`
          INSERT INTO tbl_notificaciones (mensaje_notificacion, fecha_creacion, tipo_notificacion_fk)
          SELECT ?, ?, ?
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1
            FROM tbl_notificaciones
            WHERE tipo_notificacion_fk = ?
              AND mensaje_notificacion LIKE CONCAT('%', ?, '%') -- usa el codigo_lote como llave
              AND leido = FALSE
            LIMIT 1
          )
        `, [mensaje, fecha_creacion, tipo_notificacion_fk, tipo_notificacion_fk, L.codigo_lote]);
        // ---------------------------------------------------------------------
      }
    }

    await conn.commit();
    
  } catch (error) {

    await conn.rollback();
    console.error('[CRON][LOTES] Error:', error?.message || error);

  } finally {
     conn.release();
  }

}, { timezone: 'America/Tegucigalpa' });



//JOB QUE SE EJECUTA  DIARIAMENTE (2 AM) PARA PURGAR NOTIFICACIONES LEÍDAS ANTERIORES A 30 DÍAS
cron.schedule('0 0 * * *', async () => {  // Se ejecuta diariamente a medianoche

    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();
    try {
        const [resultado] = await conn.query(`
            DELETE FROM tbl_notificaciones
            WHERE leido = TRUE
        `);

        console.log(`PURGA COMPLETADA: ${resultado.affectedRows} notificaciones eliminadas`);

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        console.error('ERROR EN EL JOB DE PURGA:', error);
    } finally {
        conn.release();
    }
}, { timezone: 'America/Tegucigalpa' });