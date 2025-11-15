
const express = require('express');
const mysqlConnection = require('../config/conexion');

  //VARIABLES GLOBALES
    let fecha = new Date();
    let anio = fecha.getFullYear();
    let mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    let dia = fecha.getDate().toString().padStart(2, '0');
    let fecha_actual = `${anio}-${mes}-${dia}`;

//CRISTOFER - RESUMEN DIARIO
//ENDPOINT PARA LOS REPORTES DIARIOS
exports.reporteDiario = async (req, res) => {

  const conn = await mysqlConnection.getConnection();

  try{

    const [resultado] = await conn.query(`
      SELECT
        ? AS fecha,
        COALESCE(
            (SELECT SUM(total)
            FROM tbl_facturas
            WHERE DATE(fecha_emision) = ?), 0
        ) AS ingresos,
        COALESCE(
            (SELECT SUM(monto_gasto)
            FROM tbl_gastos
            WHERE DATE(fecha_registro_gasto) = ?), 0
        ) AS gastos
    `, [fecha_actual, fecha_actual, fecha_actual]);

    res.status(200).json({
      Consulta: true,
      mensaje: 'REPORTE DIARIO CARGADO',
      reporte: resultado || []
      // datos: resultado
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

//JAMES - TABLA DE REPORTES
//ENDPOINT PARA CONSULTAS DE INGRESOS, GASTOS Y GANANCIAS ANUALES, TODO MEDIANTE EL CIFRADO
exports.registroFinanciero = async (req, res) => {

  const conn = await mysqlConnection.getConnection();

  try {

    const { anio } = req.query;

    const [registros] = await conn.query(`
      SELECT
          YEAR(fecha) AS año,
          MONTH(fecha) AS mes,
          SUM(ingresos) AS total_ingresos,
          SUM(gastos) AS total_gastos,
          SUM(ingresos) - SUM(gastos) AS balance
      FROM (
          SELECT DATE(fecha_emision) AS fecha,
                total AS ingresos,
                0 AS gastos
          FROM tbl_facturas

          UNION ALL

          SELECT DATE(fecha_registro_gasto) AS fecha,
                0 AS ingresos,
                monto_gasto AS gastos
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

//ENDPOINT DE LAS VENTAS AL DIA DE HOY
exports.ventasDiarias = async (req, res) => {

  conn = await mysqlConnection.getConnection();

  try {

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