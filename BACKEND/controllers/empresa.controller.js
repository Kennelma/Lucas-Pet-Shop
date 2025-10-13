//CONTROLADORES PARA LAS TABLAS DE EMPRESA, SUCURSAL, USUARIOS, GASTOS

const express = require('express');
const mysqlConnection = require('../config/conexion');
//const bcrypt = require('bcrypt');
const argon2 = require('argon2');



// ─────────────────────────────────────────────────────────
//   ENDPOINT DE INSERTAR EMPRESA, SUCURSALES Y USUARIOS
// ─────────────────────────────────────────────────────────
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection(); 

    await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

    try  {

        const {entidad} = req.body; 

        switch (entidad) {

            case 'EMPRESA':

                await conn.query (
                    `INSERT INTO tbl_empresa (
                    nombre_empresa,
                    direccion_empresa,
                    telefono_empresa,
                    correo_empresa) VALUES (?,?,?,?)`,
                    [
                        req.body.nombre_empresa,
                        req.body.direccion_empresa, 
                        req.body.telefono_empresa, 
                        req.body.correo_empresa
                    ]);
                break;

            case 'SUCURSALES':

                await conn.query (
                    `INSERT INTO tbl_sucursales (
                        nombre_sucursal,
                        direccion_sucursal,
                        telefono_sucursal,
                        id_empresa_fk
                    ) VALUES (?,?,?,?)`,
                    [
                        req.body.nombre_sucursal,
                        req.body.direccion_sucursal, 
                        req.body.telefono_sucursal, 
                        req.body.id_empresa_fk
                    ]);

                break;
                
            
            case 'USUARIOS':

                const options = {
                    type: argon2.argon2id, 
                    memoryCost: 65536,    // 64 MB (Buena seguridad por defecto)
                    timeCost: 3,          // Iteraciones de CPU (¡Puedes probar con 2 si necesitas más velocidad!)
                    parallelism: 4        // Aprovecha 4 núcleos de CPU (Ajusta a tus núcleos si es posible)
                };
                                
                const contraHasheada = await argon2.hash(req.body.contrasena_usuario, options); 
                
                await conn.query (
                    `INSERT INTO tbl_usuarios(
                        usuario, 
                        email_usuario, 
                        contrasena_usuario, 
                        id_sucursal_fk
                    ) VALUES (?,?,?,?)`, 
                    [
                        req.body.usuario,
                        req.body.email_usuario,
                        contraHasheada,
                        req.body.id_sucursal_fk
                    ]
                );
                
                break;

            case 'GASTOS':

                //SE TOMA EL ID DEL USUARIO AUTENTICADO (MIDDLEWARE AUTH)
                const id_usuario = req.user?.id_usuario_pk;

                await conn.query(
                `INSERT INTO tbl_gastos (
                    detalle_gasto, 
                    monto_gasto, 
                    id_usuario_fk
                ) VALUES (?,?,?)`,
                [
                    req.body.detalle_gasto,
                    req.body.monto_gasto,
                    id_usuario
                ]
                );
                
            break;
        
            default:
                throw new Error('No es parte del módulo de empresa. Intente de nuevo');
        }

        await conn.commit(); //CONFIRMO LA TRANSACCIÓN
        res.json ({
            Consulta: true,
            mensaje: `Registro en ${entidad} ingresado con éxito`,
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
//   ENDPOINT DE ACTUALIZAR EMPRESA, SUCURSALES, USUARIOS Y GASTOS
// ─────────────────────────────────────────────────────────
exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction();

        const { id, entidad } = req.body;

        if (!id) {
            throw new Error('El ID es requerido para actualizar');
        }

        switch (entidad) {

            case 'EMPRESA':

                await conn.query(
                    `UPDATE tbl_empresa
                    SET 
                        nombre_empresa    = COALESCE(?, nombre_empresa),
                        direccion_empresa = COALESCE(?, direccion_empresa),
                        telefono_empresa  = COALESCE(?, telefono_empresa),
                        correo_empresa    = COALESCE(?, correo_empresa)
                    WHERE id_empresa_pk = ?`,
                    [
                        req.body.nombre_empresa || null,
                        req.body.direccion_empresa || null,
                        req.body.telefono_empresa || null,
                        req.body.correo_empresa || null,
                        id
                    ]
                );
                break;


            case 'SUCURSALES':

                await conn.query(
                    `UPDATE tbl_sucursales
                    SET 
                        nombre_sucursal    = COALESCE(?, nombre_sucursal),
                        direccion_sucursal = COALESCE(?, direccion_sucursal),
                        telefono_sucursal  = COALESCE(?, telefono_sucursal),
                        id_empresa_fk      = COALESCE(?, id_empresa_fk)
                    WHERE id_sucursal_pk = ?`,
                    [
                        req.body.nombre_sucursal || null,
                        req.body.direccion_sucursal || null,
                        req.body.telefono_sucursal || null,
                        req.body.id_empresa_fk || null,
                        id
                    ]
                );
                break;

            case 'USUARIOS':

                
                let contraHasheada = null;

                if (req.body.contrasena_usuario) {
                    contraHasheada = await bcrypt.hash(req.body.contrasena_usuario, 10);
                }

                await conn.query(
                    `UPDATE tbl_usuarios
                    SET 
                        usuario            = COALESCE(?, usuario),
                        email_usuario      = COALESCE(?, email_usuario),
                        contrasena_usuario = COALESCE(?, contrasena_usuario),
                        id_sucursal_fk     = COALESCE(?, id_sucursal_fk),
                        cat_estado_fk      = COALESCE(?, cat_estado_fk),
                        intentos_fallidos  = COALESCE(?, intentos_fallidos),
                        bloqueado_hasta    = COALESCE(?, bloqueado_hasta)
                    WHERE id_usuario_pk = ?`,
                    [
                        req.body.usuario || null,
                        req.body.email_usuario || null,
                        contraHasheada || null,
                        req.body.id_sucursal_fk || null,
                        req.body.cat_estado_fk || null,
                        req.body.intentos_fallidos !== undefined ? req.body.intentos_fallidos : null,
                        req.body.bloqueado_hasta || null,
                        id
                    ]
                );
                break;

            case 'GASTOS':

                await conn.query(
                    `UPDATE tbl_gastos
                    SET 
                        detalle_gasto = COALESCE(?, detalle_gasto),
                        monto_gasto   = COALESCE(?, monto_gasto)
                    WHERE id_gasto_pk = ?`,
                    [
                        req.body.detalle_gasto || null,
                        req.body.monto_gasto || null,
                        id
                    ]
                );
                break;

            default:
                throw new Error('Entidad no válida para actualizar');
        }

        await conn.commit();
        res.json({
            Consulta: true,
            mensaje: `Registro en ${entidad} actualizado con éxito`,
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
};





// ─────────────────────────────────────────────────────────
//      ENDPOINT PARA VER EN EMPRESA, SUCURSALES, USUARIOS Y GASTOS
// ─────────────────────────────────────────────────────────
exports.ver = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let registros; 

        const {entidad} = req.query; 

        switch (entidad) {
            
            case 'EMPRESA':

                [registros] = await conn.query(

                    `SELECT 
                        id_empresa_pk,
                        nombre_empresa,
                        direccion_empresa,
                        telefono_empresa,
                        correo_empresa
                    FROM tbl_empresa`);
                
                break;

            case 'SUCURSALES':

                [registros] = await conn.query(
                    `SELECT 
                        s.id_sucursal_pk,  
                        s.nombre_sucursal, 
                        s.direccion_sucursal, 
                        s.telefono_sucursal,
                        e.nombre_empresa
                    FROM tbl_sucursales s
                    JOIN tbl_empresa e ON e.id_empresa_pk = s.id_empresa_fk
                    ORDER BY s.id_sucursal_pk DESC`);
                break;

            case 'USUARIOS':

                [registros] = await conn.query(
                    `SELECT 
                        u.id_usuario_pk, 
                        u.usuario, 
                        u.email_usuario, 
                        u.fecha_creacion,
                        u.intentos_fallidos, 
                        u.bloqueado_hasta,
                        u.id_sucursal_fk, 
                        s.nombre_sucursal,
                        u.cat_estado_fk
                    FROM tbl_usuarios u
                    JOIN tbl_sucursales s ON s.id_sucursal_pk = u.id_sucursal_fk
                    ORDER BY u.id_usuario_pk DESC`);
                break;
                
            case 'GASTOS':
                
                [registros] = await conn.query(
                    `SELECT 
                        id_gasto_pk,
                        detalle_gasto,
                        monto_gasto,
                        fecha_registro_gasto
                    FROM tbl_gastos`);
                break;
   
            default:

                throw new Error('Las entidades permitidas son: GASTOS, EMPRESA, SUCURSALES o USUARIOS');
        }

        res.json({
            Consulta: true,
            mensaje: `Registros de ${entidad}`,
            entidad: registros || []
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
//  ENDPOINT PARA ELIMINAR EMPRESA, SUCURSAL, GASTOS Y USUARIOS
// ─────────────────────────────────────────────────────────
exports.eliminar = async (req, res) => {


    const conn = await mysqlConnection.getConnection();
    
    try {

        await conn.beginTransaction();

        const { id, entidad} = req.body;

        //VALIDACION A NIVEL DE BACKEND
        if (!id) throw new Error("Debe enviar el ID del servicio a eliminar");

        switch (entidad) {

            case 'EMPRESA':

                await conn.query(
                    `DELETE FROM tbl_empresa
                     WHERE id_empresa_pk = ?`, 
                     [id]);
                
                break;
        
            case 'SUCURSALES':
                
                await conn.query(
                    `DELETE FROM tbl_sucursales
                    WHERE id_sucursal_pk = ?`, 
                    [id]);
                break;

            case 'GASTOS':
                
                await conn.query(
                    `DELETE FROM tbl_gastos
                    WHERE id_gasto_pk = ?`, 
                    [id]);
                break;    

            case 'USUARIOS':
                
                await conn.query(
                    `DELETE FROM tbl_usuarios
                    WHERE id_usuario_pk = ?`, 
                    [id]);
                break;       
                
            default:
                throw new Error('Entidad no válida');
        }

        await conn.commit();
        res.json({
            Consulta: true,
            mensaje: `Registro en ${entidad} eliminado con éxito`,
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