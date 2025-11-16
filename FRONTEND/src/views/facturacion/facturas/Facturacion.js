import React, { useState } from "react";
import { FileText, Import, Plus } from "lucide-react";

// 1. IMPORTAR EL COMPONENTE NUEVAFactura
import NuevaFactura from "./NuevaFactura.js";
import ListaFacturas from "./ListaFacturas.js";

export default function Facturacion() {
  const [activeTab, setActiveTab] = useState("nueva");
  const [facturaParaImprimir, setFacturaParaImprimir] = useState(null);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100" style={{ fontFamily: 'Poppins' }}>
      {/* HEADER Y TÍTULO */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="">
          <div className="flex justify-between items-center"></div>
        </div>

        {/* NAVEGADOR DE PESTAÑAS */}

        <div className="flex  border-b border-gray-200">
          {/* PESTAÑA: Nueva Factura */}
          <button
            onClick={() => setActiveTab("nueva")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "nueva"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus size={20} />
              Nueva factura
            </div>
          </button>

          {/* PESTAÑA: Facturas */}
          <button
            onClick={() => setActiveTab("facturas")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "facturas"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              Historial de facturas
            </div>
          </button>
        </div>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
