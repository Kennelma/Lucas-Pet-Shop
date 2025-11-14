

const mysqlConnection = require('../config/conexion');


async function calcular_estado_lote (stock_lote) {

    const conn = await mysqlConnection.getConnection();

//ENVIO LA CONSULTA A LA BASE MEDIANTE EL EXECUTE Y ALMACENO EL RESULTADO
  const [estados] = await conn.execute(
    `SELECT
        nombre_estado,
        id_estado_pk
     FROM cat_estados
     WHERE dominio = 'LOTE_MEDICAMENTO'
       AND nombre_estado IN ('AGOTADO', 'DISPONIBLE')`
  );

  //VARIABLES DE APOYO PAR
  let id_agotado = null;
  let id_disponible = null;

  //RECORRO LAS FILAS OBTENIDAS
  for (const fila of estados) {

    if (fila.nombre_estado === 'AGOTADO') {

        id_agotado = fila.id_estado_pk; //SE GUARDA EL ID DEL ESTADO DE AGOTADO

    } else if (fila.nombre_estado === 'DISPONIBLE') {

        id_disponible = fila.id_estado_pk; //SE GUARDA EL ID DEL ESTADO DE DISPONIBLE
    };

    };

    return stock_lote > 0 ? id_disponible : id_agotado;

};


module.exports = {};