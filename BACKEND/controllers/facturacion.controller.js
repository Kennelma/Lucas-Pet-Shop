require('dotenv').config()

const mysqlConnection = require('../config/conexion');

//------FUNCION DE MOVIMIENTOS DE KARDEX----------------
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

//---- FUNCION PARA OBTENER SIGUIENTE NÚMERO DE FACTURA CON CAI
async function obtenerSiguienteNumeroFactura(conn) {

    //OBTENER CAI ACTIVO
    const [cai] = await conn.query(
        `SELECT
            
            codigo_cai,
            prefijo,
            numero_actual,
            rango_inicio,
            rango_fin,
            fecha_limite,
            punto_emision,
            tipo_documento
        FROM tbl_cai
        WHERE activo = TRUE
        AND tipo_documento = '01'
        LIMIT 1
        FOR UPDATE`
    );

    if (!cai || cai.length === 0) {
        throw new Error('NO HAY CAI ACTIVO PARA FACTURAR. CONTACTE AL ADMINISTRADOR.');
    }

    //VARIABLE PARA EL CAI
    const caiData = cai[0];

    //SE VALIDA FECHA LÍMITE DE EXPERIACIÓN
    const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
    const fechaLimite = new Date(caiData.fecha_limite);
        fechaLimite.setHours(0, 0, 0, 0);

    //VALIDACION QUE ME DESACTIVA EL CAI SI LLEGO A SU FECHA LIMITE
    if (fechaLimite < hoy) {

    await conn.query(
        `UPDATE tbl_cai
        SET activo = FALSE
        WHERE activo = TRUE AND tipo_documento = '01'`
        );
        throw new Error(`CAI VENCIDO (fecha límite: ${caiData.fecha_limite}). NO SE PUEDEN GENERAR FACTURAS, DEBE SOLICITAR UN NUEVO CAI AL SAR.`);
    }

    //SE VALIDA RANGO
    if (caiData.numero_actual > caiData.rango_fin) {
    await conn.query(
        `UPDATE tbl_cai
            SET activo = FALSE
         WHERE activo = TRUE AND tipo_documento = '01'`
    );
    throw new Error(`FACTURAS AGOTADAS. SE ALCANZÓ EL LÍMITE DE RANGO: (${caiData.rango_fin}). DEBE SOLICITAR UN NUEVO CAI AL SAR.`);
    }


    //SE GENERA NUMERO FORMATEADO CON EL PREFIJO DEL CAI
    const numeroFormateado = `${caiData.prefijo}-${String(caiData.numero_actual).padStart(8, '0')}`;

    //SE INCREMENTA EL CONTADOR
    await conn.query(
        `UPDATE tbl_cai
        SET numero_actual = numero_actual + 1
        WHERE activo = TRUE AND tipo_documento = '01'` //TIPO DE DOCUMENTO, FACTURA
    );

    return {
        numero_factura: numeroFormateado,
        cai: caiData.codigo_cai,
        rango_inicio: caiData.rango_inicio,
        rango_fin: caiData.rango_fin,
        fecha_limite: caiData.fecha_limite,
    };
}

