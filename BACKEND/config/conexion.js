//Constante para el maquete MySQL
require('dotenv').config();

const mysql = require('mysql2/promise');

//console.log("Host de DB cargado:", process.env.DB_HOST);
process.env.TZ = 'America/Tegucigalpa';

//CONFIGURACIÓN DE LA CONEXIÓN AL SERVIDOR CON LA BASE DE DATOS
const mysqlConnection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    queueLimit: 0,
    acquireTimeout: 10000,
    connectionLimit: 5,
    timezone: '-06:00', //Zona horaria de Tegucigalpa
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false
});

//MENSAJE DE CONFIRMACIÓN DE CONEXIÓN Y MANEJO DE ERRORES
(async () => {
    try {
        await mysqlConnection.getConnection();
        console.log('Conectado a MySQL correctamente');
        //MySQL connected
    } catch (err) {
        console.log('Error conectando a MySQL:', err.message);
        process.exit(1);
    }
})();


//SE EXPORTA LA CONEXIÓN A LOS DIFERENTES ARCHIVOS
module.exports = mysqlConnection;
