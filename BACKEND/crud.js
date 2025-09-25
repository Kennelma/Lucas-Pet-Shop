require('dotenv').config(); 

const express = require('express');

const router = express.Router();

const mysqlConnection = require('./conexion');


const util = require('util');

const queryAsync = util.promisify(mysqlConnection.query.bind(mysqlConnection));

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//CONFIGURACIÓN DE CAMPOS QUE NECESITAN HASHEARSE
const CAMPOS_PARA_HASHEAR = {
    'tbl_usuarios': ['contrasena_usuario'],
};


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


//CRUD DE INGRESAR DATOS
router.post('/ingresar-datos-formulario', async function(req, res) {
    const { tabla, ...campos } = req.body;

    try {
        //HASHEAO DE CONTRASEÑAS AUTOMÁTICAMENTE
        if (CAMPOS_PARA_HASHEAR[tabla]) {
            const camposAHashear = CAMPOS_PARA_HASHEAR[tabla];
            
            for (const campo of camposAHashear) {
                if (campos[campo]) {
                    console.log(`🔐 Hasheando ${campo} para ${tabla}...`);
                    campos[campo] = await bcrypt.hash(campos[campo], 10); 
                }
            }
        }

        //SE CONSTRUYEN LAS COLUMNAS Y VALORES
        const columnas = Object.keys(campos).join(',');
        const valores = Object.values(campos)
            .map(v => typeof v === 'string' ? `'${v}'` : v)
            .join(', ');

        //MANDA A LLAMAR EL PROCEDIMIENTO
        const query = 'CALL INSERT_FORMULARIOS(?, ?, ?)';
        console.log(`📌 PROCEDURE: ${query}`);
        console.log(`📋 SQL: INSERT INTO ${tabla} (${columnas}) VALUES (${valores});`);

        mysqlConnection.query(query, [tabla, columnas, valores], function(err, result) {
            if (err) {
                console.error(`❌ Error al insertar en ${tabla}:`, err);
                res.status(500).json({ error: "Error al insertar datos" });
            } else {
                console.log(`✅ Registro en ${tabla} insertado correctamente`);
                res.status(201).json({ mensaje: `✅ Registro ingresado correctamente` });
            }
        });
        
    } catch (error) {
        console.error('❌ Error en el procesamiento:', error);
        res.status(500).json({ error: "Error al procesar los datos" });
    }
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


//ENDPOINT BORRAR DATOS (DELTE) TODO DINAMICO
router.delete('/borrar-registro/:tabla/:id', function(req, res) {
    
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
})


//ENDPOINT PARA EL LOGUEO DE USUARIOS
module.exports = router;router.post('/login', async (req, res) => {
   
    const { login, password } = req.body;
    
    try {

        //SE EEJCUTA EL SP PARA OBTENER DATOS DEL USUARIO
        const result = await queryAsync('CALL SP_LOGIN(?)', [login]);
        const user = result?.[0]?.[0];
        
        //VALIDACION PARA USUARIOS NO REGISTRADOS O INACTIVOS
        let mensaje; 
        let estado; 

        switch (true) {

            
            case !user:
                //SI EL USUARIO NO ESTÁ DENTRO DEL SISTEMA
                estado = 401;
                mensaje = '❌USUARIO INEXISTENTE EN EL SISTEMA';
                break;

                //SI EL USUARIO ESTÁ DENTRO DEL SISTEMA, PERO INACTIVO 
            case user.estado_usuario !== 'ACTIVO':
                estado = 403;
                mensaje = '⚠️USUARIO INACTIVO, CONSULTE CON EL ADMINISTRADOR'
                break;     

            default:
                 
                //SI EL USUARIO ESTÁ DENTRO DEL SISTEMA Y ACTIVO
                const validPassword = await bcrypt.compare(password, user.contrasena_usuario);
                if (!validPassword) {
                    estado = 401; 
                    mensaje = '⚠️CREDENCIALES INVÁLIDAS';
                    break;

                }else {    
                    estado = 200;
                    mensaje = '✅LOGIN EXITOSO'
                    break;
                               
                }
        }

        
        //SI EL USUARIO ESTÁ DENTRO DEL SISTEMA
        let token = null;
        if (estado === 200) {
            token = jwt.sign(
                { id_usuario: user.id_usuario_pk, rol: user.id_rol_fk },
                process.env.JWT_SECRET || 'proyectoVeterinar!a2025_LoginSecret!',
                { expiresIn: '1h' }
            );
        }

        //RESPUESTA
        return res.status(estado).json({
            success: estado === 200,
            message: mensaje,
            usuario: estado === 200 ? {
                id: user.id_usuario_pk,
                nombre: user.usuario,
                email: user.email_usuario,
                rol: user.id_rol_fk === 1 ? 'ADMINISTRADOR' : 'VENDEDOR',
                empresa: user.id_empresa_fk,
                estado: user.estado_usuario
            } : null,
            token
        });

        
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: "Error al procesar login" });
    }
});