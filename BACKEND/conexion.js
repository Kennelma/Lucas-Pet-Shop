//Constante para el maquete MySQL
const mysql = require('mysql');

//CONFIGURACIÓN DE LA CONEXIÓN AL SERVIDOR CON LA BASE DE DATOS
var mysqlConnection = mysql.createConnection({
    host: 'mysql-implementacion.mysql.database.azure.com',
    user: 'administrador',
    port: 3306,
    password: 'Lucaspetshop.',
    database: 'lucas_pet_shop',
    multipleStatements: true,
    ssl: true
});

//MENSAJE DE CONFIRMACIÓN DE CONEXIÓN Y MANEJO DE ERRORES
mysqlConnection.connect((err)=>{
    if (!err){
        console.log('✅ Conexion Exitosa');
    } else { 
        console.log('❌ Error al conectar la base de datos', err.message);
    }
});

//SE EXPORTA LA CONEXIÓN A LOS DIFERENTES ARCHIVOS
module.exports = mysqlConnection;
