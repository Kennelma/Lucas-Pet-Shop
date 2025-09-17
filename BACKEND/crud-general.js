const express = require('express');

const router = express.Router();

const mysqlConnection = require('./conexion');

//CRUD DE INGRESAR DATOS
router.post('/ingresar-datos-formulario', function(req, res) {

    const {tabla,...campos} = req.body;

    //SE CONSURUYEN LAS COLUMNAS Y VALORES
    const columnas = Object.keys(campos).join(',');
    const valores = Object.values(campos)
        .map(v => typeof v === 'string' ? `'${v}'` : v)
        .join(', ');

    //MANDA A LLMAR EL PROCEDIMIENTO     
    const query = 'CALL INSERT_FORMULARIOS(?, ?, ?)';    

    console.log('')
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: INSERT INTO ${tabla} (${columnas}) VALUES (${valores});`);
    
    mysqlConnection.query(query, [tabla, columnas, valores], function(err, result) {

        if (err) {
            console.error(`❌ Error al insertar en ${tabla}:`, err);
            res.status(500).json({ error: "Error al insertar datos" });
        } else {
            console.log(`✅ Registro en  ${tabla} insertado correctamente`);
            res.status(201).json({ 
                mensaje: `✅ Registro ingresado correctamente`
            });
        }
    });
});


//ENDPOINT PARA VER TABLAS (SELECT)
router.get('/ver-informacion/:tabla', function(req, res) {      
    
    const { tabla } =  req.params;

    console.log(`📋 Consultando tabla: ${tabla}`);

    const query = 'CALL SELECT_INFORMACION(?)';  
    console.log('')
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: SELECT * FROM ${tabla};`);


    mysqlConnection.query(query, [tabla], function(err, result) {          
        if (!err) {              
           console.log(`✅ ${tabla} encontrados:`, result[0].length); 
            res.status(200).json({                 
                mensaje: "✅ Consulta exitosa",                 
                total_registros: result[0].length,                 
                datos: result[0]             
            });         
        } else {             
            return res.status(500).send("Error en la consulta: ", err);         
        }         
    }); 
});   


//ENDPOINT BORRAR DATOS (DELTE) TODO DINAMICO
router.delete('/borrar-registro/:nombreTabla/:id', function(req, res) {
    
    const { tabla, id } =  req.params;
        
    console.log(`🗑️ Eliminando ${tabla} con ID: ${id}`);
    console.log('');

    
    const query = 'CALL DELETE_DATOS(?, ?)';
    
    console.log('')
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: DELETE FROM ${tabla} WHERE id = ${id};`);

    
    mysqlConnection.query(query, [tabla, id], function(err, result) {
        if (err) {
            console.error(`❌ Error al eliminar ${tabla}:`, err);
            res.status(500).json({ error: "Error al eliminar datos" });
        } else {
            console.log(`✅ Registro de la tabla ${tabla} eliminado correctamente`);
            res.status(200).json({
                mensaje: `✅ Registro borrado correctamente`,
                id_eliminado: id
            });
        }
    });
});


//ENDPOINT PARA ACTUALIZAR DATOS (UPDATE) TODO DINAMICO
router.put('/actualizar-datos', function(req, res) {
    
    const { tabla, id, ...campos } = req.body;
    
    const cambios = Object.entries(campos)
        .map(([key, value]) => typeof value === 'string' ? `${key} = '${value}'` : `${key} = ${value}`)
        .join(', ');

    console.log(`📝 Actualizando ${tabla} con ID: ${id}`);
    console.log(`Datos nuevos:`, req.body);
    console.log('');
    
    const query = 'CALL UPDATE_DATOS(?, ?, ?)';

    console.log('');
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: UPDATE ${tabla} SET ${cambios} WHERE id = ${id};`);

    mysqlConnection.query(query, [tabla, cambios, id], function(err, result) {
        if (err) {
            console.error(`❌ Error al actualizar ${tabla}:`, err);
            res.status(500).json({ error: "Error al actualizar datos" });
        } else {
            console.log(`✅ Registro de la ${tabla} actualizado correctamente`);
            res.status(200).json({
                mensaje: `✅ Registro actualizado correctamente`,
                id_actualizado: id
            });
        }
    });
});


module.exports = router;