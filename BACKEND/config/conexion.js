//Constante para el maquete MySQL
const mysql = require('mysql2/promise');
require('dotenv').config()

//CONFIGURACIÓN DE LA CONEXIÓN AL SERVIDOR CON LA BASE DE DATOS
const mysqlConnection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
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
