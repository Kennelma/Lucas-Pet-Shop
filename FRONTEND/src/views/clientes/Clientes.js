import { useState } from "react";

//IMPORTACION DE LOS ARCHIVOS COMPLEMENTARIOS DEL MODULO DE CLIENTES
import TablaClientes from "./tabla-clientes.js";
import PerfilCliente from "./perfil-cliente.js";

const Clientes = () => {

  //ESTADO QUE SIRVE PARA SELECCIONAR REGISTRO -> MOSTRAR EL PERFIL DEL MISMO (GLOBAL)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Título */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 shadow-sm border border-gray-200 mb-3">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            GESTIÓN DE CLIENTES
          </h2>
        </div>
      </div>
      
      <TablaClientes setClienteSeleccionado={setClienteSeleccionado}/>

      <main className="bg-white border border-gray-300 rounded-xl overflow-hidden flex max-w-5xl w-full mx-auto mt-6">
         <PerfilCliente clienteSeleccionado={clienteSeleccionado} />
      </main>
    </div>
  );
};

export default Clientes;
