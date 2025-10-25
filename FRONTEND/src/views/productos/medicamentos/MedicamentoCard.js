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
      className={`rounded-lg shadow-md p-4 pb-12 relative min-h-[150px] ${ 
        medicamento.activo 
          ? 'bg-white border-2 border-blue-300' 
          : 'bg-gray-100 opacity-70 border-2 border-gray-300'
      }`}
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="absolute top-2 right-2">
        <span className={`flex items-center gap-1 text-xs ${ 
          medicamento.activo ? 'text-green-600' : 'text-gray-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${ 
            medicamento.activo ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
          {medicamento.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="text-center mb-4 mt-6">
        <div className="font-bold text-base mb-2 text-black" style={{ textAlign: 'justify', textAlignLast: 'center' }}>
          {medicamento.nombre_producto}
        </div>
        
        <div className="text-xs font-mono text-black mb-2 bg-green-50 py-1 px-2 rounded border border-green-300">
          {medicamento.sku}
        </div>

        <div className="text-xs text-black mb-1" style={{ textAlign: 'justify', textAlignLast: 'center' }}>
          {medicamento.presentacion_medicamento}
        </div>
        <div className="text-xs text-black mb-2" style={{ textAlign: 'justify', textAlignLast: 'center' }}>
          {medicamento.tipo_medicamento}
        </div>

        <div className="text-xs text-black mb-3 font-semibold">
          {medicamento.cantidad_contenido} {medicamento.unidad_medida}
        </div>

        <div className="text-lg font-bold text-black mb-2">
          L. {medicamento.precio_producto.toFixed(2)}
        </div>

        <div className={`text-xl font-bold mb-1 ${ 
          stockTotal > 5 ? 'text-green-600' : 'text-red-600'
        }`}>
          Stock: {stockTotal}
        </div>

        <div className="text-xs text-black mt-2 py-1 px-2 rounded inline-block">
          {lotesCount} lote(s) disponible(s)
        </div>

        {stockTotal <= 5 && (
          <div className="mt-2 text-xs text-red-600 font-bold bg-red-50 py-1 px-2 rounded">
            STOCK BAJO
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
          📊
        </button>
        <button 
          onClick={onEliminar} 
          className="p-1 hover:scale-110 transition-transform text-red-600" 
          title="Eliminar Medicamento"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default MedicamentoCard;