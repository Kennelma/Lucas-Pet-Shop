import { useState } from "react";



//IMPORTACION DE LOS ARCHIVOS COMPLEMENTARIOS DEL MODULO DE CLIENTES
import TablaClientes from "./tabla_clientes.js";
import PerfilCliente from "./perfil_cliente.js";

const Clientes = () => {

  //ESTADO QUE SIRVE PARA SELECCIONAR REGISTRO -> MOSTRAR EL PERFIL DEL MISMO (GLOBAL)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  return (
    <div className="min-h-screen p-6 bg-gray-100 space-y-6">
      
      <TablaClientes setClienteSeleccionado={setClienteSeleccionado}/>

      <main className="bg-white border border-gray-300 rounded-xl overflow-hidden flex max-w-5xl w-full mx-auto">
         <PerfilCliente clienteSeleccionado={clienteSeleccionado} />
      </main>

      

    </div>
  );
};

export default Clientes;
