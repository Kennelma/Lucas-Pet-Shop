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

        // 2) SE TOMA EL ID DEL USUARIO Y LA SUCURSAL POR EL AUTENTICADO (MIDDLEWARE AUTH)
        const id_usuario = req.usuario?.id_usuario_pk;
        const id_sucursal = req.usuario?.id_sucursal_fk;

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
            let id_tipo_item = null;


            //SI ES UN PRODUCTO
            if (detalle.id_producto) {

                const [producto] = await conn.query(
                    `SELECT
                        nombre_producto,
                        precio_producto,
                        stock,
                        tipo_producto_fk
                    FROM tbl_productos
                    WHERE id_producto_pk = ? AND activo = TRUE`,
                    [detalle.id_producto]
                );

                //VALIDACIONES BASICAS DE STOCK BAJO O INACTIVO
                 if (!producto || producto.length === 0) {
                    return res.status(404).json({
                        success: false,
                        mensaje: `Producto con ID ${detalle.id_producto} no encontrado o inactivo`
                    });

                }

                if (producto[0].stock < cantidad) {
                    await conn.rollback();
                    return res.status(400).json({
                        success: false,
                        mensaje: `Stock insuficiente para ${producto[0].nombre_producto}. Disponible: ${producto[0].stock}, Solicitado: ${cantidad}`
                    });

                }


                nombre_item = producto[0].nombre_producto;
                precio_item = parseFloat(producto[0].precio_producto);

                const [tipoItem] = await conn.query(
                    `SELECT id_tipo_item_pk
                    FROM cat_tipo_item
                    WHERE nombre_tipo_item = 'PRODUCTOS'`
                );

                id_tipo_item = tipoItem && tipoItem.length > 0 ? tipoItem[0].id_tipo_item_pk : null;


                //SI ES UN SERVICIO
            } else if (detalle.id_servicio) {

                const [servicio] = await conn.query(
                    `SELECT
                        nombre_servicio_peluqueria,
                        precio_servicio
                    FROM tbl_servicios_peluqueria_canina
                    WHERE id_servicio_peluqueria_pk = ? AND activo = TRUE`,
                    [detalle.id_servicio]
                );

                //VALIDACIONES BASICAS
                if (!servicio || servicio.length === 0) {
                    await conn.rollback();
                    return res.status(404).json({
                        success: false,
                        mensaje: `Servicio con ID ${detalle.id_servicio} no encontrado o inactivo`
                    });
                }

                nombre_item = servicio[0].nombre_servicio_peluqueria;
                precio_item = parseFloat(servicio[0].precio_servicio);

                const [tipoItem] = await conn.query(
                    `SELECT id_tipo_item_pk
                     FROM cat_tipo_item
                     WHERE nombre_tipo_item = 'SERVICIOS PELUQUERIA'`
                );

                id_tipo_item = tipoItem && tipoItem.length > 0 ? tipoItem[0].id_tipo_item_pk : null;


                // SI ES UNA PROMOCIÓN
            } else if (detalle.id_promocion) {

                const [promocion] = await conn.query(
                    `SELECT
                        nombre_promocion,
                        precio_promocion
                    FROM tbl_promociones
                    WHERE id_promocion_pk = ?`,
                    [detalle.id_promocion]
                );

                //VALIDACIONES BASICAS
                if (!promocion || promocion.length === 0) {
                    await conn.rollback();
                    return res.status(404).json({
                        success: false,
                        mensaje: `Promoción con ID ${detalle.id_promocion} no encontrada`
                    });
                }

                nombre_item = promocion[0].nombre_promocion;
                precio_item = parseFloat(promocion[0].precio_promocion);

                const [tipoItem] = await conn.query(
                    `SELECT id_tipo_item_pk
                     FROM cat_tipo_item
                     WHERE nombre_tipo_item LIKE '%Promocion%'
                     LIMIT 1`
                );

                id_tipo_item = tipoItem && tipoItem.length > 0 ? tipoItem[0].id_tipo_item_pk : null;

                console.log(`Promoción: ${nombre_item} | Precio: L.${precio_item}`);

            } else {
                await conn.rollback();
                return res.status(400).json({
                    success: false,
                    mensaje: 'CADA DETALLE DEBE TENER UN ID, YA SE PRODUCTO, SERVICIO O PROMOCION'
                });
            }


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

