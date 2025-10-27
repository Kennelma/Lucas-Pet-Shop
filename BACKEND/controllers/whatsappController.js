const whatsappService = require('../services/whatsappService');
const mysqlConnection = require('../config/conexion');

exports.getStatus = async (req, res) => {
    try {
        const status = whatsappService.getStatus();
        res.json({
            Consulta: true,
            ...status
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
        await whatsappService.connect();
        res.json({
            Consulta: true,
            mensaje: 'Conectando WhatsApp... Escanea el QR en la terminal',
            qrCode: whatsappService.qrCode
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

        const [clientes] = await conn.query(
            `SELECT DISTINCT telefono_cliente 
             FROM tbl_clientes 
             WHERE telefono_cliente IS NOT NULL 
             AND telefono_cliente != ''`
        );

        if (clientes.length === 0) {
            return res.json({
                Consulta: false,
                error: 'No hay clientes con teléfonos registrados'
            });
        }

        const numeros = clientes.map(c => c.telefono_cliente);
        const resultados = await whatsappService.enviarMasivo(numeros, mensaje);

        if (id_recordatorio) {
            await conn.query(
                `UPDATE tbl_recordatorios 
                 SET ultimo_envio = NOW(), 
                     intentos = intentos + 1
                 WHERE id_recordatorio_pk = ?`,
                [id_recordatorio]
            );
        }

        res.json({
            Consulta: true,
            mensaje: 'Envío completado',
            resultados
        });

    } catch (error) {
        console.error('Error en envío masivo:', error);
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};