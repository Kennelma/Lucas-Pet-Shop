const whatsappService = require('../services/whatsappService');
const mysqlConnection = require('../config/conexion');

// 🔹 Variables globales para QR
let currentQR = null;
let currentQRBase64 = null;

// 🔹 Registrar listener para QR (recibe ambos parámetros del service)
whatsappService.onQRGenerated(async (qr, qrBase64) => {
    currentQR = qr;
    currentQRBase64 = qrBase64;
    console.log('🔄 QR almacenado para frontend');
});

exports.getStatus = async (req, res) => {
    try {
        const status = whatsappService.getStatus();
        res.json({
            Consulta: true,
            connected: status.connected,
            qrCode: currentQR,
            qrBase64: currentQRBase64,
            status: status.status
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
        currentQRBase64 = null;
        
        console.log('🔄 Solicitando conexión WhatsApp...');
        await whatsappService.connect();
        
        res.json({
            Consulta: true,
            mensaje: 'Conectando WhatsApp...',
            qrCode: currentQR,
            qrBase64: currentQRBase64
        });
    } catch (error) {
        console.error('❌ Error en connect:', error);
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
        currentQRBase64 = null;
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

// 🔹 Endpoint para obtener QR (string)
exports.getQR = async (req, res) => {
    try {
        const status = whatsappService.getStatus();
        
        if (currentQR) {
            return res.json({
                Consulta: true,
                qrCode: currentQR,
                message: 'QR disponible',
                isConnected: status.connected
            });
        }

        if (status.connected) {
            return res.json({
                Consulta: true,
                qrCode: null,
                message: 'WhatsApp ya está conectado',
                isConnected: true
            });
        }
        
        res.json({
            Consulta: false,
            qrCode: null,
            message: 'No hay QR disponible. Intenta conectar primero.',
            isConnected: false
        });
        
    } catch (error) {
        console.error('❌ Error en getQR:', error);
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    }
};

// 🔹 Endpoint para obtener QR en Base64
exports.getQRBase64 = async (req, res) => {
    try {
        const status = whatsappService.getStatus();
        
        if (currentQRBase64) {
            return res.json({
                Consulta: true,
                qrBase64: currentQRBase64,
                message: 'QR Base64 disponible',
                isConnected: status.connected
            });
        }

        if (status.connected) {
            return res.json({
                Consulta: true,
                qrBase64: null,
                message: 'WhatsApp ya está conectado',
                isConnected: true
            });
        }
        
        res.json({
            Consulta: false,
            qrBase64: null,
            message: 'No hay QR disponible. Intenta conectar primero.',
            isConnected: false
        });
        
    } catch (error) {
        console.error('❌ Error en getQRBase64:', error);
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    }
};

exports.enviarRecordatorioMasivo = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        const { id_recordatorio, mensaje } = req.body;

        if (!whatsappService.isConnected) {
            return res.status(400).json({
                Consulta: false,
                error: 'WhatsApp no está conectado'
            });
        }

        // Actualizar estado a "Enviando"
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

        // Actualizar estado final
        if (id_recordatorio) {
            let estadoFinal = 3; // Enviado
            
            if (resultados.fallidos.length > 0 && resultados.exitosos.length === 0) {
                estadoFinal = 4; // Fallido
            } else if (resultados.fallidos.length > 0) {
                estadoFinal = 5; // Parcial
            }

            await conn.query(
                `UPDATE tbl_recordatorios 
                 SET id_estado_programacion_fk = ?,
                     ultimo_envio = NOW(),
                     intentos = intentos + 1
                 WHERE id_recordatorio_pk = ?`,
                [estadoFinal, id_recordatorio]
            );
        }

        res.json({
            Consulta: true,
            mensaje: 'Envío completado',
            resultados
        });

    } catch (error) {
        console.error('Error en envío masivo:', error);
        
        // Asegurar que id_recordatorio está definido en este scope
        if (req.body.id_recordatorio) {
            await conn.query(
                `UPDATE tbl_recordatorios 
                 SET id_estado_programacion_fk = 4
                 WHERE id_recordatorio_pk = ?`,
                [req.body.id_recordatorio]
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