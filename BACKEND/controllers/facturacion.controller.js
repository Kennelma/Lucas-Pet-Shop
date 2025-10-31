require('dotenv').config()

const mysqlConnection = require('../config/conexion');

//====================CREAR_FACTURA====================
exports.crearFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        const fechaEmision = new Date();

        //SE OBTIENEN LOS DATOS DESDE EL TOKEN
        const id_usuario = req.usuario.id_usuario_pk;
        const id_sucursal = req.usuario.id_sucursal_fk;

        //SE OBTIENEN LOS DATOS DESDE EL BODY DEL FRONTEND
        const {
            RTN,
            id_cliente,
            items  //ARRAY DE ITEMS
        } = req.body;


        //ANTES DE ENTRAR A PAGOS, ES PENDIENTE PORQUE NO SE HA PAGADO
        const [estado] = await conn.query(
            `SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'FACTURA' AND nombre_estado = 'PENDIENTE'`
        );

        const estado_factura = estado[0].id_estado_pk;

        //SE OBTIENE EL IMPUESTO PARA LOS CALCULOS DE LA FACTURA
        const [isv] = await conn.query(
            `SELECT valor_parametro
            FROM tbl_parametros
            WHERE nombre_parametro = 'IMPUESTO_ISV'`
        );

        const impuesto_porcentaje = parseFloat(isv[0].valor_parametro); //15%
        const impuesto_valor = 1 + (impuesto_porcentaje / 100); //1.15

        //SE VALIDA Y CALCULAR CADA ITEM
        let total_bruto = 0;
        let total_ajuste = 0;
        const detallesValidados = [];

        //FOR EACH PARA EL ARRAY DE ITEMS QUE VIENEN DEL FRONTEND
        for (const item of items) {

            const { tipo, item: item_id, cantidad, ajuste, estilistas } = item;

            let precio_unitario = 0;
            let nombre_item = '';
            let id_producto = null;
            let id_servicio = null;
            let id_promocion = null;

            //OBTENER PRECIO REAL DESDE LA BD SEGÚN EL TIPO
            if (tipo === 'PRODUCTOS') {

                const [producto] = await conn.query(
                    `SELECT
                        id_producto_pk,
                        nombre_producto,
                        precio_producto,
                        stock
                    FROM tbl_productos
                    WHERE id_producto_pk = ? AND activo = TRUE`,
                    [item_id]
                );

                if (!producto || producto.length === 0) {
                    throw new Error(`Producto con ID ${item_id} no encontrado o inactivo`);
                }

                // VALIDAR STOCK
                if (producto[0].stock < cantidad) {
                    throw new Error(`Stock insuficiente para ${producto[0].nombre_producto}. Disponible: ${producto[0].stock}`);
                }

                precio_unitario = parseFloat(producto[0].precio_producto);
                nombre_item = producto[0].nombre_producto;
                id_producto = producto[0].id_producto_pk;

            } else if (tipo === 'SERVICIOS') {

                const [servicio] = await conn.query(
                    `SELECT
                        id_servicio_peluqueria_pk,
                        nombre_servicio_peluqueria,
                        precio_servicio
                    FROM tbl_servicios_peluqueria_canina
                    WHERE id_servicio_peluqueria_pk = ? AND activo = TRUE`,
                    [item_id]
                );

                if (!servicio || servicio.length === 0) {
                    throw new Error(`Servicio con ID ${item_id} no encontrado o inactivo`);
                }

                //VALIDAR ESTILISTAS
                if (!estilistas || estilistas.length === 0) {
                    throw new Error(`El servicio ${servicio[0].nombre_servicio_peluqueria} requiere al menos un estilista`);
                }

                precio_unitario = parseFloat(servicio[0].precio_servicio);
                nombre_item = servicio[0].nombre_servicio_peluqueria;
                id_servicio = servicio[0].id_servicio_peluqueria_pk;

            } else if (tipo === 'PROMOCIONES') {

                const [promocion] = await conn.query(
                    `SELECT
                        id_promocion_pk,
                        nombre_promocion,
                        precio_promocion
                    FROM tbl_promociones
                    WHERE id_promocion_pk = ? AND activo = TRUE`,
                    [item_id]
                );

                if (!promocion || promocion.length === 0) {
                    throw new Error(`Promoción con ID ${item_id} no encontrada o inactiva`);
                }

                // VALIDAR ESTILISTAS
                if (!estilistas || estilistas.length === 0) {
                    throw new Error(`La promoción ${promocion[0].nombre_promocion} requiere al menos un estilista`);
                }

                precio_unitario = parseFloat(promocion[0].precio_promocion);
                nombre_item = promocion[0].nombre_promocion;
                id_promocion = promocion[0].id_promocion_pk;

            } else {
                throw new Error(`Tipo de item no válido: ${tipo}`);
            }

            //CALCULAR TOTAL DE LINEA
            const ajuste_valor = parseFloat(ajuste || 0);
            const total_linea = (cantidad * precio_unitario) + ajuste_valor;

            total_bruto += (cantidad * precio_unitario);
            total_ajuste += ajuste_valor;

            //AGREGAR AL ARRAY VALIDADO
            detallesValidados.push({
                nombre_item,
                cantidad,
                precio_unitario,
                ajuste: ajuste_valor,
                total_linea,
                id_producto,
                id_servicio,
                id_promocion,
                estilistas: estilistas || []
            });

            console.log(`✅ ${nombre_item} | ${cantidad} x L.${precio_unitario} + L.${ajuste_valor} = L.${total_linea.toFixed(2)}`);
        }

        //SE CALCULA LOS TOTALES FINALES
        const total_con_ajustes = total_bruto + total_ajuste;
        const subtotal = total_con_ajustes / impuesto_valor; // Base imponible
        const impuesto = total_con_ajustes - subtotal; // ISV
        const descuento = total_ajuste < 0 ? Math.abs(total_ajuste) : 0;
        const total = total_con_ajustes;
        const saldo = total; // Sin pagos aún

        console.log('💵 TOTALES:');
        console.log(`   Subtotal: L.${subtotal.toFixed(2)}`);
        console.log(`   Impuesto (15%): L.${impuesto.toFixed(2)}`);
        console.log(`   Descuento: L.${descuento.toFixed(2)}`);
        console.log(`   TOTAL: L.${total.toFixed(2)}`);
        console.log(`   Saldo pendiente: L.${saldo.toFixed(2)}`);

        // ⭐ GENERAR NÚMERO DE FACTURA ANTES DEL INSERT
        const [ultimaFactura] = await conn.query(
            `SELECT IFNULL(MAX(id_factura_pk), 0) + 1 as siguiente_id FROM tbl_facturas`
        );

        const siguiente_id = ultimaFactura[0].siguiente_id;

        const [sucursalData] = await conn.query(
            `SELECT LPAD(id_sucursal_pk, 3, '0') as codigo
             FROM tbl_sucursales
             WHERE id_sucursal_pk = ?`,
            [id_sucursal]
        );

        const codigo_sucursal = sucursalData[0].codigo;
        const numero_factura = `FAC-${codigo_sucursal}-${String(siguiente_id).padStart(8, '0')}`;

        console.log(`📄 Número de factura generado: ${numero_factura}`);

        // 7) INSERTAR FACTURA CON EL NÚMERO YA GENERADO
        const [factura] = await conn.query(
            `INSERT INTO tbl_facturas (
                numero_factura,
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
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                numero_factura,  // ⭐ AGREGAR AQUÍ
                fechaEmision,
                RTN || null,
                subtotal.toFixed(2),
                impuesto.toFixed(2),
                descuento.toFixed(2),
                total.toFixed(2),
                saldo.toFixed(2),
                id_sucursal,
                id_usuario,
                estado_factura,
                id_cliente || null
            ]
        );

        const id_factura = factura.insertId;

        console.log(`✅ Factura ${numero_factura} creada - ID: ${id_factura}`);

        // 8) INSERTAR DETALLES Y ESTILISTAS
        for (const detalle of detallesValidados) {

            // INSERTAR DETALLE
            const [detalleInsertado] = await conn.query(
                `INSERT INTO tbl_detalles_facturas (
                    nombre_item,
                    cantidad_item,
                    precio_item,
                    ajuste_precio,
                    total_linea,
                    id_factura_fk,
                    id_producto_fk,
                    id_servicio_fk,
                    id_promocion_fk
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    detalle.nombre_item,
                    detalle.cantidad,
                    detalle.precio_unitario,
                    detalle.ajuste,
                    detalle.total_linea || null,
                    id_factura,
                    detalle.id_producto || null,
                    detalle.id_servicio || null,
                    detalle.id_promocion || null
                ]
            );

            const id_detalle = detalleInsertado.insertId;

            // SI HAY ESTILISTAS, INSERTAR EN TABLA PIVOTE
            if (detalle.estilistas && detalle.estilistas.length > 0) {

                for (const estilista of detalle.estilistas) {

                    await conn.query(
                        `INSERT INTO tbl_detalle_estilistas (
                            id_detalle_fk,
                            id_estilista_fk,
                            num_mascotas_atendidas
                        ) VALUES (?, ?, ?)`,
                        [
                            id_detalle,
                            estilista.estilistaId,
                            estilista.cantidadMascotas || 0
                        ]
                    );

                    console.log(`   👤 Estilista ID ${estilista.estilistaId} - ${estilista.cantidadMascotas} mascotas`);
                }
            }

            // DESCONTAR INVENTARIO SI ES PRODUCTO
            if (detalle.id_producto) {
                await conn.query(
                    `UPDATE tbl_productos
                     SET stock = stock - ?
                     WHERE id_producto_pk = ?`,
                    [detalle.cantidad, detalle.id_producto]
                );
                console.log(`   📦 Stock descontado: ${detalle.nombre_item} (-${detalle.cantidad})`);
            }
        }

        await conn.commit();
        console.log('✅ TRANSACCIÓN COMPLETADA');

        return res.status(201).json({
            success: true,
            mensaje: 'Factura creada exitosamente',
            data: {
                id_factura,
                fecha_emision: fechaEmision,
                subtotal: subtotal.toFixed(2),
                impuesto: impuesto.toFixed(2),
                descuento: descuento.toFixed(2),
                total: total.toFixed(2),
                saldo: saldo.toFixed(2)
            }
        });

    } catch (err) {
        await conn.rollback();
        console.error('❌ ERROR:', err.message);
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear la factura',
            error: err.message
        });
    } finally {
        conn.release();
    }

};

