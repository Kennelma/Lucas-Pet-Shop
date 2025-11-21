require('dotenv').config()

const mysqlConnection = require('../config/conexion');

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
                (rango_fin - rango_inicio + 1) AS total_facturas
            FROM tbl_cai
            ORDER BY activo DESC, id_cai_pk DESC
        `);

        res.status(200).json({
            Consulta: true,
            Catalogo: filas || []
        });
    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};

//================VER CAI ACTIVO (QUE SE ESTÁ USANDO)====================
exports.verCAIActivo = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        const [cai] = await conn.query(
            `SELECT
                id_cai_pk,
                codigo_cai,
                prefijo,
                rango_inicio,
                rango_fin,
                numero_actual,
                fecha_limite,
                punto_emision,
                tipo_documento,
                activo
            FROM tbl_cai
            WHERE activo = TRUE
            AND tipo_documento = '01'
            LIMIT 1`
        );

        if (!cai || cai.length === 0) {
            return res.status(404).json({
                Consulta: false,
                mensaje: 'No hay CAI activo configurado'
            });
        }

        const caiActual = cai[0];

        //CALCULAR ESTADÍSTICAS
        const facturasUsadas = caiActual.numero_actual - caiActual.rango_inicio;
        const facturasDisponibles = caiActual.rango_fin - caiActual.numero_actual + 1;
        const totalFacturas = caiActual.rango_fin - caiActual.rango_inicio + 1;
        const porcentajeUsado = ((facturasUsadas / totalFacturas) * 100).toFixed(2);

        //CALCULAR DÍAS RESTANTES
        const fechaLimite = new Date(caiActual.fecha_limite);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));

        //GENERAR ALERTAS
        const alertas = [];

        if (diasRestantes < 30 && diasRestantes > 0) {
            alertas.push({
                tipo: 'FECHA',
                mensaje: `El CAI VENCE EN ${diasRestantes} días`,
                severidad: diasRestantes < 7 ? 'error' : 'warning'
            });
        } else if (diasRestantes <= 0) {
            alertas.push({
                tipo: 'FECHA',
                mensaje: 'El CAI ESTÁ VENCIDO. DEBE SOLICITAR UNO NUEVO AL SAR.',
                severidad: 'error'
            });
        }

        if (facturasDisponibles < 100 && facturasDisponibles > 0) {
            alertas.push({
                tipo: 'FACTURAS',
                mensaje: `SÓLO QUEDAN ${facturasDisponibles} FACTURAS DISPONIBLES`,
                severidad: facturasDisponibles < 50 ? 'error' : 'warning'
            });
        } else if (facturasDisponibles <= 0) {
            alertas.push({
                tipo: 'FACTURAS',
                mensaje: 'SE AGOTARON LAS FACTURAS. DEBE SOLICITAR UN NUEVO CAI AL SAR.',
                severidad: 'error'
            });
        }

        res.status(200).json({
            Consulta: true,
            data: {
                ...caiActual,
                estadisticas: {
                    facturasUsadas,
                    facturasDisponibles,
                    totalFacturas,
                    porcentajeUsado,
                    diasRestantes
                },
                alertas
            }
        });

    } catch (error) {
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
            prefijo,
            rango_inicio,
            rango_fin,
            fecha_limite,
            punto_emision,
            tipo_documento
        } = req.body;

        //VALIDACIONES
        if (!codigo_cai || !prefijo || !rango_inicio || !rango_fin || !fecha_limite) {
            throw new Error('TODOS LOS CAMPOS DEBEN SER LLENADOS');
        }

        if (parseInt(rango_fin) <= parseInt(rango_inicio)) {
            throw new Error('EL RANGO FINAL DEBE SER MAYOR AL RANGO INICIAL');
        }

        if (new Date(fecha_limite) <= new Date()) {
            throw new Error('LA FECHA LÍMITE DEBE SER FUTURA');
        }

        const [caiActivo] = await conn.query(
            `SELECT id_cai_pk
            FROM tbl_cai
            WHERE activo = TRUE
            AND tipo_documento = ?`,
            [tipo_documento || '01']
        );

        if (caiActivo && caiActivo.length > 0) {
            throw new Error('YA EXISTE UN CAI ACTIVO. NO SE PUEDE INGRESAR OTRO HASTA QUE EL ACTUAL SE AGOTE O VENZA.');
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
                punto_emision || '002',
                tipo_documento || '01'
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

        // FACTURAS
        if (facturasRestantes <= 100 && facturasRestantes > 0) {
            alertas.push({
                tipo: 'facturas',
                mensaje: `SOLO QUEDAN ${facturasRestantes} FACTURAS DISPONIBLES CON EL CAI ACTUAL.`,
                severidad: facturasRestantes <= 50 ? 'critico' : 'advertencia',
                valor: facturasRestantes
            });
        } else if (facturasRestantes <= 0) {
            alertas.push({
                tipo: 'facturas',
                mensaje: 'LAS FACTURAS DISPONIBLES SE HAN AGOTADO CON EL CAI ACTUAL.',
                severidad: 'critico',
                valor: 0
            });
        }

        // FECHA
        if (diasRestantes <= 30 && diasRestantes > 0) {
            alertas.push({
                tipo: 'fecha',
                mensaje: `El CAI VENCE EN ${diasRestantes} DÍAS.`,
                severidad: diasRestantes <= 7 ? 'critico' : 'advertencia',
                valor: diasRestantes,
                fecha: caiData.fecha_limite
            });
        } else if (diasRestantes <= 0) {
            alertas.push({
                tipo: 'fecha',
                mensaje: 'EL CAI HA VENCIDO',
                severidad: 'critico',
                valor: 0,
                fecha: caiData.fecha_limite
            });
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
        res.status(500).json({
            Consulta: false,
            error: error.message
        });
    } finally {
        conn.release();
    }
};

module.exports = exports;
