import React, { useMemo } from 'react';

const limpiaIdentidad = (s = "") => s.replace(/[^\d]/g, ""); // solo dígitos (0801198712345)
const identidadEsValida = (s) => limpiaIdentidad(s).length === 13; // ajusta tu regla

const EncabezadoFactura = ({
  RTN,
  setRTN,
}) => {

  const esValida = useMemo(() => identidadEsValida(identidad), [identidad]);

  const handleSubmit = async () => {
    if (!esValida || buscando) return;
    await onBuscarCliente(limpiaIdentidad(identidad));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-3">Factura</h1>

      <div className="grid grid-cols-2 gap-3 items-end mb-4 border-b pb-4 border-gray-200">
        {/* Identidad + Buscar */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Identidad</label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={identidad}
              onChange={(e) => setIdentidad(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0801-1987-12345"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!esValida || buscando}
              className={`absolute right-1.5 h-[70%] px-2 text-xs text-white rounded-md transition-colors
                ${(!esValida || buscando) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {buscando ? '...' : 'Buscar'}
            </button>
          </div>
          {errorMsg && <p className="mt-1 text-xs text-red-600">{errorMsg}</p>}
          {!errorMsg && !esValida && identidad && (
            <p className="mt-1 text-[11px] text-gray-500">La identidad debe tener 13 dígitos.</p>
          )}
        </div>

        {/* RTN */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">RTN*</label>
          <input
            type="text"
            value={RTN}
            onChange={(e) => setRTN(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0000-0000-000000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Vendedor */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Vendedor</label>
          <input
            type="text"
            value={vendedor}
            readOnly
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-default"
            placeholder="Nombre del vendedor"
          />
        </div>

        {/* Sucursal */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sucursal</label>
          <input
            type="text"
            value={sucursal}
            readOnly
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-default"
            placeholder="Sucursal de la operación"
          />
        </div>
      </div>
    </div>
  );
};

export default EncabezadoFactura;
