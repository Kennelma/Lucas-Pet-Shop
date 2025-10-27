import React from "react";


import EncabezadoFactura from "./EncabezadoFactura";
import DetallesFactura from "./DetallesFactura";

const NuevaFactura = () => {
    // NOTA: En la implementación real, aquí se definirían los props que
    // luego se pasarían a los componentes hijos. Aquí solo mostramos el esqueleto.

    return (
        <div className="space-y-6 p-4 max-w-5xl mx-auto bg-white shadow-xl rounded-lg">

            {/* CONTENEDOR DE ENCABEZADO (VISTA 1) */}
            <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg bg-blue-50">
                <p className="text-blue-700 font-semibold mb-2">
                    CONTENEDOR DE ENCABEZADO
                </p>
                <EncabezadoFactura />
            </div>

            {/* CONTENEDOR DE DETALLES (VISTA 2) */}
            <div className="border-2 border-dashed border-green-300 p-4 rounded-lg bg-green-50">
                <p className="text-green-700 font-semibold mb-2">
                    CONTENEDOR DE DETALLES
                </p>
                <DetallesFactura/>
            </div>

        </div>
    );
};

export default NuevaFactura;