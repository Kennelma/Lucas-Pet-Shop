import React from "react";
import userImage from "../../clientes/clientes-dog.png"; // Usando la misma imagen temporalmente

const PerfilUsuario = ({ usuarioSeleccionado }) => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-gradient-to-b from-orange-50 to-amber-50 border-b border-gray-300 flex-shrink-0">
        <div className="p-4">
          <span className="block w-full text-center font-semibold text-gray-700 font-poppins">
            PERFIL DE USUARIO
          </span>

          {usuarioSeleccionado ? (
            <div className="mt-4">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={userImage}
                  alt="Usuario"
                  className="w-20 h-20 object-cover rounded-full border-[3px] border-white shadow-lg"
                />
                <div className="text-center">
                  <h3 className="font-bold text-lg text-gray-800">
                    {usuarioSeleccionado.usuario}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Email: {usuarioSeleccionado.email_usuario}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Sucursal: {usuarioSeleccionado.nombreSucursal || 'No asignada'}
                  </p>
                </div>
              </div>

              {/* Información adicional del usuario */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-semibold ${usuarioSeleccionado.activo ? 'text-green-600' : 'text-red-600'}`}>
                      {usuarioSeleccionado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  {usuarioSeleccionado.fecha_creacion && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Creado:</span>
                      <span className="text-gray-800">
                        {new Date(usuarioSeleccionado.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>
                  )}
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
              <p className="text-gray-500 text-sm">Selecciona un usuario</p>
              <p className="text-gray-400 text-xs mt-1">para ver su perfil</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
