import React, { useState } from "react";

//IMPORTACION DE LOS ARCHIVOS COMPLEMENTARIOS DEL MODULO DE CLIENTES
import TablaClientes from "./tabla-clientes.js";
import PerfilCliente from "./perfil-cliente.js";

const Clientes = () => {
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    return (
        <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
        <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50">
            <div className="pb-12">
                {/* Título */}
                <div className="rounded-lg sm:rounded-xl p-4 sm:p-6 mb-3"
                    style={{
                        backgroundImage: window.innerWidth >= 640 ? 'url("/H2.jpg")' : 'none',
                        backgroundColor: '#B5DD7E',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left center',
                        boxShadow: '0 0 8px #A5CC8B40, 0 0 0 1px #A5CC8B33'
                    }}
                >
                    <div className="flex justify-center items-center">
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-center uppercase text-black">
                            GESTIÓN DE CLIENTES
                        </h2>
                    </div>
                    <p className="text-center text-black italic mt-2 text-xs sm:text-sm">
                        Administra los clientes disponibles en el sistema para su venta
                    </p>
                </div>

                {/* LAYOUT_DE_DOS_COLUMNAS_TABLA_Y_PERFIL: Ajustado a 8/4 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 mb-12 items-start">
                    {/* TABLA_DE_CLIENTES_IZQUIERDA (Ocupa 8/12) */}
                    <div className="lg:col-span-8 bg-white border border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
                        <TablaClientes setClienteSeleccionado={setClienteSeleccionado}/>
                    </div>

                    {/* PERFIL_DE_CLIENTE_DERECHA (Ocupa 4/12) */}
                    <div className="lg:col-span-4 flex items-start justify-center sticky top-3 sm:top-4 md:top-6">
                        <PerfilCliente clienteSeleccionado={clienteSeleccionado} />
                    </div>
                </div>
            </div>
        </div>
        </div>

    );
};

export default Clientes;