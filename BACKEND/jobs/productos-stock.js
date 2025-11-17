const cron = require('node-cron');
const mysqlConnection = require('../config/conexion');


//JOB QUE REVISA PRODUCTOS BAJO STOCK Y CREA NOTIFICACIONES (TIEMPO COMPLETO)
cron.schedule('0 */5 * * * ', async () => {

    const conn = await mysqlConnection.getConnection();

    await conn.beginTransaction(); //INICIO LA TRANSACCIÓN

    try {

        //OBTENER LOS DATOS DE PRODUCTO BAJO STOCK (STOCK < STOCK MINIMO)
        const [producto] = await conn.query(`
            SELECT
                id_producto_pk,
                nombre_producto,
                stock,
                stock_minimo
            FROM tbl_productos 
            WHERE stock < stock_minimo
        `);

        if (producto.length === 0) {

            console.log('NO HAY PRODUCTOS BAJO STOCK');
            await conn.commit();
            return;

        } else {

            //OBTENGO EL ID DEL TIPO DE NOTIFICACION "STOCK_BAJOS"
            const [tipo_notificacion] = await conn.query(`
                SELECT
                    id_tipo_notificacion_pk
                FROM cat_tipo_notificacion
                WHERE nombre_tipo_notificacion = 'STOCK_BAJOS'`);

            const tipo_notificacion_fk = tipo_notificacion[0].id_tipo_notificacion_pk;

            //RECORRO EL ARREGLO DE PRODUCTOS BAJO STOCK
            for (let i = 0; i < producto.length; i++) {

                const nombre = producto[i].nombre_producto;
                const mensaje = `EL PRODUCTO ${nombre} TIENE UN STOCK = ${producto[i].stock} DE UNIDADES. ES NECESARIO REABASTECER.`;
                const fecha_creacion = new Date();

                //INSERTA SOLO SI NO EXISTE UNA NOTIFICACIÓN ACTIVA (NO LEÍDA) PARA ESTE PRODUCTO
                const [resultado] = await conn.query(`
                    INSERT INTO tbl_notificaciones (mensaje_notificacion, fecha_creacion, tipo_notificacion_fk)
                    SELECT ?, ?, ?
                    FROM DUAL
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM tbl_notificaciones
                        WHERE tipo_notificacion_fk = ?
                          AND mensaje_notificacion LIKE CONCAT('%', ?, '%')
                          AND leido = FALSE
                        LIMIT 1
                    )
                `, [mensaje, fecha_creacion, tipo_notificacion_fk, tipo_notificacion_fk, nombre]);
            };

            await conn.commit();
        }

    } catch (error) {
        await conn.rollback();
        console.error('ERROR EN EL JOB DE PRODUCTOS BAJO STOCK:', error);

    } finally {
        conn.release();
    }

});
