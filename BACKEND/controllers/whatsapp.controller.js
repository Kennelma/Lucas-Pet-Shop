const { getQRCode, isWhatsAppConnected } = require('../config/whatsapp');

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