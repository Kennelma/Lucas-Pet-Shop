const express = require('express');
//ENDPOINT PARA LOS GRAFICOS
const mysqlConnection = require('../config/conexion');

// ENDPOINT PARA LOS GRÁFICOS
exports.registroIngresos = async (req, res) => {

    let conn;

    try {
        conn = await mysqlConnection.getConnection();

        const { anio, mes } = req.query;
        let query = `
            SELECT
                YEAR(fecha_emision) AS anio,
                MONTH(fecha_emision) AS mes,
                COUNT(*) AS cantidad_facturas,
                SUM(subtotal) AS total_subtotal,
                SUM(impuesto) AS total_impuesto,
                SUM(descuento) AS total_descuento,
                SUM(total) AS ingresos_brutos,
                SUM(total - descuento) AS ingresos_netos
            FROM tbl_facturas
            WHERE id_estado_fk IS NOT NULL
        `;
        const params = [];

        if (anio && mes) {
            query += ` AND YEAR(fecha_emision) = ? AND MONTH(fecha_emision) = ?`;
            params.push(anio, mes);
        } else if (anio) {
            query += ` AND YEAR(fecha_emision) = ?`;
            params.push(anio);
        }

        query += `
            GROUP BY YEAR(fecha_emision), MONTH(fecha_emision)
            ORDER BY anio DESC, mes DESC
        `;

        const [registros] = await conn.query(query, params);

        res.status(200).json({
            ok: true,
            ingresos: registros
        });

    } catch (error) {
        console.error('Error al obtener los ingresos mensuales:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al consultar ingresos mensuales.'
        });

    } finally {
        if (conn) conn.release();
    }
};

