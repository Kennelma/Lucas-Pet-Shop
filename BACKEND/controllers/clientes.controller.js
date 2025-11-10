
const mysqlConnection = require('../config/conexion');


// ENDPOINT DE INGRESAR CLIENTES
exports.crear = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try {

        const fechaRegistro = new Date();

        await conn.query(
        `INSERT INTO tbl_clientes (nombre_cliente, apellido_cliente, identidad_cliente, telefono_cliente, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
        [
           req.body.nombre_cliente,
           req.body.apellido_cliente,
           req.body.identidad_cliente,
           req.body.telefono_cliente,
           fechaRegistro
        ]
        );

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'Registro realizado con éxito',
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


//ENDPOINT DE VER LISTA DE CLIENTES
exports.ver = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    try {
        //SE EJECUTA EL PROCEDIMIENTO
        const [clientes] = await conn.query(`SELECT * FROM tbl_clientes ORDER BY id_cliente_pk DESC`);

        res.status(200).json({
            Consulta: true,
            clientes: clientes || []
        });

    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });

    } finally {
        conn.release(); //SE LIBERA LA CONEXIÓN
    }
};


//ENDPOINT ACTUALIZAR CLIENTES
exports.actualizar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction();

    try{

        const { id_cliente } = req.body;

        await conn.query(
                `UPDATE tbl_clientes
                SET nombre_cliente = COALESCE(?, nombre_cliente),
                    apellido_cliente = COALESCE(?, apellido_cliente),
                    identidad_cliente = COALESCE(?, identidad_cliente),
                    telefono_cliente = COALESCE(?, telefono_cliente)
                WHERE id_cliente_pk = ?`,
            [
                req.body.nombre_cliente || null,
                req.body.apellido_cliente || null,
                req.body.identidad_cliente || null,
                req.body.telefono_cliente || null,
                id_cliente
            ]
        );

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Cliente actualizado con éxito',
            id_cliente

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

//ENDPOINT PARA ELIMINAR CLIENTES
exports.eliminar = async (req, res) => {

    const conn = await mysqlConnection.getConnection();


    try {
        await conn.beginTransaction();

        const { id } = req.body;

        await conn.query(`DELETE FROM tbl_clientes WHERE id_cliente_pk = ?`, [id]);

        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'Cliente eliminado con éxito',
            id
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

//ENDPOINT QUE MUESTRA EL HISTORIAL DE COMPRAS DE UN CLIENTE (último mes)
exports.historialCompras = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        const { id_cliente } = req.query;

        const [historial] = await conn.query(`
            SELECT
                f.numero_factura,
                f.fecha_emision,
                c.nombre_cliente,
                df.nombre_item,
                df.cantidad_item,
                df.precio_item,
                (df.cantidad_item * df.precio_item) AS total_item
            FROM tbl_facturas f
            INNER JOIN tbl_detalles_facturas df ON f.id_factura_pk = df.id_factura_fk
            INNER JOIN tbl_clientes c ON f.id_cliente_fk = c.id_cliente_pk
            WHERE c.id_cliente_pk = ?
              AND f.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            ORDER BY f.fecha_emision DESC
        `, [id_cliente]);

        const agrupadas = [];
        const mapaFacturas = new Map();

        for (const fila of historial) {
            const clave = fila.numero_factura;

            if (!mapaFacturas.has(clave)) {
                mapaFacturas.set(clave, {
                    numero_factura: fila.numero_factura,
                    fecha_emision: fila.fecha_emision,
                    nombre_cliente: fila.nombre_cliente,
                    detalles: [],
                    total_factura: 0
                });
                agrupadas.push(mapaFacturas.get(clave));
            }

            const factura = mapaFacturas.get(clave);
            factura.detalles.push({
                nombre_item: fila.nombre_item,
                cantidad_item: fila.cantidad_item,
                precio_item: fila.precio_item,
                total_item: fila.total_item
            });
            factura.total_factura += fila.total_item;
        }

        res.status(200).json({
            Consulta: true,
            historial: agrupadas
        });

    } catch (error) {
        res.status(500).json({
            Consulta: false,
            error: error.message
        });

    } finally {
        conn.release(); //SE LIBERA LA CONEXIÓN
    }
};