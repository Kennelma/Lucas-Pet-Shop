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
    console.log('📱 Escanea el QR de WhatsApp si aparece en la terminal');
    
    // 🔹 PROGRAMADOR AUTOMÁTICO - Iniciar después de que el servidor esté listo
    iniciarProgramadorAutomatico();
});

// 🔹 FUNCIÓN PARA INICIAR EL PROGRAMADOR AUTOMÁTICO
const iniciarProgramadorAutomatico = () => {
    try {
        const whatsappController = require('./controllers/whatsappController');
        
        // Verificar si la función existe antes de llamarla
        if (whatsappController && typeof whatsappController.procesarRecordatoriosProgramados === 'function') {
            
            // 🔹 Ejecutar al iniciar el servidor (opcional)
            console.log('⏰ Iniciando verificación inicial de recordatorios...');
            whatsappController.procesarRecordatoriosProgramados().catch(err => {
                console.warn('⚠️ Error en verificación inicial:', err.message);
            });
            
            // 🔹 Programar ejecución cada hora
            setInterval(() => {
                console.log('⏰ Verificando recordatorios programados...');
                whatsappController.procesarRecordatoriosProgramados().catch(err => {
                    console.warn('⚠️ Error en verificación programada:', err.message);
                });
            }, 60 * 60 * 1000); // Cada hora
            
            console.log('✅ Programador automático de recordatorios iniciado');
            
        } else {
            console.warn('⚠️ Función procesarRecordatoriosProgramados no disponible');
        }
        
    } catch (error) {
        console.error('❌ Error iniciando programador automático:', error.message);
    }
};

// 🔹 Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
});