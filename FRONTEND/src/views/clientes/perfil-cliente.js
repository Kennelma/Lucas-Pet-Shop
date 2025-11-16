import React, { useState } from "react";
import clienteImage from "../../views/clientes/clientes-dog.png";
import ModalPerfilCliente from "../../views/clientes/ModalPerfilCliente"; // export default

const PerfilCliente = ({ clienteSeleccionado }) => {
  const [openModalPerfil, setOpenModalPerfil] = useState(false);
  const [clientePerfil, setClientePerfil] = useState(null);
  
  // Aplicar Poppins
  useEffect(() => {
    document.body.style.fontFamily = 'Poppins';
  }, []);

  const abrirHistorial = () => {
    if (!clienteSeleccionado) return;
    setClientePerfil(clienteSeleccionado);
    setOpenModalPerfil(true);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-gradient-to-b from-[#DEFFAD]/30 to-[#DEFFAD]/10 border-b border-gray-300 flex-shrink-0">
        <div className="p-4">
          <span className="block w-full text-center font-semibold text-gray-700 font-poppins">
            PERFIL DE CLIENTE
          </span>

          {clienteSeleccionado ? (
            <div className="mt-4">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={clienteImage}
                  alt="Cliente"
                  className="w-20 h-20 object-cover rounded-full border-[3px] border-white shadow-lg"
                />
                <div className="text-center">
                  <h3 className="font-bold text-lg text-gray-800">
                    {clienteSeleccionado.nombre_cliente}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Identidad: {clienteSeleccionado.identidad_cliente}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente desde:{" "}
                    {new Date(clienteSeleccionado.fecha_registro).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Selecciona un cliente</p>
              <p className="text-gray-400 text-xs mt-1">para ver su perfil</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {clienteSeleccionado && (
          <button
            className="text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
            style={{ backgroundColor: "#DEFFAD" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#c9e89a")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#DEFFAD")}
            onClick={abrirHistorial}
          >
            VER HISTORIAL DE COMPRAS
          </button>
        )}
      </div>

      {/* Renderiza el modal como componente, no lo invoques */}
      <ModalPerfilCliente
        isOpen={openModalPerfil}
        cliente={clientePerfil}
        onClose={() => setOpenModalPerfil(false)}
      />
    </div>
  );
};

export default PerfilCliente;
