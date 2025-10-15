
const mysqlConnection = require('../config/conexion');


const argon2 = require('argon2'); 
const jwt = require('jsonwebtoken');

const { enviarCodigo2FA } = require('../config/email');
const { generarCodigoOTP } = require('../config/otp-generator'); 

//ENDPOINT PARA EL LOGUEO DE USUARIOS
exports.login = async (req, res) => {

    const start = Date.now(); 

    const conn = await mysqlConnection.getConnection();
    
    const LIMITE_INTENTOS = parseInt(process.env.LIMITE_INTENTOS_LOGIN) || 5; //SE BLOQUEA EL USUARIO SI LO EXCEDE
    const TIEMPO_BLOQUEO = parseInt(process.env.TIEMPO_BLOQUEO_MINUTOS) || 10; //EL TIEMPO QUE DEBE ESPERAR PARA VOLVER INTENTAR INICIAR SESION

    const { login, password } = req.body;
    
    try {

        //SE EJECUTA EL SP PARA OBTENER DATOS DEL USUARIO
        const result = await conn.query(
            `SELECT 
                u.id_usuario_pk,
                u.usuario,
                u.email_usuario, 
                u.contrasena_usuario, 
                u.intentos_fallidos, 
                u.bloqueado_hasta,
                e.nombre_estado
            FROM tbl_usuarios u
            INNER JOIN cat_estados e ON u.cat_estado_fk = e.id_estado_pk
            WHERE u.email_usuario = ? OR u.usuario = ?`, // ⬅️ Permite login por email o usuario
            [login, login]
        );

        const user = result[0]?.[0];

        console.log('Resultado completo de búsqueda:', result);
        console.log('Primer usuario encontrado:', user);

        // PRIMERO: SI EL USUARIO NO EXISTE
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '❌USUARIO INEXISTENTE EN EL SISTEMA',
                usuario: null,
                token: null
            });
        }

        //VALIDO QUE ESTE USUARIO NO ESTÉ BLOQUEADO
        if (user.bloqueado_hasta) {
            const ahora = new Date();
            const bloqueadoHasta = new Date(user.bloqueado_hasta);

            if (ahora < bloqueadoHasta) {
                return res.status(403).json({
                    success: false,
                    message: `🔒 CUENTA BLOQUEADA HASTA ${bloqueadoHasta.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}`,
                    usuario: null,
                    token: null
                });
            } else {
                //PASADO LOS MINUTOS, SE DESBLOQUEA EL USUARIO
                    await conn.query(
                    `UPDATE tbl_usuarios 
                    SET intentos_fallidos = 0, bloqueado_hasta = NULL 
                    WHERE id_usuario_pk = ?`,
                    [user.id_usuario_pk]
                );
                user.intentos_fallidos = 0;
                user.bloqueado_hasta = null;
                    

            }
        }
        

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
            case user.nombre_estado !== 'ACTIVO':
                estado = 403;
                mensaje = '⚠️USUARIO INACTIVO, CONSULTE CON EL ADMINISTRADOR'
                break;     

            default:
                 
                //SI EL USUARIO ESTÁ DENTRO DEL SISTEMA Y ACTIVO
                const validarContrasena = await argon2.verify(user.contrasena_usuario, password);
                console.log('Validación de contraseña:', validarContrasena);
                
                //SI LA CONTRASEÑA ES INCORRECTA
                if (!validarContrasena) {
                    
                    
                    const nuevosIntentos = user.intentos_fallidos + 1;

                    //SI LOS INTENTOS PASAN DEL LIMITE (5)
                    if (nuevosIntentos >= LIMITE_INTENTOS) {

                        //SE BLOQUEA LA CUENTA
                        await conn.query(
                            `UPDATE tbl_usuarios 
                            SET intentos_fallidos = ?, 
                                bloqueado_hasta = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                            WHERE id_usuario_pk = ?`,
                            [nuevosIntentos, TIEMPO_BLOQUEO, user.id_usuario_pk]
                        );

                        estado = 403;
                        mensaje = `🔒 CUENTA BLOQUEADA POR ${TIEMPO_BLOQUEO} MINUTOS (demasiados intentos fallidos)`;
                        break;
                         
                    } else {

                        //SOLO SE INCREMENTAN, PERO NO SE BLOQUEA
                        await conn.query(
                            `UPDATE tbl_usuarios 
                            SET intentos_fallidos = ? 
                            WHERE id_usuario_pk = ?`,
                            [nuevosIntentos, user.id_usuario_pk]
                        );
                        
                        estado = 401;
                        mensaje = `⚠️ CREDENCIALES INVÁLIDAS (Intento ${nuevosIntentos} de ${LIMITE_INTENTOS})`;
                        break;

                    }
                    

                }else {   
                    
                    //SE RESETEAN LOS INTENTOS Y LO DEJA LOGUEAR
                    await conn.query(
                        `UPDATE tbl_usuarios 
                        SET intentos_fallidos = 0, bloqueado_hasta = NULL 
                        WHERE id_usuario_pk = ?`,
                        [user.id_usuario_pk]
                        
                    );

                    estado = 200;
                    mensaje = '✅LOGIN EXITOSO'
                    break;
                               
                }
        }

        //SI EL USUARIO ESTÁ DENTRO DEL SISTEMA
        let token = null;
        if (estado === 200) {
            console.log('Antes de JWT:', Date.now() - start, 'ms');
            token = jwt.sign(
                { 
                    id_usuario_pk: user.id_usuario_pk }, 
                    process.env.JWT_SECRET, 
                    
                { expiresIn: '1h' }
                //{ expiresIn: '1m' }
            );
            console.log('Después de JWT:', Date.now() - start, 'ms');
        }

        const responseTime = Date.now() - start;
        console.log('Tiempo total login (CORREGIDO):', responseTime, 'ms');
        

        //RESPUESTA
        return res.status(estado).json({
            success: estado === 200,
            message: mensaje,
            usuario: estado === 200 ? {
                id: user.id_usuario_pk,
                nombre: user.usuario,
                email: user.email_usuario,
                estado: user.nombre_estado
            } : null,
            token
        });

        
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: "Error al procesar login" });

    } finally {

        //SE ASEGURA DE LIBERAR LA CONEXIÓN
        if (conn) { 
            conn.release(); 
        }
    }
};



