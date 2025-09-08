const express = require('express');

const router = express.Router();

const mysqlConnection = require('./conexion');

//SE IMPORTA LAS TABLAS CON SUS COLUMNAS 
const Veterinaria = require('./tablas');


//FUNCION NECESARIA PARA CREAR LOS STRING QUE VAN AL INSERT
function construirValores(datos, campos) {
    let valores = '';
    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];
        const valor = datos[campo];
        valores += `'${valor}'`;
        if (i < campos.length - 1) valores += ', ';
    }
    return valores;
}


//ENDPOINT PARA INSERTAR TABLAS (DINAMICO PARA TODAS)
router.post('/:nombreTabla/ingresar', function(req, res) {
    
    const nombreTabla = req.params.nombreTabla;

    console.log(`📥 Insertando en ${nombreTabla}:`, req.body);
    
    //SE GUARDAN LOS DATOS DEL OBJETO, EJEMPLO (EMPRESA CON SUS COLUMNAS, PRODUCTOS, ETC)
    const datos = Veterinaria[nombreTabla];

    //SE CONSTRUYE EL QUERY
    const query = 'CALL INSERT_DATOS(?, ?, ?)';
    const columnas = datos.campos.join(', ');
    const valores = construirValores(req.body, datos.campos);
    
    console.log('')
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: INSERT INTO ${datos.tabla} (${columnas}) VALUES (${valores});`);
    
    //EJECUTO EL QUERY
    mysqlConnection.query(query, [datos.tabla, columnas, valores], function(err, result) {
        if (err) {
            console.error(`❌ Error al insertar en ${nombreTabla}:`, err);
            res.status(500).json({ error: "Error al insertar datos" });
        } else {
            console.log(`✅ Registro en la tabla ${nombreTabla} insertado correctamente`);
            res.status(201).json({ 
                mensaje: `✅ Registro ingresado correctamente`
            });
        }
    });
});


//ENDPOINT PARA VER TABLAS (SELECT)
router.get('/:nombreTabla/ver', function(req, res) {      
    
    const nombreTabla = req.params.nombreTabla;

    //MEJORAR VALIDACIONES
    if (!Veterinaria[nombreTabla]) {
        return res.status(400).json({ 
        error: `❌ La tabla '${nombreTabla}' no está registrada en la base de datos` });
    }

    console.log(`📋 Consultando tabla: ${nombreTabla}`);

    //SE GUARDAN LOS DATOS DEL OBJETO, EJEMPLO (EMPRESA CON SUS COLUMNAS, PRODUCTOS, ETC)
    const verTabla = Veterinaria[nombreTabla];

    const query = 'CALL SELECT_DATOS(?)';  
    console.log('')
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: SELECT * FROM ${verTabla.tabla};`);


    mysqlConnection.query(query, [verTabla.tabla], function(err, result) {          
        if (!err) {              
           console.log(`✅ ${nombreTabla} encontrados:`, result[0].length); 
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
router.delete('/:nombreTabla/:id/borrar', function(req, res) {
    
    const nombreTabla = req.params.nombreTabla;
    const id = req.params.id;
        
    console.log(`🗑️ Eliminando ${nombreTabla} con ID: ${id}`);
    console.log('');
    
    //SE GUARDAN LOS DATOS DEL OBJETO
    const borrarRegistro = Veterinaria[nombreTabla];
    
    const query = 'CALL DELETE_DATOS(?, ?)';
    
    console.log('')
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: DELETE FROM ${borrarRegistro.tabla} WHERE id = ${id};`);

    
    mysqlConnection.query(query, [borrarRegistro.tabla, id], function(err, result) {
        if (err) {
            console.error(`❌ Error al eliminar ${nombreTabla}:`, err);
            res.status(500).json({ error: "Error al eliminar datos" });
        } else {
            console.log(`✅ Registro de la tabla ${nombreTabla} eliminado correctamente`);
            res.status(200).json({
                mensaje: `✅ Registro borrado correctamente`,
                id_eliminado: id
            });
        }
    });
});


//ENDPOINT PARA ACTUALIZAR DATOS (UPDATE) TODO DINAMICO
router.put('/:nombreTabla/:id/actualizar', function(req, res) {
    
    const nombreTabla = req.params.nombreTabla;
    const id = req.params.id;

    console.log(`📝 Actualizando ${nombreTabla} con ID: ${id}`);
    console.log(`Datos nuevos:`, req.body);
    console.log('');
    
    //SE GUARDAN LOS DATOS DEL OBJETO
    const actualizacion = Veterinaria[nombreTabla];
    
    //CONSTRUIR STRING DE CAMBIOS DINAMICAMENTE
    let cambios = '';
    const campos = Object.keys(req.body);
    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];
        const valor = req.body[campo];
        cambios += `${campo}='${valor}'`;
        if (i < campos.length - 1) cambios += ', ';
    }
    
    const query = 'CALL UPDATE_DATOS(?, ?, ?)';

    console.log('');
    console.log(`📌 PROCEDURE: ${query}`);
    console.log(`📋 SQL: UPDATE ${actualizacion.tabla} SET ${cambios} WHERE id = ${id};`);

    mysqlConnection.query(query, [actualizacion.tabla, cambios, id], function(err, result) {
        if (err) {
            console.error(`❌ Error al actualizar ${nombreTabla}:`, err);
            res.status(500).json({ error: "Error al actualizar datos" });
        } else {
            console.log(`✅ Registro de la ${nombreTabla} actualizado correctamente`);
            res.status(200).json({
                mensaje: `✅ Registro actualizado correctamente`,
                id_actualizado: id
            });
        }
    });
});


module.exports = router;