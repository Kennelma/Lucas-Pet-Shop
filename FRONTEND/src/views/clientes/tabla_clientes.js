import { useState, useEffect } from "react";

//IMPORTACIÓN DEL SERVICIO QUE CONSUME LA API (GET)
import {  verRegistro } from "../../services/apiService.js"; 


const TablaClientes = ({ setClienteSeleccionado }) => {

  //ESTADOS QUE ME CARGAN LOS DATOS Y EL OTRO PARA GUARDAR TODOS LOS CLIENTES QUE VIENEN DE LA API
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);

  //USE EFECT PARA EL SERVICIO QUE CONSUME EL PROCEDIMIENTO ALMACENADO (API)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await verRegistro("tbl_clientes");
        setClientes(data);   
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);   
      }
    };
    fetchData();
  }, []);

  //ESTADO BOOLEANO MIENTRAS CARGAN LOS DATOS
  if (loading) {
    return <p>Cargando datos...</p>; 
  }

  return (
  <div>
    <section className="bg-white border border-gray-300 rounded-xl p-6 overflow-y-auto flex flex-col max-w-5xl w-full mx-auto">
    <div className="text-center text-lg font-medium text-gray-700 mb-4 font-poppins">REGISTRO DE CLIENTES</div>


  <div className="overflow-x-auto">
    <table className="w-full table-auto border-collapse border border-gray-200 rounded-lg">
      <thead>
        <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
          <th className="py-3 px-6 border-b border-gray-300">ID</th>
          <th className="py-3 px-6 border-b border-gray-300">Nombre</th>
          <th className="py-3 px-6 border-b border-gray-300">Apellido</th>
          <th className="py-3 px-6 border-b border-gray-300">Identidad</th>
          <th className="py-3 px-6 border-b border-gray-300">Teléfono</th>
          <th className="py-3 px-6 border-b border-gray-300">Acciones</th>
        </tr>
      </thead>

      <tbody className="text-gray-600 text-sm">
         {loading ? (
              // MENSAJE DE CARGA DENTRO DE LA TABLA
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    <span>Cargando datos...</span>
                  </div>
                </td>
              </tr>
        ) : clientes.length > 0 ? (
          clientes.map((c) => (
            <tr
              key={c.id_cliente_pk}
              className="hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer"
              onClick={() => setClienteSeleccionado(c)}
            >
              <td className="py-3 px-6 border-b">{c.id_cliente_pk}</td>
              <td className="py-3 px-6 border-b">{c.nombre_cliente}</td>
              <td className="py-3 px-6 border-b ">{c.apellido_cliente}</td>
              <td className="py-3 px-6 border-b">{c.identidad_cliente}</td>
              <td className="py-3 px-6 border-b">{c.telefono_cliente}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="py-4 text-center text-gray-500">
              No hay datos disponibles
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>

  </div>
);

};

export default TablaClientes;
