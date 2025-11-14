const pool = require('../config/conexion');

//OBTENER_REGISTRO_DE_INGRESOS
const registroIngresos = async (req, res) => {
  try {
    const query = `
      SELECT
        DATE(fecha_emision) as fecha,
        COUNT(*) as total_facturas,
        SUM(total_factura) as ingresos_totales,
        SUM(impuesto) as impuestos,
        SUM(descuento) as descuentos
      FROM FACTURAS
      WHERE estado_factura = 'COMPLETADA'
      GROUP BY DATE(fecha_emision)
      ORDER BY fecha DESC
    `;

    const [result] = await pool.query(query);

    res.json({
      Consulta: true,
      ingresos: result
    });
  } catch (error) {
    console.error('Error al obtener registro de ingresos:', error);
    res.status(500).json({
      Consulta: false,
      error: 'Error al obtener registro de ingresos'
    });
  }
};

//OBTENER_REGISTRO_DE_GASTOS
const registrosGastos = async (req, res) => {
  try {
    const query = `
      SELECT
        DATE(fecha_registro_gasto) as fecha,
        COUNT(*) as total_gastos,
        SUM(monto_gasto) as gastos_totales
      FROM GASTOS
      GROUP BY DATE(fecha_registro_gasto)
      ORDER BY fecha DESC
    `;

    const [result] = await pool.query(query);

    res.json({
      Consulta: true,
      gastos: result
    });
  } catch (error) {
    console.error('Error al obtener registro de gastos:', error);
    res.status(500).json({
      Consulta: false,
      error: 'Error al obtener registro de gastos'
    });
  }
};

//OBTENER_RESUMEN_DIARIO
const resumenDiario = async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

    const queryIngresos = `
      SELECT
        COALESCE(SUM(total_factura), 0) as ingresos_dia
      FROM FACTURAS
      WHERE DATE(fecha_emision) = ?
      AND estado_factura = 'COMPLETADA'
    `;

    const queryGastos = `
      SELECT
        COALESCE(SUM(monto_gasto), 0) as gastos_dia
      FROM GASTOS
      WHERE DATE(fecha_registro_gasto) = ?
    `;

    const [ingresos] = await pool.query(queryIngresos, [fechaConsulta]);
    const [gastos] = await pool.query(queryGastos, [fechaConsulta]);

    const ingresosTotal = parseFloat(ingresos[0].ingresos_dia || 0);
    const gastosTotal = parseFloat(gastos[0].gastos_dia || 0);
    const utilidad = ingresosTotal - gastosTotal;

    res.json({
      Consulta: true,
      fecha: fechaConsulta,
      ingresos: ingresosTotal,
      gastos: gastosTotal,
      utilidad: utilidad
    });
  } catch (error) {
    console.error('Error al obtener resumen diario:', error);
    res.status(500).json({
      Consulta: false,
      error: 'Error al obtener resumen diario'
    });
  }
};

//OBTENER_DATOS_PARA_GRAFICOS
const resumenGraficos = async (req, res) => {
  try {
    const { dias = 30 } = req.query;

    const query = `
      SELECT
        DATE(fecha) as fecha,
        COALESCE(SUM(ingresos), 0) as ingresos,
        COALESCE(SUM(gastos), 0) as gastos
      FROM (
        SELECT
          fecha_emision as fecha,
          total_factura as ingresos,
          0 as gastos
        FROM FACTURAS
        WHERE DATE(fecha_emision) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND estado_factura = 'COMPLETADA'

        UNION ALL

        SELECT
          fecha_registro_gasto as fecha,
          0 as ingresos,
          monto_gasto as gastos
        FROM GASTOS
        WHERE DATE(fecha_registro_gasto) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ) AS combined
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC
    `;

    const [result] = await pool.query(query, [dias, dias]);

    res.json({
      Consulta: true,
      datos: result
    });
  } catch (error) {
    console.error('Error al obtener datos para gráficos:', error);
    res.status(500).json({
      Consulta: false,
      error: 'Error al obtener datos para gráficos'
    });
  }
};

module.exports = {
  registroIngresos,
  registrosGastos,
  resumenDiario,
  resumenGraficos
};
