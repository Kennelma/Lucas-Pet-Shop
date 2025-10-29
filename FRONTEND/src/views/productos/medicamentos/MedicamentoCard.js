import React from "react";

const MedicamentoTable = ({ 
  medicamentos,
  stockTotals,
  lotesCounts,
  onEditar, 
  onAgregarLote, 
  onVerLotes,
  onEliminar 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto / SKU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Presentación
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contenido
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lotes
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {medicamentos.map((medicamento) => {
            const stockTotal = stockTotals[medicamento.id_producto_pk] || 0;
            const lotesCount = lotesCounts[medicamento.id_producto_pk] || 0;
            
            return (
              <tr 
                key={medicamento.id_producto_pk}
                className={`hover:bg-gray-50 ${
                  medicamento.activo ? '' : 'bg-gray-100 opacity-70'
                }`}
              >
                {/* Estado */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    medicamento.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      medicamento.activo ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    {medicamento.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>

                {/* Producto/SKU */}
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-sm text-gray-900 uppercase">
                      {medicamento.nombre_producto}
                    </div>
                    <div className="text-xs text-gray-500">
                      SKU: {medicamento.sku || 'N/A'}
                    </div>
                  </div>
                </td>

                {/* Presentación */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {medicamento.presentacion_medicamento}
                </td>

                {/* Tipo */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {medicamento.tipo_medicamento}
                </td>

                {/* Contenido */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {medicamento.cantidad_contenido} {medicamento.unidad_medida}
                </td>

                {/* Precio */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-900">
                    L. {medicamento.precio_producto.toFixed(2)}
                  </span>
                </td>

                {/* Stock */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    stockTotal > 5 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stockTotal}
                  </span>
                </td>

                {/* Lotes */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lotesCount} lote(s)
                </td>

                {/* Acciones */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {/* Editar */}
                    <button
                      className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                      onClick={() => onEditar(medicamento)}
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
                        <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/>
                      </svg>
                    </button>

                    {/* Eliminar */}
                    <button
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      onClick={() => onEliminar(medicamento)}
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                        <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
                      </svg>
                    </button>

                    {/* Agregar Lote */}
                    <button
                      className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                      onClick={() => onAgregarLote(medicamento)}
                      title="Agregar Lote"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
                      </svg>
                    </button>

                    {/* Ver Lotes */}
                    <button
                      className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                      onClick={() => onVerLotes(medicamento)}
                      title="Ver Lotes"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 576 512">
                        <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 17.7 0 25.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-17.7 0-25.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-92.7-69.4z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {medicamentos.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg mt-4">
          <p className="text-gray-600 text-lg">No se encontraron medicamentos</p>
          <p className="text-sm text-gray-500 mt-2">Haz clic en "+ MEDICAMENTO" para agregar uno nuevo</p>
        </div>
      )}
    </div>
  );
};

export default MedicamentoTable;