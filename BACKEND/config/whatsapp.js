const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

let sock = null;
let isConnected = false;
let qrCodeData = null; // ⭐ Guardar QR aquí

const connectWhatsApp = async () => {
    try {
        const authPath = path.join(__dirname, '..', 'auth_info');

        if (!fs.existsSync(authPath)) {
            fs.mkdirSync(authPath, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCodeData = await QRCode.toDataURL(qr);
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                    : true;

                if (shouldReconnect) {
                    setTimeout(() => connectWhatsApp(), 5000);
                } else {
                    isConnected = false;
                    qrCodeData = null;
                }
            }
            else if (connection === 'open') {
                isConnected = true;
                qrCodeData = null;
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

const getQRCode = () => qrCodeData;

//====================SOLICITAR_CODIGO_EMPAREJAMIENTO====================
const requestPairingCode = async (phoneNumber) => {
    try {
        if (!sock) {
            throw new Error('Socket de WhatsApp no inicializado');
        }
        const code = await sock.requestPairingCode(phoneNumber);
        return code;
    } catch (error) {
        console.error('❌ Error al solicitar código de emparejamiento:', error);
        throw error;
    }
};

//====================CERRAR_SESION_WHATSAPP====================
const logoutWhatsApp = async () => {
    try {
        if (sock) {
            await sock.logout();
            sock = null;
        }
        isConnected = false;
        qrCodeData = null;
        const authPath = path.join(__dirname, '..', 'auth_info');
        if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
        }
        await connectWhatsApp();
        return true;
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
    }
};

module.exports = {
    connectWhatsApp,
    getWhatsAppSocket,
    isWhatsAppConnected,
    getQRCode,
    requestPairingCode,
    logoutWhatsApp
};