//====================VALIDAR_DISPONIBILIDAD====================
//ESTE ENDPOINT SE LLAMA ANTES DE IR A PAGOS
exports.validarDisponibilidad = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const { items } = req.body;

        const itemsValidados = [];
        const errores = [];

        //FOR EACH PARA EL ARRAY DE ITEMS QUE VIENEN DEL FRONTEND
        for (const item of items) {

            const { tipo, item: item_id, cantidad, estilistas } = item;

            //VALIDAR SEGÚN EL TIPO
            if (tipo === 'PRODUCTOS') {

                const [producto] = await conn.query(
                `SELECT
                    p.id_producto_pk,
                    p.nombre_producto,
                    p.precio_producto,
                    p.stock,
                    p.tiene_impuesto
                FROM tbl_productos p
                WHERE p.id_producto_pk = ? AND p.activo = TRUE`,
                [item_id]
                );

                if (!producto || producto.length === 0) {
                    errores.push(`Producto con ID ${item_id} no encontrado o inactivo`);
                    continue;
                }

                const cantidadSolicitada = parseInt(cantidad);

                //VALIDAR STOCK GENERAL
                if (producto[0].stock < cantidadSolicitada) {
                    errores.push(`Stock insuficiente para "${producto[0].nombre_producto}". Solicitado: ${cantidadSolicitada}, Disponible: ${producto[0].stock}`);
                    continue;
                }

                //VALIDAR SI ES MEDICAMENTO CON LOTES
                const [esMedicamento] = await conn.query(
                    `SELECT id_medicamento_pk
                    FROM tbl_medicamentos_info
                    WHERE id_producto_fk = ?`,
                    [item_id]
                );

                if (esMedicamento.length > 0) {
                    //ES UN MEDICAMENTO, VALIDAR LOTES CON FIFO
                    const id_medicamento = esMedicamento[0].id_medicamento_pk;

                    //OBTENER LOTES DISPONIBLES ORDENADOS POR FECHA DE VENCIMIENTO (FIFO)
                    const [lotes] = await conn.query(
                    `SELECT
                        l.id_lote_medicamentos_pk,
                        l.stock_lote,
                        l.fecha_vencimiento,
                        e.nombre_estado
                    FROM tbl_lotes_medicamentos l
                    INNER JOIN cat_estados e ON l.estado_lote_fk = e.id_estado_pk
                    WHERE l.id_medicamento_fk = ?
                        AND l.stock_lote > 0
                        AND l.fecha_vencimiento >= CURDATE()
                        AND e.nombre_estado = 'DISPONIBLE'
                    ORDER BY l.fecha_vencimiento ASC`,
                    [id_medicamento]
                    );

                    if (!lotes || lotes.length === 0) {
                        errores.push(`No hay lotes disponibles para ${producto[0].nombre_producto}`);
                        continue;
                    }

                    //VALIDAR QUE HAY SUFICIENTE STOCK EN LOTES NO VENCIDOS
                    const stockDisponible = lotes.reduce((sum, lote) => sum + lote.stock_lote, 0);
                    if (stockDisponible < cantidadSolicitada) {
                        errores.push(`Stock insuficiente en lotes no vencidos para ${producto[0].nombre_producto}. Disponible: ${stockDisponible}`);
                        continue;
                    }
                }

                itemsValidados.push({
                    id: item_id,
                    tipo: 'PRODUCTOS',
                    nombre: producto[0].nombre_producto,
                    precio: producto[0].precio_producto,
                    cantidad: cantidadSolicitada,
                    tiene_impuesto: producto[0].tiene_impuesto
                });

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
                    errores.push(`Servicio con ID ${item_id} no encontrado o inactivo`);
                    continue;
                }

                //VALIDAR ESTILISTAS
                if (!estilistas || estilistas.length === 0) {
                    errores.push(`El servicio ${servicio[0].nombre_servicio_peluqueria} requiere al menos un estilista`);
                    continue;
                }

                itemsValidados.push({
                    id: item_id,
                    tipo: 'SERVICIOS',
                    nombre: servicio[0].nombre_servicio_peluqueria,
                    precio: servicio[0].precio_servicio,
                    cantidad: cantidad
                });

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
                    errores.push(`Promoción con ID ${item_id} no encontrada o inactiva`);
                    continue;
                }

                //VALIDAR ESTILISTAS
                if (!estilistas || estilistas.length === 0) {
                    errores.push(`La promoción ${promocion[0].nombre_promocion} requiere al menos un estilista`);
                    continue;
                }

                itemsValidados.push({
                    id: item_id,
                    tipo: 'PROMOCIONES',
                    nombre: promocion[0].nombre_promocion,
                    precio: promocion[0].precio_promocion,
                    cantidad: cantidad
                });

            } else {
                errores.push(`Tipo de item no válido: ${tipo}`);
                continue;
            }
        }

        //SI HAY ERRORES, RETORNAR 400
        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: 'Hay problemas con algunos items',
                errores: errores,
                itemsValidados: itemsValidados
            });
        }

        //TODO ESTÁ DISPONIBLE
        return res.status(200).json({
            success: true,
            mensaje: 'Todos los items están disponibles',
            data: itemsValidados
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al validar disponibilidad',
            error: err.message
        });
    } finally {
        conn.release();
    }

};

