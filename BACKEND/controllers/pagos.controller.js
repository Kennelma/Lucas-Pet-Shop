require('dotenv').config();
const mysqlConnection = require('../config/conexion');

//OBTENER TIPOS DE PAGO (TOTAL/PARCIAL)
exports.obtenerTipoPago = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        const [registros] = await conn.query(
            `SELECT id_tipo_pago_pk, tipo_pago FROM cat_tipo_pago`
        );

        res.status(registros.length > 0 ? 200 : 404).json({
            success: registros.length > 0,
            message: registros.length > 0 ? "TIPOS DE PAGO ENCONTRADOS" : "TIPOS DE PAGO NO ENCONTRADOS",
            data: registros.length > 0 ? registros : undefined
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al consultar tipos de pago',
            error: err.message
        });
    } finally {
        conn.release();
    }
};

//OBTENER MÉTODOS DE PAGO (EFECTIVO/TARJETA/TRANSFERENCIA)
exports.obtenerMetodosPago = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        const [registros] = await conn.query(
            `SELECT id_metodo_pago_pk, metodo_pago FROM cat_metodo_pago`
        );

        res.status(registros.length > 0 ? 200 : 404).json({
            success: registros.length > 0,
            message: registros.length > 0 ? "MÉTODOS DE PAGO ENCONTRADOS" : "MÉTODOS DE PAGO NO ENCONTRADOS",
            data: registros.length > 0 ? registros : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};


exports.procesarPago = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        await conn.beginTransaction();

        const { numero_factura, id_tipo, monto, metodos } = req.body;

        //VALIDAR DATOS REQUERIDOS
        if (!numero_factura) {
            throw new Error('Número de factura es requerido');
        }
        if (!id_tipo) {
            throw new Error('Tipo de pago es requerido');
        }
        if (!metodos || !Array.isArray(metodos) || metodos.length === 0) {
            throw new Error('Debe incluir al menos un método de pago');
        }

        //OBTENER FACTURA
        const [facturas] = await conn.query(
            `SELECT id_factura_pk, total, saldo
            FROM tbl_facturas
            WHERE numero_factura = ?`,
            [numero_factura]
        );

        if (!facturas || facturas.length === 0) {
            throw new Error(`Factura ${numero_factura} no encontrada`);
        }

        //OBTENER EL NOMBRE DEL TIPO DE PAGO
        const [tipoPago] = await conn.query(
            `SELECT tipo_pago
            FROM cat_tipo_pago
            WHERE id_tipo_pago_pk = ?`,
            [id_tipo]
        );

        if (!tipoPago || tipoPago.length === 0) {
            throw new Error('Tipo de pago no válido');
        }

        //OBTENER EL ID DEL ESTADO APROBADO PARA PAGOS
        const [estadoPago] = await conn.query(
            `SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'PAGO' AND nombre_estado = 'APROBADO'`
        );

        const fecha_pago = new Date();
        const tipoPagoNombre = tipoPago[0].tipo_pago;

        switch (tipoPagoNombre) {

            case 'TOTAL':

                if (metodos.length === 1) {
                    //PAGO TOTAL CON UN SOLO MÉTODO
                    const metodo = metodos[0];

                    const [pagos] = await conn.query(
                        `INSERT INTO tbl_pagos (
                            fecha_pago,
                            monto_pagado,
                            id_metodo_pago_fk,
                            id_tipo_pago_fk,
                            id_estado_fk
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                            fecha_pago,
                            metodo.monto,
                            metodo.id_metodo_pago_fk,
                            id_tipo,
                            estadoPago[0].id_estado_pk
                        ]
                    );

                    //APLICAR PAGO A LA FACTURA
                    await conn.query(
                        `INSERT INTO tbl_pago_aplicacion (
                            id_pago_fk,
                            id_factura_fk,
                            monto,
                            fecha_aplicacion
                        ) VALUES (?, ?, ?)`,
                        [
                            pagos.insertId,
                            facturas[0].id_factura_pk,
                            monto, fecha_pago
                        ]
                    );

                    //ACTUALIZAR SALDO A 0
                    await conn.query(
                        `UPDATE tbl_facturas
                        SET saldo = 0
                        WHERE id_factura_pk = ?`,
                        [facturas[0].id_factura_pk]
                    );

                    //ACTUALIZAR ESTADO A PAGADA
                    await conn.query(
                        `UPDATE tbl_facturas
                        SET id_estado_fk = (
                            SELECT id_estado_pk
                            FROM cat_estados
                            WHERE dominio = 'FACTURA' AND nombre_estado = 'PAGADA'
                        )
                        WHERE id_factura_pk = ?`,
                        [facturas[0].id_factura_pk]
                    );

                } else {
                    //PAGO TOTAL CON DOS MÉTODOS
                    for (const metodo of metodos) {

                        const [pagos] = await conn.query(
                            `INSERT INTO tbl_pagos (
                                fecha_pago,
                                monto_pagado,
                                id_metodo_pago_fk,
                                id_tipo_pago_fk,
                                id_estado_fk
                            ) VALUES (?, ?, ?, ?, ?)`,
                            [
                                fecha_pago,
                                metodo.monto,
                                metodo.id_metodo_pago_fk,
                                id_tipo,
                                estadoPago[0].id_estado_pk
                            ]
                        );

                        //APLICAR CADA PAGO A LA FACTURA
                        await conn.query(
                            `INSERT INTO tbl_pago_aplicacion (
                                id_pago_fk,
                                id_factura_fk,
                                monto
                            ) VALUES (?, ?, ?)`,
                            [
                                pagos.insertId,
                                facturas[0].id_factura_pk,
                                metodo.monto
                            ]
                        );
                    }

                    //ACTUALIZAR SALDO A 0
                    await conn.query(
                        `UPDATE tbl_facturas
                        SET saldo = 0
                        WHERE id_factura_pk = ?`,
                        [facturas[0].id_factura_pk]
                    );

                    //ACTUALIZAR ESTADO A PAGADA
                    await conn.query(
                        `UPDATE tbl_facturas
                        SET id_estado_fk = (
                            SELECT id_estado_pk
                            FROM cat_estados
                            WHERE dominio = 'FACTURA' AND nombre_estado = 'PAGADA'
                        )
                        WHERE id_factura_pk = ?`,
                        [facturas[0].id_factura_pk]
                    );
                }

                break;

            case 'PARCIAL':

                //PAGO PARCIAL CON UN SOLO MÉTODO
                const metodo = metodos[0];

                const [pagos] = await conn.query(
                    `INSERT INTO tbl_pagos (
                        fecha_pago,
                        monto_pagado,
                        id_metodo_pago_fk,
                        id_tipo_pago_fk,
                        id_estado_fk
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        fecha_pago,
                        metodo.monto,
                        metodo.id_metodo_pago_fk,
                        id_tipo,
                        estadoPago[0].id_estado_pk
                    ]
                );

                //APLICAR PAGO A LA FACTURA
                await conn.query(
                    `INSERT INTO tbl_pago_aplicacion (
                        id_pago_fk,
                        id_factura_fk,
                        monto
                    ) VALUES (?, ?, ?)`,
                    [
                        pagos.insertId,
                        facturas[0].id_factura_pk,
                        metodo.monto
                    ]
                );

                //ACTUALIZAR SALDO
                await conn.query(
                    `UPDATE tbl_facturas
                    SET saldo = saldo - ?
                    WHERE id_factura_pk = ?`,
                    [
                        metodo.monto,
                        facturas[0].id_factura_pk
                    ]
                );

                //VERIFICAR SALDO DESPUÉS DEL PAGO PARCIAL
                const [facturaActualizada] = await conn.query(
                    `SELECT saldo FROM tbl_facturas WHERE id_factura_pk = ?`,
                    [facturas[0].id_factura_pk]
                );

                const saldoRestante = parseFloat(facturaActualizada[0].saldo);

                //SI EL SALDO ES 0, CAMBIAR A PAGADA; SI NO, CAMBIAR A PARCIAL
                const estadoNombre = saldoRestante === 0 ? 'PAGADA' : 'PARCIAL';
                const [estadoFactura] = await conn.query(
                    `SELECT id_estado_pk
                     FROM cat_estados
                     WHERE dominio = 'FACTURA' AND nombre_estado = ?`,
                    [estadoNombre]
                );

                await conn.query(
                    `UPDATE tbl_facturas
                    SET id_estado_fk = ?
                    WHERE id_factura_pk = ?`,
                    [estadoFactura[0]?.id_estado_pk, facturas[0].id_factura_pk]
                );

                break;

            default:
                break;
        }

        await conn.commit();

        //OBTENER SALDO ACTUALIZADO PARA LA RESPUESTA
        const [facturaActualizada] = await conn.query(
            `SELECT saldo, total, id_estado_fk FROM tbl_facturas WHERE id_factura_pk = ?`,
            [facturas[0].id_factura_pk]
        );

        const [estadoActual] = await conn.query(
            `SELECT nombre_estado FROM cat_estados WHERE id_estado_pk = ?`,
            [facturaActualizada[0].id_estado_fk]
        );

        return res.status(200).json({
            success: true,
            mensaje: 'Pago procesado exitosamente',
            data: {
                id_tipo_pago: id_tipo,
                tipo_pago: id_tipo === 1 ? 'TOTAL' : id_tipo === 2 ? 'PARCIAL' : 'MIXTO',
                saldo_restante: parseFloat(facturaActualizada[0].saldo || 0),
                total: parseFloat(facturaActualizada[0].total || 0),
                estado: estadoActual[0]?.nombre_estado || 'DESCONOCIDO'
            }
        });

    } catch (err) {
        await conn.rollback();
        console.error('❌ ERROR EN PROCESAR PAGO:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({
            success: false,
            mensaje: 'Error al procesar el pago',
            error: err.message,
            detalles: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    } finally {
        conn.release();
    }
};
