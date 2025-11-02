require('dotenv').config()

const mysqlConnection = require('../config/conexion');




//OBTIENE EL ID DEL TIPO DE PAGO SEGÚN NOMBRE (TOTAL/PARCIAL)
exports.obtenerTipoPago = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {


        const [registros] = await conn.query(
            `SELECT
                id_tipo_pago_pk,
                tipo_pago
            FROM cat_tipo_pago`
        );


        if (registros.length > 0) {
            res.status(200).json({
                success: true,
                message: "TIPOS DE PAGO ENCONTRADOS",
                data: registros
            });

        } else {

            res.status(404).json({
                success: false,
                message: "TIPOS DE PAGO NO ENCONTRADOS"
            });
        }
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
exports.obtenerMetodosPago = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const [registros] = await conn.query(
            `SELECT
                id_metodo_pago_pk,
                metodo_pago
            FROM cat_metodo_pago`
        );

        if (registros.length > 0) {
            res.status(200).json({
                success: true,
                message: "MÉTODOS DE PAGO ENCONTRADOS",
                data: registros
            });

        } else {

            res.status(404).json({
                success: false,
                message: "MÉTODOS DE PAGO NO ENCONTRADOS"
            });
        }

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

        const { facturas, tipo_pago, metodos } = req.body;

        //VALIDAR DATOS REQUERIDOS
        if (!facturas?.length || !tipo_pago || !metodos?.length) {
            throw new Error('Datos incompletos para procesar el pago');
        }

        //OBTENER FACTURAS DE LA BASE DE DATOS
        const numerosFacturas = facturas.map(f => f.numero_factura);
        const placeholders = numerosFacturas.map(() => '?').join(',');

        const [facturasExistentes] = await conn.query(
            `SELECT id_factura_pk, numero_factura, total, saldo
             FROM tbl_facturas
             WHERE numero_factura IN (${placeholders})`,
            numerosFacturas
        );

        //VALIDAR EXISTENCIA DE FACTURAS
        if (facturasExistentes.length !== facturas.length) {
            throw new Error('Algunas facturas no existen en el sistema');
        }

        //VALIDAR SALDOS Y MONTOS
        for (const factura of facturas) {
            const facturaExistente = facturasExistentes.find(f => f.numero_factura === factura.numero_factura);
            const monto = parseFloat(factura.monto_aplicar);

            if (parseFloat(facturaExistente.saldo) <= 0) {
                throw new Error(`La factura ${factura.numero_factura} ya está pagada`);
            }

            if (monto <= 0 || monto > parseFloat(facturaExistente.saldo)) {
                throw new Error(`Monto inválido para factura ${factura.numero_factura}`);
            }
        }

        //VALIDAR QUE EL PAGO TOTAL CUBRA LAS APLICACIONES
        const totalPago = metodos.reduce((sum, m) => sum + parseFloat(m.monto), 0);
        const totalAplicar = facturas.reduce((sum, f) => sum + parseFloat(f.monto_aplicar), 0);

        if (totalPago < totalAplicar) {
            throw new Error('El monto del pago no cubre las aplicaciones');
        }

        //OBTENER ID DEL ESTADO APROBADO PARA PAGOS
        const [estadoPago] = await conn.query(
            `SELECT id_estado_pk FROM cat_estados
             WHERE dominio = 'PAGO' AND nombre_estado = 'APROBADO'`
        );

        if (!estadoPago?.length) {
            throw new Error('Estado de pago no configurado');
        }

        //CREAR REGISTROS DE PAGO POR CADA MÉTODO
        for (const metodo of metodos) {
            if (!metodo.id_metodo_pago || !metodo.monto) {
                throw new Error('Método de pago incompleto');
            }

            const [resultPago] = await conn.query(
                `INSERT INTO tbl_pagos (fecha_pago, monto_pagado, id_metodo_pago_fk, id_tipo_pago_fk, id_estado_fk)
                 VALUES (NOW(), ?, ?, ?, ?)`,
                [parseFloat(metodo.monto), parseInt(metodo.id_metodo_pago), parseInt(tipo_pago), estadoPago[0].id_estado_pk]
            );

            //APLICAR EL PAGO A CADA FACTURA
            for (const factura of facturas) {
                const facturaExistente = facturasExistentes.find(f => f.numero_factura === factura.numero_factura);

                await conn.query(
                    `INSERT INTO tbl_pago_aplicacion (id_pago_fk, id_factura_fk, monto)
                     VALUES (?, ?, ?)`,
                    [resultPago.insertId, facturaExistente.id_factura_pk, parseFloat(factura.monto_aplicar)]
                );
            }
        }

        //ACTUALIZAR SALDO Y ESTADO DE CADA FACTURA
        const facturasActualizadas = [];

        for (const factura of facturas) {
            const facturaExistente = facturasExistentes.find(f => f.numero_factura === factura.numero_factura);
            const nuevoSaldo = parseFloat(facturaExistente.saldo) - parseFloat(factura.monto_aplicar);

            //ACTUALIZAR SALDO
            await conn.query(
                `UPDATE tbl_facturas SET saldo = ? WHERE id_factura_pk = ?`,
                [nuevoSaldo, facturaExistente.id_factura_pk]
            );

            //DETERMINAR Y ACTUALIZAR ESTADO
            let nuevoEstado = 'PENDIENTE';

            if (nuevoSaldo <= 0.01) {
                const [estado] = await conn.query(
                    `SELECT id_estado_pk FROM cat_estados WHERE dominio = 'FACTURA' AND nombre_estado = 'PAGADO'`
                );

                if (estado?.length) {
                    await conn.query(
                        `UPDATE tbl_facturas SET id_estado_fk = ? WHERE id_factura_pk = ?`,
                        [estado[0].id_estado_pk, facturaExistente.id_factura_pk]
                    );
                    nuevoEstado = 'PAGADO';
                }
            } else if (nuevoSaldo < parseFloat(facturaExistente.total)) {
                const [estado] = await conn.query(
                    `SELECT id_estado_pk FROM cat_estados
                     WHERE dominio = 'FACTURA' AND nombre_estado = 'PARCIAL'`
                );

                if (estado?.length) {
                    await conn.query(
                        `UPDATE tbl_facturas SET id_estado_fk = ? WHERE id_factura_pk = ?`,
                        [estado[0].id_estado_pk, facturaExistente.id_factura_pk]
                    );
                    nuevoEstado = 'PARCIAL';
                }
            }

            facturasActualizadas.push({
                numero_factura: factura.numero_factura,
                monto_aplicado: parseFloat(factura.monto_aplicar).toFixed(2),
                saldo_restante: nuevoSaldo.toFixed(2),
                estado: nuevoEstado
            });
        }

        await conn.commit();

        return res.status(200).json({
            success: true,
            mensaje: 'Pago procesado exitosamente',
            data: {
                facturas_procesadas: facturasActualizadas.length,
                facturas: facturasActualizadas,
                metodos_usados: metodos.length,
                monto_total_pagado: totalPago.toFixed(2)
            }
        });

    } catch (err) {
        await conn.rollback();
        console.error('ERROR:', err.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al procesar el pago',
            error: err.message
        });
    } finally {
        conn.release();
    }
}
