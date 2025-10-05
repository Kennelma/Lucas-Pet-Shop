// Importaciones al inicio
const express = require('express');
const cors = require('cors');
const path = require('path');

// Constantes
const app = express();

// IMPORTO LA CONEXION DEL ARCHIVO CORRRESPONDIENTE
const mysqlConnection = require('./conexion'); 

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// IMPORTACION DE LA RUTA GENERICA
app.use('/api', require('./crud-general'));

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, function() {
    console.log('🚀 Servidor en puerto ' + PORT);
});