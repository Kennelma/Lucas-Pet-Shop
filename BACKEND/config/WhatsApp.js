const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const QRCode = require('qrcode'); // ⭐ Cambiar a generar imagen
const path = require('path');

let sock = null;
let isConnected = false;
let qrCodeData = null; // ⭐ Guardar QR aquí

const connectWhatsApp = async () => {
    try {
        const authPath = path.join(__dirname, '..', 'auth_info');
        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // ⭐ Generar QR como base64 para el frontend
                qrCodeData = await QRCode.toDataURL(qr);
                console.log('📱 QR generado. Accede desde el frontend para escanearlo.');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                    : true;

                console.log('🔌 Conexión cerrada.');

                if (shouldReconnect) {
                    console.log('🔄 Reconectando...');
                    setTimeout(() => connectWhatsApp(), 5000);
                } else {
                    console.log('❌ Sesión cerrada.');
                    isConnected = false;
                    qrCodeData = null; // ⭐ Limpiar QR
                }
            }
            else if (connection === 'open') {
                console.log('✅ WhatsApp conectado');
                isConnected = true;
                qrCodeData = null; // ⭐ Limpiar QR cuando se conecta
            }
        });

        sock.ev.on('creds.update', saveCreds);

        return sock;

    } catch (error) {
        console.error('❌ Error al conectar WhatsApp:', error);
        isConnected = false;
        throw error;
    }
};

const getWhatsAppSocket = () => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp no está conectado');
    }
    return sock;
};

const isWhatsAppConnected = () => isConnected;

// ⭐ Obtener QR para el frontend
const getQRCode = () => qrCodeData;

module.exports = {
    connectWhatsApp,
    getWhatsAppSocket,
    isWhatsAppConnected,
    getQRCode 
};