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
const QRCode = require('qrcode');

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.qrCode = null;
        this.qrCodeBase64 = null;
        this.isConnected = false;
        this.authFolder = path.join(__dirname, '../whatsapp_auth');
        this.qrListeners = [];
        this.connectionPromise = null;
    }

    onQRGenerated(callback) {
        this.qrListeners.push(callback);
    }

    notifyQR(qr) {
        console.log('📱 Notificando QR a listeners:', this.qrListeners.length);
        this.qrListeners.forEach(callback => {
            try {
                callback(qr);
            } catch (error) {
                console.error('Error en QR listener:', error);
            }
        });
    }

    async connect() {
        // 🔹 Evitar múltiples conexiones simultáneas
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = (async () => {
            try {
                if (!fs.existsSync(this.authFolder)) {
                    fs.mkdirSync(this.authFolder, { recursive: true });
                }

                const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
                const { version } = await fetchLatestBaileysVersion();

                console.log('🔄 Iniciando conexión WhatsApp...');

                this.sock = makeWASocket({
                    version,
                    logger: pino({ level: 'silent' }),
                    printQRInTerminal: false, // ❌ NO mostrar en terminal automático
                    auth: state,
                    browser: ['Sistema Recordatorios', 'Chrome', '1.0.0'],
                    markOnlineOnConnect: false,
                    syncFullHistory: false,
                    generateHighQualityLinkPreview: false
                });

                this.sock.ev.on('creds.update', saveCreds);

                // 🔹 MANEJADOR DE CONEXIÓN MEJORADO CON QR TERMINAL
                this.sock.ev.on('connection.update', async (update) => {
                    const { connection, lastDisconnect, qr } = update;
                    
                    console.log('🔄 Estado conexión:', connection, qr ? 'QR disponible' : '');

                    // 📱 Manejo de QR Code con visualización en terminal
                    if (qr) {
                        console.log('📱 QR Code generado, almacenando...');
                        this.qrCode = qr;
                        
                        // ✅ MOSTRAR QR EN TERMINAL SIEMPRE (para debug)
                        try {
                            const QRCode = require('qrcode-terminal');
                            console.log('\n\n📱 ====== QR CODE WHATSAPP ======');
                            QRCode.generate(qr, { small: true });
                            console.log('📱 ===============================\n\n');
                        } catch (error) {
                            console.log('📱 QR generado (no se pudo mostrar en terminal)');
                        }
                        
                        // ✅ Notificar QR inmediatamente a listeners
                        this.notifyQR(qr);
                    }

                    // ❌ Manejo de desconexión
                    if (connection === 'close') {
                        const statusCode = (lastDisconnect?.error instanceof Boom) 
                            ? lastDisconnect.error.output.statusCode 
                            : null;
                        
                        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                        
                        console.log('❌ Conexión cerrada. StatusCode:', statusCode, 'Reconectar:', shouldReconnect);
                        
                        if (shouldReconnect) {
                            console.log('🔄 Intentando reconexión en 5 segundos...');
                            this.connectionPromise = null; // Limpiar promesa antes de reconectar
                            
                            setTimeout(async () => {
                                try {
                                    await this.connect();
                                } catch (error) {
                                    console.error('❌ Error en reconexión:', error);
                                }
                            }, 5000);
                        } else {
                            // Usuario cerró sesión manualmente
                            this.isConnected = false;
                            this.qrCode = null;
                            this.connectionPromise = null;
                            console.log('⚠️ Sesión cerrada manualmente. Vuelve a escanear el QR.');
                        }
                    }

                    // ✅ Manejo de conexión exitosa
                    if (connection === 'open') {
                        this.isConnected = true;
                        this.qrCode = null;
                        this.connectionPromise = null;
                        console.log('✅ WhatsApp conectado exitosamente');
                    }
                });

                return true;
            } catch (error) {
                this.connectionPromise = null;
                console.error('❌ Error conectando WhatsApp:', error);
                throw error;
            }
        })();

        return this.connectionPromise;
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
            this.connectionPromise = null;
            console.log('🔴 WhatsApp desconectado');
        }
    }

    // 🔹 Método para verificar estado de conexión
    async checkConnection() {
        return this.isConnected && this.sock !== null;
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