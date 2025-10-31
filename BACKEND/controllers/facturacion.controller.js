require('dotenv').config()

const mysqlConnection = require('../config/conexion');

//1. LLENAR PRIMERO LA TABLA DE FACATURAS

exports.crearFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

        const fechaEmision = new Date(); //TOMA LA FECHA DE LA COMPUTADORA


        // 1) OBTENER LOS DETALLES DE LA FACTURA DESDE EL BODY
        const {
            RTN,
            descuento_monto,
            id_cliente,
            detalles
        } = req.body

        //VALIDAR QUE EXISTAN OBJETOS PARA PODER CREAR LA FACTURA
        if (!detalles || detalles.length === 0) {
            return res.status(400).json({
                Consulta: false,
                mensaje: 'Se debe incluir al menos un detalle para generar la factura.'
            });
        }

        // 3) ESTADO DE LA FACTURA ANTES DE ENTRAR A LOS METODOS DE PAGO
        const [estado] = await conn.query(
            `SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'FACTURA' and nombre_estado = 'PENDIENTE'`
        )

        const estado_factura = estado[0].id_estado_pk;


        // 4) SE OBTIENE EL IMPUESTO ACTUAL DESDE LA TABLA DE PARAMETROS
        const [isv] = await conn.query(
            `SELECT valor_parametro
            FROM tbl_parametros
            WHERE nombre_parametro = 'IMPUESTO_ISV'`
        )

        const impuesto_valor = 1 + parseFloat(isv[0].valor_parametro/100);

        console.log('Impuesto obtenido:', impuesto_valor); //1.15

        let total_con_impuesto = 0;
        const detallesConTotal= [];

        //ARRAY DE OBJETOS DE DEATLLEA
        for (const detalle of detalles) {

            //TOTAL DE LINEA = CANTIDAD * PRECIO + AJUSTE
            const cantidad = detalle.cantidad_item;
            const ajuste = parseFloat(detalle.ajuste_precio || 0);
            let nombre_item = '';
            let precio_item = 0;
            //--CALCULO TOTAL DE LINEA
            //SE PROCESAN LOS DETALLES DE LA FACTURA
            const total_linea = (cantidad * precio_item) + ajuste;

            total_con_impuesto += total_linea;


            //SE AGREGA EL TOTAL DE LINEA AL OBJETO DETALLE CON SU TOTAL CALCULADO
            detallesConTotal.push({
                ...detalle,
                nombre_item,
                precio_item,
                id_tipo_item,
                total_linea: total_linea.toFixed(2)
            });

            console.log(`Detalle: ${detalle.nombre_item} | Cant: ${cantidad} x L. ${precio_item} + L.${ajuste} = L.${total_linea}`);

        }


        // 6.   DESGLOSE DEL SUBTOTAL, IMPUESTO Y TOTAL
        const descuento = parseFloat(descuento_monto || 0);
        const subtotal = (total_con_impuesto - descuento)/ impuesto_valor;
        const impuesto = total_con_impuesto - subtotal;
        const total = subtotal + impuesto;
        const saldo = total;

        console.log('💵 Totales:');
        console.log(`Subtotal: L.${subtotal.toFixed(2)}`);
        console.log(`Impuesto (15%): L.${impuesto.toFixed(2)}`);
        console.log(`Descuento: L.${descuento.toFixed(2)}`);
        console.log(`Total: L.${total.toFixed(2)}`);

        console.log('Total calculado:', total);


        //EL NUMERO DE LA FACTURA SE GENERA MEDIANTE UN TRIGGER


        const [factura] = await conn.query(
            `INSERT INTO tbl_facturas (
                fecha_emision,
                RTN,
                subtotal,
                impuesto,
                descuento,
                total,
                saldo,
                id_sucursal_fk,
                id_usuario_fk,
                id_estado_fk,
                id_cliente_fk
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
                fechaEmision,
                RTN || null,
                subtotal.toFixed(2),
                impuesto.toFixed(2),
                descuento.toFixed(2),
                total.toFixed(2),
                saldo.toFixed(2),
                id_sucursal,
                id_usuario,
                estado_factura, //PENDIENTE
                id_cliente || null
            ]
        )

        //CAPTURAR EL ID DE LA FACTURA CREADA
        const id_factura = factura.insertId;

        const [facturaCreada] = await conn.query(
            `SELECT numero_factura
            FROM tbl_facturas
            WHERE id_factura_pk = ?`,
            [id_factura]
        );

        const numero_factura = facturaCreada[0].numero_factura;
        console.log('✅ Factura creada - ID:', id_factura, '| Número:', numero_factura);


        //INSERTAR DETLLES Y DESCONTAR EL INVENTARIO
        for (const detalle of detallesConTotal) {

            await conn.query(
                `INSERT INTO tbl_detalles_facturas (
                    nombre_item,
                    cantidad_item,
                    precio_item,
                    ajuste_precio,
                    total_linea,
                    num_mascotas_atendidas,
                    id_factura_fk,
                    id_tipo_item_fk,
                    id_descrip_ajuste_fk,
                    id_estilista_fk,
                    id_productos_fk,
                    id_servicio_fk,
                    id_promocion_fk
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    detalle.nombre_item,
                    detalle.cantidad_item,
                    detalle.precio_item,
                    detalle.ajuste_precio || 0,
                    detalle.num_mascotas_atendidas || null,
                    detalle.total_linea,
                    id_factura,
                    detalle.id_tipo_item,
                    detalle.id_descrip_ajuste || null,
                    detalle.id_estilista || null,
                    detalle.id_producto || null,
                    detalle.id_servicio || null,
                    detalle.id_promocion || null
                ]
            );

            //SI SE VENDE PRODUCTO, SE DESCUENTA DEL INVENTARIO
            if (detalle.id_producto) {

                const cantidad = detalle.cantidad_item

                await conn.query(
                    `UPDATE tbl_productos
                     SET stock = stock - ?
                     WHERE id_producto_pk = ?`,
                    [cantidad, detalle.id_producto]
                );
            }

        }

        await conn.commit();
        console.log('✅ Transacción completada');

        return res.status(201).json({
            success: true,
            mensaje: 'Factura creada exitosamente',
            data: {
                id_factura,
                numero_factura,
                fecha_emision
            }
        });




    } catch (err) {
        await conn.rollback();
        res.status(500).json({
            mensaje: 'Error al crear la factura',
            error: err.message
        });
    } finally {
        conn.release();
    }

}



