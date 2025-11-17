import React, { useState, useEffect } from "react";

//IMPORTACION DE LOS ARCHIVOS COMPLEMENTARIOS DEL MODULO DE CLIENTES
import TablaClientes from "./tabla-clientes.js";
import PerfilCliente from "./perfil-cliente.js";


const Clientes = () => {

    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    //DEBUG_PARA_VER_CAMBIOS_EN_CLIENTE_SELECCIONADO
    useEffect(() => {
        console.log('Cliente actualizado en Clientes.js:', clienteSeleccionado);
    }, [clienteSeleccionado]);

    return (
        
        <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
        <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
            {/* Título */}
            <div className="rounded-xl p-6 mb-3"
                style={{
                    backgroundImage: 'url("/H2.jpg")',
                    backgroundColor: '#DEFFAD',
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

            {/* LAYOUT_DE_DOS_COLUMNAS_TABLA_Y_PERFIL: Ajustado a 8/4 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* TABLA_DE_CLIENTES_IZQUIERDA (Ocupa 8/12) */}
                <div className="lg:col-span-8 bg-white border border-gray-300 rounded-xl overflow-hidden">
                    <TablaClientes setClienteSeleccionado={setClienteSeleccionado}/>
                </div>

                {/* PERFIL_DE_CLIENTE_DERECHA (Ocupa 4/12) */}
                <div className="lg:col-span-4 bg-white border border-gray-300 rounded-xl overflow-hidden">
                    <PerfilCliente clienteSeleccionado={clienteSeleccionado} />
                </div>
            </div>

        </div>
    </div>
    );
};

export default Clientes;