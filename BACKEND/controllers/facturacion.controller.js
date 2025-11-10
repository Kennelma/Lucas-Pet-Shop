require('dotenv').config()

const mysqlConnection = require('../config/conexion');

//=========================================================
// FUNCIÓN REUTILIZABLE PARA MANEJAR MOVIMIENTOS DE KARDEX
//=========================================================
async function insertarMovimientoKardex (conn, datosMovimiento) {
  const {
    cantidad_movimiento,
    costo_unitario,
    id_usuario,
    id_medicamento,
    id_lote,
    tipo_movimiento,
    origen_movimiento
  } = datosMovimiento;

  const [tipo] = await conn.query(
    `SELECT id_estado_pk AS id
     FROM cat_estados
     WHERE dominio = 'TIPO' AND nombre_estado = ?`,
    [tipo_movimiento]
  );

  const [origen] = await conn.query(
    `SELECT id_estado_pk AS id
     FROM cat_estados
     WHERE dominio = 'ORIGEN' AND nombre_estado = ?`,
    [origen_movimiento]
  );

  await conn.query(
    `INSERT INTO tbl_movimientos_kardex (
        cantidad_movimiento,
        costo_unitario,
        fecha_movimiento,
        id_tipo_fk,
        id_origen_fk,
        id_usuario_fk,
        id_medicamento_fk,
        id_lote_fk
     ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`,
    [
      cantidad_movimiento,
      costo_unitario,
      tipo[0].id,
      origen[0].id,
      id_usuario,
      id_medicamento,
      id_lote
    ]
  );
}


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
            descuento,
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

        const impuesto_porcentaje = parseFloat(isv[0]?.valor_parametro || 15);

        if (impuesto_porcentaje <= 0 || isNaN(impuesto_porcentaje)) {
            throw new Error('Error al obtener el impuesto del sistema. Contacte al administrador.');
        }

        //SE VALIDA Y CALCULAR CADA ITEM
        let id_medicamento = null;
        let subtotal_exento = 0;   //PRODUCTO EXENTO
        let subtotal_gravado = 0;   //PRODUCTO GRAVADO
        const detallesValidados = [];

        //FOR EACH PARA EL ARRAY DE ITEMS QUE VIENEN DEL FRONTEND
        for (const item of items) {

            const { tipo, item: item_id, cantidad, ajuste, estilistas } = item;

            let precio_unitario = 0;
            let nombre_item = '';
            let id_producto = '';
            let tiene_impuesto = false;
            let id_tipo_item_fk = null;

            //OBTENER PRECIO REAL DESDE LA BD SEGÚN EL TIPO
            if (tipo === 'PRODUCTOS') {

                const [producto] = await conn.query(
                `SELECT
                    p.id_producto_pk,
                    p.nombre_producto,
                    p.precio_producto,
                    p.stock,
                    p.tipo_item_fk,
                    p.tiene_impuesto
                FROM tbl_productos p
                INNER JOIN cat_tipo_item t
                        ON t.id_tipo_item_pk = p.tipo_item_fk
                WHERE p.id_producto_pk = ? AND p.activo = TRUE AND p.stock > 0`,
                [item_id]
                );

                const cantidadSolicitada = parseInt(cantidad);

                console.log(`Validando stock para ${producto[0].nombre_producto}`);
                console.log(`Disponible: ${producto[0].stock}, Solicitado: ${cantidadSolicitada}`);

                if (producto[0].stock < cantidadSolicitada) {
                throw new Error(`Stock insuficiente para "${producto[0].nombre_producto}". Solicitado: ${cantidadSolicitada}, Disponible: ${producto[0].stock}`);
                }


                precio_unitario = parseFloat(producto[0].precio_producto);
                id_producto = producto[0].id_producto_pk;
                nombre_item = producto[0].nombre_producto;
                id_tipo_item_fk = producto[0].tipo_item_fk;
                tiene_impuesto = Boolean(producto[0].tiene_impuesto);


                //====================VALIDAR_SI_ES_MEDICAMENTO_CON_LOTES====================
                const [esMedicamento] = await conn.query(
                    `SELECT id_medicamento_pk
                    FROM tbl_medicamentos_info
                    WHERE id_producto_fk = ?`,
                    [item_id]
                );

                if (esMedicamento.length > 0) {

                    //ES UN MEDICAMENTO, VALIDAR LOTES CON FIFO
                    id_medicamento = esMedicamento[0].id_medicamento_pk;

                    //OBTENER LOTES DISPONIBLES ORDENADOS POR FECHA DE VENCIMIENTO (FIFO)
                    const [lotes] = await conn.query(
                    `SELECT
                        l.id_lote_medicamentos_pk,
                        l.codigo_lote,
                        l.stock_lote,
                        l.fecha_vencimiento,
                        e.nombre_estado
                    FROM tbl_lotes_medicamentos l
                    INNER JOIN cat_estados e ON l.estado_lote_fk = e.id_estado_pk
                    WHERE l.id_medicamento_fk = ?
                        AND l.stock_lote > 0
                        AND l.fecha_vencimiento >= CURDATE()
                        AND e.nombre_estado != 'CADUCADO'
                    ORDER BY l.fecha_vencimiento ASC
                    FOR UPDATE`,
                    [id_medicamento]
                    );


                    if (!lotes || lotes.length === 0) {
                        throw new Error(`No hay lotes disponibles para ${nombre_item}`);
                    }

                    //VALIDAR QUE HAY SUFICIENTE STOCK EN LOTES NO VENCIDOS
                    const stockDisponible = lotes.reduce((sum, lote) => sum + lote.stock_lote, 0);
                    if (stockDisponible < cantidad) {
                        throw new Error(`Stock insuficiente en lotes no vencidos para ${nombre_item}. Disponible: ${stockDisponible}`);
                    }

                    //GUARDAR INFO DE LOTES PARA DESCONTAR DESPUÉS
                    item.lotesADescontar = [];
                    let cantidadRestante = cantidad;

                    for (const lote of lotes) {
                        if (cantidadRestante <= 0) break;

                        const cantidadDelLote = Math.min(cantidadRestante, lote.stock_lote);
                        item.lotesADescontar.push({
                            id_lote: lote.id_lote_medicamentos_pk,
                            codigo_lote: lote.codigo_lote,
                            cantidad: cantidadDelLote
                        });

                        cantidadRestante -= cantidadDelLote;
                    }
                }

            } else if (tipo === 'SERVICIOS') {


                const [servicio] = await conn.query(
                    `SELECT
                        id_servicio_peluqueria_pk,
                        nombre_servicio_peluqueria,
                        precio_servicio,
                        id_tipo_item_fk
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
                id_tipo_item_fk = servicio[0].id_tipo_item_fk;

            } else if (tipo === 'PROMOCIONES') {

                const [promocion] = await conn.query(
                    `SELECT
                        id_promocion_pk,
                        nombre_promocion,
                        precio_promocion,
                        id_tipo_item_fk
                    FROM tbl_promociones
                    WHERE id_promocion_pk = ? AND activo = TRUE`,
                    [item_id]
                );

                if (!promocion || promocion.length === 0) {
                    throw new Error(`Promoción con ID ${item_id} no encontrada o inactiva`);
                }

                //VALIDAR ESTILISTAS
                if (!estilistas || estilistas.length === 0) {
                    throw new Error(`La promoción ${promocion[0].nombre_promocion} requiere al menos un estilista`);
                }

                precio_unitario = parseFloat(promocion[0].precio_promocion);
                nombre_item = promocion[0].nombre_promocion;
                id_tipo_item_fk = promocion[0].id_tipo_item_fk;

            } else {
                throw new Error(`Tipo de item no válido: ${tipo}`);
            }

            //CALCULAR TOTAL DE LINEA
            const ajuste_valor = parseFloat(ajuste || 0);
            const subtotal_linea = cantidad * precio_unitario;
            const total_linea = subtotal_linea + ajuste_valor;

            //ACUMULAR SUBTOTALES SEGÚN IMPUESTO
            if (tiene_impuesto) {
                subtotal_gravado += total_linea / 1.15;
            } else {
               subtotal_exento += total_linea;
            }

            //AGREGAR AL ARRAY VALIDADO
            detallesValidados.push({
                nombre_item,
                cantidad,
                precio_unitario,
                ajuste: ajuste_valor,
                total_linea,
                id_producto,
                id_tipo_item_fk,
                tiene_impuesto,
                id_medicamento,
                estilistas: estilistas || [],
                lotesADescontar: item.lotesADescontar || null  //LOTES FIFO PARA MEDICAMENTOS
            });
        }


        //SE CALCULAN LOS TOTALES DE LA FACTURA
        const impuesto = subtotal_gravado * (impuesto_porcentaje / 100);
        const descuento_valor = parseFloat(descuento || 0);
        const total_final = subtotal_exento + subtotal_gravado + impuesto - descuento_valor;
        const saldo = total_final; //INICIALMENTE EL SALDO ES IGUAL AL TOTAL

        //SE CALCULA LOS TOTALES FINALES
        if (isNaN(total_final) || isNaN(impuesto_porcentaje)) {
            throw new Error('Error en el cálculo de totales. Valores inválidos detectados.');
        }

        //VALIDAR RESULTADOS
        if (isNaN(subtotal_exento) || isNaN(subtotal_gravado) || isNaN(impuesto) || isNaN(total_final)) {
            throw new Error('Error en cálculos finales. Por favor, revise los datos ingresados.');
        }

        if (total_final <= 0) {
            throw new Error('El total de la factura no puede ser cero o negativo.');}

        //SE GENERA EL NÚMERO DE FACTURA (Formato: FAC-2025-001)
        const [[{ numero_factura }]] = await conn.query(`
            SELECT CONCAT(
                'FAC-', YEAR(CURDATE()), '-',
                LPAD(COALESCE(MAX(SUBSTRING_INDEX(numero_factura, '-', -1)), 0) + 1, 3, '0')
            ) AS numero_factura
            FROM tbl_facturas
            WHERE numero_factura LIKE CONCAT('FAC-', YEAR(CURDATE()), '-%')
            FOR UPDATE
        `);

        //VERIFICAR QUE EL NÚMERO NO EXISTA (POR SI HAY FORMATOS ANTIGUOS)
        const [existente] = await conn.query(
            `SELECT numero_factura FROM tbl_facturas WHERE numero_factura = ?`,
            [numero_factura]
        );

        if (existente.length > 0) {
            throw new Error(`El número de factura ${numero_factura} ya existe. Intente nuevamente.`);
        }

        //INSERTAR FACTURA CON EL NÚMERO YA GENERADO
        const [factura] = await conn.query(
            `INSERT INTO tbl_facturas (
                numero_factura,
                fecha_emision,
                RTN,
                subtotal_exento,
                subtotal_gravado,
                impuesto,
                descuento,
                total,
                saldo,
                id_sucursal_fk,
                id_usuario_fk,
                id_estado_fk,
                id_cliente_fk
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                numero_factura,
                fechaEmision,
                RTN || null,
                subtotal_exento.toFixed(2),
                subtotal_gravado.toFixed(2),
                impuesto.toFixed(2),
                descuento_valor.toFixed(2),
                total_final.toFixed(2),
                saldo.toFixed(2),
                id_sucursal,
                id_usuario,
                estado_factura,
                id_cliente || null
            ]
        );

        const id_factura = factura.insertId;



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
                    id_tipo_item_fk,
                    tiene_impuesto
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    detalle.nombre_item,
                    detalle.cantidad,
                    detalle.precio_unitario,
                    detalle.ajuste,
                    detalle.total_linea || null,
                    id_factura,
                    detalle.id_tipo_item_fk,
                    detalle.tiene_impuesto ? 1 : 0,
                ]
            );

            const id_detalle = detalleInsertado.insertId;

            // SI HAY ESTILISTAS, INSERTAR EN TABLA PIVOTE
            if (detalle.estilistas && detalle.estilistas.length > 0) {

                for (const estilista of detalle.estilistas) {

                    await conn.query(
                        `INSERT INTO tbl_detalle_factura_estilistas (
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
                }
            }

            // DESCONTAR INVENTARIO SI ES PRODUCTO
            if (detalle.id_producto) {


                //SI TIENE LOTES (ES MEDICAMENTO), DESCONTAR DE LOS LOTES CON FIFO
                if (detalle.lotesADescontar && detalle.lotesADescontar.length > 0) {

                    //ACTUALIZO STOCK DE LOS LOTES SI ES QUE VENDO
                    for (const lote of detalle.lotesADescontar) {

                        //SE DESCUENTA EL LOTE
                        await conn.query(
                            `UPDATE tbl_lotes_medicamentos
                            SET stock_lote = stock_lote - ?
                            WHERE id_lote_medicamentos_pk = ?`,
                            [lote.cantidad, lote.id_lote]
                        );

                        // INSERTO EN EL KARDEX LA SALIDA DE LOTE VENDIDO (MEDICAMENTO)
                        await insertarMovimientoKardex(conn, {
                            cantidad_movimiento: lote.cantidad,
                            costo_unitario: detalle.precio_unitario,
                            id_usuario,
                            id_medicamento: detalle.id_medicamento,
                            id_lote: lote.id_lote,
                            tipo_movimiento: 'SALIDA',
                            origen_movimiento: 'VENTA'
                        });
                    }
                }

                //DESCONTAR DEL STOCK GENERAL DEL PRODUCTO
                await conn.query(
                    `UPDATE tbl_productos
                     SET stock = stock - ?
                     WHERE id_producto_pk = ?`,
                    [detalle.cantidad, detalle.id_producto]
                );
            }
        }

        await conn.commit();

        return res.status(201).json({
            success: true,
            mensaje: 'Factura creada exitosamente',
            data: {
                id_factura,
                numero_factura,
                fecha_emision: fechaEmision,
                subtotal: (subtotal_exento + subtotal_gravado).toFixed(2),
                impuesto: impuesto.toFixed(2),
                descuento: descuento_valor.toFixed(2),
                total: total_final.toFixed(2),
                saldo: saldo.toFixed(2)
            }
        });

    } catch (err) {
        await conn.rollback();
        console.error('ERROR:', err.message);
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

//ENDPOINTS PARA CARGAR CATÁLOGOS DE ITEMS
exports.catalogoItems = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    let resultados;

    try {
        switch (req.query.tipo_item) {

            case 'PRODUCTOS':

                [resultados] = await conn.query(
                    `SELECT
                        p.id_producto_pk,
                        p.nombre_producto,
                        p.precio_producto,
                        p.tiene_impuesto,
                        COALESCE(
                            (SELECT SUM(l.stock_lote)
                            FROM tbl_lotes_medicamentos l
                            INNER JOIN tbl_medicamentos_info m
                                ON l.id_medicamento_fk = m.id_medicamento_pk
                            INNER JOIN cat_estados e
                                ON l.estado_lote_fk = e.id_estado_pk
                            WHERE m.id_producto_fk = p.id_producto_pk
                            AND l.stock_lote > 0
                            AND l.fecha_vencimiento >= CURDATE()
                            AND e.nombre_estado = 'DISPONIBLE'
                            ),
                            p.stock
                        ) AS stock
                    FROM tbl_productos p
                    WHERE p.activo = TRUE
                    HAVING stock > 0`
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

//PARA MOSTRAR EL HISTORIAL DE FACTURAS EN LA TABLA (NO CONFUNDIR)
exports.historialFacturas = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        [facturas] = await conn.query(
            `SELECT
                f.id_factura_pk,
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


exports.detalleFacturaSeleccionada = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const { id_factura } = req.query;

        const [detalle] = await conn.query(
            `SELECT
                f.numero_factura,
                f.subtotal_gravado,
                f.subtotal_exento,
                f.total,
                f.impuesto,
                f.saldo,
                f.descuento,
                df.nombre_item,
                df.cantidad_item,
                df.precio_item,
                df.ajuste_precio,
                df.total_linea,
                ct.nombre_tipo_item AS tipo_item
            FROM tbl_detalles_facturas df
            LEFT JOIN cat_tipo_item ct
                ON df.id_tipo_item_fk = ct.id_tipo_item_pk
            LEFT JOIN tbl_facturas f
                ON df.id_factura_fk = f.id_factura_pk
            WHERE df.id_factura_fk = ?
            ORDER BY df.id_detalle_pk`,
            [id_factura]
        );

        if (detalle.length > 0) {
            res.status(200).json({
                success: true,
                message: "DETALLE DE FACTURA ENCONTRADO",
                data: detalle
            });
        } else {
            res.status(404).json({
                success: false,
                message: "DETALLE DE FACTURA NO ENCONTRADO"
            });
        }


    } catch (error) {
        console.error("Error al obtener detalle de factura:", error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener detalle de factura',
            error: error.message
        });
    } finally {
        conn.release();
    }

};





















