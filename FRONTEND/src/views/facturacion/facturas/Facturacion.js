import React, { useState } from "react";
import { FileText, Import, Plus } from "lucide-react";

// 1. IMPORTAR EL COMPONENTE NUEVAFactura
import NuevaFactura from "./NuevaFactura.js";
import ListaFacturas from "./ListaFacturas.js";

export default function Facturacion() {
  const [activeTab, setActiveTab] = useState("nueva");
  const [facturaParaImprimir, setFacturaParaImprimir] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins' }}>
      {/* HEADER Y TÍTULO */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        {/* NAVEGADOR DE PESTAÑAS - RESPONSIVO */}
        <div className="overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-full">
            {/* PESTAÑA: Nueva Factura */}
            <button
              onClick={() => setActiveTab("nueva")}
              className={`px-3 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === "nueva"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Nueva factura</span>
                <span className="sm:hidden">Nueva</span>
              </div>
            </button>

            {/* PESTAÑA: Facturas */}
            <button
              onClick={() => setActiveTab("facturas")}
              className={`px-3 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === "facturas"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <FileText size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Historial de facturas</span>
                <span className="sm:hidden">Historial</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 min-h-[calc(100vh-100px)]">
        {/* 2. RENDERIZADO CONDICIONAL */}
        {activeTab === "nueva" && <NuevaFactura setActiveTab={setActiveTab} setFacturaParaImprimir={setFacturaParaImprimir} />}

        {activeTab === "facturas" && (
          <>
            <ListaFacturas facturaParaImprimir={facturaParaImprimir} setFacturaParaImprimir={setFacturaParaImprimir} />
          </>
        )}
      </div>
    </div>
  );
}