import React from "react";

const MedicamentoCard = ({ 
  medicamento, 
  stockTotal, 
  lotesCount,
  onEditar,
  onAgregarLote,
  onVerLotes
}) => {
  return (
    <div 
      className={`rounded-lg shadow-md p-4 pb-12 relative min-h-[150px] ${
        medicamento.activo 
          ? 'bg-white border-2 border-purple-200' 
          : 'bg-gray-100 opacity-70 border-2 border-gray-300'
      }`}
    >
      <div className="absolute top-2 right-2">
        <span className={`flex items-center gap-1 text-xs ${
          medicamento.activo ? 'text-emerald-600' : 'text-gray-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            medicamento.activo ? 'bg-emerald-500' : 'bg-gray-400'
          }`}></span>
          {medicamento.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="text-center mb-4 mt-6">
        <div className="font-bold text-base mb-2 text-gray-800">
          {medicamento.nombre_producto}
        </div>
        
        <div className="text-xs font-mono text-purple-600 mb-2 bg-purple-50 py-1 px-2 rounded">
          {medicamento.sku}
        </div>

        <div className="text-xs text-gray-600 mb-1">
          {medicamento.presentacion_medicamento}
        </div>
        <div className="text-xs text-gray-500 mb-2">
          {medicamento.tipo_medicamento}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          {medicamento.cantidad_contenido} {medicamento.unidad_medida}
        </div>

        <div className="text-lg font-bold text-purple-700 mb-2">
          L. {medicamento.precio_producto.toFixed(2)}
        </div>

        <div className={`text-xl font-bold mb-1 ${
          stockTotal < medicamento.stock_minimo 
            ? 'text-red-600' 
            : stockTotal < medicamento.stock_minimo * 2 
              ? 'text-orange-600' 
              : 'text-green-600'
        }`}>
          Stock: {stockTotal}
        </div>

        <div className="text-xs text-blue-600 mt-2 bg-blue-50 py-1 px-2 rounded inline-block">
          {lotesCount} lote(s) disponible(s)
        </div>

        {stockTotal < medicamento.stock_minimo && (
          <div className="mt-2 text-xs text-red-600 font-bold bg-red-50 py-1 px-2 rounded">
            ⚠️ STOCK BAJO
          </div>
        )}
      </div>

      <div className="absolute bottom-2 left-2 flex gap-1">
        <button
          onClick={onEditar}
          className="p-1 hover:scale-110 transition-transform"
          title="Editar"
        >
          ⚙️
        </button>
        <button
          onClick={onAgregarLote}
          className="p-1 hover:scale-110 transition-transform"
          title="Agregar Lote"
        >
          ➕
        </button>
        <button
          onClick={onVerLotes}
          className="p-1 hover:scale-110 transition-transform"
          title="Ver Lotes"
        >
          📦
        </button>
      </div>
    </div>
  );
};

export default MedicamentoCard;