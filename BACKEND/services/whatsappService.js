// ========================================
// 📁 BACKEND/services/whatsappService.js
// ========================================
const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.qrCode = null;
        this.isConnected = false;
        this.authFolder = path.join(__dirname, '../whatsapp_auth');
        this.qrListeners = []; // Para notificar cuando hay QR
    }

    // 🔹 Agregar listener para QR
    onQRGenerated(callback) {
        this.qrListeners.push(callback);
    }

    // 🔹 Notificar QR a todos los listeners
    notifyQR(qr) {
        this.qrListeners.forEach(callback => callback(qr));
    }

    async connect() {
        try {
            if (!fs.existsSync(this.authFolder)) {
                fs.mkdirSync(this.authFolder, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                // ❌ NO mostrar QR en terminal
                printQRInTerminal: false,
                auth: state,
                browser: ['Sistema Recordatorios', 'Chrome', '1.0.0']
            });

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qrCode = qr;
                    console.log('📱 QR Code generado. Enviando al frontend...');
                    
                    // ✅ Notificar a todos los listeners (frontend)
                    this.notifyQR(qr);
                    
                    // ❌ OPCIONAL: Mostrar QR en terminal manualmente (solo si necesitas debug)
                    // const QRCode = require('qrcode-terminal');
                    // QRCode.generate(qr, { small: true });
                }

                if (connection === 'close') {
                    const shouldReconnect = 
                        (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    
                    console.log('❌ Conexión cerrada. Reconectando:', shouldReconnect);
                    
                    if (shouldReconnect) {
                        await this.connect();
                    } else {
                        this.isConnected = false;
                        this.qrCode = null;
                        console.log('⚠️ Sesión cerrada. Vuelve a escanear el QR.');
                    }
                }

                if (connection === 'open') {
                    this.isConnected = true;
                    this.qrCode = null;
                    console.log('✅ WhatsApp conectado exitosamente');
                }
            });

            return true;
        } catch (error) {
            console.error('❌ Error conectando WhatsApp:', error);
            throw error;
        }
    }

    formatNumber(number) {
        let cleaned = number.toString().replace(/\D/g, '');
        
        if (!cleaned.startsWith('504')) {
            cleaned = '504' + cleaned;
        }
        
        return cleaned + '@s.whatsapp.net';
    }

    async verificarNumero(numero) {
        try {
            const formattedNumber = this.formatNumber(numero);
            const [result] = await this.sock.onWhatsApp(formattedNumber);
            return result?.exists || false;
        } catch (error) {
            console.warn(`⚠️ No se pudo verificar: ${numero}`);
            return false;
        }
    }

    async enviarMensaje(numero, mensaje) {
        try {
            if (!this.isConnected) {
                throw new Error('WhatsApp no está conectado');
            }

            const formattedNumber = this.formatNumber(numero);
            const existe = await this.verificarNumero(numero);

            if (!existe) {
                return { 
                    success: false, 
                    numero, 
                    error: 'Número no registrado en WhatsApp' 
                };
            }

            await this.sock.sendMessage(formattedNumber, { text: mensaje });

            console.log(`✅ Mensaje enviado a: ${numero}`);
            return { success: true, numero };

        } catch (error) {
            console.error(`❌ Error enviando a ${numero}:`, error.message);
            return { 
                success: false, 
                numero, 
                error: error.message 
            };
        }
    }

    async enviarMasivo(numeros, mensaje) {
        const resultados = {
            exitosos: [],
            fallidos: [],
            total: numeros.length
        };

        console.log(`📤 Iniciando envío masivo a ${numeros.length} números...`);

        for (const numero of numeros) {
            const resultado = await this.enviarMensaje(numero, mensaje);

            if (resultado.success) {
                resultados.exitosos.push(numero);
            } else {
                resultados.fallidos.push({
                    numero,
                    error: resultado.error
                });
            }

            await this.sleep(2000);
        }

        console.log(`✅ Envío completado: ${resultados.exitosos.length}/${resultados.total}`);
        return resultados;
    }

    async disconnect() {
        if (this.sock) {
            await this.sock.logout();
            this.isConnected = false;
            this.qrCode = null;
            console.log('🔴 WhatsApp desconectado');
        }
    }

    getStatus() {
        return {
            connected: this.isConnected,
            qrCode: this.qrCode,
            needsQR: !this.isConnected && !fs.existsSync(path.join(this.authFolder, 'creds.json'))
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const whatsappService = new WhatsAppService();

module.exports = whatsappService;