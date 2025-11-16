
//CONTROLADORES DEL MODULO DE SERVICIOS DE PELUQUERIA  (SERVICIOS Y PROMOCIONES)

const express = require('express');
const mysqlConnection = require('../config/conexion');


// ─────────────────────────────────────────────────────────
//    ENDPOINT DE INSERTAR SERVICIOS Y PROMOCIONES
// ─────────────────────────────────────────────────────────

exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

    try  {

        switch (req.body.tipo_servicio) {


            case 'PELUQUERIA':

                const [servicio] = await conn.query (`
                    SELECT
                        id_tipo_item_pk
                    FROM cat_tipo_item
                    WHERE nombre_tipo_item = 'SERVICIOS'`);

                const id = servicio[0].id_tipo_item_pk;

                await conn.query (
                    `INSERT INTO tbl_servicios_peluqueria_canina (
                        nombre_servicio_peluqueria,
                        descripcion_servicio,
                        precio_servicio,
                        duracion_estimada,
                        requisitos,
                        id_tipo_item_fk
                    ) VALUES (?,?,?,?,?,?)`,
                    [
                        req.body.nombre_servicio_peluqueria,
                        req.body.descripcion_servicio,
                        req.body.precio_servicio,
                        req.body.duracion_estimada,
                        req.body.requisitos,
                        id
                    ]);
                break;

            case 'PROMOCIONES':


                const [promocion] = await conn.query (`
                    SELECT
                        id_tipo_item_pk
                    FROM cat_tipo_item
                    WHERE nombre_tipo_item = 'PROMOCIONES'`);

                const id_item = promocion[0].id_tipo_item_pk;

                await conn.query (
                    `INSERT INTO tbl_promociones (
                        nombre_promocion,
                        descripcion_promocion,
                        precio_promocion,
                        dias_promocion,
                        id_tipo_item_fk
                    ) VALUES (?,?,?,?,?)`,
                    [
                        req.body.nombre_promocion,
                        req.body.descripcion_promocion,
                        req.body.precio_promocion,
                        req.body.dias_promocion,
                        id_item
                    ]);
                break;

            default:
                throw new Error('Tipo de servicio no válido');
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
}

// ─────────────────────────────────────────────────────────
//     ENDPOINT DE ACTUALIZAR SERVICIOS Y PROMOCIONES
// ─────────────────────────────────────────────────────────
exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        const {id, tipo_servicio } = req.body;

        switch (tipo_servicio) {

            case 'PELUQUERIA':

                await conn.query(`
                UPDATE tbl_servicios_peluqueria_canina
                SET
                    nombre_servicio_peluqueria = COALESCE(?, nombre_servicio_peluqueria),
                    descripcion_servicio       = COALESCE(?, descripcion_servicio),
                    precio_servicio            = COALESCE(?, precio_servicio),
                    duracion_estimada          = COALESCE(?, duracion_estimada),
                    requisitos                 = COALESCE(?, requisitos),
                    activo                     = COALESCE(?, activo)
                WHERE id_servicio_peluqueria_pk = ?`,
                [
                    req.body.nombre_servicio_peluqueria || null,
                    req.body.descripcion_servicio || null,
                    req.body.precio_servicio || null,
                    req.body.duracion_estimada || null,
                    req.body.requisitos || null,
                    req.body.activo !== undefined ?  req.body.activo : null,
                    id,
                ]);
                break;

            case 'PROMOCIONES':

                await conn.query(
                    `UPDATE tbl_promociones
                    SET
                        nombre_promocion     = COALESCE(?, nombre_promocion),
                        descripcion_promocion= COALESCE(?, descripcion_promocion),
                        precio_promocion     = COALESCE(?, precio_promocion),
                        dias_promocion       = COALESCE(?, dias_promocion),
                        activo               = COALESCE(?, activo)
                    WHERE id_promocion_pk = ?`,
                [
                    req.body.nombre_promocion || null,
                    req.body.descripcion_promocion || null,
                    req.body.precio_promocion || null,
                    req.body.dias_promocion || null,
                    req.body.activo !== undefined ?  req.body.activo : null,
                    id,
                ]);
                break;

            default:
                throw new Error('Tipo de servicio no válido');


        }


        await conn.commit(); //CONFIRMO LA TRANSACCIÓN
        res.json ({
            Consulta: true,
            mensaje: 'Registro actualizado con éxito',
            id
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



}


// ─────────────────────────────────────────────────────────
//     ENDPOINT PARA ELIMINAR SERVICIOS Y PROMOCIONES
// ─────────────────────────────────────────────────────────
exports.eliminar = async (req, res) => {


    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        const { id, tipo_servicio} = req.body;

        if (!id) throw new Error("Debe enviar el ID del servicio a eliminar");

        switch (tipo_servicio) {

            case 'PELUQUERIA':

                await conn.query(
                    `DELETE FROM tbl_servicios_peluqueria_canina
                     WHERE id_servicio_peluqueria_pk = ?`,
                     [id]);

                break;

            case 'PROMOCIONES':

                await conn.query(
                    `DELETE FROM tbl_promociones
                    WHERE id_promocion_pk = ?`,
                    [id]);
                break;

            default:
                throw new Error('Tipo de servicio no válido');
        }

        await conn.commit();
        res.json({
            Consulta: true,
            mensaje: 'Servicio eliminado con éxito',
            id
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


}



// ─────────────────────────────────────────────────────────
//     ENDPOINT DE VER SERVICIOS Y PROMOCIONES
// ─────────────────────────────────────────────────────────
exports.visualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let filas; //VARIABLE DE APOYO

        switch (req.query.tipo_servicio) {

            case 'PELUQUERIA':
                [filas] = await conn.query(`
                    SELECT * FROM tbl_servicios_peluqueria_canina ORDER BY id_servicio_peluqueria_pk DESC`);
                break;

            case 'PROMOCIONES':

                [filas] = await conn.query(
                    `SELECT * FROM tbl_promociones ORDER BY id_promocion_pk DESC`);
                break;

            default:
               throw new Error('Tipo de servicio no válido');
        }

        res.json({
            Consulta: true,
            servicios: filas || []
        });

    } catch (error) {
        res.json({
            Consulta: false,
            error: error.message
        });

    } finally {

        conn.release();
    }


}



//ENDPOINT DE SERVICIOS FAVORITOS DE LA PELUQERIA
exports.favoritos = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        const { tipo } = req.query;


        const [servicio] = await conn.query(`
            SELECT
                id_tipo_item_pk,
                nombre_tipo_item
            FROM cat_tipo_item
            WHERE nombre_tipo_item = ?
        `, [tipo]);

        const tipo_item = servicio[0].id_tipo_item_pk;

        const [favoritos] = await conn.query(`
            SELECT
                f.numero_factura,
                df.nombre_item,
                SUM(df.cantidad_item) AS total_vendido,
                MONTHNAME(f.fecha_emision) AS mes
            FROM tbl_detalles_facturas df
            INNER JOIN tbl_facturas f ON df.id_factura_fk = f.id_factura_pk
            WHERE df.id_tipo_item_fk = ?
            AND MONTH(f.fecha_emision) = MONTH(CURDATE())
            AND YEAR(f.fecha_emision)= YEAR(CURDATE())
            GROUP BY f.numero_factura, df.nombre_item, mes
            ORDER BY total_vendido DESC
        `, [tipo_item]);

        res.json({
            Consulta: true,
            favoritos: favoritos || []
        });

    } catch (error) {

        console.error("Error en favoritos:", error);
        res.status(500).json({
            Consulta: false,
            mensaje: "Error al obtener favoritos",
            error: error.message
        });

    }

};