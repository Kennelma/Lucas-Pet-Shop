import React from 'react';

function SeleccionMetodos({ metodos, metodosSeleccionados, onToggleMetodo, tipoPago, maxMetodos = 2 }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">
        {tipoPago === 'parcial' ? 'Seleccione dos métodos' : 'Seleccione método'}
      </p>
      <div className="grid grid-cols-3 gap-1">
        {metodos.map((metodo) => {
          const Icon = metodo.icon;
          const isSelected = metodosSeleccionados.includes(metodo.id);
          const isDisabled = !isSelected && metodosSeleccionados.length >= maxMetodos && tipoPago === 'parcial';

          return (
            <button
              key={metodo.id}
              onClick={() => !isDisabled && onToggleMetodo(metodo.id)}
              disabled={isDisabled}
              className={`py-3 px-1.5 border rounded transition flex flex-col items-center justify-center space-y-1 ${
                isSelected
                  ? 'border-purple-600 bg-purple-100'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-700' : 'text-gray-400'}`} />
              <p className="text-xs text-gray-700 text-center leading-tight">{metodo.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SeleccionMetodos;
