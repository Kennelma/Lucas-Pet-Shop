const mysqlConnection = require('../config/conexion');

// CREAR RECORDATORIO
exports.crear = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();

    try {
        let proximoEnvio = null;
        let idFrecuencia = null;
        const { id_frecuencia_fk, fecha_programada, hora_programada, tipo_envio } = req.body;
        
        console.log('📥 Datos recibidos:', {
            tipo_envio,
            id_frecuencia_fk,
            fecha_programada,
            hora_programada
        });

        // ✅ LÓGICA MEJORADA SEGÚN TIPO DE ENVÍO
        if (tipo_envio === 'programar' || tipo_envio === 'ambos') {
            // Programar para fecha/hora específica
            idFrecuencia = id_frecuencia_fk;
            
            if (fecha_programada && hora_programada) {
                const fechaHoraProgramada = new Date(`${fecha_programada} ${hora_programada}`);
                proximoEnvio = fechaHoraProgramada.toISOString().slice(0, 19).replace('T', ' ');
                console.log('📅 Fecha programada:', proximoEnvio);
            }
        } else if (tipo_envio === 'inmediato') {
            // Envío inmediato - usar frecuencia por defecto (diaria)
            // Buscar frecuencia diaria en la base de datos
            const [frecuenciaDiaria] = await conn.query(
                `SELECT id_frecuencia_record_pk FROM cat_frecuencia_recordatorio WHERE dias_intervalo = 1 LIMIT 1`
            );
            
            if (frecuenciaDiaria.length > 0) {
                idFrecuencia = frecuenciaDiaria[0].id_frecuencia_record_pk;
            } else {
                // Si no hay frecuencia diaria, usar la primera disponible
                const [primeraFrecuencia] = await conn.query(
                    `SELECT id_frecuencia_record_pk FROM cat_frecuencia_recordatorio ORDER BY id_frecuencia_record_pk LIMIT 1`
                );
                idFrecuencia = primeraFrecuencia[0].id_frecuencia_record_pk;
            }
            console.log('🚀 Envío inmediato - usando frecuencia:', idFrecuencia);
        } else {
            // Comportamiento por defecto (programar con frecuencia)
            idFrecuencia = id_frecuencia_fk;
            
            if (id_frecuencia_fk) {
                const [frecuenciaData] = await conn.query(
                    `SELECT dias_intervalo FROM cat_frecuencia_recordatorio WHERE id_frecuencia_record_pk = ?`,
                    [id_frecuencia_fk]
                );
                
                if (frecuenciaData.length > 0 && frecuenciaData[0].dias_intervalo) {
                    const diasIntervalo = frecuenciaData[0].dias_intervalo;
                    proximoEnvio = new Date();
                    proximoEnvio.setDate(proximoEnvio.getDate() + diasIntervalo);
                    proximoEnvio = proximoEnvio.toISOString().slice(0, 19).replace('T', ' ');
                    console.log('📅 Fecha calculada por frecuencia:', proximoEnvio);
                }
            }
        }

        // ✅ VALIDAR QUE TENEMOS UNA FRECUENCIA VÁLIDA
        if (!idFrecuencia) {
            throw new Error('Se requiere una frecuencia para el recordatorio');
        }

        console.log('💾 Insertando recordatorio con:', {
            mensaje: req.body.mensaje_recordatorio,
            tipo_item: req.body.id_tipo_item_fk,
            frecuencia: idFrecuencia,
            proximo_envio: proximoEnvio
        });

        const [result] = await conn.query(
            `INSERT INTO tbl_recordatorios (
                mensaje_recordatorio,    
                id_tipo_item_fk, 
                id_frecuencia_fk,
                proximo_envio,
                id_estado_programacion_fk,
                activo
             ) VALUES (?, ?, ?, ?, 1, 1)`,
            [
                req.body.mensaje_recordatorio,
                req.body.id_tipo_item_fk,
                idFrecuencia,
                proximoEnvio
            ]
        );

        await conn.commit();
        
        // ✅ SI ES ENVÍO INMEDIATO O AMBOS, EJECUTAR EL ENVÍO
        if (tipo_envio === 'inmediato' || tipo_envio === 'ambos') {
            console.log('🚀 Envío inmediato solicitado para recordatorio:', result.insertId);
            
            try {
                // Lógica para enviar inmediatamente
                const whatsappService = require('../services/whatsappService');
                
                if (whatsappService.isConnected) {
                    // Obtener números de teléfono de clientes
                    const [clientes] = await conn.query(
                        `SELECT DISTINCT telefono_cliente 
                         FROM tbl_clientes 
                         WHERE telefono_cliente IS NOT NULL 
                         AND telefono_cliente != ''
                         AND LENGTH(TRIM(telefono_cliente)) >= 8`
                    );

                    if (clientes.length > 0) {
                        const numeros = clientes.map(c => c.telefono_cliente);
                        console.log(`📤 Enviando inmediatamente a ${numeros.length} números...`);
                        
                        // Actualizar estado a "Enviando"
                        await conn.query(
                            `UPDATE tbl_recordatorios 
                             SET id_estado_programacion_fk = 2 
                             WHERE id_recordatorio_pk = ?`,
                            [result.insertId]
                        );

                        // Enviar mensajes
                        const resultados = await whatsappService.enviarMasivo(numeros, req.body.mensaje_recordatorio);

                        // Determinar estado final
                        let estadoFinal = 3; // Enviado exitosamente
                        if (resultados.fallidos.length > 0 && resultados.exitosos.length === 0) {
                            estadoFinal = 4; // Fallido completamente
                        } else if (resultados.fallidos.length > 0) {
                            estadoFinal = 5; // Enviado parcialmente
                        }

                        await conn.query(
                            `UPDATE tbl_recordatorios 
                             SET id_estado_programacion_fk = ?,
                                 ultimo_envio = NOW(),
                                 intentos = intentos + 1
                             WHERE id_recordatorio_pk = ?`,
                            [estadoFinal, result.insertId]
                        );

                        console.log(`✅ Envío inmediato completado: ${resultados.exitosos.length}/${resultados.total}`);
                    }
                } else {
                    console.log('⚠️ WhatsApp no conectado, no se puede enviar inmediatamente');
                }
            } catch (envioError) {
                console.error('❌ Error en envío inmediato:', envioError);
            }
        }

        res.status(200).json({
            Consulta: true,
            mensaje: 'Recordatorio creado con éxito',
            id_recordatorio: result.insertId
        });

    } catch (err) {
        await conn.rollback();
        console.error('Error al crear recordatorio:', err);
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};

