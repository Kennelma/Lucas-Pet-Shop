
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
        u.nombre_usuario
      FROM tbl_gastos g
      INNER JOIN tbl_usuarios u ON u.id_usuario_pk = g.id_usuario_fk
      WHERE 1=1
    `;
    const params = [];


    if (anio && mes) {
      const m = String(mes).padStart(2, '0');
      const inicio = `${anio}-${m}-01 00:00:00`;
      const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0).getDate();
      const fin = `${anio}-${m}-${ultimoDia} 23:59:59`;
      query += ` AND g.fecha_registro_gasto BETWEEN ? AND ?`;
      params.push(inicio, fin);
    }

    else if (anio) {
      const inicio = `${anio}-01-01 00:00:00`;
      const fin = `${anio}-12-31 23:59:59`;
      query += ` AND g.fecha_registro_gasto BETWEEN ? AND ?`;
      params.push(inicio, fin);
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

    //MODO: DIARIO (dentro de un mes)
    if (modo === 'diario') {
      const m = String(mes).padStart(2, '0');
      const inicio = `${anio}-${m}-01 00:00:00`;
      const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0).getDate();
      const fin = `${anio}-${m}-${ultimoDia} 23:59:59`;

      const [rows] = await conn.query(
        `
        /* Ingresos diarios */
        WITH ingresos AS (
          SELECT DATE(f.fecha_emision) AS fecha,
                 COUNT(*) AS cant_facturas,
                 SUM(f.subtotal) AS subtotal_ing,
                 SUM(f.impuesto) AS impuesto_ing,
                 SUM(f.descuento) AS descuento_ing,
                 SUM(f.total) AS total_ing,
                 SUM(f.total - f.descuento) AS neto_ing
          FROM tbl_facturas f
          WHERE f.id_estado_fk IS NOT NULL
            AND f.fecha_emision BETWEEN ? AND ?
          GROUP BY DATE(f.fecha_emision)
        ),
        gastos AS (
          SELECT DATE(g.fecha_registro_gasto) AS fecha,
                 SUM(g.monto_gasto) AS total_gasto
          FROM tbl_gastos g
          WHERE g.fecha_registro_gasto BETWEEN ? AND ?
          GROUP BY DATE(g.fecha_registro_gasto)
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
          /* Generador de días existentes en cualquiera de las dos tablas */
          SELECT DATE(x.fecha) AS fecha
          FROM (
            SELECT f.fecha_emision AS fecha
            FROM tbl_facturas f
            WHERE f.fecha_emision BETWEEN ? AND ?
            UNION
            SELECT g.fecha_registro_gasto AS fecha
            FROM tbl_gastos g
            WHERE g.fecha_registro_gasto BETWEEN ? AND ?
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

    //MODO: MENSUAL (acumulado por mes)
    let filtros = '';
    const params = [];
    if (anio) {
      filtros = `WHERE YEAR(fecha) = ?`;
      params.push(anio);
    }

    const [rows] = await conn.query(
      `
      /* Ingresos mensuales */
      WITH ing AS (
        SELECT
          DATE(f.fecha_emision) AS fecha,
          YEAR(f.fecha_emision) AS anio,
          MONTH(f.fecha_emision) AS mes,
          COUNT(*) AS cant_facturas,
          SUM(f.subtotal) AS subtotal_ing,
          SUM(f.impuesto) AS impuesto_ing,
          SUM(f.descuento) AS descuento_ing,
          SUM(f.total) AS total_ing,
          SUM(f.total - f.descuento) AS neto_ing
        FROM tbl_facturas f
        WHERE f.id_estado_fk IS NOT NULL
        GROUP BY YEAR(f.fecha_emision), MONTH(f.fecha_emision)
      ),
      gas AS (
        SELECT
          DATE(g.fecha_registro_gasto) AS fecha,
          YEAR(g.fecha_registro_gasto) AS anio,
          MONTH(g.fecha_registro_gasto) AS mes,
          SUM(g.monto_gasto) AS total_gasto
        FROM tbl_gastos g
        GROUP BY YEAR(g.fecha_registro_gasto), MONTH(g.fecha_registro_gasto)
      ),
      union_meses AS (
        SELECT DATE(CONCAT(i.anio,'-',LPAD(i.mes,2,'0'),'-01')) AS fecha, i.anio, i.mes FROM ing i
        UNION
        SELECT DATE(CONCAT(g.anio,'-',LPAD(g.mes,2,'0'),'-01')) AS fecha, g.anio, g.mes FROM gas g
      )
      SELECT
        u.anio,
        u.mes,
        COALESCE(i.cant_facturas, 0) AS cantidad_facturas,
        COALESCE(i.subtotal_ing, 0)  AS ingresos_subtotal,
        COALESCE(i.impuesto_ing, 0)  AS ingresos_impuesto,
        COALESCE(i.descuento_ing, 0) AS ingresos_descuento,
        COALESCE(i.total_ing, 0)     AS ingresos_brutos,
        COALESCE(i.neto_ing, 0)      AS ingresos_netos,
        COALESCE(g.total_gasto, 0)   AS gastos,
        COALESCE(i.neto_ing, 0) - COALESCE(g.total_gasto, 0) AS utilidad_neta
      FROM union_meses u
      LEFT JOIN ing i ON i.anio = u.anio AND i.mes = u.mes
      LEFT JOIN gas g ON g.anio = u.anio AND g.mes = u.mes
      ${filtros}
      ORDER BY u.anio DESC, u.mes DESC`,
      params
    );

    return res.status(200).json({ ok: true, modo: 'mensual', anio: anio ? Number(anio) : null, data: rows });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: 'Error interno al consultar finanzas.' });

  } finally {

    if (conn) conn.release();
  }
};
