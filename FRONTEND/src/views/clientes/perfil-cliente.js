import React, { useState, useEffect } from "react";
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
    <div className="bg-white flex flex-col w-full h-full rounded-xl overflow-hidden shadow-lg border-2" style={{borderColor: '#B5DD7E'}}>
      <div className=" shrink-0" style={{ backgroundColor: '#fbfffbff' }}>
        <div className="p-3">
          <span className="block w-full text-center font-semibold text-gray-700 font-poppins text-xs">
            PERFIL DE CLIENTE
          </span>

          {clienteSeleccionado ? (
          <div className="mt-3 px-2 flex flex-col items-center">
            <img
              src={clienteImage}
              alt="Cliente"
              className="w-12 h-12 rounded-full object-cover shadow-lg mb-2"
            />
            <h3 className="font-bold text-lg text-gray-800 text-center">
              {clienteSeleccionado.nombre_cliente}
            </h3>
            <p className="text-xs text-black-600 mt-1 text-center">
              Cliente desde:{" "}
              {new Date(clienteSeleccionado.fecha_registro).toLocaleDateString()}
            </p>
            <p className="text-xs text-black-600 mt-0.5 text-center">
              Identidad: {clienteSeleccionado.identidad_cliente}
            </p>
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

      <div className="flex-1 flex flex-col items-center justify-center p-3" style={{ backgroundColor: "#B5DD7E" }}>
        {clienteSeleccionado && (
          <button
            className="text-gray-900 font-semibold px-3 py-1.5 text-xs rounded-lg transition-colors shadow-md w-[90%]"
            style={{ backgroundColor: "#F4F5F4" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#F4F5F4")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#F4F5F4")}
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