//====================CREAR_FACTURA_SIN_PAGO====================
exports.crearFacturaSinPago = async (req, res) => {

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
            nombre_cliente,
            descuento,
            items
        } = req.body;

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
        let subtotal_exento = 0;
        let subtotal_gravado = 0;
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

                if (producto[0].stock < cantidadSolicitada) {
                    throw new Error(`Stock insuficiente para "${producto[0].nombre_producto}". Solicitado: ${cantidadSolicitada}, Disponible: ${producto[0].stock}`);
                }

                precio_unitario = parseFloat(producto[0].precio_producto);
                id_producto = producto[0].id_producto_pk;
                nombre_item = producto[0].nombre_producto;
                id_tipo_item_fk = producto[0].tipo_item_fk;
                tiene_impuesto = Boolean(producto[0].tiene_impuesto);

                //VALIDAR SI ES MEDICAMENTO CON LOTES (FIFO)
                const [esMedicamento] = await conn.query(
                    `SELECT id_medicamento_pk
                    FROM tbl_medicamentos_info
                    WHERE id_producto_fk = ?`,
                    [item_id]
                );

                if (esMedicamento.length > 0) {
                    id_medicamento = esMedicamento[0].id_medicamento_pk;

                    const [lotes] = await conn.query(
                        `SELECT
                            l.id_lote_medicamentos_pk,
                            l.stock_lote,
                            l.fecha_vencimiento
                        FROM tbl_lotes_medicamentos l
                        WHERE l.id_medicamento_fk = ? AND l.stock_lote > 0
                        ORDER BY l.fecha_vencimiento ASC`,
                        [id_medicamento]
                    );

                    let cantidadRestante = cantidadSolicitada;
                    const lotesADescontar = [];

                    for (const lote of lotes) {
                        if (cantidadRestante <= 0) break;

                        const cantidadDelLote = Math.min(lote.stock_lote, cantidadRestante);
                        lotesADescontar.push({
                            id_lote: lote.id_lote_medicamentos_pk,
                            cantidad: cantidadDelLote
                        });

                        cantidadRestante -= cantidadDelLote;
                    }

                    if (cantidadRestante > 0) {
                        throw new Error(`Stock insuficiente en lotes para "${nombre_item}". Falta: ${cantidadRestante}`);
                    }

                    item.lotesADescontar = lotesADescontar;
                }

            } else if (tipo === 'SERVICIOS') {

                const [servicio] = await conn.query(
                `SELECT
                    s.id_servicio_peluqueria_pk,
                    s.nombre_servicio_peluqueria,
                    s.precio_servicio,
                    s.tiene_impuesto,
                    t.id_tipo_item_pk
                FROM tbl_servicios_peluqueria s
                INNER JOIN cat_tipo_item t
                        ON t.nombre_tipo_item = 'SERVICIO'
                WHERE s.id_servicio_peluqueria_pk = ? AND s.activo = TRUE`,
                [item_id]
                );

                precio_unitario = parseFloat(servicio[0].precio_servicio);
                nombre_item = servicio[0].nombre_servicio_peluqueria;
                id_tipo_item_fk = servicio[0].id_tipo_item_pk;
                tiene_impuesto = Boolean(servicio[0].tiene_impuesto);

            } else if (tipo === 'PROMOCIONES') {

                const [promocion] = await conn.query(
                `SELECT
                    pr.id_promocion_pk,
                    pr.nombre_promocion,
                    pr.precio_promocion,
                    pr.tiene_impuesto,
                    t.id_tipo_item_pk
                FROM tbl_promociones pr
                INNER JOIN cat_tipo_item t
                        ON t.nombre_tipo_item = 'PROMOCION'
                WHERE pr.id_promocion_pk = ? AND pr.activo = TRUE`,
                [item_id]
                );

                precio_unitario = parseFloat(promocion[0].precio_promocion);
                nombre_item = promocion[0].nombre_promocion;
                id_tipo_item_fk = promocion[0].id_tipo_item_pk;
                tiene_impuesto = Boolean(promocion[0].tiene_impuesto);
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
                lotesADescontar: item.lotesADescontar || null
            });
        }

        //SE CALCULAN LOS TOTALES DE LA FACTURA
        const impuesto = subtotal_gravado * (impuesto_porcentaje / 100);
        const descuento_valor = parseFloat(descuento || 0);
        const total_final = subtotal_exento + subtotal_gravado + impuesto - descuento_valor;

        //VALIDACIONES
        if (total_final <= 0) {
            throw new Error('El total de la factura no puede ser cero o negativo.');
        }

        // FACTURA SIN PAGO: saldo = total, estado = PENDIENTE
        const saldo = total_final;
        const estado_nombre = 'PENDIENTE';

        const [estado] = await conn.query(
            `SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'FACTURA' AND nombre_estado = ?`,
            [estado_nombre]
        );

        const estado_factura = estado[0].id_estado_pk;

        //OBTENER SIGUIENTE NÚMERO DE FACTURA CON CAI
        const { numero_factura, cai } = await obtenerSiguienteNumeroFactura(conn);

        //INSERTAR FACTURA
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
            ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                numero_factura,
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

        // INSERTAR DETALLES Y DESCONTAR INVENTARIO
        for (const detalle of detallesValidados) {

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

            // ESTILISTAS
            if (detalle.estilistas && detalle.estilistas.length > 0) {
                for (const estilista of detalle.estilistas) {
                    await conn.query(
                        `INSERT INTO tbl_detalle_factura_estilistas (
                            id_detalle_fk,
                            id_estilista_fk,
                            num_mascotas_atendidas
                        ) VALUES (?, ?, ?)`,
                        [id_detalle, estilista.estilistaId, estilista.cantidadMascotas || 0]
                    );
                }
            }

            // DESCONTAR INVENTARIO
            if (detalle.id_producto) {

                if (detalle.lotesADescontar && detalle.lotesADescontar.length > 0) {
                    // MEDICAMENTO CON LOTES (FIFO)
                    for (const loteDescontar of detalle.lotesADescontar) {
                        await conn.query(
                            `UPDATE tbl_lotes_medicamentos
                            SET stock_lote = stock_lote - ?
                            WHERE id_lote_medicamentos_pk = ?`,
                            [loteDescontar.cantidad, loteDescontar.id_lote]
                        );

                        await conn.query(
                            `INSERT INTO tbl_movimientos_kardex (
                                fecha_movimiento,
                                cantidad,
                                tipo_movimiento,
                                origen_movimiento,
                                id_lote_fk,
                                id_producto_fk
                            ) VALUES (NOW(), ?, 'SALIDA', 'VENTA', ?, ?)`,
                            [loteDescontar.cantidad, loteDescontar.id_lote, detalle.id_producto]
                        );
                    }
                }

                // DESCONTAR STOCK GENERAL
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
            mensaje: 'Factura creada sin pago (PENDIENTE)',
            data: {
                id_factura,
                numero_factura,
                fecha_emision: fechaEmision,
                subtotal: (subtotal_exento + subtotal_gravado).toFixed(2),
                impuesto: impuesto.toFixed(2),
                descuento: descuento_valor.toFixed(2),
                total: total_final.toFixed(2),
                saldo: saldo.toFixed(2),
                estado: estado_nombre
            }
        });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear la factura sin pago',
            error: err.message
        });
    } finally {
        conn.release();
    }

};

