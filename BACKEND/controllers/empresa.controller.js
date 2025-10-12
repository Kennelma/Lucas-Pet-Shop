//CONTROLADORES PARA LAS TABLAS DE EMPRESA, SUCURSAL, USUARIOS, GASTOS

const express = require('express');
const mysqlConnection = require('../config/conexion');


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
                    `INSERT INTO tbl_sucursal (
                    nombre_sucursal,
                    direccion_sucursal,
                    telefono_sucursal,
                    id_empresa_fk) VALUES (?,?,?,?)`,
                    [
                        req.body.nombre_sucursal,
                        req.body.direccion_sucursal, 
                        req.body.telefono_sucursal, 
                        req.body.correo_empresa
                    ]);
                break;
                
            
            case 'USUARIOS':

                const bcrypt = require('bcrypt');
                const hashedPassword = await bcrypt.hash(req.body.contrasena_usuario, 10);
                
               
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

        await conn.beginTransaction();//INICIO LA TRANSACCIÓN 

        switch (req.body.entidad) {
            
            case 'EMPRESAS':
                [registros] = await conn.query(
                    `SELECT 
                        nombre_empresa,
                        direccion_empresa,
                        telefono_empresa,
                        correo_empresa
                    FROM tbl_empresas`);
                
                break;

            case 'SUCURSALES':

                [registros] = await conn.query(
                    `SELECT 
                        nombre_sucursal,
                        direccion_sucursal,
                        telefono_sucursal
                    FROM tbl_sucursales`);
                break;

            case 'USUARIOS':

                [registros] = await conn.query(
                    `SELECT 
                        usuario,
                        email_usuario,
                        telefono_sucursal,
                        id_sucursal_fk,
                        cat_estado_fk
                        bloqueado_hasta
                    FROM tbl_usuarios`);
                break;
                
            case 'GASTOS':
                
                [registros] = await conn.query(
                    `SELECT 
                        detalle_gasto,
                        monto_gasto,
                        fecha_registro_gasto
                    FROM tbl_gastos`);
                break;
   
            default:

                throw new Error('INVALIDO PARA ESTE MODULO');
        }

        res.json({
            Consulta: true,
            productos: registros || []
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
