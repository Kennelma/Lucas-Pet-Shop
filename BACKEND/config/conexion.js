//Constante para el maquete MySQL
const mysql = require('mysql2/promise');

//CONFIGURACIÓN DE LA CONEXIÓN AL SERVIDOR CON LA BASE DE DATOS
const mysqlConnection = mysql.createPool({
    host: 'mysql-implementacion.mysql.database.azure.com',
    user: 'administrador',
    password: 'Lucaspetshop.',
    port: 3306,
    database: 'db_lucas_pet_shop',
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
