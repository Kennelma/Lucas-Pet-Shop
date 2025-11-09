
//IMPORTACION DE LOS ARCHIVOS COMPLEMENTARIOS DEL MODULO DE CLIENTES
import TablaClientes from "./tabla-clientes.js";



const Clientes = () => {

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Título */}
      <div className="rounded-xl p-6 mb-3"
        style={{
          backgroundImage: 'url("/H2.jpg")',
          backgroundColor: '#A5CC8B',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          boxShadow: '0 0 8px #A5CC8B40, 0 0 0 1px #A5CC8B33'
        }}
      >
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-black">
            GESTIÓN DE CLIENTES
          </h2>
        </div>
        <p className="text-center text-black italic mt-2">
          Administra los clientes disponibles en el sistema para su venta
        </p>
      </div>

      
      <TablaClientes/>
    </div>
  );
};

export default Clientes;
