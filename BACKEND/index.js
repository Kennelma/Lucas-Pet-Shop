//IMPORTACIÓN DE VARIABLES DE ENTORNO
require('dotenv').config();

const express = require('express');
const cors = require("cors");
const app = express();
const path = require('path');

const mysqlConnection = require('./config/conexion');
const { connectWhatsApp } = require('./config/WhatsApp');


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
    console.error('Error al conectar WhatsApp:', err);
});

//SERVIDOR ESCUCHANDO PETICIONES, PUERTO 4000 O EL QUE ASIGNE EL HOSTING
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0',() => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;