exports.encabezadoFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    let resultados;

    try {

        const { identidad } = req.query;

        [resultados] = await conn.query(
            `SELECT
                id_cliente_pk,
                nombre_cliente,
                identidad_cliente
            FROM tbl_clientes
            WHERE identidad_cliente = ?`,
            [identidad]
        );

        if (!resultados || resultados.length === 0) {
        return res.status(404).json({
            success: false,
            mensaje: `NO SE ENCONTRÓ NINGUN REGISTRO CON ESTA IDENTIDAD: ${identidad}.`,
        });
        }

        return res.status(200).json({
            success: true,
            mensaje: 'Datos obtenidos con éxito',
            data: resultados
        });

    } catch (err) {

        res.status(500).json({
            mensaje: 'ERROR AL MOSTRAR DATOS',
            error: err.message
        });

    } finally {
        conn.release();
    }

}







// ENDPOINT OBTENER DETALLES DE FACTURA (PRODUCTOS, SERVICIOS, PROMOCIONES)
exports.detallesFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    let resultados;

    try {
        switch (req.query.tipo_item) {

            case 'PRODUCTOS':

                [resultados] = await conn.query(
                    `SELECT
                        id_producto_pk,
                        nombre_producto,
                        precio_producto
                    FROM tbl_productos
                    WHERE activo = TRUE`
                )

                break;

            case 'SERVICIOS':

                [resultados] = await conn.query(
                    `SELECT
                        id_servicio_peluqueria_pk,
                        nombre_servicio_peluqueria,
                        precio_servicio
                    FROM tbl_servicios_peluqueria_canina
                    WHERE activo = TRUE`
                )

                break;

            case 'PROMOCIONES':

                [resultados] = await conn.query(
                    `SELECT
                        id_promocion_pk,
                        nombre_promocion,
                        precio_promocion
                    FROM tbl_promociones
                    WHERE activo = TRUE`
                )
                break;

            default:
                throw new Error('TIPO DE ITEM NO VÁLIDO, INTENTE DE NUEVO');

        }

        return res.status(200).json({ success: true, data: resultados })

    } catch (err) {

        res.status(500).json({
            mensaje: 'ERROR AL MOSTRAR DATOS',
            error: err.message
        });

    } finally {
        conn.release();
    }

}



// ENDPOINT BUSCAR CLIENTE POR IDENTIDAD PARA FACTURA
exports.buscarClientesPorIdentidad = async (req, res) => {

    const { identidad } = req.query;

    const conn = await mysqlConnection.getConnection();

    try {
        //SE BUSCAN LOS CLEINTES CON LA IDENTIDAD PROPORCIONADA
        const [registros] = await conn.query(
            `SELECT
                id_cliente_pk,
                identidad_cliente,
                nombre_cliente,
                apellido_cliente
             FROM tbl_clientes
             WHERE identidad_cliente = ?`,
            [identidad]
        );

        if (registros.length > 0) {
            res.status(200).json({
                success: true,
                message: "CLIENTE ENCONTRADO",
                data: registros
            });

        } else {

            res.status(404).json({
                success: false,
                message: "CLIENTE NO ENCONTRADO"
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

//ENDPOINT PARA MOSTRAR EL USUARIO Y SUCURSAL QUE CREA LA FACTURA
exports.usuarioFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        //OBTENER EL ID DEL USUARIO DESDE EL TOKEN
        const id_usuario = req.usuario.id_usuario_pk;

        //BUSCAR EL USUARIO Y SUCURSAL
        const [registros] = await conn.query(
            `SELECT
                u.id_usuario_pk,
                u.usuario,
                s.id_sucursal_pk,
                s.nombre_sucursal
             FROM tbl_usuarios u
             INNER JOIN tbl_sucursales s ON u.id_sucursal_fk = s.id_sucursal_pk
             WHERE u.id_usuario_pk = ?`,
            [id_usuario]
        );

        if (registros.length > 0) {
            res.status(200).json({
                success: true,
                message: "USUARIO Y SUCURSAL ENCONTRADOS",
                data: registros[0]
            });

        } else {

            res.status(404).json({
                success: false,
                message: "USUARIO NO ENCONTRADO"
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


//BUSCAR ESTILISTAS
exports.buscarEstilistas = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

         //BUSCAR EsTILISTAS ACTIVOS
        const [registros] = await conn.query(
            `SELECT
                id_estilista_pk,
                nombre_estilista,
                apellido_estilista
             FROM tbl_estilistas_caninos`,
        );

        if (registros.length > 0) {
            res.status(200).json({
                success: true,
                message: "ESTILISTAS ENCONTRADOS",
                data: registros
            });

        } else {

            res.status(404).json({
                success: false,
                message: "ESTILISTAS NO ENCONTRADOS"
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

}