const { getQRCode, isWhatsAppConnected, logoutWhatsApp, requestPairingCode, getWhatsAppSocket } = require('../config/whatsapp');
const mysqlConnection = require('../config/conexion');

exports.obtenerQR = (req, res) => {
    try {
        const qr = getQRCode();

        if (isWhatsAppConnected()) {
            return res.json({
                success: true,
                conectado: true,
                mensaje: 'WhatsApp ya está conectado'
            });
        }

        if (!qr) {
            return res.json({
                success: false,
                conectado: false,
                mensaje: 'QR no disponible. Reinicia el servidor.'
            });
        }

        return res.json({
            success: true,
            conectado: false,
            qr: qr // ⭐ QR en base64
        });

    } catch (error) {
        console.error('❌ Error al obtener QR:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al obtener QR',
            error: error.message
        });
    }
};

exports.verificarEstado = (req, res) => {
    return res.json({
        success: true,
        conectado: isWhatsAppConnected()
    });
};

//====================SOLICITAR_CODIGO_EMPAREJAMIENTO====================
exports.solicitarCodigoEmparejamiento = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                mensaje: 'Número de teléfono requerido'
            });
        }

        const code = await requestPairingCode(phoneNumber);

        return res.json({
            success: true,
            code: code,
            mensaje: 'Código de emparejamiento generado'
        });
    } catch (error) {
        console.error('❌ Error al solicitar código:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al solicitar código de emparejamiento',
            error: error.message
        });
    }
};

//====================CERRAR_SESION====================
exports.cerrarSesion = async (req, res) => {
    try {
        await logoutWhatsApp();
        return res.json({
            success: true,
            mensaje: 'Sesión cerrada correctamente'
        });
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al cerrar sesión',
            error: error.message
        });
    }
};



exports.enviarRecordatoriosPendientes = async (req, res) => {

    const conn = await mysqlConnection.getConnection();
    try {

        //VERIFICAR CONEXIÓN WHATSAPP
        if (!isWhatsAppConnected()) {
            return res.status(400).json({
                success: false,
                mensaje: 'WhatsApp no está conectado'
            });
        }

        const sock = getWhatsAppSocket();

        //OBTENER LOS RECORDATORIOS PENDIENTES
        const query = `
            SELECT DISTINCT
                c.id_cliente_pk,
                c.telefono_cliente,
                r.mensaje_recordatorio,
                r.id_recordatorio_pk,
                r.programada_para
            FROM tbl_recordatorios r
            INNER JOIN cat_estados ce
                ON ce.id_estado_pk = r.id_estado_programacion_fk
            INNER JOIN tbl_detalles_facturas df
                ON df.id_tipo_item_fk = r.id_tipo_item_fk
            INNER JOIN tbl_facturas f
                ON f.id_factura_pk = df.id_factura_fk
            INNER JOIN tbl_clientes c
                ON c.id_cliente_pk = f.id_cliente_fk
            WHERE
                r.activo = 1
                AND ce.nombre_estado = 'PENDIENTE'
                AND r.programada_para <= NOW()
                AND c.telefono_cliente IS NOT NULL
                AND c.telefono_cliente != ''
        `;

        const [recordatorios] = await conn.query(query);

        if (recordatorios.length === 0) {
            return res.json({
                success: true,
                mensaje: 'No hay recordatorios pendientes para enviar',
                enviados: 0
            });
        }

        //NVIAR REDORDATORIOS
        let enviados = 0;
        let errores = 0;
        const resultados = [];

        for (const record of recordatorios) {
            try {

                // Formatear número: 50412345678@s.whatsapp.net
                const numero = record.telefono_cliente.replace(/\D/g, ''); // Quitar caracteres no numéricos
                const jid = `504${numero}@s.whatsapp.net`; 
                // Enviar mensaje
                await sock.sendMessage(jid, {
                    text: record.mensaje_recordatorio
                });

                enviados++;
                resultados.push({
                    cliente_id: record.id_cliente_pk,
                    telefono: record.telefono_cliente,
                    estado: 'enviado'
                });

                console.log(`✅ Enviado a ${record.telefono_cliente}`);

            } catch (error) {
                errores++;
                resultados.push({
                    cliente_id: record.id_cliente_pk,
                    telefono: record.telefono_cliente,
                    estado: 'error',
                    error: error.message
                });

                console.error(`❌ Error enviando a ${record.telefono_cliente}:`, error);
            }
        }

        // 4. Actualizar estado de recordatorios a ENVIADO
        // (Solo los que se enviaron exitosamente)
        if (enviados > 0) {
            const recordatoriosIds = recordatorios
                .filter((r, index) => resultados[index].estado === 'enviado')
                .map(r => r.id_recordatorio_pk);

            if (recordatoriosIds.length > 0) {
                // Obtener el id_estado de "ENVIADO" desde cat_estados
                const [estadoEnviado] = await   conn.query(
                    'SELECT id_estado_pk FROM cat_estados WHERE nombre_estado = ?',
                    ['ENVIADO']
                );

                if (estadoEnviado.length > 0) {
                    const idEstadoEnviado = estadoEnviado[0].id_estado_pk;

                    await conn.query(
                        `UPDATE tbl_recordatorios
                         SET id_estado_programacion_fk = ?
                         WHERE id_recordatorio_pk IN (?)`,
                        [idEstadoEnviado, recordatoriosIds]
                    );
                }
            }
        }

        return res.json({
            success: true,
            mensaje: `Proceso completado: ${enviados} enviados, ${errores} errores`,
            enviados,
            errores,
            resultados
        });

    } catch (error) {
        console.error('❌ Error al enviar recordatorios:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al enviar recordatorios',
            error: error.message
        });
    } finally {
        if (conn) conn.release();  // 🔥 Agregar esto
    }

};