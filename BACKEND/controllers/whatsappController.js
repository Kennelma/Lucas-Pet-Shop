const whatsappService = require('../services/whatsappService');
const mysqlConnection = require('../config/conexion');

// 🔹 Variable global para almacenar QR
let currentQR = null;

// 🔹 Registrar listener para QR
whatsappService.onQRGenerated((qr) => {
    currentQR = qr;
    console.log('🔄 QR almacenado para frontend');
});

exports.getStatus = async (req, res) => {
    try {
        const status = whatsappService.getStatus();
        res.json({
            Consulta: true,
            ...status,
            qrCode: currentQR // ✅ Incluir QR actual
        });
    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    }
};

exports.connect = async (req, res) => {
    try {
        // Limpiar QR anterior
        currentQR = null;
        
        await whatsappService.connect();
        res.json({
            Consulta: true,
            mensaje: 'Conectando WhatsApp... Escanea el QR cuando aparezca',
            qrCode: currentQR
        });
    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    }
};

exports.disconnect = async (req, res) => {
    try {
        await whatsappService.disconnect();
        currentQR = null;
        res.json({
            Consulta: true,
            mensaje: 'WhatsApp desconectado'
        });
    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    }
};

// 🔹 NUEVO: Endpoint para obtener QR
exports.getQR = async (req, res) => {
    try {
        const status = whatsappService.getStatus();
        if (status.qrCode) {
            res.json({
                Consulta: true,
                qrCode: status.qrCode,
                message: 'QR disponible para escanear'
            });
        } else {
            res.json({
                Consulta: false,
                message: 'No hay QR disponible. Conecta WhatsApp primero.'
            });
        }
    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    }
};

// 🔹 NUEVO: Función para procesar recordatorios programados automáticamente
exports.procesarRecordatoriosProgramados = async () => {
    const conn = await mysqlConnection.getConnection();
    
    try {
        console.log('🔄 Verificando recordatorios programados...');
        
        // Obtener recordatorios que deben enviarse hoy
        const [recordatoriosPendientes] = await conn.query(
            `SELECT r.*, f.dias_intervalo 
             FROM tbl_recordatorios r
             JOIN cat_frecuencia_recordatorio f ON r.id_frecuencia_fk = f.id_frecuencia_record_pk
             WHERE r.proximo_envio <= NOW() 
             AND r.id_estado_programacion_fk IN (1, 3, 5)`
        );

        console.log(`📨 ${recordatoriosPendientes.length} recordatorios para enviar hoy`);

        for (const recordatorio of recordatoriosPendientes) {
            try {
                if (!whatsappService.isConnected) {
                    console.log('⚠️ WhatsApp no conectado, no se pueden enviar recordatorios automáticos');
                    break;
                }

                // Obtener clientes
                const [clientes] = await conn.query(
                    `SELECT DISTINCT telefono_cliente 
                     FROM tbl_clientes 
                     WHERE telefono_cliente IS NOT NULL 
                     AND telefono_cliente != ''`
                );

                if (clientes.length > 0) {
                    const numeros = clientes.map(c => c.telefono_cliente);
                    
                    // Actualizar estado a "Enviando"
                    await conn.query(
                        `UPDATE tbl_recordatorios 
                         SET id_estado_programacion_fk = 2 
                         WHERE id_recordatorio_pk = ?`,
                        [recordatorio.id_recordatorio_pk]
                    );

                    // Enviar mensajes
                    const resultados = await whatsappService.enviarMasivo(numeros, recordatorio.mensaje_recordatorio);

                    // Actualizar estado final
                    let estadoFinal = 3; // Enviado
                    if (resultados.fallidos.length > 0 && resultados.exitosos.length === 0) {
                        estadoFinal = 4; // Fallido
                    } else if (resultados.fallidos.length > 0) {
                        estadoFinal = 5; // Parcial
                    }

                    // Calcular próximo envío
                    const proximoEnvio = new Date();
                    proximoEnvio.setDate(proximoEnvio.getDate() + recordatorio.dias_intervalo);

                    await conn.query(
                        `UPDATE tbl_recordatorios 
                         SET id_estado_programacion_fk = ?,
                             ultimo_envio = NOW(),
                             proximo_envio = ?,
                             intentos = intentos + 1
                         WHERE id_recordatorio_pk = ?`,
                        [estadoFinal, proximoEnvio, recordatorio.id_recordatorio_pk]
                    );

                    console.log(`✅ Recordatorio ${recordatorio.id_recordatorio_pk} procesado: ${resultados.exitosos.length}/${resultados.total}`);
                }

            } catch (error) {
                console.error(`❌ Error procesando recordatorio ${recordatorio.id_recordatorio_pk}:`, error);
                
                // Marcar como fallido en caso de error
                await conn.query(
                    `UPDATE tbl_recordatorios 
                     SET id_estado_programacion_fk = 4,
                         ultimo_error = ?
                     WHERE id_recordatorio_pk = ?`,
                    [error.message, recordatorio.id_recordatorio_pk]
                );
            }
        }

    } catch (error) {
        console.error('❌ Error en procesamiento automático:', error);
    } finally {
        conn.release();
    }
};