//====================ENDPOINTS_AUXILIARES====================

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

};

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

};

exports.buscarClientesPorIdentidad = async (req, res) => {

    const { identidad } = req.query;

    const conn = await mysqlConnection.getConnection();

    try {
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

exports.usuarioFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const id_usuario = req.usuario.id_usuario_pk;

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

exports.buscarEstilistas = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const [registros] = await conn.query(
            `SELECT
                id_estilista_pk,
                nombre_estilista,
                apellido_estilista
             FROM tbl_estilistas_caninos`
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

};

exports.historialFacturas = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        [facturas] = await conn.query(
            `SELECT
                f.numero_factura,
                f.fecha_emision,
                f.total,
                f.saldo,
                u.usuario,
                s.nombre_sucursal,
                c.nombre_estado,
                cl.nombre_cliente,
                cl.apellido_cliente,
                cl.identidad_cliente
            FROM tbl_facturas f
            INNER JOIN tbl_usuarios u ON f.id_usuario_fk = u.id_usuario_pk
            INNER JOIN tbl_sucursales s ON f.id_sucursal_fk = s.id_sucursal_pk
            INNER JOIN cat_estados c ON f.id_estado_fk = c.id_estado_pk
            LEFT JOIN tbl_clientes cl ON f.id_cliente_fk = cl.id_cliente_pk`
        );

        console.log("Historial de facturas:", facturas);
        res.status(200).json({
            success: true,
            data: facturas
        });

    } catch (error) {
        console.error("Error al obtener historial de facturas:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        conn.release();
    }

}