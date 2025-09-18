//Constante para el paquete Express
const express = require('express');

//constante para los metodos de express.
var  app = express();

//constante para el paquete de bodyparser.
const bp = require('body-parser');

//IMPORTO LA CONEXION DEL ARCHIVO CORRRESPONDIENTE
const mysqlConnection = require('./conexion'); 

//Enviando los datos de data-form a NODEJS API
app.use(express.json());
app.use(bp.urlencoded({ extended: true }))

const cors = require("cors");

//Permitir todas las peticiones desde cualquier origen
app.use(cors());

//IMPORTACION DE LA RUTA GENERICA
app.use('/api', require('./crud-general'));

const PORT = 4000;
app.listen(PORT, function() {
    console.log('🚀 Servidor en puerto ' + PORT);
});