//====================CREAR_FACTURA_CON_PAGO====================
exports.crearFacturaConPago = async (req, res) => {

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
            items,
            monto_pagado,
            metodos_pago,  //ARRAY de métodos [{id_metodo_pago_fk: 1, monto: 50}, ...]
            id_metodo_pago,  //Un solo método (para compatibilidad)
            id_tipo_pago
        } = req.body;

        //SE VALIDAN LOS MÉTODOS DE PAGO
        let metodosPagoValidados = [];
        let montoTotalPago = 0;

        //CASOS DE USO:
        if (metodos_pago && Array.isArray(metodos_pago) && metodos_pago.length > 0) {
            //CASO 1: SE ENVIÓ UN ARRAY DE MÉTODOS DE PAGO
            metodosPagoValidados = metodos_pago;
            montoTotalPago = metodos_pago.reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);

        } else if (id_metodo_pago && monto_pagado) {

            //CASO 2: SE ENVIÓ UN SOLO MÉTODO DE PAGO CON MONTO
            metodosPagoValidados = [{ id_metodo_pago_fk: id_metodo_pago, monto: monto_pagado }];
            montoTotalPago = parseFloat(monto_pagado);
        } else {
            throw new Error('Debe incluir información de pago (metodos_pago o monto_pagado + id_metodo_pago)');
        }

        if (!id_tipo_pago) {
            throw new Error('Debe incluir el tipo de pago (id_tipo_pago)');
        }

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

                //VALIDAR STOCK DISPONIBLE VS CANTIDAD SOLICITADA
                if (producto[0].stock < cantidadSolicitada) {
                throw new Error(`Stock insuficiente para "${producto[0].nombre_producto}". Solicitado: ${cantidadSolicitada}, Disponible: ${producto[0].stock}`);
                }

                precio_unitario = parseFloat(producto[0].precio_producto);
                id_producto = producto[0].id_producto_pk;
                nombre_item = producto[0].nombre_producto;
                id_tipo_item_fk = producto[0].tipo_item_fk;
                tiene_impuesto = Boolean(producto[0].tiene_impuesto);

                //VALIDAR SI ES MEDICAMENTO CON LOTES (FIFO)
                const [esMedicamento] = await conn.query(
                    `SELECT id_medicamento_pk
                    FROM tbl_medicamentos_info
                    WHERE id_producto_fk = ?`,
                    [item_id]
                );

                if (esMedicamento.length > 0) {

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

                    //VALIDAR STOCK TOTAL EN LOTES NO VENCIDOS
                    const stockDisponible = lotes.reduce((sum, lote) => sum + lote.stock_lote, 0);
                    if (stockDisponible < cantidad) {
                        throw new Error(`Stock insuficiente en lotes no vencidos para ${nombre_item}. Disponible: ${stockDisponible}`);
                    }

                    //PREPARAR ARRAY DE LOTES A DESCONTAR (FIFO)
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

        //VALIDAR QUE LOS CÁLCULOS SEAN CORRECTOS
        if (isNaN(subtotal_exento) || isNaN(subtotal_gravado) || isNaN(impuesto) || isNaN(total_final)) {
            throw new Error('Error en cálculos finales. Por favor, revise los datos ingresados.');
        }

        if (total_final <= 0) {
            throw new Error('EL TOTAL DE LA FACTURA DEBE SER MAYOR QUE CERO.');
        }

        //VALIDAR QUE EL MONTO PAGADO NO SEA MAYOR AL TOTAL
        if (montoTotalPago > total_final) {
            throw new Error('EL MONTO PAGADO NO PUEDE SER MAYOR AL TOTAL DE LA FACTURA.');
        }

        //CALCULAR SALDO DESPUÉS DEL PAGO
        const saldo = total_final - montoTotalPago;

        //DETERMINAR ESTADO DE LA FACTURA (PAGADA O PENDIENTE)
        const estado_nombre = saldo === 0 ? 'PAGADA' : 'PENDIENTE';

        const [estado] = await conn.query(
            `SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'FACTURA' AND nombre_estado = ?`,
            [estado_nombre]
        );

        const estado_factura = estado[0].id_estado_pk;

        //OBTENER SIGUIENTE NÚMERO DE FACTURA CON CAI
        const { numero_factura, cai, fecha_limite } = await obtenerSiguienteNumeroFactura(conn);


        //INSERTAR FACTURA EN LA BASE DE DATOS
        const [factura] = await conn.query(
            `INSERT INTO tbl_facturas (
                numero_factura,
                fecha_emision,
                RTN,
                nombre_cliente,
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
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                numero_factura,
                fechaEmision,
                RTN || null,
                nombre_cliente || null,
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

        //INSERTAR DETALLES DE LA FACTURA Y DESCONTAR INVENTARIO
        for (const detalle of detallesValidados) {

            //INSERTAR ITEM EN DETALLES DE FACTURA
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

            //INSERTAR ESTILISTAS (SI APLICA PARA SERVICIOS/PROMOCIONES)
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

            //DESCONTAR INVENTARIO (SOLO PRODUCTOS)
            if (detalle.id_producto) {

                //SI ES MEDICAMENTO CON LOTES, DESCONTAR CON FIFO
                if (detalle.lotesADescontar && detalle.lotesADescontar.length > 0) {

                    for (const lote of detalle.lotesADescontar) {

                        //DESCONTAR DEL LOTE
                        await conn.query(
                            `UPDATE tbl_lotes_medicamentos
                            SET stock_lote = stock_lote - ?
                            WHERE id_lote_medicamentos_pk = ?`,
                            [lote.cantidad, lote.id_lote]
                        );

                        //REGISTRAR MOVIMIENTO EN KARDEX
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

                //DESCONTAR DEL STOCK GENERAL
                await conn.query(
                    `UPDATE tbl_productos
                     SET stock = stock - ?
                     WHERE id_producto_pk = ?`,
                    [detalle.cantidad, detalle.id_producto]
                );
            }
        }

        //REGISTRAR PAGOS (SOPORTA MÚLTIPLES MÉTODOS DE PAGO)
        const [estadoPago] = await conn.query(
            `SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'PAGO' AND nombre_estado = 'APROBADO'`
        );

        if (!estadoPago || estadoPago.length === 0) {
            throw new Error('No se encontró el estado APROBADO para pagos');
        }

        //INSERTAR CADA MÉTODO DE PAGO
        for (const metodoPago of metodosPagoValidados) {
            const { id_metodo_pago_fk, monto } = metodoPago;

            //INSERTAR PAGO
            const [pago] = await conn.query(
                `INSERT INTO tbl_pagos (
                    fecha_pago,
                    monto_pagado,
                    id_metodo_pago_fk,
                    id_tipo_pago_fk,
                    id_estado_fk
                ) VALUES (NOW(), ?, ?, ?, ?)`,
                [monto, id_metodo_pago_fk, id_tipo_pago, estadoPago[0].id_estado_pk]
            );

            const id_pago = pago.insertId;

            //APLICAR EL PAGO A LA FACTURA
            await conn.query(
                `INSERT INTO tbl_pago_aplicacion (
                    id_pago_fk,
                    id_factura_fk,
                    monto,
                    fecha_aplicacion
                ) VALUES (?, ?, ?, ?)`,
                [id_pago, id_factura, monto, new Date()]
            );
        }

        await conn.commit();

        return res.status(201).json({
            success: true,
            mensaje: 'Factura creada y pago registrado exitosamente',
            data: {
                id_factura,
                numero_factura,
                fecha_emision: fechaEmision,
                subtotal: (subtotal_exento + subtotal_gravado).toFixed(2),
                impuesto: impuesto.toFixed(2),
                descuento: descuento_valor.toFixed(2),
                total: total_final.toFixed(2),
                pagado: montoTotalPago.toFixed(2),
                saldo: saldo.toFixed(2),
                estado: estado_nombre
            }
        });

    } catch (err) {
        await conn.rollback();
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
                COALESCE(
                    NULLIF(f.nombre_cliente, ''),
                    CONCAT_WS(' ', cl.nombre_cliente, cl.apellido_cliente),
                    'CONSUMIDOR FINAL'
                ) AS nombre_cliente,
                cl.identidad_cliente
            FROM tbl_facturas f
            INNER JOIN tbl_usuarios u ON f.id_usuario_fk = u.id_usuario_pk
            INNER JOIN tbl_sucursales s ON f.id_sucursal_fk = s.id_sucursal_pk
            INNER JOIN cat_estados c ON f.id_estado_fk = c.id_estado_pk
            LEFT JOIN tbl_clientes cl ON f.id_cliente_fk = cl.id_cliente_pk
            ORDER BY f.id_factura_pk DESC`
        );

        res.status(200).json({
            success: true,
            data: facturas
        });

    } catch (error) {
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
    const { numero_factura } = req.query;

    const [detalle] = await conn.query(`
      SELECT
        f.id_factura_pk,
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
      FROM tbl_facturas f
      LEFT JOIN tbl_detalles_facturas df
        ON df.id_factura_fk = f.id_factura_pk
      LEFT JOIN cat_tipo_item ct
        ON df.id_tipo_item_fk = ct.id_tipo_item_pk
      WHERE f.numero_factura = ?
      ORDER BY df.id_detalle_pk
    `, [numero_factura]);

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
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener detalle de factura',
      error: error.message
    });
  } finally {
    conn.release();
  }
};


