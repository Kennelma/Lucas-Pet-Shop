const express = require('express');
const mysqlConnection = require('../config/conexion');

//CONSTANTES A UTILIZAR
const TIPOS_PRODUCTOS = {
    ACCESORIOS: 1, 
    ANIMALES: 2,
    ALIMENTOS: 3,
    MEDICAMENTOS: 4    
};


// ─────────────────────────────────────────────────────────
//        ENDPOINT DE INSERTAR PRODUCTOS
// ─────────────────────────────────────────────────────────

//ESTOS ATRIBUTOS SON COMUNES PARA TODOS LOS ENDPOINT
function insert_atributos_padre (body) {
    return[
        body.nombre_producto,
        body.precio_producto,
        body.sku,
        body.stock,
        body.imagen_url || null
    ];
}

//ENDOPINT DE INGRESAR PRODUCTOS
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();    
    try {
        
        await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

        //SE TRAE LA FUNCION CON LOS ATRIBUTOS PADRES
        const atributosComunes = insert_atributos_padre(req.body);

        switch (req.body.tipo_producto) {

            case 'ACCESORIOS':
                const [accesorio] = await conn.query ('CALL sp_insert_producto_accesorio (?,?,?,?,?,?,?)',
                    [...atributosComunes, 
                        TIPOS_PRODUCTOS.ACCESORIOS,
                        req.body.tipo_accesorio
                    ]);
                break;
            
                case 'ANIMALES':
                
                const [animal] = await conn.query ('CALL sp_insert_producto_animal(?,?,?,?,?,?,?,?)',
                    [...atributosComunes, 
                        TIPOS_PRODUCTOS.ANIMALES,
                        req.body.especie,
                        req.body.sexo
                    ]);                               
                break;

            case 'ALIMENTOS':

                const [alimento] = await conn.query ('CALL sp_insert_producto_alimento (?,?,?,?,?,?,?,?)',
                    [...atributosComunes, 
                        TIPOS_PRODUCTOS.ALIMENTOS,
                        req.body.alimento_destinado,
                        req.body.peso_alimento
                    ]);                               
                break;

            case 'MEDICAMENTOS':
                const [medicamento] = await conn.query ('CALL sp_insert_producto_medicamento (?,?,?,?,?,?,?,?,?,?,?,?)',
                    [
                        req.body.nombre_producto,
                        req.body.precio_producto,
                        req.body.sku,
                        req.body.imagen_url || null,
                        TIPOS_PRODUCTOS.MEDICAMENTOS,
                        req.body.presentacion_medicamento,
                        req.body.tipo_medicamento,
                        req.body.cantidad_contenido,
                        req.body.unidad_medida,
                        req.body.codigo_lote,
                        req.body.fecha_vencimiento,
                        req.body.stock_lote
                    ]);
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
        body.imagen_url || null
    ];
    
}

exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        //ATRIBUTOS QUE USAN TODAS LAS TABLAS (ATRIBUTOS DE LA TABLA PADRE)
        const atributosNuevos = update_atributos_padre(req.body);

        const { id_producto, tipo_producto } = req.body;

        if (!id_producto) throw new Error("Debe enviar el ID del producto a actualizar");

        switch (tipo_producto) {
            
            case 'ANIMALES':

                await conn.query('CALL sp_update_producto_animal(?,?,?,?,?,?,?,?,?,?)',
                [   id_producto,
                    ...atributosNuevos, 
                    req.body.especie || null,
                    req.body.sexo || null
                ]);                               
                break;
            
            case 'ALIMENTOS':
                await conn.query('CALL sp_update_producto_alimento(?,?,?,?,?,?,?,?,?,?)',
                [   id_producto,
                    ...atributosNuevos, 
                    req.body.alimento_destinado || null,
                    req.body.peso_alimento || null
                ]);                               
                break;
            
            case 'ACCESORIOS':
                await conn.query('CALL sp_update_producto_accesorio(?,?,?,?,?,?,?,?,?)',
                [   id_producto,
                    ...atributosNuevos, 
                    req.body.tipo_accesorio || null
                ]);                               
                break;
            
            case 'MEDICAMENTOS':

                await conn.query('CALL sp_update_producto_medicamento(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [   id_producto,
                    ...atributosNuevos, 
                    req.body.presentacion_medicamento,
                    req.body.tipo_medicamento,
                    req.body.cantidad_contenido,
                    req.body.unidad_medida,
                    req.body.codigo_lote,
                    req.body.fecha_vencimiento,
                    req.body.stock_lote
                ]);                               
                break;

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
                [registros] = await conn.query('CALL sp_select_producto_accesorios()');
                break;
            
            case 'ANIMALES':
                [registros] = await conn.query('CALL sp_select_producto_animales()');
                break;
            
            case 'ALIMENTOS':
                [registros] = await conn.query('CALL sp_select_producto_alimentos()');
                break;

            case 'MEDICAMENTOS':
                [registros] = await conn.query('CALL sp_select_producto_medicamentos()');
                break;

            default:
                throw new Error('Tipo de producto no válido');
        }

        res.json({
            Consulta: true,
            productos: registros[0] || []
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

        const {id_producto } = req.body;

        if (!id_producto) throw new Error("Debe enviar el ID del producto a eliminar");

        await conn.query('CALL sp_delete_productos(?)', [id_producto]);

        await conn.commit();
        res.json({
            Consulta: true,
            mensaje: 'Producto eliminado con éxito',
            id_producto
        });

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


