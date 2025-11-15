
const express = require('express');
const mysqlConnection = require('../config/conexion');

const argon2 = require('argon2');


//ENDPOINT PARA MOSTRAR LOS ROLES DE USUARIOS
exports.verRolesUsuarios = async (req, res) => {
  const conn = await mysqlConnection.getConnection();

  try {
    const { opciones } = req.query;
    let resultado;

    switch (opciones) {
      case 'ROLES':
        [resultado] = await conn.query(`
          SELECT id_rol_pk, tipo_rol FROM cat_roles
        `);
        break;

      case 'SUCURSALES':
        [resultado] = await conn.query(`
          SELECT id_sucursal_pk, nombre_sucursal FROM tbl_sucursales
        `);
        break;

      default:
        throw new Error('NO ES PARTE DE LAS OPCIONES PARA INGRESAR USUARIOS');
    }

    await conn.commit();

    res.json({
      Consulta: true,
      mensaje: 'Datos obtenidos con éxito',
      datos: resultado
    });

  } catch (error) {
    res.status(500).json({
      Consulta: false,
      error: error.message
    });
  } finally {
    if (conn) conn.release();
  }
};



exports.crearUsuario = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        
        await conn.beginTransaction();

        const { usuario, email_usuario, contrasena_usuario, id_sucursal_fk, id_rol_fk } = req.body;

        // Validar que vengan todos los datos requeridos
        if (!usuario || !email_usuario || !contrasena_usuario || !id_rol_fk) {
            return res.status(400).json({
                Consulta: false,
                mensaje: 'Faltan datos requeridos'
            });
        }

        // Hashear contraseña con argon2
        const contraHasheada = await argon2.hash(contrasena_usuario);
        const fechaCreacion = new Date();

        // Insertar usuario con contraseña hasheada
        const [result] = await conn.query(
            `INSERT INTO tbl_usuarios(
                usuario,
                email_usuario,
                contrasena_usuario,
                fecha_creacion,
                password_update_at,
                id_sucursal_fk
            ) VALUES (?,?,?,?,?,?)`,
            [
                usuario,
                email_usuario,
                contraHasheada,
                fechaCreacion,
                fechaCreacion,
                id_sucursal_fk || null
            ]
        );

        const usuarioId = result.insertId;

        // Insertar rol del usuario
        await conn.query(
            `INSERT INTO tbl_usuario_roles (
                id_usuario_fk,
                id_rol_fk
            ) VALUES (?, ?)`,
            [usuarioId, id_rol_fk]
        );

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'USUARIO CREADO CON ÉXITO',
            datos: {
                id_usuario: usuarioId,
                usuario: usuario
            }
        });

    } catch (error) {
        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};

//ENDPOINT PARA VER TODOS LOS USUARIOS
exports.verUsuarios = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        const [usuarios] = await conn.query(`
            SELECT
                u.id_usuario_pk,
                u.usuario,
                u.email_usuario,
                u.intentos_fallidos,
                u.bloqueado_hasta,
                u.id_sucursal_fk,
                s.nombre_sucursal,
                u.cat_estado_fk,
                e.nombre_estado,
                GROUP_CONCAT(DISTINCT r.id_rol_pk) AS id_roles,
                GROUP_CONCAT(DISTINCT r.tipo_rol SEPARATOR ', ') AS roles
            FROM tbl_usuarios u
            LEFT JOIN tbl_sucursales s ON s.id_sucursal_pk = u.id_sucursal_fk
            LEFT JOIN cat_estados e ON e.id_estado_pk = u.cat_estado_fk
            LEFT JOIN tbl_usuario_roles ur ON ur.id_usuario_fk = u.id_usuario_pk
            LEFT JOIN cat_roles r ON r.id_rol_pk = ur.id_rol_fk
            GROUP BY u.id_usuario_pk
            ORDER BY u.id_usuario_pk DESC
        `);

        res.status(200).json({
            Consulta: true,
            mensaje: 'Usuarios obtenidos exitosamente',
            datos: usuarios
        });

    } catch (error) {
        console.error('❌ Error en verUsuarios:', error);
        res.status(500).json({
            Consulta: false,
            mensaje: 'Error al obtener usuarios',
            error: error.message
        });
    } finally {
        conn.release();
    }
};

//ENDPOINT PARA ACTUALIZAR USUARIO
exports.actualizarUsuario = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        await conn.beginTransaction();

        const { id_usuario_pk, usuario, contrasena_usuario, email_usuario, id_sucursal_fk, id_rol_fk, cat_estado_fk } = req.body;

        //Hashear contraseña solo si se proporciona una nueva
        let contraHasheada = null;
        if (contrasena_usuario && contrasena_usuario.trim() !== '') {
            contraHasheada = await argon2.hash(contrasena_usuario);
        }

        // Actualizar datos del usuario
        await conn.query(
            `UPDATE tbl_usuarios
            SET
                usuario            = COALESCE(?, usuario),
                email_usuario      = COALESCE(?, email_usuario),
                contrasena_usuario = COALESCE(?, contrasena_usuario),
                id_sucursal_fk     = COALESCE(?, id_sucursal_fk),
                cat_estado_fk      = COALESCE(?, cat_estado_fk)
            WHERE id_usuario_pk = ?`,
            [
                usuario || null,
                email_usuario || null,
                contraHasheada,
                id_sucursal_fk || null,
                cat_estado_fk || null,
                id_usuario_pk
            ]
        );

        // Actualizar o insertar rol del usuario si se proporciona
        if (id_rol_fk) {
            // Verificar si ya existe un rol para este usuario
            const [existingRole] = await conn.query(
                `SELECT id_usuario_fk FROM tbl_usuario_roles WHERE id_usuario_fk = ?`,
                [id_usuario_pk]
            );

            if (existingRole && existingRole.length > 0) {
                // Si existe, actualizar
                await conn.query(
                    `UPDATE tbl_usuario_roles SET id_rol_fk = ? WHERE id_usuario_fk = ?`,
                    [id_rol_fk, id_usuario_pk]
                );
            } else {
                // Si no existe, insertar
                await conn.query(
                    `INSERT INTO tbl_usuario_roles (id_usuario_fk, id_rol_fk) VALUES (?, ?)`,
                    [id_usuario_pk, id_rol_fk]
                );
            }
        }

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'USUARIO ACTUALIZADO CON ÉXITO'
        });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};


//ENDPOINT PARA ELIMINAR USUARIO
exports.eliminarUsuario = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        const { id_usuario_pk } = req.body;

        // Validar que se proporcione el ID
        if (!id_usuario_pk) {
            return res.status(400).json({
                Consulta: false,
                mensaje: 'ID de usuario requerido'
            });
        }

        await conn.beginTransaction();

        // Primero eliminar los roles del usuario
        await conn.query(
            `DELETE FROM tbl_usuario_roles WHERE id_usuario_fk = ?`,
            [id_usuario_pk]
        );

        // Luego eliminar el usuario
        await conn.query(
            `DELETE FROM tbl_usuarios WHERE id_usuario_pk = ?`,
            [id_usuario_pk]
        );

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'USUARIO ELIMINADO CON ÉXITO',
            id_usuario_pk
        });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }
};