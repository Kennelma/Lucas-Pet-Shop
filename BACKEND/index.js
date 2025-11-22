const express = require('express');
const cors = require("cors");
const app = express();
const path = require('path');
const mysqlConnection = require('./config/conexion');
const { connectWhatsApp } = require('./config/whatsapp');


//IMPORTACIÓN DE VARIABLES DE ENTORNO
require('dotenv').config();


//IMPORTACIÓN DE JOBS
require('./jobs/lotes-vencimiento');
require('./jobs/productos-stock');
require('./jobs/envio-recordatorios');


//PARA QUE EL SERVIDOR PUEDA RECIBIR JSON Y XXWW-FORM-URLENCODED
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', require('./routes/rutas'));


//IMPORTACION DE WHATSAPP
connectWhatsApp().catch(err => {
    console.error('ERROR AL CONECTAR WHATSAPP:', err);
});

const PORT = 4000;
app.listen(PORT, function() {
    console.log('SERVIDOR EN PUERTO ' + PORT);
    //console.log('📱 Escanea el QR de WhatsApp si aparece en la terminal');
});

module.exports = app;