import clienteImage from "../../views/clientes/clientes-dog.png";

const PerfilCliente = ({ clienteSeleccionado }) => {

  return (
    <div className="flex w-full">

      <div className="w-1/3 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-gray-300">
        <div className="p-4">

          <span className="block w-full text-center font-semibold text-gray-700 font-poppins">PERFIL DE CLIENTE</span>
          {clienteSeleccionado ? (
            <div className="mt-4">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={clienteImage}
                  alt="Cliente"
                  className="w-20 h-20 object-cover rounded-full border-[3px] border-white shadow-lg"
                />
                <div className="text-center">
                  {/*NOMBRE DEL CLIENTE*/}
                  <h3 className="font-bold text-lg text-gray-800">{clienteSeleccionado.nombre_cliente}</h3>
                  <p className="text-sm text-gray-600 mt-1">Identidad: {clienteSeleccionado.identidad_cliente}</p>
                  <p className="text-sm text-gray-600 mt-1">Teléfono: {clienteSeleccionado.telefono_cliente}</p>
                  <p className="text-sm text-gray-600 mt-1"> Cliente desde: {new Date(clienteSeleccionado.fecha_registro).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Selecciona un cliente</p>
              <p className="text-gray-400 text-xs mt-1">para ver su perfil</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-gray-700">INFORMACIÓN ADICIONAL</span>
          {clienteSeleccionado && (
            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
              Total: 15 compras
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilCliente;
