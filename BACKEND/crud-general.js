const express = require('express');
const router = express.Router();
const mysqlConnection = require('./conexion');

router.get('/ver-informacion/:tabla', function(req, res) {      
    const { tabla } = req.params;
    console.log(`📋 Consultando tabla: ${tabla}`);

    const query = 'CALL SELECT_INFORMACION(?)';  
    
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

// ========== ENDPOINT PARA INGRESAR DATOS (INSERT) ==========
router.post('/ingresar-datos-formulario', function(req, res) {
    const {tabla, imagen_base64, ...campos} = req.body;

    // Guardar imagen base64 directamente en la BD
    if (imagen_base64 && imagen_base64.trim() !== '' && imagen_base64.includes('base64,')) {
        campos.url_imagen = imagen_base64; // ✅ Guardar el base64 completo
    }

    const columnas = Object.keys(campos).join(',');
    const valores = Object.values(campos)
        .map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v) // Escapar comillas
        .join(', ');

    const query = 'CALL INSERT_FORMULARIOS(?, ?, ?)';    

    console.log(`📋 SQL: INSERT INTO ${tabla} (${columnas}) VALUES (...);`);
    
    mysqlConnection.query(query, [tabla, columnas, valores], function(err, result) {
        if (err) {
            console.error(`❌ Error al insertar en ${tabla}:`, err);
            res.status(500).json({ error: "Error al insertar datos" });
        } else {
            console.log(`✅ Registro en ${tabla} insertado correctamente`);
            res.status(201).json({ 
                mensaje: `✅ Registro ingresado correctamente`
            });
        }
    });
});

// ========== ENDPOINT PARA ACTUALIZAR DATOS (UPDATE) ==========
router.put('/actualizar-datos', function(req, res) {
    const { tabla, id, imagen_base64, ...campos } = req.body;

    // Si hay nueva imagen base64, actualizar
    if (imagen_base64 && imagen_base64.trim() !== '' && imagen_base64.includes('base64,')) {
        campos.url_imagen = imagen_base64; // ✅ Reemplazar con nuevo base64
    }
    
    const cambios = Object.entries(campos)
        .map(([key, value]) => typeof value === 'string' ? `${key} = '${value.replace(/'/g, "''")}'` : `${key} = ${value}`)
        .join(', ');

    console.log(`📝 Actualizando ${tabla} con ID: ${id}`);
    
    const query = 'CALL UPDATE_DATOS(?, ?, ?)';

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

// ========== ENDPOINT PARA BORRAR DATOS (DELETE) ==========
router.delete('/borrar-registro/:tabla/:id', function(req, res) {
    const { tabla, id } = req.params;
        
    console.log(`🗑️ Eliminando ${tabla} con ID: ${id}`);
    
    const query = 'CALL DELETE_DATOS(?, ?)';
    
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

module.exports = router;