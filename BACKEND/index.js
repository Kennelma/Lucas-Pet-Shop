//Constante para el paquete Express
const express = require('express');
const cors = require("cors");

//constante para los metodos de express.
var app = express();

//IMPORTO LA CONEXION DEL ARCHIVO CORRRESPONDIENTE
const mysqlConnection = require('./config/conexion');

//PARA CARGAR LA JWT SECRET DESDE EL ARCHIVO .ENV
const path = require('path');

require('dotenv').config({ 
    path: path.resolve(process.cwd(), '..', '.env'),
    debug: false,
    silent: true
});

//PARA QUE EL SERVIDOR PUEDA RECIBIR JSON Y XXWW-FORM-URLENCODED
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Permitir todas las peticiones desde cualquier origen
app.use(cors());

//IMPORTACION DE LAS RUTAS
app.use('/api', require('./routes/rutas'));

// 🔹 Inicializar WhatsApp al arrancar servidor
 const whatsappService = require('./services/whatsappService');
 whatsappService.connect().catch(err => {
     console.warn('⚠️ WhatsApp no conectado automáticamente. Conéctalo desde el frontend.');
 });

const PORT = 4000;
app.listen(PORT, function() {
    console.log('🚀 Servidor en puerto ' + PORT);
//     console.log('📱 Escanea el QR de WhatsApp si aparece en la terminal');
});

// Agregar al final del archivo, después de inicializar el servidor:

// 🔹 PROGRAMADOR AUTOMÁTICO - Ejecutar cada hora
const whatsappController = require('./controllers/whatsappController');

setInterval(() => {
    whatsappController.procesarRecordatoriosProgramados();
}, 60 * 60 * 1000); // Cada hora

// 🔹 También ejecutar al iniciar el servidor (opcional)
whatsappController.procesarRecordatoriosProgramados();

console.log('⏰ Programador automático de recordatorios iniciado');