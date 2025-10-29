import React, { useState } from 'react';
import { FileText, Import, Plus } from 'lucide-react';

// 1. IMPORTAR EL COMPONENTE NUEVAFactura
import NuevaFactura from './NuevaFactura.js'
import ListaFacturas from './ListaFacturas.js';


export default function Facturacion () {

    const [activeTab, setActiveTab] = useState('nueva');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

            {/* HEADER Y TÍTULO */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Módulo de facturacion</h2>
                        </div>
                    </div>
                </div>

                {/* NAVEGADOR DE PESTAÑAS */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-2 border-b border-gray-200">
                        {/* PESTAÑA: Nueva Factura */}
                        <button
                            onClick={() => setActiveTab('nueva')}
                            className={`px-6 py-3 font-semibold transition-all ${
                                activeTab === 'nueva'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Plus size={20} />
                                Nueva Factura


                            </div>
                        </button>

                        {/* PESTAÑA: Facturas */}
                        <button
                            onClick={() => setActiveTab('facturas')}
                            className={`px-6 py-3 font-semibold transition-all ${
                                activeTab === 'facturas'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText size={20} />
                                Facturas
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENIDO DE LAS PESTAÑAS */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* 2. RENDERIZADO CONDICIONAL */}
                {activeTab === 'nueva' && (
                    <NuevaFactura />
                )}

                {activeTab === 'facturas' && (
                    <><ListaFacturas /></>
                )}
            </div>
        </div>
    );
}