require('dotenv').config()

const mysqlConnection = require('../config/conexion');
const moment = require('moment-timezone');

//============VER CATALOGO DE CAI====================
exports.verCatalogoCAI = async (req, res) => {

    const conn = await mysqlConnection.getConnection();
    try {
        const [filas] = await conn.query(`
            SELECT
                id_cai_pk,
                codigo_cai,
                prefijo,
                rango_inicio,
                rango_fin,
                numero_actual,
                fecha_limite,
                punto_emision,
                tipo_documento,
                activo,
                (numero_actual - rango_inicio) AS facturas_usadas,
                (rango_fin - rango_inicio + 1) AS total_facturas,
                (rango_fin - numero_actual + 1) AS facturas_disponibles
            FROM tbl_cai
            ORDER BY activo DESC, id_cai_pk DESC
        `);

        res.status(200).json({
            Consulta: true,
            Catalogo: filas || []
        });

    } catch (error) {
        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};

//==============CREAR UN NUEVO CAI==================
exports.crearCAI = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        await conn.beginTransaction();

        const {
            codigo_cai,
            cantidad_facturas,
            fecha_limite
        } = req.body;

        // VALORES POR DEFECTO
        const establecimiento = '000';
        const punto_emision = '002';
        const tipo_documento = '01';
        const prefijo = `${establecimiento}-${punto_emision}-${tipo_documento}`;
        const rango_inicio = 1;
        const rango_fin = parseInt(cantidad_facturas);

        //VALIDACIONES
        if (!codigo_cai || !cantidad_facturas || !fecha_limite) {
            throw new Error('TODOS LOS CAMPOS SON OBLIGATORIOS');
        }

        if (parseInt(cantidad_facturas) <= 0) {
            throw new Error('LA CANTIDAD DE FACTURAS DEBE SER MAYOR A 0');
        }

        if (new Date(fecha_limite) <= new Date()) {
            throw new Error('LA FECHA LÍMITE DEBE SER FUTURA');
        }

        // VALIDAR QUE NO EXISTA CAI ACTIVO
        const [caiActivo] = await conn.query(
            `SELECT id_cai_pk
            FROM tbl_cai
            WHERE activo = TRUE
            AND tipo_documento = ?`,
            [tipo_documento]
        );

        if (caiActivo && caiActivo.length > 0) {
            throw new Error('YA HAY UN CAI DISPONIBLE Y ACTIVO EN EL SISTEMA. NO SE PUEDE AGREGAR OTRO.');
        }

        //INSERTAR NUEVO CAI
        await conn.query(
            `INSERT INTO tbl_cai (
                codigo_cai,
                prefijo,
                rango_inicio,
                rango_fin,
                numero_actual,
                fecha_limite,
                punto_emision,
                tipo_documento,
                activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
                codigo_cai,
                prefijo,
                rango_inicio,
                rango_fin,
                rango_inicio, //NUMERO_ACTUAL EMPIEZA EN RANGO_INICIO
                fecha_limite,
                punto_emision,
                tipo_documento
            ]
        );

        await conn.commit();

        res.status(201).json({
            Consulta: true,
            mensaje: 'EL CAI FUE CREADO Y ACTIVADO EXITOSAMENTE.'
        });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }
};


//==============OBTENER ALERTAS DEL CAI====================
exports.obtenerAlertasCAI = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        const [cai] = await conn.query(
            `SELECT
                codigo_cai,
                prefijo,
                numero_actual,
                rango_fin,
                fecha_limite,
                activo
            FROM tbl_cai
            WHERE activo = TRUE
            AND tipo_documento = '01'
            LIMIT 1`
        );

        if (!cai || cai.length === 0) {
            return res.status(200).json({
                Consulta: true,
                hayAlertas: true,
                alertas: [{
                    tipo: 'sin_cai',
                    mensaje: 'NO HAY CAI ACTIVO CONFIGURADO',
                    severidad: 'critico'
                }]
            });
        }

        const caiData = cai[0];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaLimite = new Date(caiData.fecha_limite);
        fechaLimite.setHours(0, 0, 0, 0);

        const facturasRestantes = caiData.rango_fin - caiData.numero_actual + 1;
        const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));

        const alertas = [];


        // ALERTAS DE FACTURAS RESTANTES
        if (facturasRestantes > 10 && facturasRestantes <= 15) {
            alertas.push({
                tipo: 'facturas',
                mensaje: `SOLO QUEDAN ${facturasRestantes} FACTURAS DISPONIBLES CON EL CAI ACTUAL.`,
                severidad: 'advertencia',
                valor: facturasRestantes
            });

        } else if (facturasRestantes > 0 && facturasRestantes <= 10) {
            alertas.push({
                tipo: 'facturas',
                mensaje: `ATENCIÓN: SOLO QUEDAN ${facturasRestantes} FACTURAS. SOLICITE UN NUEVO CAI.`,
                severidad: 'advertencia',
                valor: facturasRestantes
            });

        } else if (facturasRestantes <= 0) {
            alertas.push({
                tipo: 'facturas',
                mensaje: 'SE HAN AGOTADO TODOS LOS RANGOS DISPONIBLES CON EL CAI ACTUAL. CONTACTE CON SU CONTADOR',
                severidad: 'critico',
                valor: 0
            });
        }



        // ALERTAS DE FECHA SOLO SI TODAVÍA HAY FACTURAS
        if (facturasRestantes > 0) {

            //FECHA DEL CAI VIENE A VENCER EN 10 DÍAS O MENOS
            if (diasRestantes <= 10 && diasRestantes > 0) {
                const fechaFormateada = moment(caiData.fecha_limite)
                    .tz('America/Tegucigalpa')
                    .format('DD/MM/YYYY');

                alertas.push({
                    tipo: 'fecha',
                    mensaje: `El CAI VENCE EN ${diasRestantes} DÍAS.`,
                    severidad: 'advertencia',
                    valor: diasRestantes,
                    fecha: fechaFormateada
                });

            } else if (diasRestantes <= 0) {
                const fechaFormateada = moment(caiData.fecha_limite)
                    .tz('America/Tegucigalpa')
                    .format('DD/MM/YYYY');

                alertas.push({
                    tipo: 'fecha',
                    mensaje: 'EL CAI HA VENCIDO',
                    severidad: 'critico',
                    valor: 0,
                    fecha: fechaFormateada
                });
            }
        }

        res.status(200).json({
            Consulta: true,
            hayAlertas: alertas.length > 0,
            alertas: alertas,
            estadisticas: {
                facturasRestantes,
                diasRestantes,
                totalFacturas: caiData.rango_fin - caiData.rango_inicio + 1,
                porcentajeUsado: (((caiData.numero_actual - caiData.rango_inicio) / (caiData.rango_fin - caiData.rango_inicio + 1)) * 100).toFixed(2)
            }
        });

    } catch (error) {
        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};
