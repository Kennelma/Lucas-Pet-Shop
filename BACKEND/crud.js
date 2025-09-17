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







// POST /api/productos-alimentos
router.post('/productos-alimentos', (req, res) => {
    const {
        nombre_producto,
        precio_unitario_producto,
        cantidad_en_stock,
        alimento_destinado,
        peso_alimento
    } = req.body;

    // Validación básica
    if (!nombre_producto || !precio_unitario_producto || !cantidad_en_stock || !alimento_destinado || !peso_alimento) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Llamada al procedimiento almacenado
    const query = 'CALL INSERT_PRODUCTO_ALIMENTO(?, ?, ?, ?, ?)';
    const params = [nombre_producto, precio_unitario_producto, cantidad_en_stock, alimento_destinado, peso_alimento];

    mysqlConnection.query(query, params, (err, result) => {
        if (err) {
            console.error('❌ Error al insertar producto + alimento:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        res.status(201).json({
            mensaje: '✅ Producto y alimento insertados correctamente',
            resultado: result
        });
    });
});



// ENDPOINT: GET DE TODOS LOS ALIMENTOS CON PRODUCTOS
router.get('/alimentos/ver-todos', (req, res) => {

    const query = `
        SELECT 
            p.nombre_producto,
            p.precio_unitario_producto,
            p.cantidad_en_stock,
            p.categoria,
            a.alimento_destinado,
            a.peso_alimento
        FROM tbl_alimentos a
        INNER JOIN tbl_productos p
            ON a.id_producto_fk = p.id_producto_pk
    `;

    mysqlConnection.query(query, (err, result) => {
        if (err) {
            console.error("❌ Error en la consulta: ", err);
            return res.status(500).json({ error: "Error en la consulta" });
        }

        res.status(200).json({
            mensaje: `✅ Consulta exitosa de todos los productos-alimentos`,
            total_registros: result.length,
            datos: result
        });
    });
});



// ENDPOINT: GET DE TODOS LOS MEDICAMENTOS CON PRODUCTOS
router.get('/medicamentos/ver-todos', (req, res) => {

    const query = `
        SELECT 
            p.nombre_producto,
            p.precio_unitario_producto,
            p.cantidad_en_stock,
            p.categoria,
            m.presentacion_medica,
            m.tipo_medicamento
        FROM tbl_medicamentos m
        INNER JOIN tbl_productos p
            ON m.id_producto_fk = p.id_producto_pk
    `;

    mysqlConnection.query(query, (err, result) => {
        if (err) {
            console.error("❌ Error en la consulta: ", err);
            return res.status(500).json({ error: "Error en la consulta" });
        }

        res.status(200).json({
            mensaje: `✅ Consulta exitosa de todos los medicamentos`,
            total_registros: result.length,
            datos: result
        });
    });
});


// ENDPOINT: POST PARA AGREGAR MEDICAMENTO USANDO PROCEDIMIENTO ALMACENADO
router.post('/medicamentos/agregar-sp', (req, res) => {
    const {
        // Datos del producto
        nombre_producto, precio_unitario_producto, cantidad_en_stock, categoria, id_categoria_item_fk,
        
        // Datos del medicamento
        presentacion_medica, // 'bote', 'jeringa', 'pastilla'
        tipo_medicamento,    // 'antibiotico', 'desparasitantes', 'vacunas', 'etc'
        
        // Datos del lote
        codigo_lote, fecha_ingreso, fecha_vencimiento, cantidad_entrada, cantidad_disponible
    } = req.body;

    if (!nombre_producto || !precio_unitario_producto || !presentacion_medica || !tipo_medicamento) {
        return res.status(400).json({
            error: "❌ Faltan campos obligatorios",
            campos_requeridos: [
                "nombre_producto", "precio_unitario_producto", "presentacion_medica", "tipo_medicamento"
            ]
        });
    }

    const query = `
        CALL INSERT_MEDICAMENTO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @id_producto, @id_medicamento, @id_lote, @resultado);
        SELECT @id_producto as id_producto, @id_medicamento as id_medicamento, @id_lote as id_lote, @resultado as resultado;
    `;

    const values = [nombre_producto, precio_unitario_producto, cantidad_en_stock || 0, categoria, id_categoria_item_fk, presentacion_medica, 
        tipo_medicamento, codigo_lote || null, fecha_ingreso || null, fecha_vencimiento || null, cantidad_entrada || null,cantidad_disponible || null
    ];

    mysqlConnection.query(query, values, (err, results) => {
        if (err) {
            console.error("❌ Error en el procedimiento almacenado: ", err);
            return res.status(500).json({ error: "Error al agregar medicamento" });
        }

        // Los resultados del procedimiento están en results[1] (segunda consulta)
        const resultado = results[1][0];
        
        if (resultado.resultado.startsWith('ERROR')) {
            return res.status(400).json({
                error: "❌ Error en la validación",
                detalle: resultado.resultado
            });
        }

        res.status(201).json({
            mensaje: "✅ Medicamento agregado exitosamente",
            datos: {
                id_producto: resultado.id_producto, id_medicamento: resultado.id_medicamento, id_lote: resultado.id_lote > 0 ? resultado.id_lote : null,
                nombre_producto, presentacion_medica, tipo_medicamento, codigo_lote: req.body.codigo_lote || null
            },
            detalle: resultado.resultado
        });
    });
});






