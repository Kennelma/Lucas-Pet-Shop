import React from "react";

const MedicamentoCard = ({ 
  medicamento, 
  stockTotal, 
  lotesCount, 
  onEditar, 
  onAgregarLote, 
  onVerLotes,
  onEliminar 
}) => {
  return (
    <div 
      className={`rounded-lg shadow-md p-4 relative border-2 ${ 
        medicamento.activo 
          ? 'bg-white border-blue-400' 
          : 'bg-gray-100 opacity-70 border-gray-300'
      }`}
      style={{ 
        fontFamily: "'Poppins', sans-serif",
        width: '280px', 
        minHeight: '200px' 
      }}
    >
      {/* Indicador de estado */}
      <div className="absolute top-2 right-3">
        <span className={`flex items-center gap-1 text-xs font-semibold ${ 
          medicamento.activo ? 'text-green-600' : 'text-gray-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${ 
            medicamento.activo ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
          {medicamento.activo ? 'ACTIVO' : 'INACTIVO'}
        </span>
      </div>

      {/* Contenido principal */}
      <div className="text-center mt-2 mb-3">
        {/* Nombre del producto - SKU */}
        <div className="font-bold text-sm mb-3 text-black uppercase px-2">
          {medicamento.nombre_producto} - {medicamento.sku || 'N/A'}
        </div>

        {/* Cantidad, Presentación y Tipo en la misma línea */}
        <div className="text-xs text-black mb-3 font-medium">
          {medicamento.cantidad_contenido} {medicamento.unidad_medida} {medicamento.presentacion_medicamento} {medicamento.tipo_medicamento}
        </div>

        {/* Precio */}
        <div className="text-base font-bold text-black mb-2">
          L. {medicamento.precio_producto.toFixed(2)}
        </div>

        {/* Stock */}
        <div className={`text-base font-bold mb-2 ${ 
          stockTotal > 5 ? 'text-green-600' : 'text-red-600'
        }`}>
          STOCK: {stockTotal}
        </div>

        {/* Lotes */}
        <div className="text-xs text-black font-medium mb-8">
          {lotesCount} LOTE(S) DISPONIBLE(S)
        </div>
      </div>

      {/* Botones de acción */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-1">
        {/* Botones izquierda */}
        <div className="flex items-center space-x-2">
          <button
            className="text-blue-500 hover:text-blue-700 p-2 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEditar();
            }}
            title="Editar"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
              <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/>
            </svg>
          </button>
          <button
            className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEliminar();
            }}
            title="Eliminar"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
              <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
            </svg>
          </button>
        </div>
        
        {/* Botones derecha */}
        <div className="flex items-center space-x-2">
          <button
            className="text-black hover:text-gray-700 p-2 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAgregarLote();
            }}
            title="Agregar Lote"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
            </svg>
          </button>
          <button
            className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors text-lg"
            onClick={(e) => {
              e.stopPropagation();
              onVerLotes();
            }}
            title="Ver Lotes"
          >
            📊
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicamentoCard;