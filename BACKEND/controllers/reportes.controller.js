const express = require('express');
const mysqlConnection = require('../config/conexion');



//====================REPORTE_DIARIO====================
//OBTIENE EL RESUMEN DE INGRESOS Y GASTOS DEL DÍA ACTUAL //ENCABEZADO DE CRISTOFER
exports.reporteDiario = async (req, res) => {

  const conn = await mysqlConnection.getConnection();

  try{

    // FECHA ACTUAL EN ZONA HORARIA DE HONDURAS
    let fecha = new Date();
    let fechaHonduras = new Date(fecha.toLocaleString('en-US', {
      timeZone: 'America/Tegucigalpa'
    }));

    let anio = fechaHonduras.getFullYear();
    let mes = (fechaHonduras.getMonth() + 1).toString().padStart(2, '0');
    let dia = fechaHonduras.getDate().toString().padStart(2, '0');
    let fecha_actual = `${anio}-${mes}-${dia}`;

    const [resultado] = await conn.query(`
      SELECT
        ? AS fecha,
        COALESCE(
            (SELECT CAST(SUM(pa.monto) AS DECIMAL(10,2))
            FROM tbl_pago_aplicacion pa
            INNER JOIN tbl_pagos p ON pa.id_pago_fk = p.id_pago_pk
            WHERE DATE(p.fecha_pago) = ?), 0.00
        ) AS ingresos,
        COALESCE(
            (SELECT CAST(SUM(monto_gasto) AS DECIMAL(10,2))
            FROM tbl_gastos
            WHERE DATE(fecha_registro_gasto) = ?), 0.00
        ) AS gastos
    `, [fecha_actual, fecha_actual, fecha_actual]);

    res.status(200).json({
      Consulta: true,
      mensaje: 'REPORTE DIARIO CARGADO',
      reporte: resultado || []
    });

  } catch (error) {
    res.status(500).json({
      Consulta: false,
      error: error.message
    });
  } finally {
    if (conn) conn.release();
  }

};


//CRISTOFER - REGISTRO FINANCIERO DIARIO (GRAFICO DE BARRAS)
exports.registroFinanciero = async (req, res) => {

  const conn = await mysqlConnection.getConnection();

  try {

    const { anio } = req.query;

    const [registros] = await conn.query(`
      SELECT
          YEAR(fecha) AS año,
          MONTH(fecha) AS mes,
          CAST(SUM(ingresos) AS DECIMAL(10,2)) AS total_ingresos,
          CAST(SUM(gastos) AS DECIMAL(10,2)) AS total_gastos,
          CAST(SUM(ingresos) - SUM(gastos) AS DECIMAL(10,2)) AS balance
      FROM (
          SELECT DATE(p.fecha_pago) AS fecha,
                CAST(pa.monto AS DECIMAL(10,2)) AS ingresos,
                0.00 AS gastos
          FROM tbl_pago_aplicacion pa
          INNER JOIN tbl_pagos p ON pa.id_pago_fk = p.id_pago_pk

          UNION ALL

          SELECT DATE(fecha_registro_gasto) AS fecha,
                0.00 AS ingresos,
                CAST(monto_gasto AS DECIMAL(10,2)) AS gastos
          FROM tbl_gastos

      ) AS datos
      WHERE YEAR(fecha) = ?
      GROUP BY YEAR(fecha), MONTH(fecha)
      ORDER BY año, mes`, [anio]
    );

    res.status(200).json({
      Consulta: true,
      mensaje: 'REPORTES DE GRAFICO Y TABLA CARGADOS',
      registros: registros
    });

  } catch (error) {
    res.status(500).json({
      Consulta: false,
      error: error.message
    });
  } finally {
    if (conn) conn.release();
  }
};

//====================VENTAS_DIARIAS====================
//OBTIENE LOS 10 ITEMS MÁS VENDIDOS DEL DÍA ACTUAL
exports.ventasDiarias = async (req, res) => {

  const conn = await mysqlConnection.getConnection();

  try {

    // FECHA ACTUAL EN ZONA HORARIA DE HONDURAS
    let fecha = new Date();
    let fechaHonduras = new Date(fecha.toLocaleString('en-US', {
      timeZone: 'America/Tegucigalpa'
    }));

    let anio = fechaHonduras.getFullYear();
    let mes = (fechaHonduras.getMonth() + 1).toString().padStart(2, '0');
    let dia = fechaHonduras.getDate().toString().padStart(2, '0');
    let fecha_actual = `${anio}-${mes}-${dia}`;

    const [ventas] = await conn.query(`
      SELECT
          df.nombre_item,
          SUM(df.cantidad_item) AS total_vendido
      FROM tbl_detalles_facturas df
      INNER JOIN tbl_facturas f ON df.id_factura_fk = f.id_factura_pk
      WHERE DATE(f.fecha_emision) = ?
      GROUP BY df.nombre_item
      ORDER BY total_vendido DESC
      LIMIT 10
      `, [fecha_actual]
    );

    res.status(200).json({
      Consulta: true,
      mensaje: 'REPORTE DE VENTAS DIARIAS CARGADO',
      ventas: ventas || []
    });

  } catch (error) {

    res.status(500).json({
      Consulta: false,
      error: error.message
    });

  } finally {
    if (conn) conn.release();
  }
};


