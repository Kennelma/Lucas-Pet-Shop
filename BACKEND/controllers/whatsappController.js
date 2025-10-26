import mysqlConnection from '../config/conexion.js';
import { sock } from './whatsapp.controller.js'; // Asegúrate del nombre correcto de tu archivo donde está iniciarWhatsApp()

// Función principal para enviar recordatorios automáticamente
export const procesarRecordatoriosWhatsApp = async () => {
  try {
    console.log('⏳ Revisando recordatorios pendientes...');
    const [recordatorios] = await mysqlConnection.query(`
      SELECT id_recordatorio_pk, mensaje_recordatorio, programada_para
      FROM tbl_recordatorios
      WHERE activo = 1
        AND (ultimo_envio IS NULL OR programada_para <= NOW())
    `);

    if (recordatorios.length === 0) {
      console.log('⏸️ No hay recordatorios pendientes.');
      return;
    }

    const [clientes] = await mysqlConnection.query(`
      SELECT telefono_cliente
      FROM tbl_clientes
      WHERE activo = 1 AND telefono_cliente IS NOT NULL
    `);

    for (const rec of recordatorios) {
      console.log(`📨 Enviando recordatorio ID ${rec.id_recordatorio_pk}`);

      for (const cli of clientes) {
        const telefono = cli.telefono_cliente?.replace(/\D/g, '');
        if (!telefono) continue;

        try {
          await sock.sendMessage(`${telefono}@s.whatsapp.net`, {
            text: rec.mensaje_recordatorio
          });
          console.log(`✅ Enviado a ${telefono}`);
        } catch (error) {
          console.error(`❌ Error enviando a ${telefono}:`, error.message);
        }
      }

      // Actualizar el último envío
      await mysqlConnection.query(`
        UPDATE tbl_recordatorios
        SET ultimo_envio = NOW()
        WHERE id_recordatorio_pk = ?
      `, [rec.id_recordatorio_pk]);
    }

  } catch (err) {
    console.error('🔥 Error general procesando recordatorios:', err.message);
  }
};

// 🔁 Ejecutar automáticamente cada minuto
setInterval(procesarRecordatoriosWhatsApp, 60 * 1000);
