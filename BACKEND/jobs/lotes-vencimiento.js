const cron = require('node-cron');
const mysqlConnection = require('../config/conexion');


//TAREA AUTOMATICA DE ESTADO DE LOTES
cron.schedule('*/2 * * * *', async () => { // CADA 5 HORAS

  const conn = await mysqlConnection.getConnection();

  //VARIABLES GLOBALES
  let fecha = new Date();
  let anio = fecha.getFullYear();
  let mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  let dia = fecha.getDate().toString().padStart(2, '0');
  let fecha_actual = `${anio}-${mes}-${dia}`;


  try {

    //OBTENGO LOS ID DE ESTADOS USADOS EN LOTAJE
    const [estados] = await conn.query(`
      SELECT
        e.id_estado_pk, e.nombre_estado
      FROM cat_estados e
      WHERE e.dominio = 'LOTE_MEDICAMENTO'
        AND e.nombre_estado IN ('AGOTADO', 'POR ACABARSE', 'DISPONIBLE', 'CADUCADO')
    `);

    //MAPEO LOS ESTADOS PARA FACILITAR SU USO
    const estadoMap = {};
    estados.forEach(estado => {
      estadoMap[estado.nombre_estado] = estado.id_estado_pk;
    });

    const idAgotado = estadoMap['AGOTADO'];
    const idPorAcabarse = estadoMap['POR ACABARSE'];
    const idDisponible = estadoMap['DISPONIBLE'];
    const idCaducado = estadoMap['CADUCADO'];

    //SE ACTUALIZAN LOS LOTES SEGUN SU LA CONDICION
    await conn.query(`
      UPDATE tbl_lotes_medicamentos l
      INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
      INNER JOIN tbl_productos p ON m.id_producto_fk = p.id_producto_pk
      SET l.estado_lote_fk =
        CASE
          WHEN l.fecha_vencimiento <= ? THEN ?
          WHEN l.stock_lote = 0 THEN ?
          WHEN l.stock_lote <= p.stock_minimo THEN ?
          WHEN l.fecha_vencimiento > ? AND l.stock_lote > p.stock_minimo THEN ?
        END
    `, [fecha_actual, idCaducado, idAgotado, idPorAcabarse, fecha_actual, idDisponible]);

    console.log(`ESTADO DE LOTES ACTUALIZADOS (${fecha_actual})`);

  } catch (error) {
      console.error('ERROR AL ACTUALIZAR ESTADO DE LOTES:', error.message);
  } finally {
    conn.release();
  }
});


//TAREA AUTOMATICA DE NOTIFICACION QUE SE MUESTRA
cron.schedule('*/1 * * * *', async () => {

  const conn = await mysqlConnection.getConnection();

  try {

    //FECHA DEL SISTEMA
    let fecha = new Date();
    let anio = fecha.getFullYear();
    let mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    let dia = fecha.getDate().toString().padStart(2, '0');
    let fecha_actual = `${anio}-${mes}-${dia}`;

    await conn.query(`
      INSERT INTO tbl_notificaciones (mensaje_notificacion, fecha_creacion, tipo_notificacion_fk)
      SELECT
        CASE
          WHEN l.stock_lote = 0 THEN
            CONCAT(p.nombre_producto, ' (', l.codigo_lote, ')')

          WHEN l.fecha_vencimiento < ? THEN
            CONCAT('LOTE VENCIDO: ', p.nombre_producto, ' (', l.codigo_lote, ')')

          WHEN DATEDIFF(l.fecha_vencimiento, ?) <= 30 THEN
            CONCAT('VENCE EN ', DATEDIFF(l.fecha_vencimiento, ?), ' DÍAS: ', p.nombre_producto, ' (', l.codigo_lote, ')')

            WHEN DATEDIFF(l.fecha_vencimiento, ?) = 60 THEN
            CONCAT('VENCE EN 60 DÍAS: ', p.nombre_producto, ' (', l.codigo_lote, ')')

            WHEN DATEDIFF(l.fecha_vencimiento, ?) = 90 THEN
            CONCAT('VENCE EN 90 DÍAS: ', p.nombre_producto, ' (', l.codigo_lote, ')')
        END AS mensaje,
        ? AS fecha,

        CASE
          WHEN l.fecha_vencimiento < ? THEN
            (SELECT id_tipo_notificacion_pk FROM cat_tipo_notificacion WHERE nombre_tipo_notificacion = 'LOTE_VENCIDO' LIMIT 1)
          ELSE
            (SELECT id_tipo_notificacion_pk FROM cat_tipo_notificacion WHERE nombre_tipo_notificacion = 'LOTE_PROXIMO_VENCER' LIMIT 1)
        END AS tipo

        FROM tbl_lotes_medicamentos l
      INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
      INNER JOIN tbl_productos p ON m.id_producto_fk = p.id_producto_pk
      WHERE (
        l.stock_lote = 0                                    
        OR l.fecha_vencimiento < ?
        OR DATEDIFF(l.fecha_vencimiento, ?) IN (30, 60, 90)
      )
      AND NOT EXISTS (
        SELECT 1 FROM tbl_notificaciones n
        WHERE n.mensaje_notificacion LIKE CONCAT('%', l.codigo_lote, '%')
          AND leido = FALSE
      )
    `, [
      fecha_actual, //CASE WHEN l.fecha_vencimiento < ?
      fecha_actual, //DATEDIFF(l.fecha_vencimiento, ?) <= 30
      fecha_actual, //DATEDIFF(l.fecha_vencimiento, ?) [para calcular días]
      fecha_actual, //DATEDIFF = 60
      fecha_actual, //DATEDIFF = 90
      fecha_actual, //NOW() reemplazado por fecha_actual
      fecha_actual, //CASE WHEN l.fecha_vencimiento < ?
      fecha_actual, //WHERE l.fecha_vencimiento < ?
      fecha_actual //DATEDIFF(l.fecha_vencimiento, ?) IN (30,60,90)
    ]);

    console.log(`NOTIFICACIONES PROCESADAS (${fecha_actual})`);

  } catch (error) {
    console.error('ERROR EN NOTIFICACIONES:', error?.message);
  } finally {
    conn.release();
  }

});


//TAREA AUTOMATICA DE LIMPIEZA DE NOTIFICACIONES VIEJAS DIARIAS A LAS 3 DE LA MAÑANA
cron.schedule('0 3 * * *', async () => {

  const conn = await mysqlConnection.getConnection();

  try {

    //FECHA LÍMITE (7 DÍAS ATRÁS)
    let fecha = new Date();
    fecha.setDate(fecha.getDate() - 7);
    let anio = fecha.getFullYear();
    let mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    let dia = fecha.getDate().toString().padStart(2, '0');
    let fecha_limite = `${anio}-${mes}-${dia}`;

    const [result] = await conn.query(`
      DELETE FROM tbl_notificaciones
      WHERE DATE(fecha_creacion) < ?
    `, [fecha_limite]);

    console.log(`NOTIFICACIONES ELIMINADAS HASTA: ${fecha_limite} - TOTAL: ${result.affectedRows}`);

  } catch (error) {
    console.error('ERROR EN LA LIMPIEZA DE NOTIFICACIONES:', error?.message);
  } finally {
    conn.release();
  }

});

module.exports = {};