//ENDPOINT_PARA_IMPRESION_DE_FACTURA_DETALLADA
exports.ImpresionFactura = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        const { numero_factura } = req.query;

        if (!numero_factura) {
            return res.status(400).json({
                success: false,
                mensaje: 'Número de factura es requerido'
            });
        }

        //CONSULTA_PRINCIPAL_DE_FACTURA_CON_TODOS_LOS_DATOS
        const [factura] = await conn.query(
            `SELECT
                f.id_factura_pk,
                f.numero_factura,
                f.nombre_cliente,
                f.fecha_emision,
                f.RTN,
                f.subtotal_exento,
                f.subtotal_gravado,
                f.descuento,
                f.impuesto,
                f.total,
                f.saldo,
                c.nombre_estado as estado,
                cl.id_cliente_pk,
                COALESCE(
                    NULLIF(f.nombre_cliente, ''),
                    CONCAT_WS(' ', cl.nombre_cliente, cl.apellido_cliente),
                    'CONSUMIDOR FINAL'
                ) AS nombre_cliente,
                cl.identidad_cliente,
                cl.telefono_cliente,
                u.usuario as vendedor,
                s.nombre_sucursal,
                s.direccion_sucursal,
                s.telefono_sucursal
            FROM tbl_facturas f
            INNER JOIN cat_estados c ON f.id_estado_fk = c.id_estado_pk
            INNER JOIN tbl_usuarios u ON f.id_usuario_fk = u.id_usuario_pk
            INNER JOIN tbl_sucursales s ON f.id_sucursal_fk = s.id_sucursal_pk
            LEFT JOIN tbl_clientes cl ON f.id_cliente_fk = cl.id_cliente_pk
            WHERE f.numero_factura = ?`,
            [numero_factura]
        );

        if (!factura || factura.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: `Factura ${numero_factura} no encontrada`
            });
        }

        const id_factura = factura[0].id_factura_pk;

        //ITEMS_DE_LA_FACTURA_CON_DETALLES_DE_ESTILISTAS
        const [items] = await conn.query(
            `SELECT
                df.id_detalle_pk,
                df.nombre_item,
                df.cantidad_item,
                df.precio_item,
                df.ajuste_precio,
                df.total_linea,
                df.tiene_impuesto,
                ct.nombre_tipo_item AS tipo_item
            FROM tbl_detalles_facturas df
            LEFT JOIN cat_tipo_item ct ON df.id_tipo_item_fk = ct.id_tipo_item_pk
            WHERE df.id_factura_fk = ?
            ORDER BY df.id_detalle_pk`,
            [id_factura]
        );

        //OBTENER_ESTILISTAS_POR_CADA_ITEM_(SI_APLICA)
        for (let item of items) {
            const [estilistas] = await conn.query(
                `SELECT
                    ec.nombre_estilista,
                    ec.apellido_estilista,
                    dfe.num_mascotas_atendidas
                FROM tbl_detalle_factura_estilistas dfe
                INNER JOIN tbl_estilistas_caninos ec ON dfe.id_estilista_fk = ec.id_estilista_pk
                WHERE dfe.id_detalle_fk = ?`,
                [item.id_detalle_pk]
            );
            item.estilistas = estilistas;
        }

        //INFORMACION_DE_LA_EMPRESA
        const [empresa] = await conn.query(
            `SELECT
                nombre_empresa,
                telefono_empresa,
                correo_empresa,
                rtn_empresa
            FROM tbl_empresa
            LIMIT 1`
        );

        //HISTORIAL_DE_PAGOS_APLICADOS_A_LA_FACTURA
        const [pagos] = await conn.query(
            `SELECT
                p.id_pago_pk,
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
            [id_factura]
        );

        //CALCULAR_TOTAL_PAGADO_Y_SALDO_PENDIENTE
        const total_pagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto_pagado), 0);
        const saldo_pendiente = parseFloat(factura[0].total) - total_pagado;

        //RESPUESTA_COMPLETA_CON_TODOS_LOS_DATOS
        res.status(200).json({
            success: true,
            data: {
                factura: {
                    ...factura[0],
                    total_pagado: total_pagado.toFixed(2),
                    saldo_pendiente: saldo_pendiente.toFixed(2)
                },
                items: items,
                empresa: empresa[0] || {},
                pagos: pagos,
                resumen: {
                    cantidad_items: items.length,
                    cantidad_pagos: pagos.length,
                    porcentaje_pagado: ((total_pagado / parseFloat(factura[0].total)) * 100).toFixed(2)
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener detalle de factura',
            error: error.message
        });
    } finally {
        conn.release();
    }
};