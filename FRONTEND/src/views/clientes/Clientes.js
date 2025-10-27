import { useState } from "react";

//IMPORTACION DE LOS ARCHIVOS COMPLEMENTARIOS DEL MODULO DE CLIENTES
import TablaClientes from "./tabla-clientes.js";


const Clientes = () => {

  //ESTADO QUE SIRVE PARA SELECCIONAR REGISTRO -> MOSTRAR EL PERFIL DEL MISMO (GLOBAL)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Título */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-3" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            GESTIÓN DE CLIENTES
          </h2>
        </div>
        <p className="text-center text-gray-600 italic">Administra la información y perfiles de clientes del negocio</p>
      </div>
      
      <TablaClientes setClienteSeleccionado={setClienteSeleccionado}/>
    </div>
  );
};

export default Clientes;
