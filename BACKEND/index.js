// Importaciones al inicio
const express = require('express');

// Constantes
const app = express();

//constante para el paquete de bodyparser.
const bp = require('body-parser');

//IMPORTO LA CONEXION DEL ARCHIVO CORRRESPONDIENTE
const mysqlConnection = require('./config/conexion'); 

//Enviando los datos de data-form a NODEJS API
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }))

//Permitir todas las peticiones desde cualquier origen
//app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//IMPORTACION DE LAS RUTAS
app.use('/api', require('./routes/rutas'));

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, function() {
    console.log('🚀 Servidor en puerto ' + PORT);
});