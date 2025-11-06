const express = require('express');
const mysqlConnection = require('../config/conexion');

// MUESTRA LAS NOTIFICACIONES SI SE CUMPLE CONDICIONES DEL JOB
exports.verNotificaciones = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        //TRAE TODAS LAS NOTIFICACIONES QUE EL CLIENTE NO HA MARCADO COMO LEIDAS
        const [notificaciones] = await conn.query(`
        SELECT
            n.id_notificacion_pk,
            n.mensaje_notificacion,
            tn.nombre_tipo_notificacion
        FROM tbl_notificaciones n
        INNER JOIN cat_tipo_notificacion tn
            ON n.tipo_notificacion_fk = tn.id_tipo_notificacion_pk
        WHERE n.leido = FALSE `);

        res.json({
            Consulta: true,
            notificaciones
        });

    } catch (err) {
         res.status(500).json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }
};


//MARCAE UNA NOTIFICACIÓN COMO LEÍDA
exports.marcarNotificacionLeida = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

  try {

    //ENTRA EL ID DE LA NOTIFICACIÓN A MARCAR COMO LEÍDA
    const { id_notificacion_pk } = req.body;


    //ACTUALIZA LA NOTIFICACIÓN COMO LEÍDA Y NO LA MUESTRA MÁS
    const [resultado] = await conn.query(`
      UPDATE tbl_notificaciones
      SET leido = TRUE
      WHERE id_notificacion_pk = ?
    `, [id_notificacion_pk]);

    //VERIFICO SI SE ACTUALIZÓ ALGUNA FILA
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        Consulta: false,
        mensaje: 'NO SE ENCONTRÓ LA NOTIFICACIÓN CON EL ID PROPORCIONADO.'
      });
    }

    res.json({
      Consulta: true,
      mensaje: 'NOTIFICACION MARCADA COMO LEÍDA.'
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
