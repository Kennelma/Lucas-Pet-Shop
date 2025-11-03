const express = require('express');
const cors = require("cors");
const app = express();
const path = require('path');
const mysqlConnection = require('./config/conexion');
const { connectWhatsApp } = require('./config/whatsapp');

// SILENCIAR COMPLETAMENTE DOTENV
const originalLog = console.log;
console.log = () => {};
require('dotenv').config({
    path: path.resolve(process.cwd(), '..', '.env')
});
console.log = originalLog;


//PARA QUE EL SERVIDOR PUEDA RECIBIR JSON Y XXWW-FORM-URLENCODED
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', require('./routes/rutas'));

//IMPORTACION DE WHATSAPP
connectWhatsApp().catch(err => {
    console.error('❌ Error al conectar WhatsApp:', err);
    console.log('⚠️  El servidor funcionará, pero WhatsApp no estará disponible.');
});

const PORT = 4000;
app.listen(PORT, function() {
    console.log('🚀 Servidor en puerto ' + PORT);
    //console.log('📱 Escanea el QR de WhatsApp si aparece en la terminal');
});

module.exports = app;