exports.registrosGastos = async (req, res) => {
  let conn;
  try {
    conn = await mysqlConnection.getConnection();

    const { anio, mes } = req.query;

    let query = `
      SELECT
        g.id_gasto_pk,
        g.detalle_gasto,
        g.monto_gasto,
        g.fecha_registro_gasto,
        g.id_usuario_fk,
        u.usuario
      FROM tbl_gastos g
      INNER JOIN tbl_usuarios u ON u.id_usuario_pk = g.id_usuario_fk
      WHERE 1=1
    `;

    const params = [];

    if (anio && mes) {
      query += ` AND YEAR(g.fecha_registro_gasto) = ? AND MONTH(g.fecha_registro_gasto) = ?`;
      params.push(parseInt(anio), parseInt(mes));
    }
    else if (anio) {
      query += ` AND YEAR(g.fecha_registro_gasto) = ?`;
      params.push(parseInt(anio));
    }

    query += ` ORDER BY g.fecha_registro_gasto DESC`;

    const [gastos] = await conn.query(query, params);

    res.status(200).json({
      ok: true,
      gastos,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ERROR AL OBTENER LOS GASTOS.' });
  } finally {
    if (conn) conn.release();
  }
};

//ENDPOINT PARA EL RESUMEN FINANCIERO DEL DIA ACTUAL (INGRESOS Y GASTOS DEL DIA)
exports.resumenDiario = async (req, res) => {
    let conn;
    try {

        conn = await mysqlConnection.getConnection();


        //SE OBTIENEN LOS INGRESOS DEL DIA ACTUAL
        const ingresosPromise = conn.query(`
            SELECT
                COALESCE(SUM(total - descuento), 0) AS total_ingresos_netos
            FROM tbl_facturas
            WHERE id_estado_fk IS NOT NULL
            AND DATE(fecha_emision) = CURDATE()`);


        //SE OBTIENEN LOS GASTOS DEL DIA ACTUAL
        const gastosPromise = conn.query(`
            SELECT
                COALESCE(SUM(monto_gasto), 0) AS total_gastos
            FROM tbl_gastos
            WHERE DATE(fecha_registro_gasto) = CURDATE()
        `);

        //SE EJECUTAN AMBAS PROMESAS EN PARALELO
        const [ [ingresos], [gastos] ] = await Promise.all([
            ingresosPromise,
            gastosPromise
        ]);


        const totalIngresos = ingresos[0].total_ingresos_netos;
        const totalGastos = gastos[0].total_gastos;
        const saldo_neto_dia = totalIngresos - totalGastos;

        const resumenDiario = {
            total_ingresos_netos: totalIngresos,
            total_gastos: totalGastos,
            saldo_neto_dia: saldo_neto_dia
        };

        res.status(200).json({
            ok: true,
            fecha: new Date().toISOString().split('T')[0],
            resumen_financiero_hoy: resumenDiario
        });

    } catch (error) {
        console.error('Error al obtener el resumen financiero de hoy:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al consultar el resumen financiero diario.'
        });
    } finally {

        conn.release();

    }
};

exports.registrosGastos = async (req, res) => {
  let conn;
  try {
    conn = await mysqlConnection.getConnection();

    const { anio, mes } = req.query;
    
    let query = `
      SELECT
        g.id_gasto_pk,
        g.detalle_gasto,
        g.monto_gasto,
        g.fecha_registro_gasto,
        g.id_usuario_fk,
        u.usuario
      FROM tbl_gastos g
      INNER JOIN tbl_usuarios u ON u.id_usuario_pk = g.id_usuario_fk
      WHERE 1=1
    `;
    
    const params = [];

    if (anio && mes) {
      query += ` AND YEAR(g.fecha_registro_gasto) = ? AND MONTH(g.fecha_registro_gasto) = ?`;
      params.push(parseInt(anio), parseInt(mes));
    }
    else if (anio) {
      query += ` AND YEAR(g.fecha_registro_gasto) = ?`;
      params.push(parseInt(anio));
    }

    query += ` ORDER BY g.fecha_registro_gasto DESC`;

    const [gastos] = await conn.query(query, params);

    res.status(200).json({
      ok: true,
      gastos,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ERROR AL OBTENER LOS GASTOS.' });
  } finally {
    if (conn) conn.release();
  }
};

exports.resumenGraficos = async (req, res) => {

  let conn;
  try {
    conn = await mysqlConnection.getConnection();

    const { modo, anio, mes } = req.query;

    //MODO: DIARIO
    if (modo === 'diario') {
      const m = String(mes).padStart(2, '0');
      const inicio = `${anio}-${m}-01 00:00:00`;
      const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0).getDate();
      const fin = `${anio}-${m}-${ultimoDia} 23:59:59`;

      const [rows] = await conn.query(
        `
        WITH ingresos AS (
          SELECT DATE(fecha_emision) AS fecha,
                 COUNT(*) AS cant_facturas,
                 SUM(subtotal_exento + subtotal_gravado) AS subtotal_ing,
                 SUM(impuesto) AS impuesto_ing,
                 SUM(descuento) AS descuento_ing,
                 SUM(total) AS total_ing,
                 SUM(total - descuento) AS neto_ing
          FROM tbl_facturas
          WHERE id_estado_fk IS NOT NULL
            AND fecha_emision BETWEEN ? AND ?
          GROUP BY DATE(fecha_emision)
        ),
        gastos AS (
          SELECT DATE(fecha_registro_gasto) AS fecha,
                 SUM(monto_gasto) AS total_gasto
          FROM tbl_gastos
          WHERE fecha_registro_gasto BETWEEN ? AND ?
          GROUP BY DATE(fecha_registro_gasto)
        )
        SELECT
          d.fecha,
          COALESCE(i.cant_facturas, 0)              AS cantidad_facturas,
          COALESCE(i.subtotal_ing, 0)               AS ingresos_subtotal,
          COALESCE(i.impuesto_ing, 0)               AS ingresos_impuesto,
          COALESCE(i.descuento_ing, 0)              AS ingresos_descuento,
          COALESCE(i.total_ing, 0)                  AS ingresos_brutos,
          COALESCE(i.neto_ing, 0)                   AS ingresos_netos,
          COALESCE(g.total_gasto, 0)                AS gastos,
          COALESCE(i.neto_ing, 0) - COALESCE(g.total_gasto, 0) AS utilidad_neta
        FROM (
          SELECT DATE(x.fecha) AS fecha
          FROM (
            SELECT fecha_emision AS fecha
            FROM tbl_facturas
            WHERE fecha_emision BETWEEN ? AND ?
            UNION
            SELECT fecha_registro_gasto AS fecha
            FROM tbl_gastos
            WHERE fecha_registro_gasto BETWEEN ? AND ?
          ) x
          GROUP BY DATE(x.fecha)
        ) d
        LEFT JOIN ingresos i ON i.fecha = d.fecha
        LEFT JOIN gastos   g ON g.fecha = d.fecha
        ORDER BY d.fecha ASC
        `,
        [inicio, fin, inicio, fin, inicio, fin, inicio, fin]
      );

      return res.status(200).json({ ok: true, modo: 'diario', anio: Number(anio), mes: Number(mes), data: rows });
    }

    // ✅ MODO: MENSUAL - CORREGIDO CON NOMBRES REALES DE COLUMNAS
    const anioConsulta = anio ? parseInt(anio) : new Date().getFullYear();

    // 1. Obtener ingresos mensuales
    const queryIngresos = `
      SELECT
        MONTH(fecha_emision) AS mes,
        COUNT(*) AS cant_facturas,
        COALESCE(SUM(subtotal_exento + subtotal_gravado), 0) AS subtotal_ing,
        COALESCE(SUM(impuesto), 0) AS impuesto_ing,
        COALESCE(SUM(descuento), 0) AS descuento_ing,
        COALESCE(SUM(total), 0) AS total_ing,
        COALESCE(SUM(total - descuento), 0) AS neto_ing
      FROM tbl_facturas
      WHERE id_estado_fk IS NOT NULL
        AND YEAR(fecha_emision) = ?
      GROUP BY MONTH(fecha_emision)
    `;

    // 2. Obtener gastos mensuales
    const queryGastos = `
      SELECT
        MONTH(fecha_registro_gasto) AS mes,
        COALESCE(SUM(monto_gasto), 0) AS total_gasto
      FROM tbl_gastos
      WHERE YEAR(fecha_registro_gasto) = ?
      GROUP BY MONTH(fecha_registro_gasto)
    `;

    const [ingresos] = await conn.query(queryIngresos, [anioConsulta]);
    const [gastos] = await conn.query(queryGastos, [anioConsulta]);

    // 3. Combinar y completar los 12 meses
    const mesesCompletos = [];
    
    for (let mes = 1; mes <= 12; mes++) {
      const ingreso = ingresos.find(i => i.mes === mes);
      const gasto = gastos.find(g => g.mes === mes);
      
      const ingresosNetos = ingreso ? Number(ingreso.neto_ing) : 0;
      const gastosTotal = gasto ? Number(gasto.total_gasto) : 0;
      
      mesesCompletos.push({
        anio: anioConsulta,
        mes: mes,
        cantidad_facturas: ingreso ? Number(ingreso.cant_facturas) : 0,
        ingresos_subtotal: ingreso ? Number(ingreso.subtotal_ing) : 0,
        ingresos_impuesto: ingreso ? Number(ingreso.impuesto_ing) : 0,
        ingresos_descuento: ingreso ? Number(ingreso.descuento_ing) : 0,
        ingresos_brutos: ingreso ? Number(ingreso.total_ing) : 0,
        ingresos_netos: ingresosNetos,
        gastos: gastosTotal,
        utilidad_neta: ingresosNetos - gastosTotal
      });
    }

    return res.status(200).json({ 
      ok: true, 
      modo: 'mensual', 
      anio: anioConsulta, 
      data: mesesCompletos 
    });

  } catch (err) {
    console.error('❌ Error en resumenGraficos:', err);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Error interno al consultar finanzas.',
      error: err.message
    });

  } finally {
    if (conn) conn.release();
  }
};