//CONTROLADORES PARA LAS TABLAS DE EMPRESA, SUCURSAL, USUARIOS, GASTOS

const express = require('express');
const mysqlConnection = require('../config/conexion');
const bcrypt = require('bcrypt');


// ─────────────────────────────────────────────────────────
//   ENDPOINT DE INSERTAR EMPRESA, SUCURSALES Y USUARIOS
// ─────────────────────────────────────────────────────────
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection(); 

    await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

    try  {

        switch (req.body.entidad) {

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
                
                const contraHasheada = await bcrypt.hash(req.body.contrasena_usuario, 20);
                
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
//      ENDPOINT PARA VER EN EMPRESA, SUCURSALES, USUARIOS Y GASTOS
// ─────────────────────────────────────────────────────────
exports.ver = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        let registros; 

        switch (req.query.entidad) {
            
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
                    JOIN tbl_empresa e ON e.id_empresa_pk = s.id_empresa_fk`);
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
                    JOIN tbl_sucursales s ON s.id_sucursal_pk = u.id_sucursal_fk`);
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
