
const express = require('express');
const mysqlConnection = require('../config/conexion');
const argon2 = require('argon2');


exports.verPerfil = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        //SE TOMA EL ID DEL USUARIO AUTENTICADO (MIDDLEWARE AUTH)
        const id_usuario = req.usuario?.id_usuario_pk;

        const [perfil] = await conn.query(`
            SELECT
                usuario AS nombre_usuario,
                email_usuario
            FROM tbl_usuarios
            WHERE id_usuario_pk = ?
        `, [id_usuario]);

        //DEVUELVE EL PERFIL DEL USUARIO
        res.json({            Consulta: true,
            Perfil: perfil[0] || null
        });

    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });

    } finally {
        conn.release();
    }

};


//AQUI CAMBIA YA SEA LA CONTRASEÑA O EL NOMBRE O EMAIL
exports.actualizarPerfil = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        //SE TOMA EL ID DEL USUARIO AUTENTICADO (MIDDLEWARE AUTH)
        const id_usuario = req.usuario?.id_usuario_pk;

        const { nombre, email, contrasena } = req.body;

        let contraHasheada = null;
        if (contrasena) {
        contraHasheada = await argon2.hash(contrasena);
        }

        const fecha_actualizacion = new Date();

        const [resultado] = await conn.query(`
            UPDATE tbl_usuarios
            SET
                usuario = COALESCE(?, usuario),
                email_usuario = COALESCE(?, email_usuario),
                contrasena_usuario = COALESCE(?, contrasena_usuario),
                password_update_at = ?
            WHERE id_usuario_pk = ?
        `, [
                nombre || null,
                email || null,
                contraHasheada || null,
                fecha_actualizacion || null,
                id_usuario
            ]);

        //DEVUELVE EL RESULTADO DE LA ACTUALIZACIÓN
        res.json({
            Consulta: true,
            resultado: resultado[0] || null
        });

    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });

    } finally {
        conn.release();
    }

};