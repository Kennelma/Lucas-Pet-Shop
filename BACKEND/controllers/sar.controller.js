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
            fecha_limite,
            establecimiento,
            punto_emision,
            tipo_documento,
            prefijo,
            rango_inicio,
            rango_fin
        } = req.body;

        //VALIDACIONES
        if (!codigo_cai || !cantidad_facturas || !fecha_limite) {
            throw new Error('TODOS LOS CAMPOS SON OBLIGATORIOS');
        }

        if (!establecimiento || !punto_emision || !tipo_documento) {
            throw new Error('ESTABLECIMIENTO, PUNTO DE EMISIÓN Y TIPO DE DOCUMENTO SON OBLIGATORIOS');
        }

        if (!rango_inicio || !rango_fin) {
            throw new Error('LOS RANGOS INICIAL Y FINAL SON OBLIGATORIOS');
        }

        if (parseInt(cantidad_facturas) <= 0) {
            throw new Error('LA CANTIDAD DE FACTURAS DEBE SER MAYOR A 0');
        }

        if (parseInt(rango_fin) < parseInt(rango_inicio)) {
            throw new Error('EL RANGO FINAL DEBE SER MAYOR O IGUAL AL INICIAL');
        }

        //VALIDAR QUE LA CANTIDAD COINCIDA CON EL RANGO
        const cantidadCalculada = parseInt(rango_fin) - parseInt(rango_inicio) + 1;
        if (cantidadCalculada !== parseInt(cantidad_facturas)) {
            throw new Error(`LA CANTIDAD DE FACTURAS (${cantidad_facturas}) NO COINCIDE CON EL RANGO (${cantidadCalculada})`);
        }

        if (new Date(fecha_limite) <= new Date()) {
            throw new Error('LA FECHA LÍMITE DEBE SER FUTURA');
        }

        //VALIDAR QUE EL RANGO SEA CONSECUTIVO CON EL ÚLTIMO CAI
        const [ultimoCAI] = await conn.query(
            `SELECT rango_fin
            FROM tbl_cai
            WHERE tipo_documento = ?
            ORDER BY rango_fin DESC
            LIMIT 1`,
            [tipo_documento]
        );

        if (ultimoCAI && ultimoCAI.length > 0) {
            const ultimoRangoFin = parseInt(ultimoCAI[0].rango_fin);
            const nuevoRangoInicio = parseInt(rango_inicio);

            if (nuevoRangoInicio !== ultimoRangoFin + 1) {
                throw new Error(`EL RANGO DEBE SER CONSECUTIVO. EL ÚLTIMO CAI TERMINÓ EN ${ultimoRangoFin}, EL NUEVO DEBE COMENZAR EN ${ultimoRangoFin + 1}`);
            }
        }

        //VALIDAR QUE NO EXISTA CAI ACTIVO
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
                parseInt(rango_inicio),
                parseInt(rango_fin),
                parseInt(rango_inicio), //NUMERO_ACTUAL EMPIEZA EN RANGO_INICIO
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
        const fechaHoy = moment().tz('America/Tegucigalpa').format('YYYY-MM-DD');

        // CONFIGURAR TIMEOUT Y NIVEL DE AISLAMIENTO
        await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED');
        await conn.query('SET SESSION innodb_lock_wait_timeout = 10');
        await conn.beginTransaction();

        //DESACTIVAR CAI vencidos
        await conn.query(`
            UPDATE tbl_cai
            SET activo = 0
            WHERE activo = 1
              AND fecha_limite < ?
        `, [fechaHoy]);

        //DESACTIVAR CAI agotados (numero_actual > rango_fin)
        await conn.query(`
            UPDATE tbl_cai
            SET activo = 0
            WHERE activo = 1
              AND numero_actual > rango_fin
        `);

        await conn.commit();

        //OBTENER CAI ACTIVO (DESPUÉS DE LA DESACTIVACIÓN)
        const [cai] = await conn.query(`
            SELECT
                codigo_cai,
                prefijo,
                numero_actual,
                rango_inicio,
                rango_fin,
                fecha_limite,
                activo
            FROM tbl_cai
            WHERE activo = TRUE
              AND tipo_documento = '01'
            LIMIT 1
        `);

        const alertas = [];

        if (!cai || cai.length === 0) {
            //NO HAY CAI ACTIVO
            alertas.push({
                tipo: 'sin_cai',
                mensaje: 'NO HAY CAI ACTIVO CONFIGURADO',
                severidad: 'critico'
            });

            return res.status(200).json({
                Consulta: true,
                hayAlertas: true,
                alertas,
                estadisticas: {}
            });
        }

        const caiData = cai[0];
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const fechaLimite = new Date(caiData.fecha_limite);
        fechaLimite.setHours(0,0,0,0);

        const facturasRestantes = caiData.rango_fin - caiData.numero_actual + 1;
        const diasRestantes = Math.floor((fechaLimite - hoy) / (1000 * 60 * 60 * 24));

        const caiVencido = diasRestantes < 0;
        const facturasAgotadas = facturasRestantes <= 0;

        // ALERTAS CRÍTICAS
        if (caiVencido) {
            const fechaFormateada = moment(caiData.fecha_limite).tz('America/Tegucigalpa').format('DD/MM/YYYY');
            alertas.push({
                tipo: 'fecha',
                mensaje: `EL CAI HA VENCIDO. CONTACTE A SU CONTADOR PARA OBTENER UN NUEVO CAI AL SAR.`,
                severidad: 'critico',
                valor: 0,
                fecha: fechaFormateada
            });
        } else if (facturasAgotadas) {
            alertas.push({
                tipo: 'facturas',
                mensaje: 'EL CAI HA SIDO DESACTIVADO PORQUE NO QUEDAN FACTURAS DISPONIBLES. DEBE SOLICITAR UN NUEVO CAI AL SAR.',
                severidad: 'critico',
                valor: 0
            });
        } else {
            // ALERTAS PREVENTIVAS
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
            }

            if (diasRestantes > 0 && diasRestantes <= 10) {
                const fechaFormateada = moment(caiData.fecha_limite).tz('America/Tegucigalpa').format('DD/MM/YYYY');
                alertas.push({
                    tipo: 'fecha',
                    mensaje: `EL CAI VENCE EN ${diasRestantes} DÍAS. FECHA LÍMITE (${fechaFormateada}). SOLICITE UNO NUEVO.`,
                    severidad: 'advertencia',
                    valor: diasRestantes,
                    fecha: fechaFormateada
                });
            }
        }

        res.status(200).json({
            Consulta: true,
            hayAlertas: alertas.length > 0,
            alertas,
            estadisticas: {
                facturasRestantes,
                diasRestantes,
                totalFacturas: caiData.rango_fin - caiData.rango_inicio + 1,
                porcentajeUsado: (((caiData.numero_actual - caiData.rango_inicio) / (caiData.rango_fin - caiData.rango_inicio + 1)) * 100).toFixed(2)
            }
        });

    } catch (error) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: error.message });
    } finally {
        conn.release();
    }
};