//ENDPOINT PARA SOLICITAR CÓDIGO DE RESETEO DE CONTRASEÑA
exports.solicitarCodigoReset = async (req, res) => {

    const { email } = req.body; 

    const conn = await mysqlConnection.getConnection();

    try {

        //VERIFICAR SI EL EMAIL PERTENECE A UN USUARIO
        const [result] = await conn.query(
            `SELECT id_usuario_pk, email_usuario 
            FROM tbl_usuarios WHERE email_usuario = ?`, 
            [email]
        );


        const user = result[0];

        if (!user) {
            // Siempre dar una respuesta genérica por seguridad
            return res.status(200).json({ message: 'ERROR' });
        }

        //SE GENERA EL CÓDIGO OTP Y SE ENVÍA AL EMAIL
        const codigoOTP = generarCodigoOTP().toString(); 
        const expirationMinutes = 5; //VALIDO POR 5 MINUTOS

        console.log(`Código OTP generado para ${email}:`, codigoOTP);

        //GUARDO EL CÓDIGO EN LA BASE DE DATOS, EN LA TABLA DE 2FA
        //LA COLUMNA fecha_expiracion SE LLENA CON LA FECHA ACTUAL + 5 MINUTOS
        await conn.query(
            `INSERT INTO tbl_codigos_2fa (id_usuario_fk, codigo, fecha_expiracion)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
            [user.id_usuario_pk, codigoOTP, expirationMinutes]
        );

        //SE ENVIA AL CORREO 
        //SE USA LA FUNCION ASINCRONICA, POR LO QUE SE USA EL AWAIT
        await enviarCodigo2FA(user.email_usuario, codigoOTP); 
        
        //RESPUESTA
        res.status(200).json({ 
            success: true,
            message: 'Se ha enviado un código de verificación para restablecer la contraseña.',
            idUsuario: user.id_usuario_pk //SE ENVIA EL ID DEL USUARIO PARA EL SIGUIENTE PASO
        });

    } catch (error) {
        console.error('Error en solicitar reset con OTP:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        conn.release();
    }
};




//ENDPOINT PARA RESETEAR CONTRASEÑA CON CÓDIGO OTP
exports.resetearConCodigo = async (req, res) => {

    const { idUsuario, codigoOTP, nuevaContrasena } = req.body;
    const conn = await mysqlConnection.getConnection();

    try {

        //SE BUSCA EL CÓDIGO EN LA BASE DE DATOS
        const [codeResult] = await conn.query(
            `SELECT codigo, fecha_expiracion, usado 
             FROM tbl_codigos_2fa 
             WHERE id_usuario_fk = ? AND usado = 0 
             ORDER BY fecha_creacion DESC LIMIT 1`, //BUSCO EL MÁS RECIENTE
            [idUsuario]
        );

        const codigoGuardado = codeResult[0];

        if (!codigoGuardado || codigoGuardado.codigo !== codigoOTP) {
            return res.status(400).json({ success: false, message: 'Código de verificación incorrecto o no encontrado.' });
        }

        //VALIDAR SI EL CÓDIGO ESTÁ EXPIRADO
        const ahora = new Date();
        const expiracion = new Date(codigoGuardado.fecha_expiracion);

        if (ahora > expiracion) {
            return res.status(400).json({ success: false, message: 'El código ha expirado. Por favor, solicita uno nuevo.' });
        }

        //SE HACE EL HASH DE LA NUEVA CONTRASEÑA
        const hashedPassword = await argon2.hash(nuevaContrasena);

        //SE HASEA LA NUEVA CONTRASEÑA Y SE ACTUALIZA EN LA BASE DE DATOS
        await conn.query(
            `UPDATE tbl_usuarios SET contrasena_usuario = ? WHERE id_usuario_pk = ?`,
            [hashedPassword, idUsuario]
        );
        
        //SE MARCA EL CÓDIGO COMO USADO
        await conn.query(
            `UPDATE tbl_codigos_2fa SET usado = 1 WHERE id_usuario_fk = ? AND codigo = ?`,
            [idUsuario, codigoOTP]
        );

        res.status(200).json({ success: true, message: '✅ Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error en restablecer con código:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        conn.release();
    }
};