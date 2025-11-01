const { getQRCode, isWhatsAppConnected, logoutWhatsApp, requestPairingCode } = require('../config/whatsapp');

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