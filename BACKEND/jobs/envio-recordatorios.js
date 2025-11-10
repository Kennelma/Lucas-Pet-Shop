const cron = require('node-cron');
const mysqlConnection = require('../config/conexion');
const { getWhatsAppSocket, isWhatsAppConnected } = require('../config/whatsapp');

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║              FUNCIÓN PARA ENVIAR RECORDATORIO POR WHATSAPP                 ║
// ╚════════════════════════════════════════════════════════════════════════════╝
async function enviarRecordatorio(telefono, mensaje, nombreCliente, idRecordatorio) {
  try {
    if (!isWhatsAppConnected()) {
      throw new Error('WhatsApp no está conectado');
    }

    const sock = getWhatsAppSocket();
    const numero = telefono.replace(/\D/g, '');
    const jid = `504${numero}@s.whatsapp.net`;

    await sock.sendMessage(jid, { text: mensaje });

    console.log(`✅ Recordatorio ${idRecordatorio} enviado a ${nombreCliente} (${telefono})`);
    return true;

  } catch (error) {
    console.error(`❌ Error al enviar a ${telefono}:`, error.message);
    throw error;
  }
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  JOB DE ENVÍO DE RECORDATORIOS AUTOMÁTICO                  ║
// ║                       SE EJECUTA CADA MINUTO                               ║
// ╚════════════════════════════════════════════════════════════════════════════╝
cron.schedule('*/1 * * * *', async () => {
  const conn = await mysqlConnection.getConnection();

  try {
    // OBTENER RECORDATORIOS PENDIENTES LISTOS PARA ENVIAR
    const [recordatoriosPendientes] = await conn.query(`
      SELECT
        r.id_recordatorio_pk,
        r.mensaje_recordatorio,
        r.programada_para,
        r.proximo_envio,
        r.ultimo_envio,
        r.intentos,
        r.id_tipo_item_fk,
        f.dias_intervalo,
        f.frecuencia_recordatorio
      FROM tbl_recordatorios r
      JOIN cat_frecuencia_recordatorio f
        ON r.id_frecuencia_fk = f.id_frecuencia_record_pk
      WHERE r.activo = 1
        AND r.processing = 0
        AND (
          (r.ultimo_envio IS NULL AND r.programada_para < NOW())
          OR
          (r.ultimo_envio IS NOT NULL AND r.proximo_envio IS NOT NULL AND r.proximo_envio < NOW())
        )
      ORDER BY r.id_recordatorio_pk
      LIMIT 10
    `);

    if (recordatoriosPendientes.length === 0) {
      return;
    }

    console.log(`📬 Procesando ${recordatoriosPendientes.length} recordatorios...`);

    // PROCESAR CADA RECORDATORIO
    for (const recordatorio of recordatoriosPendientes) {
      try {
        // RESERVAR REGISTRO (LOCK DE IDEMPOTENCIA)
        const [updateLock] = await conn.query(
          `UPDATE tbl_recordatorios
           SET processing = 1
           WHERE id_recordatorio_pk = ? AND processing = 0`,
          [recordatorio.id_recordatorio_pk]
        );

        if (updateLock.affectedRows === 0) {
          continue; // Ya está siendo procesado
        }

        // OBTENER CLIENTES QUE COMPRARON ESE TIPO DE ITEM
        const [clientes] = await conn.query(`
          SELECT DISTINCT
            c.id_cliente_pk,
            c.nombre_cliente,
            c.telefono_cliente
          FROM tbl_clientes c
          INNER JOIN tbl_facturas fa ON c.id_cliente_pk = fa.id_cliente_fk
          INNER JOIN tbl_detalles_facturas df ON fa.id_factura_pk = df.id_factura_fk
          WHERE df.id_tipo_item_fk = ?
            AND c.telefono_cliente IS NOT NULL
            AND c.telefono_cliente != ''
            AND c.telefono_cliente REGEXP '^[0-9-]+$'
        `, [recordatorio.id_tipo_item_fk]);

        if (clientes.length === 0) {
          // NO HAY CLIENTES, PROGRAMAR PRÓXIMO ENVÍO Y CONTINUAR
          await conn.query(`
            UPDATE tbl_recordatorios r
            JOIN cat_frecuencia_recordatorio f ON r.id_frecuencia_fk = f.id_frecuencia_record_pk
            SET r.processing = 0,
                r.proximo_envio = DATE_ADD(NOW(), INTERVAL f.dias_intervalo DAY)
            WHERE r.id_recordatorio_pk = ?
          `, [recordatorio.id_recordatorio_pk]);
          continue;
        }

        console.log(`👥 Enviando a ${clientes.length} clientes...`);

        // ENVIAR A CADA CLIENTE
        let enviados = 0;
        let fallidos = 0;

        for (const cliente of clientes) {
          try {
            await enviarRecordatorio(
              cliente.telefono_cliente,
              recordatorio.mensaje_recordatorio,
              cliente.nombre_cliente,
              recordatorio.id_recordatorio_pk
            );
            enviados++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para no saturar WhatsApp
          } catch (error) {
            fallidos++;
            console.error(`❌ Fallo al enviar a ${cliente.nombre_cliente}:`, error.message);
          }
        }

        console.log(`📊 Resultado: ${enviados} enviados, ${fallidos} fallidos`);

        // ACTUALIZAR ESTADO DEL RECORDATORIO
        if (enviados > 0) {
          const [estadoEnviado] = await conn.query(`
            SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'RECORDATORIO' AND nombre_estado = 'ENVIADO'
            LIMIT 1
          `);

          await conn.query(`
            UPDATE tbl_recordatorios r
            JOIN cat_frecuencia_recordatorio f ON r.id_frecuencia_fk = f.id_frecuencia_record_pk
            SET r.ultimo_envio = NOW(),
                r.intentos = 0,
                r.id_estado_programacion_fk = ?,
                r.processing = 0,
                r.proximo_envio = DATE_ADD(NOW(), INTERVAL f.dias_intervalo DAY)
            WHERE r.id_recordatorio_pk = ?
          `, [estadoEnviado?.[0]?.id_estado_pk, recordatorio.id_recordatorio_pk]);

          console.log(`✅ Recordatorio ${recordatorio.id_recordatorio_pk} completado. Próximo en ${recordatorio.dias_intervalo} días`);
        } else {
          throw new Error('No se pudo enviar a ningún cliente');
        }

      } catch (error) {
        // MANEJO DE ERRORES: MARCAR COMO FALLIDO Y APLICAR BACKOFF
        console.error(`❌ Error recordatorio ${recordatorio.id_recordatorio_pk}:`, error.message);

        try {
          const [estadoFallido] = await conn.query(`
            SELECT id_estado_pk
            FROM cat_estados
            WHERE dominio = 'RECORDATORIO' AND nombre_estado = 'FALLIDO'
            LIMIT 1
          `);

          const intentos = Number(recordatorio.intentos || 0) + 1;

          await conn.query(`
            UPDATE tbl_recordatorios
            SET intentos = ?,
                id_estado_programacion_fk = ?,
                processing = 0,
                activo = IF(? >= 3, 0, 1),
                proximo_envio = IF(? < 3, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NULL)
            WHERE id_recordatorio_pk = ?
          `, [intentos, estadoFallido?.[0]?.id_estado_pk, intentos, intentos, recordatorio.id_recordatorio_pk]);

          if (intentos >= 3) {
            console.log(`🚫 Recordatorio ${recordatorio.id_recordatorio_pk} DESACTIVADO tras 3 intentos`);
          } else {
            console.log(`🔄 Recordatorio ${recordatorio.id_recordatorio_pk} reintentará en 15 min (${intentos}/3)`);
          }
        } catch (updateError) {
          console.error(`❌ Error crítico al actualizar:`, updateError.message);
          await conn.query(
            `UPDATE tbl_recordatorios SET processing = 0 WHERE id_recordatorio_pk = ?`,
            [recordatorio.id_recordatorio_pk]
          );
        }
      }
    }

  } catch (error) {
    console.error('❌ [CRON RECORDATORIOS] Error general:', error);
  } finally {
    conn.release();
  }
}, {
  scheduled: true,
  timezone: 'America/Tegucigalpa'
});

console.log('🚀 Job de recordatorios iniciado (cada 1 minuto - America/Tegucigalpa)\n');

module.exports = {};