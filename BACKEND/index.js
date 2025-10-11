//Constante para el paquete Express
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const mysqlConnection = require('./config/conexion'); 


const  app = express();

//Enviando los datos JSON y de data-form a NODEJS API
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//IMPORTACION DE LAS RUTAS;
app.use('/api', require('./routes/rutas'));

const PORT = 4000;
app.listen(PORT, function() {
    console.log('🚀 Servidor en puerto ' + PORT);
});