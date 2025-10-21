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

        //VALIDAR QUE EXISTAN OBJETOS PARA PODER CREAR LA FACTURA
        if (!detalles || detalles.length === 0) {
            return res.status(400).json({
                Consulta: false,
                mensaje: 'Se debe incluir al menos un detalle para generar la factura.'
            });
        }

        console.log('Detalles recibidos:', detalles);
        console.log('Cantidad de detalles:', detalles.length);


        //VARIABLES DE APOYO
        //let subtotal = 0;
    
        //SE RECORRE CADA UNO DE LOS DETALLES 
        for (let detalle of detalles) {
           
            //TOTAL DE LINEA = CANTIDAD * PRECIO + AJUSTE
            const total_linea = (detalle.cantidad_item * detalle.precio_item) + (detalle.ajuste_precio || 0);
            
            console.log(`Detalle: ${detalle.nombre_item} -> total_linea: ${total_linea}`);

            subtotal += total_linea;
        }

        //console.log('Subtotal calculado:', subtotal);

        //const total = subtotal + (impuesto || 0) - (descuento || 0);

        console.log('Total calculado:', total);

        //const saldo = total;



        //EN EL CASO DE DETALLES ES UN ARRAY DE OBJETOS
        const { RTN, subtotal, impuesto, descuento, total, saldo, id_cliente, detalles } = req.body

        
        const [factura] = await conn.query(
            `INSERT INTO tbl_facturas (
                fecha_emision,
                RTN,
                subtotal, 
                impuesto,
                descuento,
                total,
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

        //CAPTURAR EL ID DE LA FACTURA CREADA
        const id_factura = factura.insertId;
        console.log('Factura creada con ID:', id_factura);


        
    } catch (err) {
        await conn.rollback();
        res.status(500).json({
            Consulta: false,
            error: err.message
        });
    } finally {
        conn.release();
    }

}

