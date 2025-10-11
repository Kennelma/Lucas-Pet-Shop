
require('dotenv').config(); 

const mysqlConnection = require('../config/conexion');
const util = require('util');
const queryAsync = util.promisify(mysqlConnection.query.bind(mysqlConnection));

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//ENDPOINT PARA EL LOGUEO DE USUARIOS
exports.login = async (req, res) => {
   
    const { login, password } = req.body;
    
    try {

        //SE EEJCUTA EL SP PARA OBTENER DATOS DEL USUARIO
        const result = await queryAsync(
            `SELECT 
                id_usuario_pk,
                usuario,
                email_usuario, 
                contrasena_usuario,
                estado_usuario, 
                id_rol_fk
            FROM tbl_usuarios
                WHERE LOWER(TRIM(email_usuario)) = LOWER(TRIM(?))
                OR LOWER(TRIM(usuario)) = LOWER(TRIM(?))
                LIMIT 1`,
            [login]);


        const user = result?.[0];
        
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
                estado: user.estado_usuario
            } : null,
            token
        });

        
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: "Error al procesar login" });
    }
};
    