//ENDPOINT PARA IMPRESIÓN DE FACTURA DETALLADA (MEJORAR)
exports.ImpresionFactura = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        const { numero_factura } = req.query;

        //DATOS DE LA FACTURA
        const [factura] = await conn.query(
            `SELECT
                f.id_factura_pk,
                f.numero_factura,
                f.fecha_emision,
                f.RTN,
                (f.subtotal_exento + f.subtotal_gravado) as subtotal,
                f.descuento,
                f.impuesto,
                f.total,
                f.saldo,
                c.nombre_estado as estado,
                cl.nombre_cliente,
                cl.apellido_cliente,
                cl.telefono_cliente
            FROM tbl_facturas f
            INNER JOIN cat_estados c ON f.id_estado_fk = c.id_estado_pk
            LEFT JOIN tbl_clientes cl ON f.id_cliente_fk = cl.id_cliente_pk
            WHERE f.numero_factura = ?`,
            [numero_factura]
        );

        //ITEMS DE LA FACTURA
        const [items] = await conn.query(
            `SELECT
                df.nombre_item,
                df.cantidad_item,
                df.precio_item,
                df.ajuste_precio,
                df.total_linea,
                ct.nombre_tipo_item AS tipo_item
            FROM tbl_detalles_facturas df
            LEFT JOIN cat_tipo_item ct ON df.id_tipo_item_fk = ct.id_tipo_item_pk
            WHERE df.id_factura_fk = ?
            ORDER BY df.id_detalle_pk`,
            [factura[0].id_factura_pk]
        );

        //ESTA INFORMACION TIENE QUE VENIR DEL MIDDLEWARE DEL USUARIO (REVISAR)
        //INFORMACIÓN DE LA EMPRESA
        const [empresa] = await conn.query(
            `SELECT
                nombre_empresa,
                direccion_empresa,
                telefono_empresa,
                correo_empresa
            FROM tbl_empresa
            LIMIT 1`
        );

        //HISTORIAL DE PAGOS
        const [pagos] = await conn.query(
            `SELECT
                p.fecha_pago,
                p.monto_pagado,
                mp.metodo_pago,
                tp.tipo_pago
            FROM tbl_pago_aplicacion pa
            INNER JOIN tbl_pagos p ON pa.id_pago_fk = p.id_pago_pk
            INNER JOIN cat_metodo_pago mp ON p.id_metodo_pago_fk = mp.id_metodo_pago_pk
            INNER JOIN cat_tipo_pago tp ON p.id_tipo_pago_fk = tp.id_tipo_pago_pk
            WHERE pa.id_factura_fk = ?
            ORDER BY p.fecha_pago DESC`,
            [factura[0].id_factura_pk]
        );

        res.status(200).json({
            success: true,
            data: {
                factura: factura[0],
                items: items,
                empresa: empresa[0] || {},
                pagos: pagos
            }
        });

    } catch (error) {
        console.error("Error al obtener detalle de factura:", error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener detalle de factura',
            error: error.message
        });
    } finally {
        conn.release();
    }
};


