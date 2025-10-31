const express = require('express');
const cors = require("cors");
const mysqlConnection = require('./config/conexion');
const path = require('path');

require('dotenv').config({ 
    path: path.resolve(process.cwd(), '..', '.env'),
    debug: false,
    silent: true
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', require('./routes/rutas'));

// 🔹 Inicializar WhatsApp al arrancar servidor
const whatsappService = require('./services/whatsappService');
whatsappService.connect().catch(err => {
    console.warn('⚠️ WhatsApp no conectado automáticamente. Conéctalo desde el frontend.');
});

const PORT = 4000;
app.listen(PORT, function() {
    console.log('🚀 Servidor en puerto ' + PORT);
    console.log('📱 Escanea el QR de WhatsApp si aparece en la terminal');
});

// 🔹 Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
});