router.put('/medicamentos/actualizar/:id', (req, res) => {
    const idMedicamento = parseInt(req.params.id);
    
    if (!idMedicamento || isNaN(idMedicamento)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    const verificarQuery = `
        SELECT id_producto_fk FROM tbl_medicamentos WHERE id_medicamento_pk = ?
    `;

    mysqlConnection.query(verificarQuery, [idMedicamento], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ error: "Medicamento no encontrado" });
        }

        const idProducto = result[0].id_producto_fk;
        const updates = req.body;
        let completadas = 0;
        const totalActualizaciones = 3; // Ahora son 3: producto, medicamento, lotes

        // 1. Actualizar producto
        const productoCampos = ['nombre_producto', 'precio_unitario_producto', 'cantidad_en_stock', 'categoria'];
        const datosProducto = {};
        productoCampos.forEach(campo => {
            if (updates[campo] !== undefined) datosProducto[campo] = updates[campo];
        });

        if (Object.keys(datosProducto).length > 0) {
            const sets = Object.keys(datosProducto).map(k => `${k} = ?`).join(', ');
            const valores = Object.values(datosProducto);
            
            mysqlConnection.query(`UPDATE tbl_productos SET ${sets} WHERE id_producto_pk = ?`, 
                [...valores, idProducto], (err) => {
                    if (err) console.error('Error producto:', err);
                    completadas++;
                    verificarFin();
                });
        } else {
            completadas++;
            verificarFin();
        }

        // 2. Actualizar medicamento
        const medicamentoCampos = ['presentacion_medica', 'tipo_medicamento'];
        const datosMedicamento = {};
        medicamentoCampos.forEach(campo => {
            if (updates[campo] !== undefined) datosMedicamento[campo] = updates[campo];
        });

        if (Object.keys(datosMedicamento).length > 0) {
            const sets = Object.keys(datosMedicamento).map(k => `${k} = ?`).join(', ');
            const valores = Object.values(datosMedicamento);
            
            mysqlConnection.query(`UPDATE tbl_medicamentos SET ${sets} WHERE id_medicamento_pk = ?`, 
                [...valores, idMedicamento], (err) => {
                    if (err) console.error('Error medicamento:', err);
                    completadas++;
                    verificarFin();
                });
        } else {
            completadas++;
            verificarFin();
        }

        // 3. Actualizar lotes (NUEVO)
        const lotesCampos = ['codigo_lote', 'fecha_ingreso', 'fecha_vencimiento', 'cantidad_entrada', 'cantidad_disponible'];
        const datosLotes = {};
        lotesCampos.forEach(campo => {
            if (updates[campo] !== undefined) datosLotes[campo] = updates[campo];
        });

        if (Object.keys(datosLotes).length > 0) {
            const sets = Object.keys(datosLotes).map(k => `${k} = ?`).join(', ');
            const valores = Object.values(datosLotes);
            
            // Actualizar todos los lotes de este medicamento
            mysqlConnection.query(`UPDATE tbl_lotes_medicamentos SET ${sets} WHERE id_medicamento_fk = ?`, 
                [...valores, idMedicamento], (err) => {
                    if (err) console.error('Error lotes:', err);
                    completadas++;
                    verificarFin();
                });
        } else {
            completadas++;
            verificarFin();
        }

        function verificarFin() {
            if (completadas === totalActualizaciones) {
                res.status(200).json({
                    mensaje: "Medicamento actualizado exitosamente (producto + medicamento + lotes)",
                    id_actualizado: idMedicamento
                });
            }
        }
    });
});

module.exports = router;