//CONTROLADORES PARA EL MÓDULO DE PRODUCTOS (MEDICAMENTOS, ALIMENTOS, ACCESORIOS, ANIMALES Y LOTES)

const express = require('express');
const mysqlConnection = require('../config/conexion');


//ESTOS ATRIBUTOS SON COMUNES PARA TODOS LOS ENDPOINT
function insert_atributos_padre (body) {
    return [
        body.nombre_producto,
        body.precio_producto,
        body.stock,
    ];
}

//FUNCIÓN REUTILIZABLE PARA MANEJAR MOVIMIENTOS DE KARDEX
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



    //OBTENER ID DEL TIPO DE MOVIMIENTO
    const [tipo] = await conn.query(
        `SELECT id_estado_pk AS id
        FROM cat_estados
        WHERE dominio = 'TIPO' AND nombre_estado = ?`,
        [tipo_movimiento]
    );

    //OBTENER ID DEL ORIGEN DEL MOVIMIENTO
    const [origen] = await conn.query(
        `SELECT id_estado_pk AS id
        FROM cat_estados
        WHERE dominio = 'ORIGEN' AND nombre_estado = ?`,
        [origen_movimiento]
    );

    //INSERTAR EN EL KARDEX EL MOVIMIENTO
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

// ─────────────────────────────────────────────────────────
//        ENDPOINT DE INSERTAR PRODUCTOS
// ─────────────────────────────────────────────────────────
exports.crear = async (req, res) => {

    // console.log('req.body:', req.body);
    // console.log('req.files:', req.files);

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

        let id_producto;

        if (req.body.tipo_producto !== 'LOTES') {
            //OBTENGO EL ID DEL TIPO DE PRODUCTO (CATALOGO)
            const [tipoProducto] = await conn.query(
                `SELECT
                    id_tipo_item_pk AS id_tipo
                FROM cat_tipo_item
                WHERE nombre_tipo_item = ?`,
                [req.body.tipo_producto]
            );

            // Validar impuesto
            const tieneImpuesto = req.body.tiene_impuesto == 1 ? 1 : 0;

            //SE LLENA LA TABLA PADRE PRIMERO
            const [productos] = await conn.query(
                `INSERT INTO tbl_productos (
                    nombre_producto,
                    precio_producto,
                    stock,
                    tipo_item_fk,
                    tiene_impuesto
                ) VALUES (?, ?, ?, ?, ?)`,
                [...insert_atributos_padre(req.body), tipoProducto[0].id_tipo, tieneImpuesto]
            );

            //OBTENGO EL ID DEL PRODUCTO INSERTADO
            id_producto = productos.insertId;
        }

        switch (req.body.tipo_producto) {

            case 'ACCESORIOS':

                await conn.query(
                    `INSERT INTO tbl_accesorios_info (
                        tipo_accesorio,
                        id_producto_fk
                    ) VALUES (?, ?)`,
                    [
                        req.body.tipo_accesorio,
                        id_producto
                    ]);
                break;

            case 'ANIMALES':

                await conn.query(
                    `INSERT INTO tbl_animales_info (
                        especie,
                        sexo,
                        id_producto_fk
                    ) VALUES (?, ?, ?)`,
                    [
                        req.body.especie,
                        req.body.sexo,
                        id_producto
                    ]);
                break;

            case 'ALIMENTOS':

                await conn.query(
                    `INSERT INTO tbl_alimentos_info (
                        alimento_destinado,
                        peso_alimento,
                        id_producto_fk
                    )VALUES (?,?,?)`,
                    [
                        req.body.alimento_destinado,
                        req.body.peso_alimento,
                        id_producto
                    ]);
                break;

            case 'MEDICAMENTOS':

                //SE LLENA EL MEDICAMENTO PRIMERO
                const [medicamentos] = await conn.query (
                    `INSERT INTO tbl_medicamentos_info (
                        presentacion_medicamento,
                        tipo_medicamento,
                        cantidad_contenido,
                        unidad_medida,
                        id_producto_fk
                    )VALUES (?,?,?,?,?)`,
                    [
                        req.body.presentacion_medicamento,
                        req.body.tipo_medicamento,
                        req.body.cantidad_contenido,
                        req.body.unidad_medida,
                        id_producto
                    ]);

                //OBTENGO EL ID DEL MEDICAMENTO PARA PODER INGRESAR EL PRIMER LOTE
                const id_medicamento = medicamentos.insertId;

                //SE LLENA EL LOTE DEL MEDICAMENTO
                    const [lote] = await conn.query(
                        `INSERT INTO tbl_lotes_medicamentos (
                        codigo_lote,
                        fecha_vencimiento,
                        stock_lote,
                        id_medicamento_fk)
                        VALUES (?, ?, ?, ?)`,
                        [
                            req.body.codigo_lote,
                            req.body.fecha_vencimiento,
                            req.body.stock_lote,
                            id_medicamento
                        ]
                    );


                    //OBTENGO DATOS PARA LLENAR AUTOMATICAMENTE EL KARDEX
                    const id_lote = lote.insertId;
                    const cantidad_movimiento = req.body.stock_lote;
                    const costo_unitario = req.body.precio_producto;

                    //EL ID DEL USUARIO VIENE DEL MIDDLEWARE DE AUTENTICACIÓN
                    const id_usuario = req.usuario?.id_usuario_pk;

                    //USAR LA FUNCIÓN REUTILIZABLE PARA INSERTAR EL MOVIMIENTO EN EL KARDEX
                    await insertarMovimientoKardex(conn, {
                        cantidad_movimiento,
                        costo_unitario,
                        id_usuario,
                        id_medicamento,
                        id_lote,
                        tipo_movimiento: 'ENTRADA',
                        origen_movimiento: 'COMPRA'
                    });

                    break;

            case 'LOTES':

                //OBTENGO EL MEDICAMENTO FK Y EL PRECIO DEL PRODUCTO EXISTENTE
                const [medicamento] = await conn.query (
                    `SELECT
                        m.id_medicamento_pk AS id,
                        p.precio_producto
                    FROM tbl_medicamentos_info m
                    INNER JOIN tbl_productos p ON m.id_producto_fk = p.id_producto_pk
                    WHERE m.id_producto_fk = ?`,
                    [req.body.id_producto]
                );

                //GUARDA EN VARIABLES LA FK DE MEDICAMENTOS Y EL PRECIO
                const id_med_fk = medicamento[0].id;
                const precio_medicamento = medicamento[0].precio_producto;

                //INSERTO EL LOTE CORRESPONDIENTE A ESE MEDICAMENTO
                const [lote_nuevo] = await conn.query(
                    `INSERT INTO tbl_lotes_medicamentos(
                        codigo_lote,
                        fecha_vencimiento,
                        stock_lote,
                        id_medicamento_fk
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        req.body.codigo_lote,
                        req.body.fecha_vencimiento,
                        req.body.stock_lote,
                        id_med_fk
                    ]
                );

                //OBTENGO DATOS PARA LLENAR AUTOMATICAMENTE EL KARDEX
                const id_lote_nuevo = lote_nuevo.insertId;
                const cantidad_movimiento_lote = req.body.stock_lote;
                const costo_unitario_lote = precio_medicamento;

                //EL ID DEL USUARIO VIENE DEL MIDDLEWARE DE AUTENTICACIÓN
                const id_user = req.usuario?.id_usuario_pk;

                //USAR LA FUNCIÓN REUTILIZABLE PARA INSERTAR EL MOVIMIENTO EN EL KARDEX
                await insertarMovimientoKardex(conn, {
                    cantidad_movimiento: cantidad_movimiento_lote,
                    costo_unitario: costo_unitario_lote,
                    id_usuario: id_user,
                    id_medicamento: id_med_fk,
                    id_lote: id_lote_nuevo,
                    tipo_movimiento: 'ENTRADA',
                    origen_movimiento: 'COMPRA'
                });

                break;

            default:
               throw new Error('Tipo de producto no válido');
        }

        await conn.commit(); //CONFIRMO LA TRANSACCIÓN
        res.json({
            Consulta: true,
            mensaje: 'Registro realizado con éxito',
        });

    } catch (err) {
        await conn.rollback(); //REVIERTO LA CONSULTA SI HAY ERROR
        console.error('ERROR AL CREAR EL ', err);
        res.json({
            Consulta: false,
            error: err.message
        });

    } finally {
        conn.release();
    }

};

// ─────────────────────────────────────────────────────────
//        ENDPOINT PARA VER CATÁLOGOS DE PRODUCTOS
// ─────────────────────────────────────────────────────────
exports.verCatalogo = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let registros;

        switch (req.query.tipo_catalogo) {

            case 'TIPOS_PRODUCTOS':
                [registros] = await conn.query(
                    `SELECT id_tipo_producto_pk, nombre_tipo_producto
                     FROM cat_tipo_productos
                     ORDER BY id_tipo_producto_pk`
                );
                break;

            case 'ESTADOS_TIPO':
                [registros] = await conn.query(
                    `SELECT id_estado_pk, nombre_estado
                     FROM cat_estados
                     WHERE dominio = 'TIPO'
                     ORDER BY id_estado_pk`
                );
                break;

            case 'ESTADOS_ORIGEN':
                [registros] = await conn.query(
                    `SELECT id_estado_pk, nombre_estado
                     FROM cat_estados
                     WHERE dominio = 'ORIGEN'
                     ORDER BY id_estado_pk`
                );
                break;

            default:
                throw new Error('Tipo de catálogo no válido');
        }

        res.json({
            Consulta: true,
            catalogo: registros || []
        });

    } catch (err) {
        res.json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }
};

// ─────────────────────────────────────────────────────────
//          ENDPOINT DE ACTUALIZAR PRODUCTOS
// ─────────────────────────────────────────────────────────

//ATRIBUTOS COMUNES EN LOS REGISTROS, MEDIANTE LOS SP, SE PUEDE ACTUALIZAR O VARIOS ATRIBUTOS
function update_atributos_padre (body) {

    return [
        body.nombre_producto || null,
        body.precio_producto || null ,
        body.sku || null,
        body.stock || null,
        body.stock_minimo || null,
        body.activo !== undefined ? body.activo : null,
    ];
}

exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        const { id_producto, tipo_producto } = req.body;

        //VALIDAR IMPUESTO
        const tieneImpuesto = req.body.tiene_impuesto == 1 ? 1 : 0;

        //SE ACTUALIZA PRIMERO LA TABLA PADRE
        await conn.query(
            `UPDATE tbl_productos
            SET
                nombre_producto = COALESCE(?, nombre_producto),
                precio_producto = COALESCE(?, precio_producto),
                sku             = COALESCE(?, sku),
                stock           = COALESCE(?, stock),
                stock_minimo    = COALESCE(?, stock_minimo),
                activo          = COALESCE(?, activo),
                tiene_impuesto = COALESCE(?, tiene_impuesto)
            WHERE id_producto_pk = ?`,
            [...update_atributos_padre(req.body), tieneImpuesto, id_producto]
        );

        switch (tipo_producto) {

            case 'ANIMALES':

                await conn.query(
                `UPDATE tbl_animales_info
                SET
                    especie = COALESCE(?, especie),
                    sexo    = COALESCE(?, sexo)
                WHERE id_producto_fk = ?`,
                [
                    req.body.especie || null,
                    req.body.sexo || null,
                    id_producto,
                ]);
                break;

            case 'ALIMENTOS':

                await conn.query(
                `UPDATE tbl_alimentos_info
                SET
                    alimento_destinado = COALESCE(?, alimento_destinado),
                    peso_alimento    = COALESCE(?, peso_alimento)
                WHERE id_producto_fk = ?`,
                [
                    req.body.alimento_destinado || null,
                    req.body.peso_alimento || null,
                    id_producto,
                ]);
                break;

            case 'ACCESORIOS':
                await conn.query(
                `UPDATE tbl_accesorios_info
                SET
                    tipo_accesorio = COALESCE(?, tipo_accesorio)
                WHERE id_producto_fk = ?`,
                [
                    req.body.tipo_accesorio || null,
                    id_producto
                ]);
                break;

            case 'MEDICAMENTOS':

                await conn.query(
                `UPDATE tbl_medicamentos_info
                SET
                    presentacion_medicamento = COALESCE(?, presentacion_medicamento),
                    tipo_medicamento         = COALESCE(?, tipo_medicamento),
                    cantidad_contenido       = COALESCE(?, cantidad_contenido),
                    unidad_medida            = COALESCE(?, unidad_medida)
                WHERE id_producto_fk = ?`,
                [
                    req.body.presentacion_medicamento || null,
                    req.body.tipo_medicamento || null,
                    req.body.cantidad_contenido || null,
                    req.body.unidad_medida || null,
                    id_producto
                ]);
                break;

            case 'LOTES':

                await conn.query(
                `UPDATE tbl_lotes_medicamentos
                SET
                    fecha_vencimiento = COALESCE(?, fecha_vencimiento),
                    stock_lote        = COALESCE(?, stock_lote)
                WHERE id_lote_medicamentos_pk = ?`,
                [
                    req.body.fecha_vencimiento || null,
                    req.body.stock_lote || null,
                    id_producto
                ]);

                //SE OBTIENE EL ID DEL PRODUCTO FK PARA ACTUALIZAR EL STOCK TOTAL
                const [loteInfo] = await conn.query(
                    `SELECT m.id_producto_fk
                     FROM tbl_lotes_medicamentos l
                     INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
                     WHERE l.id_lote_medicamentos_pk = ?`,
                    [id_producto]
                );

                const id_producto_fk = loteInfo[0]?.id_producto_fk;

                if (id_producto_fk) {

                    //SE SUMA LOS STOCKS DE LOS LOTES DEL MEDICAMENTO
                    const [sumaStock] = await conn.query(
                        `SELECT SUM(stock_lote) AS total_stock
                         FROM tbl_lotes_medicamentos l
                         INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
                         WHERE m.id_producto_fk = ?`,
                        [id_producto_fk]
                    );
                    const total_stock = sumaStock[0]?.total_stock || 0;

                    //SE ACTUALIZA EL STOCK TOTAL EN LA TABLA DE PRODUCTOS
                    await conn.query(
                        `UPDATE tbl_productos SET stock = ? WHERE id_producto_pk = ?`,
                        [total_stock, id_producto_fk]
                    );
                }
                break;

            default:
                throw new Error('Tipo de producto no válido');
        }

        await conn.commit(); //CONFIRMO LA TRANSACCIÓN
        res.json({
            Consulta: true,
            mensaje: 'Registro actualizado con éxito',
            id_producto
        });

    } catch (err) {
        await conn.rollback(); //REVIERTO LA CONSULTA SI HAY ERROR
        res.json({
            Consulta: false,
            error: err.message
        });

    } finally {
        conn.release();
    }
};

// ─────────────────────────────────────────────────────────
//        ENDPOINT PARA VER CATÁLOGOS DE
// ─────────────────────────────────────────────────────────
exports.verCatalogo = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let registros;

        switch (req.query.tipo_catalogo) {

            case 'TIPOS_PRODUCTOS':
                [registros] = await conn.query(
                    `SELECT id_tipo_producto_pk, nombre_tipo_producto
                     FROM cat_tipo_productos
                     ORDER BY id_tipo_producto_pk`
                );
                break;

            case 'ESTADOS_TIPO':
                [registros] = await conn.query(
                    `SELECT id_estado_pk, nombre_estado
                     FROM cat_estados
                     WHERE dominio = 'TIPO'
                     ORDER BY id_estado_pk`
                );
                break;

            case 'ESTADOS_ORIGEN':
                [registros] = await conn.query(
                    `SELECT id_estado_pk, nombre_estado
                     FROM cat_estados
                     WHERE dominio = 'ORIGEN'
                     ORDER BY id_estado_pk`
                );
                break;

            default:
                throw new Error('Tipo de catálogo no válido');
        }

        res.json({
            Consulta: true,
            catalogo: registros || []
        });

    } catch (err) {
        res.json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }
};

// ─────────────────────────────────────────────────────────
//              ENDPOINT PARA VER LOS PRODUCTOS
// ─────────────────────────────────────────────────────────
//ENDPOINT DE VER LISTA DE PRODUCTOS
exports.ver = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let registros; //VARIABLE DE APOYO


        switch (req.query.tipo_producto) {

            case 'ACCESORIOS':
                [registros] = await conn.query(
                    `SELECT
                        p.id_producto_pk,
                        p.nombre_producto,
                        p.precio_producto,
                        p.sku,
                        p.stock,
                        p.stock_minimo,
                        p.activo,
                        ac.tipo_accesorio
                    FROM tbl_productos p
                    INNER JOIN tbl_accesorios_info ac ON p.id_producto_pk = ac.id_producto_fk
                    ORDER BY p.id_producto_pk DESC`);
                break;

            case 'ANIMALES':
                [registros] = await conn.query(
                    `SELECT
                        p.id_producto_pk,
                        p.nombre_producto,
                        p.precio_producto,
                        p.sku,
                        p.stock,
                        p.stock_minimo,
                        p.activo,
                        a.especie,
                        a.sexo
                    FROM tbl_productos p
                    INNER JOIN tbl_animales_info a
                        ON p.id_producto_pk = a.id_producto_fk
                    ORDER BY p.id_producto_pk DESC`);
                break;

            case 'ALIMENTOS':
                [registros] = await conn.query(
                    `SELECT
                        p.id_producto_pk,
                        p.nombre_producto,
                        p.precio_producto,
                        p.sku,
                        p.stock,
                        p.stock_minimo,
                        p.activo,
                        al.alimento_destinado,
                        al.peso_alimento
                    FROM tbl_productos p
                    INNER JOIN tbl_alimentos_info al ON p.id_producto_pk = al.id_producto_fk
                    ORDER BY p.id_producto_pk DESC`
                );
                break;

            case 'MEDICAMENTOS':
                [registros] = await conn.query(
                    `SELECT
                        p.id_producto_pk,
                        p.nombre_producto,
                        p.precio_producto,
                        p.sku,
                        p.stock,
                        p.stock_minimo,
                        p.activo,
                        m.presentacion_medicamento,
                        m.tipo_medicamento,
                        m.cantidad_contenido,
                        m.unidad_medida
                    FROM tbl_productos p
                    INNER JOIN tbl_medicamentos_info m
                        ON p.id_producto_pk = m.id_producto_fk
                    ORDER BY p.id_producto_pk DESC`);
                break;

            case 'LOTES':
                [registros] = await conn.query(
                    `SELECT
                        l.id_lote_medicamentos_pk,
                        l.codigo_lote,
                        l.fecha_ingreso,
                        l.fecha_vencimiento,
                        l.stock_lote,
                        e.nombre_estado AS estado_lote_nombre,
                        m.id_medicamento_pk,
                        m.id_producto_fk,
                        p.nombre_producto
                    FROM tbl_lotes_medicamentos l
                    INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
                    INNER JOIN tbl_productos p ON m.id_producto_fk = p.id_producto_pk
                    INNER JOIN cat_estados e ON l.estado_lote_fk = e.id_estado_pk AND e.dominio = 'LOTE_MEDICAMENTO' -- <-- join
                    ORDER BY l.id_lote_medicamentos_pk DESC`
                );
                break;

            case 'KARDEX':

                [registros] = await conn.query(
                    `SELECT
                        k.id_movimiento_pk,
                        p.nombre_producto,
                        l.codigo_lote,
                        k.cantidad_movimiento,
                        k.costo_unitario,
                        k.fecha_movimiento,
                        tm.nombre_estado AS tipo_movimiento,
                        om.nombre_estado AS origen_movimiento,
                        u.usuario AS nombre_usuario_movimiento
                    FROM
                        tbl_movimientos_kardex k
                    INNER JOIN
                        tbl_medicamentos_info m ON k.id_medicamento_fk = m.id_medicamento_pk
                    INNER JOIN
                        tbl_productos p ON m.id_producto_fk = p.id_producto_pk
                    LEFT JOIN
                        tbl_lotes_medicamentos l ON k.id_lote_fk = l.id_lote_medicamentos_pk
                    INNER JOIN
                        cat_estados tm ON k.id_tipo_fk = tm.id_estado_pk AND tm.dominio = 'TIPO'
                    INNER JOIN
                        cat_estados om ON k.id_origen_fk = om.id_estado_pk AND om.dominio = 'ORIGEN'
                    INNER JOIN
                        tbl_usuarios u ON k.id_usuario_fk = u.id_usuario_pk
                    ORDER BY
                        k.fecha_movimiento DESC, k.id_movimiento_pk DESC`
                );
                break;

            default:
                throw new Error('TIPO DE PRODUCTO NO VALIDO');
        }

        res.json({
            Consulta: true,
            productos: registros || []
        });

    } catch (err) {
        res.json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }

};

// ─────────────────────────────────────────────────────────
//            ENDPOINT PARA ELIMINAR PRODUCTOS
// ─────────────────────────────────────────────────────────
exports.eliminar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        //SI USO UN ID LOTE SE BORRA
        const { id_lote } = req.body;

        if (id_lote) {

            //SE OBTIENE EL STOCK DEL LOTE Y EL PRODUCTO RELACIONADO
            const [lotes] = await conn.query(
                `SELECT
                    l.stock_lote,
                    m.id_producto_fk
                FROM tbl_lotes_medicamentos l
                INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
                WHERE l.id_lote_medicamentos_pk = ?`,
                [id_lote]
            );

            const stock = lotes[0]?.stock_lote || 0;

            const id_produ = lotes[0]?.id_producto_fk;

            // SE RESTA EL STOCK DEL PRODUCTO
            if (id_produ) {
                await conn.query(
                    `UPDATE tbl_productos SET stock = stock - ? WHERE id_producto_pk = ?`,
                    [stock, id_produ]
                );
            }

            // 3. Borrar el lote
            await conn.query(
                `DELETE FROM tbl_lotes_medicamentos WHERE id_lote_medicamentos_pk = ?`, [id_lote]
            );

            await conn.commit();
            return res.json({
                Consulta: true,
                mensaje: 'Lote eliminado y stock actualizado',
                id_lote
            });

        } else {

            const {id_producto } = req.body;

            await conn.query(`DELETE FROM tbl_productos WHERE id_producto_pk = ?`, [id_producto]);

            await conn.commit();
            res.json({
                Consulta: true,
                mensaje: 'Producto eliminado con éxito',
                id_producto
            });

        }

    } catch (err) {
        await conn.rollback();
        res.json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }

};