exports.enviarRecordatorioMasivo = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        const { id_recordatorio, mensaje } = req.body;

        if (!whatsappService.isConnected) {
            return res.status(400).json({
                Consulta: false,
                error: 'WhatsApp no está conectado. Conéctalo primero.'
            });
        }

        // 🔹 1. Actualizar estado a "Enviando" (estado 2)
        if (id_recordatorio) {
            await conn.query(
                `UPDATE tbl_recordatorios 
                 SET id_estado_programacion_fk = 2 
                 WHERE id_recordatorio_pk = ?`,
                [id_recordatorio]
            );
        }

        const [clientes] = await conn.query(
            `SELECT DISTINCT telefono_cliente 
             FROM tbl_clientes 
             WHERE telefono_cliente IS NOT NULL 
             AND telefono_cliente != ''`
        );

        if (clientes.length === 0) {
            // 🔹 Si no hay clientes, actualizar estado a "Fallido"
            if (id_recordatorio) {
                await conn.query(
                    `UPDATE tbl_recordatorios 
                     SET id_estado_programacion_fk = 4 
                     WHERE id_recordatorio_pk = ?`,
                    [id_recordatorio]
                );
            }
            
            return res.json({
                Consulta: false,
                error: 'No hay clientes con teléfonos registrados'
            });
        }

        const numeros = clientes.map(c => c.telefono_cliente);
        const resultados = await whatsappService.enviarMasivo(numeros, mensaje);

        // 🔹 2. Actualizar estado final según resultados
        if (id_recordatorio) {
            let estadoFinal = 3; // 3 = Enviado (éxito total)
            
            if (resultados.fallidos.length > 0 && resultados.exitosos.length === 0) {
                estadoFinal = 4; // 4 = Fallido (todos fallaron)
            } else if (resultados.fallidos.length > 0) {
                estadoFinal = 5; // 5 = Parcial (algunos fallaron)
            }

            await conn.query(
                `UPDATE tbl_recordatorios 
                 SET id_estado_programacion_fk = ?,
                     ultimo_envio = NOW(), 
                     intentos = intentos + 1
                 WHERE id_recordatorio_pk = ?`,
                [estadoFinal, id_recordatorio]
            );

            // 🔹 3. Registrar detalles de envío (opcional)
            for (const exito of resultados.exitosos) {
                await conn.query(
                    `INSERT INTO tbl_envios_recordatorios 
                     (id_recordatorio_fk, telefono, estado, fecha_envio) 
                     VALUES (?, ?, 'enviado', NOW())`,
                    [id_recordatorio, exito]
                );
            }

            for (const fallido of resultados.fallidos) {
                await conn.query(
                    `INSERT INTO tbl_envios_recordatorios 
                     (id_recordatorio_fk, telefono, estado, error, fecha_intento) 
                     VALUES (?, ?, 'fallido', ?, NOW())`,
                    [id_recordatorio, fallido.numero, fallido.error]
                );
            }
        }

        res.json({
            Consulta: true,
            mensaje: 'Envío completado',
            resultados
        });

    } catch (error) {
        console.error('Error en envío masivo:', error);
        
        // 🔹 4. En caso de error, marcar como fallido
        if (id_recordatorio) {
            await conn.query(
                `UPDATE tbl_recordatorios 
                 SET id_estado_programacion_fk = 4,
                     ultimo_error = ?
                 WHERE id_recordatorio_pk = ?`,
                [error.message, id_recordatorio]
            );
        }

        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};