//====================HISTORIAL_REPORTES====================
//OBTIENE EL HISTORIAL COMPLETO DE INGRESOS Y GASTOS POR FECHA ESPECÍFICA
exports.historialReportes = async (req, res) => {

  const conn = await mysqlConnection.getConnection();

  try {

    const { anio, mes, dia } = req.query;

    const [historial] = await conn.query(`
      SELECT
          YEAR(fecha) AS año,
          MONTH(fecha) AS mes,
          DAY(fecha) AS dia,
          DATE(fecha) AS fecha_completa,
          COUNT(DISTINCT numero_factura) AS cantidad_facturas,
          CAST(SUM(ingresos) AS DECIMAL(10,2)) AS total_ingresos,
          CAST(SUM(gastos) AS DECIMAL(10,2)) AS total_gastos,
          CAST(SUM(ingresos) - SUM(gastos) AS DECIMAL(10,2)) AS balance
      FROM (
          SELECT DATE(p.fecha_pago) AS fecha,
                CAST(pa.monto AS DECIMAL(10,2)) AS ingresos,
                0.00 AS gastos,
                f.id_factura_pk AS numero_factura
          FROM tbl_pago_aplicacion pa
          INNER JOIN tbl_pagos p ON pa.id_pago_fk = p.id_pago_pk
          INNER JOIN tbl_facturas f ON pa.id_factura_fk = f.id_factura_pk

          UNION ALL

          SELECT DATE(fecha_registro_gasto) AS fecha,
                0.00 AS ingresos,
                CAST(monto_gasto AS DECIMAL(10,2)) AS gastos,
                NULL AS numero_factura
          FROM tbl_gastos
      ) AS datos
      WHERE YEAR(fecha) = ?
        AND MONTH(fecha) = ?
        AND DAY(fecha) = ?
      GROUP BY YEAR(fecha), MONTH(fecha), DAY(fecha), DATE(fecha)
      ORDER BY año, mes, dia`, [anio, mes, dia]);

    res.status(200).json({
      Consulta: true,
      mensaje: 'HISTORIAL DE REPORTES CARGADO',
      historial: historial || []
    });

  } catch (error) {

    res.status(500).json({
      Consulta: false,
      error: error.message
    });

  } finally {
    if (conn) conn.release();
  }

};



//====================REPORTES_DETALLADOS====================
//OBTIENE EL DETALLE COMPLETO DE INGRESOS Y GASTOS POR FECHA (CON CONCEPTOS)
exports.reportesDetallados = async (req, res) => {

  const conn = await mysqlConnection.getConnection();

  try {

    const { fecha_reporte } = req.query;

    const [detalles] = await conn.query(`
      SELECT
          'INGRESO' AS tipo_movimiento,
          p.fecha_pago AS fecha,
          f.numero_factura AS documento,
          CONCAT(
            (SELECT GROUP_CONCAT(CONCAT(df2.nombre_item, ' (', df2.cantidad_item, ') - L.', CAST(df2.precio_item AS DECIMAL(10,2))) SEPARATOR ', ')
             FROM tbl_detalles_facturas df2
             WHERE df2.id_factura_fk = f.id_factura_pk),
            ' | Pago: ', tp.tipo_pago, ' en ', mp.metodo_pago, ' (L.', CAST(pa.monto AS DECIMAL(10,2)), ')'
          ) AS concepto,
          CAST(pa.monto AS DECIMAL(10,2)) AS monto
      FROM tbl_pago_aplicacion pa
      INNER JOIN tbl_facturas f ON pa.id_factura_fk = f.id_factura_pk
      INNER JOIN tbl_pagos p ON pa.id_pago_fk = p.id_pago_pk
      INNER JOIN cat_tipo_pago tp ON p.id_tipo_pago_fk = tp.id_tipo_pago_pk
      INNER JOIN cat_metodo_pago mp ON p.id_metodo_pago_fk = mp.id_metodo_pago_pk
      WHERE DATE(p.fecha_pago) = ?

      UNION ALL

      SELECT
          'GASTO' AS tipo_movimiento,
          g.fecha_registro_gasto AS fecha,
          CONCAT('GASTO #', g.id_gasto_pk) AS documento,
          CONCAT(g.detalle_gasto, ' - L.', CAST(g.monto_gasto AS DECIMAL(10,2))) AS concepto,
          CAST(g.monto_gasto AS DECIMAL(10,2)) AS monto
      FROM tbl_gastos g
      WHERE DATE(g.fecha_registro_gasto) = ?

      ORDER BY fecha, documento
    `, [fecha_reporte, fecha_reporte]);

    res.status(200).json({
      Consulta: true,
      mensaje: 'REPORTES DETALLADOS CARGADOS',
      detalles: detalles || []
    });

  } catch (error) {
    res.status(500).json({
      Consulta: false,
      error: error.message
    });

  } finally {
    if (conn) conn.release();
  }

};