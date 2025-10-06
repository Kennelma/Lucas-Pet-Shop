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

                const [servicio] = await conn.query ('CALL sp_insert_servicio_peluqueria (?,?,?,?,?)',
                    [
                        req.body.nombre_servicio_peluqueria,
                        req.body.descripcion_servicio, 
                        req.body.precio_servicio, 
                        req.body.duracion_estimada, 
                        req.body.requisitos 
                    ]);
                break;

            case 'PROMOCIONES':
                
                const [promocion] = await conn.query ('CALL sp_insert_promocion (?,?,?,?)',
                    [
                        req.body.nombre_promocion,
                        req.body.descripcion_promocion, 
                        req.body.precio_promocion, 
                        req.body.dias_promocion
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
                

                await conn.query('CALL sp_update_servicio_peluqueria(?,?,?,?,?,?,?)',
                [   id,
                    req.body.nombre_servicio_peluqueria || null,
                    req.body.descripcion_servicio || null, 
                    req.body.precio_servicio || null, 
                    req.body.duracion_estimada || null, 
                    req.body.requisitos || null,
                    req.body.activo !== undefined ?  req.body.activo : null,
                ]);                               
                break;

            case 'PROMOCIONES':
                
                await conn.query('CALL sp_update_promocion(?,?,?,?,?)',
                [   id,
                    req.body.nombre_promocion || null,
                    req.body.descripcion_promocion || null, 
                    req.body.precio_promocion || null, 
                    req.body.dias_promocion || null
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

                await conn.query('CALL sp_delete_servicio_peluqueria(?)', [id]);
                
                break;
        
            case 'PROMOCIONES':
                
                await conn.query('CALL sp_delete_promocion(?)', [id]);

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
                [filas] = await conn.query('CALL sp_select_servicios_peluqueria()');
                break;

            case 'PROMOCIONES':

                [filas] = await conn.query('CALL sp_select_promociones()');
                break;

            default:
               throw new Error('Tipo de servicio no válido');
        }

        res.json({
            Consulta: true,
            servicios: filas[0] || []
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
