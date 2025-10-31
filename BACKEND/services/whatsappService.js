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
const QRCode = require('qrcode'); // ✅ IMPORTANTE: Agregar esto

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.qrCode = null;
        this.qrBase64 = null;
        this.isConnected = false;
        this.authFolder = path.join(__dirname, '../whatsapp_auth');
        this.qrListeners = [];
        this.connectionPromise = null;
        this.connectionStatus = 'disconnected';
    }

    onQRGenerated(callback) {
        this.qrListeners.push(callback);
    }

    async notifyQR(qr) {
        console.log('📱 Notificando QR a listeners:', this.qrListeners.length);
        
        // ✅ GENERAR QR BASE64 INMEDIATAMENTE
        try {
            this.qrBase64 = await QRCode.toDataURL(qr);
            console.log('✅ QR Base64 generado correctamente');
        } catch (error) {
            console.error('❌ Error generando QR Base64:', error);
            this.qrBase64 = null;
        }

        this.qrListeners.forEach(callback => {
            try {
                callback(qr, this.qrBase64); // ✅ Enviar ambos
            } catch (error) {
                console.error('Error en QR listener:', error);
            }
        });
    }

    async connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionStatus = 'connecting';
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
                    printQRInTerminal: false, // ✅ DESACTIVAR - ya no funciona
                    auth: state,
                    browser: ['Sistema Recordatorios', 'Chrome', '1.0.0'],
                    markOnlineOnConnect: false,
                    syncFullHistory: false,
                    generateHighQualityLinkPreview: false
                });

                this.sock.ev.on('creds.update', saveCreds);

                // 🔹 MANEJADOR DE CONEXIÓN MEJORADO
                this.sock.ev.on('connection.update', async (update) => {
                    const { connection, lastDisconnect, qr } = update;
                    
                    console.log('🔄 Estado conexión:', connection);

                    // 📱 GENERAR QR - MANUALMENTE
                    if (qr) {
                        console.log('📱 QR Code generado, notificando listeners...');
                        this.qrCode = qr;
                        
                        // ✅ MOSTRAR QR EN TERMINAL MANUALMENTE
                        try {
                            console.log('\n\n📱 ====== QR CODE WHATSAPP ======');
                            console.log('📱 Escanea este código con tu teléfono:');
                            console.log('📱 ===============================\n\n');
                            
                            // Generar QR en terminal
                            const qrTerminal = await import('qrcode-terminal');
                            qrTerminal.generate(qr, { small: true });
                        } catch (error) {
                            console.log('📱 QR generado (no se pudo mostrar en terminal)');
                        }
                        
                        await this.notifyQR(qr);
                    }

                    if (connection === 'open') {
                        this.isConnected = true;
                        this.connectionStatus = 'connected';
                        this.qrCode = null;
                        this.qrBase64 = null;
                        this.connectionPromise = null;
                        console.log('✅ WhatsApp conectado exitosamente');
                    }

                    if (connection === 'close') {
                        this.isConnected = false;
                        this.connectionStatus = 'disconnected';
                        this.qrCode = null;
                        this.qrBase64 = null;
                        this.connectionPromise = null;
                        
                        const statusCode = (lastDisconnect?.error instanceof Boom) 
                            ? lastDisconnect.error.output.statusCode 
                            : null;
                        
                        console.log('❌ Conexión cerrada. StatusCode:', statusCode);
                        
                        if (statusCode !== DisconnectReason.loggedOut && statusCode !== 408) {
                            console.log('🔄 Intentando reconexión en 5 segundos...');
                            setTimeout(() => {
                                this.connect().catch(console.error);
                            }, 5000);
                        } else if (statusCode === 408) {
                            console.log('⏰ Timeout de conexión. Reiniciando...');
                            setTimeout(() => {
                                this.connect().catch(console.error);
                            }, 3000);
                        }
                    }
                });

                return true;
            } catch (error) {
                this.connectionPromise = null;
                this.connectionStatus = 'disconnected';
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
            this.connectionStatus = 'disconnected';
            this.qrCode = null;
            this.qrBase64 = null;
            this.connectionPromise = null;
            console.log('🔴 WhatsApp desconectado');
        }
    }

    getStatus() {
        return {
            connected: this.isConnected,
            status: this.connectionStatus,
            qrCode: this.qrCode,
            qrBase64: this.qrBase64
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // 🔄 AGREGAR ESTO AL FINAL DE LA CLASE WhatsAppService
startScheduler() {
    // Verificar cada minuto si hay recordatorios pendientes
   setInterval(async () => {
    if (!whatsappService.isConnected) return;
    
    try {
        const mysqlConnection = require('./config/conexion');
        const conn = await mysqlConnection.getConnection();
        
        // Buscar recordatorios cuya fecha ya pasó
        const [recordatorios] = await conn.query(`
            SELECT * FROM tbl_recordatorios 
            WHERE proximo_envio <= NOW() 
            AND id_estado_programacion_fk IN (1, 3, 5)
            AND activo = 1
        `);

        if (recordatorios.length > 0) {
            console.log(`📨 Enviando ${recordatorios.length} recordatorios pendientes...`);
            
            for (const recordatorio of recordatorios) {
                // Enviar y actualizar fecha
                const [clientes] = await conn.query(`
                    SELECT telefono_cliente FROM tbl_clientes 
                    WHERE telefono_cliente IS NOT NULL 
                `);

                if (clientes.length > 0) {
                    const numeros = clientes.map(c => c.telefono_cliente);
                    await whatsappService.enviarMasivo(numeros, recordatorio.mensaje_recordatorio);
                    
                    // Calcular nueva fecha
                    if (recordatorio.id_frecuencia_fk) {
                        const [frecuencia] = await conn.query(
                            `SELECT dias_intervalo FROM cat_frecuencia_recordatorio 
                             WHERE id_frecuencia_record_pk = ?`,
                            [recordatorio.id_frecuencia_fk]
                        );
                        
                        if (frecuencia[0]) {
                            const nuevaFecha = new Date();
                            nuevaFecha.setDate(nuevaFecha.getDate() + frecuencia[0].dias_intervalo);
                            
                            await conn.query(
                                `UPDATE tbl_recordatorios 
                                 SET proximo_envio = ?, ultimo_envio = NOW(), id_estado_programacion_fk = 3
                                 WHERE id_recordatorio_pk = ?`,
                                [nuevaFecha, recordatorio.id_recordatorio_pk]
                            );
                        }
                    }
                }
            }
        }
        
        conn.release();
    } catch (error) {
        console.log('⚠️ Error en recordatorios automáticos:', error.message);
    }
}, 60000); // Cada minuto

console.log('✅ Recordatorios automáticos ACTIVADOS')
;}
}



const whatsappService = new WhatsAppService();
module.exports = whatsappService;