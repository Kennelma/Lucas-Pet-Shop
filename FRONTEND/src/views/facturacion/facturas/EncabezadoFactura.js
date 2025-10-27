import React from "react";
import { User } from 'lucide-react';

// NOTA: Estas variables son placeholders. Se asume que serán pasadas como props desde un componente padre.
const nuevaFactura = { nombre: "", apellido: "", identidad: "" }; // Placeholder del objeto de estado
const setNuevaFactura = () => {}; // Placeholder de la función de estado


const EncabezadoFactura = () => {

    return (
        // El Fragment <> o <div> es necesario para envolver el contenido JSX devuelto.
        <div>
            {/* Información del Cliente */}
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Información del cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                    {/* Campo Nombre */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={nuevaFactura.nombre}
                            // En la implementación real, usarías:
                            // onChange={(e) => setNuevaFactura({ ...nuevaFactura, nombre: e.target.value })}
                            onChange={() => {}}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                            placeholder="Nombre"
                        />
                    </div>

                    {/* Campo Apellido */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Apellido *
                        </label>
                        <input
                            type="text"
                            value={nuevaFactura.apellido}
                            // En la implementación real, usarías:
                            // onChange={(e) => setNuevaFactura({ ...nuevaFactura, apellido: e.target.value })}
                            onChange={() => {}}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                            placeholder="Apellido"
                        />
                    </div>

                    {/* Campo Identidad */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Identidad
                        </label>
                        <input
                            type="text"
                            value={nuevaFactura.identidad}
                            // En la implementación real, usarías:
                            // onChange={(e) => setNuevaFactura({ ...nuevaFactura, identidad: e.target.value })}
                            onChange={() => {}}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                            placeholder="0000-0000-00000"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncabezadoFactura;