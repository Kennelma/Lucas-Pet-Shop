require('dotenv').config()

const mysqlConnection = require('../config/conexion');

//1. LLENAR PRIMERO LA TABLA DE FACATURAS

exports.crearFactura = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {

        await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

        const fechaEmision = new Date(); //TOMA LA FECHA DE LA COMPUTADORA

        //ESTADO DE LA FACTURA ANTES DE ENTRAR A LOS METODOS DE PAGO
        const [estado_factura] = await conn.query(
            `SELECT id_estado_pk as id_estado
            FROM cat_estados
            WHERE dominio = 'FACTURA' and nombre_estado = 'PENDIENTE'`
        )

        //SE TOMA EL ID DEL USUARIO Y LA SUCURSAL POR EL AUTENTICADO (MIDDLEWARE AUTH)
        const id_usuario = req.usuario?.id_usuario_pk;
        const id_sucursal = req.usuario?.id_sucursal_fk;

        const { RTN, subtotal, impuesto, descuento, total, saldo, id_cliente } = req.body

        //s
        await conn.query(
            `INSERT INTO tbl_facturas (
                fecha_emision,
                RTN,
                subtotal, 
                impuesto
                descuento,
                total
                saldo,
                id_sucursal_fk,
                id_usuario_fk,
                id_estado_fk
                id_cliente_fk
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                fechaEmision,
                RTN || null,
                subtotal,
                impuesto,
                descuento || null,
                total,
                saldo,
                id_sucursal,
                id_usuario,
                estado_factura[0].id_estado,
                id_cliente || null
            ]
        )



        
    } catch (error) {
        
    }





}