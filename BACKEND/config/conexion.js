//Constante para el maquete MySQL
const path = require('path');

require('dotenv').config({
    path: path.resolve(process.cwd(), '..', '.env')
});

const mysql = require('mysql2/promise');
console.log("Host de DB cargado:", process.env.DB_HOST);

//CONFIGURACIÓN DE LA CONEXIÓN AL SERVIDOR CON LA BASE DE DATOS
const mysqlConnection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    //timezone: '-06:00' ,
    ssl: {
        rejectUnauthorized: false
    }
});

//MENSAJE DE CONFIRMACIÓN DE CONEXIÓN Y MANEJO DE ERRORES
(async () => {
    try {
        await mysqlConnection.getConnection();
        console.log('Conexión a MySQL OK');
    } catch (err) {
        console.log('Error conectando a MySQL:', err.message);
        process.exit(1);
    }
})();


//SE EXPORTA LA CONEXIÓN A LOS DIFERENTES ARCHIVOS
module.exports = mysqlConnection;