// VER LISTA DE RECORDATORIOS
exports.ver = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        const [recordatorios] = await conn.query(
            `SELECT * FROM tbl_recordatorios ORDER BY id_recordatorio_pk DESC`
        );

        res.status(200).json({
            Consulta: true,
            recordatorios: recordatorios || []
        });
    } catch (error) {
        res.status(500).json({ Consulta: false, error: error.message });
    } finally {
        conn.release();
    }
};

// ACTUALIZAR RECORDATORIO
exports.actualizar = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();

    try {
        const { id_recordatorio_pk } = req.body;

        if (!id_recordatorio_pk) {
            return res.status(400).json({
                Consulta: false,
                error: 'ID del recordatorio es requerido'
            });
        }

        // 🔹 VALIDAR QUE EXISTE EL RECORDATORIO
        const [existeRecordatorio] = await conn.query(
            `SELECT id_recordatorio_pk FROM tbl_recordatorios WHERE id_recordatorio_pk = ?`,
            [id_recordatorio_pk]
        );

        if (existeRecordatorio.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                Consulta: false,
                error: 'Recordatorio no encontrado'
            });
        }

        // 🔹 CONSTRUIR QUERY DINÁMICAMENTE SOLO CON CAMPOS PROPORCIONADOS
        const campos = [];
        const valores = [];

        if (req.body.mensaje_recordatorio !== undefined) {
            campos.push('mensaje_recordatorio = ?');
            valores.push(req.body.mensaje_recordatorio);
        }

        if (req.body.id_tipo_item_fk !== undefined) {
            campos.push('id_tipo_item_fk = ?');
            valores.push(req.body.id_tipo_item_fk);
        }

        if (req.body.id_frecuencia_fk !== undefined) {
            campos.push('id_frecuencia_fk = ?');
            valores.push(req.body.id_frecuencia_fk);
        }

        if (req.body.id_estado_programacion_fk !== undefined) {
            campos.push('id_estado_programacion_fk = ?');
            valores.push(req.body.id_estado_programacion_fk);
        }

        if (campos.length === 0) {
            await conn.rollback();
            return res.status(400).json({
                Consulta: false,
                error: 'No hay campos para actualizar'
            });
        }

        // 🔹 AGREGAR ID AL FINAL DE LOS VALORES
        valores.push(id_recordatorio_pk);

        const query = `UPDATE tbl_recordatorios SET ${campos.join(', ')} WHERE id_recordatorio_pk = ?`;
        
        console.log('🔧 Query de actualización:', query);
        console.log('📤 Valores:', valores);

        await conn.query(query, valores);

        await conn.commit();
        res.status(200).json({
            Consulta: true,
            mensaje: 'Recordatorio actualizado con éxito',
            id_recordatorio: id_recordatorio_pk
        });
    } catch (err) {
        await conn.rollback();
        console.error('❌ Error en actualizar:', err);
        res.status(500).json({ 
            Consulta: false, 
            error: err.message,
            details: 'Error al actualizar en la base de datos'
        });
    } finally {
        conn.release();
    }
};

// ELIMINAR RECORDATORIO
exports.eliminar = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.body;

        await conn.query(`DELETE FROM tbl_recordatorios WHERE id_recordatorio_pk = ?`, [id]);
        await conn.commit();

        res.status(200).json({
            Consulta: true,
            mensaje: 'Recordatorio eliminado con éxito',
            id
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};

// VER CATÁLOGO
exports.verCatalogo = async (req, res) => {
    const conn = await mysqlConnection.getConnection();

    try {
        let filas;
        
        switch (req.query.tipo_catalogo) {
            case 'FRECUENCIA':
                [filas] = await conn.query(`
                    SELECT * FROM cat_frecuencia_recordatorio ORDER BY id_frecuencia_record_pk DESC`);
                break;

            case 'TELEFONO':
                [filas] = await conn.query(`
                    SELECT telefono_cliente FROM tbl_clientes`);
                break;
                
            case 'ESTADO':
                [filas] = await conn.query(`
                    SELECT id_estado_pk , nombre_estado FROM cat_estados WHERE dominio = 'RECORDATORIO'`);
                break;

            case 'TIPO_SERVICIO':
                [filas] = await conn.query(
                    `SELECT id_tipo_item_pk, nombre_tipo_item FROM cat_tipo_item where nombre_tipo_item != 'PRODUCTOS'`);
                break;

            default:
               throw new Error('Tipo de catalogo no válido');
        }

        res.json({
            Consulta: true,
            Catalogo: filas || []
        });

    } catch (error) {
        res.json({
            Consulta: false,
            error: error.message
        });

    } finally {
        conn.release();
    }  
};

