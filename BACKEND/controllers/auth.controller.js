require('dotenv').config()

const mysqlConnection = require('../config/conexion');
const { getTimezoneOffset } = require('../config/utils/timezone');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const { enviarCodigo2FA } = require('../config/email');
const { generarCodigoOTP } = require('../config/otp-generator');

//ENDPOINT PARA EL LOGUEO DE USUARIOS
exports.login = async (req, res) => {

    const conn = await mysqlConnection.getConnection();
    await conn.query(`SET time_zone = '${getTimezoneOffset()}'`);

    const LIMITE_INTENTOS = parseInt(process.env.LIMITE_INTENTOS_LOGIN);
    const TIEMPO_BLOQUEO = parseInt(process.env.TIEMPO_BLOQUEO_MINUTOS);

    const { login, password } = req.body;

    try {

        //SE EJECUTA EL QUERY PARA OBTENER DATOS DEL USUARIO
        const result = await conn.query(
            `SELECT
                u.id_usuario_pk,
                u.usuario,
                u.email_usuario,
                u.contrasena_usuario,
                u.intentos_fallidos,
                u.bloqueado_hasta,
                u.id_sucursal_fk,
                s.nombre_sucursal,
                e.nombre_estado,
                r.id_rol_pk,
                r.tipo_rol
            FROM tbl_usuarios u
            JOIN cat_estados e ON u.cat_estado_fk = e.id_estado_pk
            JOIN tbl_sucursales s ON u.id_sucursal_fk = s.id_sucursal_pk
            LEFT JOIN tbl_usuario_roles ur ON ur.id_usuario_fk = u.id_usuario_pk
            LEFT JOIN cat_roles r ON r.id_rol_pk = ur.id_rol_fk
            WHERE u.email_usuario = ? OR u.usuario = ?`,
            [login, login]
        );

        const user = result[0]?.[0];

        // SI EL USUARIO NO EXISTE
        if (!user) {
            return res.status(401).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'Usuario no encontrado',
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
                    code: 'ACCOUNT_BLOCKED',
                    message: 'Cuenta bloqueada temporalmente',
                    bloqueadoHasta: bloqueadoHasta.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    usuario: null,
                    token: null
                });
            } else {

                const [activo] = await conn.query(`
                SELECT id_estado_pk
                FROM cat_estados
                WHERE dominio = 'USUARIO' AND nombre_estado = 'ACTIVO'
                LIMIT 1
                `);

                //PASADO LOS MINUTOS, SE DESBLOQUEA EL USUARIO
                await conn.query(
                `UPDATE tbl_usuarios
                SET intentos_fallidos = 0,
                bloqueado_hasta = NULL,
                cat_estado_fk = ?
                WHERE id_usuario_pk = ?`,
                [activo[0].id_estado_pk, user.id_usuario_pk]
                );

                user.intentos_fallidos = 0;
                user.bloqueado_hasta = null;
            }
        }


        //VALIDACION PARA USUARIOS NO REGISTRADOS O INACTIVOS
        let mensaje;
        let estado;
        let codigo;
        let intentosRestantes;
        let tiempoBloqueo;

        switch (true) {
            case user.nombre_estado === 'BLOQUEADO':
                estado = 403;
                mensaje = 'Cuenta bloqueada';
                codigo = 'ACCOUNT_BLOCKED';
                break;

            case user.nombre_estado === 'INACTIVO':
                estado = 403;
                mensaje = 'Usuario inactivo';
                codigo = 'USER_INACTIVE';
                break;

            default:

                //SI EL USUARIO ESTÁ DENTRO DEL SISTEMA Y ACTIVO
                const validarContrasena = await argon2.verify(user.contrasena_usuario, password);

                //SI LA CONTRASEÑA ES INCORRECTA
                if (!validarContrasena) {

                    const nuevosIntentos = user.intentos_fallidos + 1;

                    //SI LOS INTENTOS PASAN DEL LIMITE
                    if (nuevosIntentos >= LIMITE_INTENTOS) {

                        //SE BLOQUEA LA CUENTA
                        const [bloqueo] = await conn.query(`
                            SELECT id_estado_pk
                            FROM cat_estados
                            WHERE dominio = 'USUARIO' AND nombre_estado = 'BLOQUEADO'
                            LIMIT 1
                        `);

                        await conn.query(
                            `UPDATE tbl_usuarios
                            SET intentos_fallidos = ?,
                                cat_estado_fk = ?,
                                bloqueado_hasta = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                            WHERE id_usuario_pk = ?`,
                            [nuevosIntentos, bloqueo[0].id_estado_pk, TIEMPO_BLOQUEO, user.id_usuario_pk]
                        );

                        estado = 403;
                        mensaje = 'Cuenta bloqueada por intentos';
                        codigo = 'ACCOUNT_BLOCKED_ATTEMPTS';
                        tiempoBloqueo = TIEMPO_BLOQUEO;
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
                        mensaje = 'Credenciales incorrectas';
                        codigo = 'INVALID_CREDENTIALS';
                        intentosRestantes = LIMITE_INTENTOS - nuevosIntentos;
                        break;
                    }

                } else {

                    //SE RESETEAN LOS INTENTOS Y LO DEJA LOGUEAR
                    const [activo] = await conn.query(`
                        SELECT id_estado_pk
                        FROM cat_estados
                        WHERE dominio = 'USUARIO' AND nombre_estado = 'ACTIVO'
                        LIMIT 1
                    `);

                    await conn.query(
                        `UPDATE tbl_usuarios
                        SET intentos_fallidos = 0,
                            bloqueado_hasta = NULL,
                            cat_estado_fk = ?
                        WHERE id_usuario_pk = ?`,
                        [activo[0].id_estado_pk, user.id_usuario_pk]
                    );

                    estado = 200;
                    mensaje = 'Login exitoso';
                    codigo = 'LOGIN_SUCCESS';
                    break;
                }
        }

        //SI EL USUARIO ESTÁ DENTRO DEL SISTEMA
        let token = null;

        if (estado === 200) {
            token = jwt.sign(
                {
                    id_usuario_pk: user.id_usuario_pk,
                    usuario: user.usuario,
                    id_sucursal_fk: user.id_sucursal_fk,
                    id_rol_pk: user.id_rol_pk,
                    rol: user.tipo_rol
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
        }

        //RESPUESTA
        return res.status(estado).json({
            success: estado === 200,
            code: codigo,
            message: mensaje,
            intentosRestantes: intentosRestantes,
            tiempoBloqueo: tiempoBloqueo,
            usuario: estado === 200 ? {
                id: user.id_usuario_pk,
                nombre: user.usuario,
                email: user.email_usuario,
                sucursal: user.nombre_sucursal,
                id_sucursal: user.id_sucursal_fk,
                estado: user.nombre_estado,
                rol: user.tipo_rol,
                id_rol: user.id_rol_pk
            } : null,
            token
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: "Error al procesar login" });

    } finally {
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
            return res.status(200).json({ message: 'ERROR' });
        }

        //SE GENERA EL CÓDIGO OTP Y SE ENVÍA AL EMAIL
        const codigoOTP = generarCodigoOTP().toString();
        const expirationMinutes = 5;

        console.log(`Código OTP generado para ${email}:`, codigoOTP);

        //GUARDO EL CÓDIGO EN LA BASE DE DATOS
        await conn.query(
            `INSERT INTO tbl_codigos_2fa (
                id_usuario_fk,
                codigo,
                fecha_expiracion)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
            [user.id_usuario_pk, codigoOTP, expirationMinutes]
        );

        //SE ENVIA AL CORREO
        await enviarCodigo2FA(user.email_usuario, codigoOTP);

        //RESPUESTA
        res.status(200).json({
            success: true,
            message: 'Se ha enviado un código de verificación para restablecer la contraseña.',
            idUsuario: user.id_usuario_pk
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
             ORDER BY fecha_creacion DESC LIMIT 1`,
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

        //SE ACTUALIZA EN LA BASE DE DATOS
        await conn.query(
            `UPDATE tbl_usuarios SET contrasena_usuario = ? WHERE id_usuario_pk = ?`,
            [hashedPassword, idUsuario]
        );

        //SE MARCA EL CÓDIGO COMO USADO
        await conn.query(
            `UPDATE tbl_codigos_2fa SET usado = 1 WHERE id_usuario_fk = ? AND codigo = ?`,
            [idUsuario, codigoOTP]
        );

        res.status(200).json({ success: true, message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error en restablecer con código:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        conn.release();
    }
};