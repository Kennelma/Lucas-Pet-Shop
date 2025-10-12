//CONTROLADORES PARA EL MÓDULO DE PRODUCTOS (MEDICAMENTOS, ALIMENTOS, ACCESORIOS, ANIMALES Y LOTES)

const express = require('express');
const mysqlConnection = require('../config/conexion');

//CONSTANTES A UTILIZAR
const TIPOS_PRODUCTOS = {
    ACCESORIOS: 1, 
    ANIMALES: 2,
    ALIMENTOS: 3,
    MEDICAMENTOS: 4    
};

//ESTOS ATRIBUTOS SON COMUNES PARA TODOS LOS ENDPOINT
function insert_atributos_padre (body, imagen_url = null) {
    return[
        body.nombre_producto,
        body.precio_producto,
        body.stock,
        imagen_url,
        TIPOS_PRODUCTOS[body.tipo_producto]
    ];
}


// ─────────────────────────────────────────────────────────
//        ENDPOINT DE INSERTAR PRODUCTOS
// ─────────────────────────────────────────────────────────
exports.crear = async (req, res) => {

    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    const conn = await mysqlConnection.getConnection();    

    try {
        
        await conn.beginTransaction(); //INICIO LA TRANSACCIÓN


        //SE LLENA LA TABLA PADRE PRIMERO
        const [result] = await conn.query(
            `INSERT INTO tbl_productos (nombre_producto, precio_producto, stock, imagen_url, tipo_producto_fk)
             VALUES (?, ?, ?, ?, ?)`,
            insert_atributos_padre(req.body)
        );

        //OBTENGO EL ID DEL PRODUCTO INSERTADO
        const id_producto = result.insertId;


        switch (req.body.tipo_producto) {

            case 'ACCESORIOS':
                
                const [accesorio] = await conn.query (
                    `INSERT INTO tbl_accesorios_info (tipo_accesorio, id_producto_fk) VALUES (?, ?)`,
                    [
                        req.body.tipo_accesorio, 
                        id_producto
                    ]);
                break;
            
            case 'ANIMALES':
                
                const [animal] = await conn.query (
                    `INSERT INTO tbl_animales_info (especie, sexo, id_producto_fk) VALUES (?, ?, ?)`,
                    [
                        req.body.especie,
                        req.body.sexo,
                        id_producto
                    ]);                               
                break;    

            case 'ALIMENTOS':

                const [alimento] = await conn.query (
                    `INSERT INTO tbl_alimentos_info (alimento_destinado, peso_alimento, id_producto_fk)
                     VALUES (?,?,?)`,
                    [
                        req.body.alimento_destinado,
                        req.body.peso_alimento,
                        id_producto
                    ]);                               
                break;

            case 'MEDICAMENTOS':

                const [medicamentos] = await conn.query (
                    `INSERT INTO tbl_medicamentos_info (presentacion_medicamento, tipo_medicamento, cantidad_contenido, 
                                                        unidad_medida, id_producto_fk) 
                                                        VALUES (?,?,?,?,?)`,
                    [
                        req.body.presentacion_medicamento,
                        req.body.tipo_medicamento,
                        req.body.cantidad_contenido,
                        req.body.unidad_medida,
                        id_producto
                    ]);

                    //OBTENGO EL ID DEL MEDICAMENTO PARA PODER INGRESAR EL PRIMER LOTE
                    const id_medicamento = medicamentos.insertId;

                    const [lote] = await conn.query(
                        `INSERT INTO tbl_lotes_medicamentos (codigo_lote, fecha_vencimiento, stock_lote, id_medicamento_fk)
                        VALUES (?, ?, ?, ?)`,
                        [
                            req.body.codigo_lote,
                            req.body.fecha_vencimiento,
                            req.body.stock_lote,
                            id_medicamento
                        ]
                    );
                break;

            case 'LOTES':

                //OBTENGO EL MEDICAMENTO FK DESDE PRODUCTOS
                const [medicamento] = await conn.query (
                    `SELECT id_medicamento_pk 
                    FROM tbl_medicamentos_info 
                    WHERE id_producto_fk = ?`,
                    [req.body.id_producto]
                );
                
                //GUARDA EN UNA VARIABLE ESA FK DE MEDICAMENTOS
                const id_med_fk = medicamento[0].id_medicamento_pk;

                
                //INSERTO EL LOTE CORRESPONDIENTE A ESE MEDICAMENTO
                 await conn.query(
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
                
            break;

            default:
               throw new Error('Tipo de producto no válido');
        }

        await conn.commit(); //CONFIRMO LA TRANSACCIÓN
        res.json ({
            Consulta: true,
            mensaje: 'Registro realizado con éxito',
        });


    } catch (err) {
        await conn.rollback(); //REVIERTO LA CONSULTA SI HAY ERROR
        res.json ({
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

    return[
        body.nombre_producto || null,
        body.precio_producto || null ,
        body.sku || null,
        body.stock || null,
        body.stock_minimo || null,
        body.activo !== undefined ? body.activo : null,
        imagen_url,
    ];
    
}

exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();


        const { id_producto, tipo_producto } = req.body;

        //SE ACTUALIZA PRIMERO LA TABLA PADRE
        const [result] = await conn.query(
            `UPDATE tbl_productos
            SET
                nombre_producto = COALESCE(?, nombre_producto),
                precio_producto = COALESCE(?, precio_producto),
                sku             = COALESCE(?, sku),
                stock           = COALESCE(?, stock),
                stock_minimo    = COALESCE(?, stock_minimo),
                activo          = COALESCE(?, activo),
                imagen_url      = COALESCE(?, imagen_url)
            WHERE id_producto_pk = ?`, 
            [...update_atributos_padre(req.body), id_producto]
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
                    codigo_lote       = COALESCE(?, codigo_lote),
                    fecha_vencimiento = COALESCE(?, fecha_vencimiento),
                    stock_lote        = COALESCE(?, stock_lote)
                WHERE id_lote_medicamentos_pk = ?`,
                [
                    req.body.codigo_lote || null,
                    req.body.fecha_vencimiento || null,
                    req.body.stock_lote || null,
                    req.body.id_lote_medicamentos_pk
                ]);

            default:
                throw new Error('Tipo de producto no válido');
        }

        await conn.commit(); //CONFIRMO LA TRANSACCIÓN
        res.json ({
            Consulta: true,
            mensaje: 'Registro actualizado con éxito',
            id_producto
        });

    } catch (err) {
        await conn.rollback(); //REVIERTO LA CONSULTA SI HAY ERROR
        res.json ({
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
                        p.imagen_url,
                        ac.tipo_accesorio
                    FROM tbl_productos p 
                    INNER JOIN tbl_accesorios_info ac ON p.id_producto_pk = ac.id_producto_fk`);
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
                        p.imagen_url,
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
                        p.imagen_url,
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
                        p.imagen_url,
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
                        l.estado_lote_fk,
                        m.id_medicamento_pk
                    FROM tbl_lotes_medicamentos l
                    INNER JOIN tbl_medicamentos_info m ON l.id_medicamento_fk = m.id_medicamento_pk
                    INNER JOIN tbl_productos p ON m.id_producto_fk = p.id_producto_pk`
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
            
            await conn.query(
                `DELETE FROM tbl_lotes_medicamentos WHERE id_lote_medicamentos_pk = ?`,[id_lote]
            );

            await conn.commit();
            return res.json({
                Consulta: true,
                mensaje: 'Lote eliminado con éxito',
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
