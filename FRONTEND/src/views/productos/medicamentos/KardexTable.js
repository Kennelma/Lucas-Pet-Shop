import React, { useState, useMemo } from "react";

const KardexTable = ({ kardexData }) => {
  const [filterValue, setFilterValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterValue) return kardexData;
    const lower = filterValue.toLowerCase();
    return kardexData.filter((item) =>
      item.nombre_producto.toLowerCase().includes(lower) ||
      item.codigo_lote?.toLowerCase().includes(lower)
    );
  }, [kardexData, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const items = filteredItems.slice(start, start + rowsPerPage);

  if (kardexData.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">📦 No se encontraron movimientos</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar medicamento o lote..."
            value={filterValue}
            onChange={(e) => {
              setFilterValue(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <span className="text-sm text-gray-500">
          Filas por página: 
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="ml-2 border-0 bg-transparent text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Medicamento
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Código Lote
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                Costo Unit.
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                Origen
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Usuario
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((mov, idx) => (
              <tr key={mov.id_movimiento_pk || idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {mov.nombre_producto}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {mov.codigo_lote || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  {mov.cantidad_movimiento}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  L. {parseFloat(mov.costo_unitario || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(mov.fecha_movimiento).toLocaleDateString('es-HN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    mov.tipo_movimiento === "ENTRADA"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {mov.tipo_movimiento}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {mov.origen_movimiento}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {mov.nombre_usuario_movimiento}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KardexTable;