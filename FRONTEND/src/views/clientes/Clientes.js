import { useEffect, useState } from "react";

{/*FUNCION QUE SIRVE PARA ENVIAR EL NOMBRE DE LA TABLA AL SERVICIO QUE CONSUME
  LA API, TODO ES DINAMICO*/}
import { verRegistro } from "../../services/apiService.js";


const Clientes = () => {

  {/*GET. ESTADO  DONDE SE GUARDAN LOS CLIENTES OBTENIDOS DESDE LA API*/}
  const [clientes, setClientes] = useState([]);

  {/*LLAMA A LA FUNCION PARA ENVIAR EL NOMBRE DE LA TABLA Y GUARDAR 
    TODOS LOS RESULTADOS EN EL ESTADOS DE ''CLIENTES''*/}
  useEffect(() => {
    verRegistro("clientes").then(setClientes);
  }, []);

 return (
  <div className="p-6">
      <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      {/*TABLA DE CLIENTES*/}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">

            {/*FILA DE LOS ENCABEZADOS DE ESAS COLUMNAS*/}
            <tr>
              <th className="text-left px-4 py-2 border-b border-gray-300">
                Nombre
              </th>
              <th className="text-left px-4 py-2 border-b border-gray-300">
                Identidad
              </th>
              <th className="text-left px-4 py-2 border-b border-gray-300">
                Teléfono
              </th>
            </tr>
          </thead>

          {/*MAPEO DEL ARREGLO DE CLIENTES*/}
          <tbody>

            {/*ARREGLO DE CLIENTES CON SU INDICE*/}
            {clientes.map((c, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b border-gray-200">
                  {c.nombre_cliente}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {c.identidad_cliente}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {c.telefono_cliente}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
    {/*MENSAJE QUE MUESTRA SI NO HAY CLIENTES (EL ARREGLO ESTÁ VACIO) A LA VISTA*/}
    {clientes.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        No hay clientes registrados
      </div>
    )}
  </div>
);
}

export default Clientes