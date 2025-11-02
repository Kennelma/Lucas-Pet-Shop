require('dotenv').config()

const mysqlConnection = require('../config/conexion');


exports.procesarPago = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        const {
            numero_factura,
            tipo_pago,  // ID DEL TIPO DE PAGO (1=TOTAL, 2=PARCIAL)
            metodos     // Array de { metodo: 'EFECTIVO'/'TARJETA'/'TRANSFERENCIA', monto: 100.00 }
        } = req.body;

        //VALIDACIONES
        if (!numero_factura || !tipo_pago || !metodos || metodos.length === 0) {
            throw new Error('Datos incompletos para procesar el pago');
        }

        //OBTENER FACTURA
        const [factura] = await conn.query(
            `SELECT
                f.id_factura_pk,
                f.numero_factura,
                f.total,
                f.saldo,
                f.id_estado_fk,
                e.nombre_estado
            FROM tbl_facturas f
            INNER JOIN cat_estados e ON f.id_estado_fk = e.id_estado_pk
            WHERE f.numero_factura = ?`,
            [numero_factura]
        );

        if (!factura || factura.length === 0) {
            throw new Error(`Factura ${numero_factura} no encontrada`);
        }

        const facturaData = factura[0];
        const id_factura = facturaData.id_factura_pk;
        const saldo_actual = parseFloat(facturaData.saldo);

        //VALIDAR QUE LA FACTURA TENGA SALDO PENDIENTE
        if (saldo_actual <= 0) {
            throw new Error('Esta factura ya está pagada completamente');
        }

        //CALCULAR MONTO TOTAL DEL PAGO
        const monto_total_pago = metodos.reduce((sum, m) => sum + parseFloat(m.monto), 0);

        console.log(`💰 Procesando pago para factura ${numero_factura}`);
        console.log(`   Saldo actual: L.${saldo_actual.toFixed(2)}`);
        console.log(`   Monto a pagar: L.${monto_total_pago.toFixed(2)}`);

        //VALIDAR TIPO DE PAGO (AHORA ES ID, NO STRING)
        const id_tipo_pago = parseInt(tipo_pago);

        //VALIDAR MONTO SEGUN TIPO (1=TOTAL, 2=PARCIAL)
        if (id_tipo_pago === 1 && Math.abs(monto_total_pago - saldo_actual) > 0.01) {
            throw new Error('El monto del pago total no coincide con el saldo pendiente');
        }

        if (id_tipo_pago === 2 && monto_total_pago > saldo_actual) {
            throw new Error('El monto del pago parcial excede el saldo pendiente');
        }

        //OBTENER ESTADO APROBADO PARA EL PAGO
        const [estadoPago] = await conn.query(
            `SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'PAGO' AND nombre_estado = 'APROBADO'`
        );

        if (!estadoPago || estadoPago.length === 0) {
            throw new Error('Estado de pago no configurado en el sistema');
        }

        const id_estado_pago = estadoPago[0].id_estado_pk;

        //CREAR UN PAGO POR CADA MÉTODO
        for (const metodo of metodos) {

            console.log(`🔍 Procesando método: ${metodo.metodo}`);

            //OBTENER ID DEL MÉTODO DE PAGO
            const [metodoPagoCat] = await conn.query(
                `SELECT id_metodo_pago_pk, metodo_pago
                FROM cat_metodo_pago
                WHERE metodo_pago = ?`,
                [metodo.metodo]
            );

            if (!metodoPagoCat || metodoPagoCat.length === 0) {
                throw new Error(`Método de pago '${metodo.metodo}' no encontrado en cat_metodo_pago`);
            }

            const id_metodo_pago = metodoPagoCat[0].id_metodo_pago_pk;

            //CREAR REGISTRO DE PAGO
            const fecha_pago = new Date();

            const [resultPago] = await conn.query(
                `INSERT INTO tbl_pagos (
                    fecha_pago,
                    monto_pagado,
                    id_metodo_pago_fk,
                    id_tipo_pago_fk,
                    id_estado_fk
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    fecha_pago,
                    parseFloat(metodo.monto).toFixed(2),
                    id_metodo_pago,
                    id_tipo_pago,
                    id_estado_pago
                ]
            );

            const id_pago = resultPago.insertId;

            console.log(`✅ Pago creado - ID: ${id_pago} | ${metodo.metodo}: L.${parseFloat(metodo.monto).toFixed(2)}`);

            //CREAR APLICACIÓN DEL PAGO A LA FACTURA
            await conn.query(
                `INSERT INTO tbl_pago_aplicacion (
                    id_pago_fk,
                    id_factura_fk,
                    monto
                ) VALUES (?, ?, ?)`,
                [
                    id_pago,
                    id_factura,
                    parseFloat(metodo.monto).toFixed(2)
                ]
            );
        }

        //CALCULAR NUEVO SALDO
        const nuevo_saldo = saldo_actual - monto_total_pago;

        //ACTUALIZAR SALDO DE LA FACTURA
        await conn.query(
            `UPDATE tbl_facturas
            SET saldo = ?
            WHERE id_factura_pk = ?`,
            [nuevo_saldo.toFixed(2), id_factura]
        );

        console.log(`   📊 Nuevo saldo: L.${nuevo_saldo.toFixed(2)}`);

        //SI EL SALDO ES 0, CAMBIAR ESTADO A PAGADO
        if (nuevo_saldo <= 0.01) {

            const [estadoPagado] = await conn.query(
                `SELECT id_estado_pk
                FROM cat_estados
                WHERE dominio = 'FACTURA' AND nombre_estado = 'PAGADO'`
            );

            if (estadoPagado && estadoPagado.length > 0) {
                await conn.query(
                    `UPDATE tbl_facturas
                    SET id_estado_fk = ?
                    WHERE id_factura_pk = ?`,
                    [estadoPagado[0].id_estado_pk, id_factura]
                );

                console.log(`   ✅ Factura marcada como PAGADA`);
            }
        }

        await conn.commit();
        console.log('✅ PAGO PROCESADO EXITOSAMENTE');

        return res.status(200).json({
            success: true,
            mensaje: 'Pago procesado exitosamente',
            data: {
                numero_factura,
                metodos_usados: metodos.length,
                monto_pagado: monto_total_pago.toFixed(2),
                saldo_restante: nuevo_saldo.toFixed(2),
                estado: nuevo_saldo <= 0.01 ? 'PAGADO' : 'PENDIENTE'
            }
        });

    } catch (err) {
        await conn.rollback();
        console.error('❌ ERROR AL PROCESAR PAGO:', err.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al procesar el pago',
            error: err.message
        });
    } finally {
        conn.release();
    }

}

//====================VER_PAGOS_FACTURA====================
exports.verPagosFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const { numero_factura } = req.query;

        const [pagos] = await conn.query(
            `SELECT
                p.id_pago_pk,
                p.fecha_pago,
                p.monto_pagado,
                mp.metodo_pago,
                tp.tipo_pago,
                pa.monto AS monto_aplicado,
                e.nombre_estado AS estado_pago
            FROM tbl_pagos p
            INNER JOIN tbl_pago_aplicacion pa ON p.id_pago_pk = pa.id_pago_fk
            INNER JOIN tbl_facturas f ON pa.id_factura_fk = f.id_factura_pk
            LEFT JOIN cat_metodo_pago mp ON p.id_metodo_pago_fk = mp.id_metodo_pago_pk
            INNER JOIN cat_tipo_pago tp ON p.id_tipo_pago_fk = tp.id_tipo_pago_pk
            INNER JOIN cat_estados e ON p.id_estado_fk = e.id_estado_pk
            WHERE f.numero_factura = ?
            ORDER BY p.fecha_pago DESC`,
            [numero_factura]
        );

        return res.status(200).json({
            success: true,
            data: pagos
        });

    } catch (err) {
        console.error('❌ ERROR AL CONSULTAR PAGOS:', err.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al consultar pagos',
            error: err.message
        });
    } finally {
        conn.release();
    }

}



//OBTIENE EL ID DEL TIPO DE PAGO SEGÚN NOMBRE (TOTAL/PARCIAL)
exports.tipoPago = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const { tipoPago } = req.query;

        const [tipos] = await conn.query(
            `SELECT
                id_tipo_pago_pk,
                tipo_pago
            FROM cat_tipo_pago
            WHERE tipo_pago = ?`,
            [tipoPago]
        );

        return res.status(200).json({
            success: true,
            data: tipos
        });

    } catch (err) {
        console.error('ERROR AL CONSULTAR TIPOS DE PAGO:', err.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al consultar tipos de pago',
            error: err.message
        });
    } finally {
        conn.release();
    }

}


//OBTIENE EL ID DEL METODO DE PAGO SEGÚN NOMBRE (EFECTIVO/TARJETA/TRANSFERENCIA)
exports.metodosPago = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        const { metodoPago } = req.query;

        const [metodos] = await conn.query(
            `SELECT
                id_metodo_pago_pk,
                metodo_pago
            FROM cat_metodo_pago
            WHERE metodo_pago = ?`,
            [metodoPago]
        );

        return res.status(200).json({
            success: true,
            data: metodos
        });

    } catch (err) {
        console.error('ERROR AL CONSULTAR MÉTODOS DE PAGO:', err.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al consultar métodos de pago',
            error: err.message
        });
    } finally {
        conn.release();
    }

}