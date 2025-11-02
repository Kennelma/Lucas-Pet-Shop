import React from 'react';

//COMPONENTE PARA SELECCIONAR MÉTODOS DE PAGO (EFECTIVO, TARJETA, TRANSFERENCIA)
//PERMITE SELECCIONAR HASTA maxMetodos (POR DEFECTO 2)
function SeleccionMetodos({ metodos, metodosSeleccionados, onToggleMetodo, tipoPago, maxMetodos = 2 }) {
  return (
    <div>
      {/* TÍTULO DINÁMICO SEGÚN TIPO DE PAGO */}
      <p className="text-xs font-medium text-gray-700 mb-1">
        {tipoPago === 'PARCIAL' ? 'Seleccione dos métodos' : 'Seleccione método'}
      </p>

      {/* GRID DE MÉTODOS DE PAGO */}
      <div className="grid grid-cols-3 gap-1">
        {metodos.map((metodo) => {
          const Icono = metodo.icon;
          const estaSeleccionado = metodosSeleccionados.includes(metodo.id_metodo_pago_pk);

          //DESHABILITAR SI YA SE ALCANZÓ EL MÁXIMO Y ESTE NO ESTÁ SELECCIONADO
          //SOLO PARA PAGO PARCIAL (TOTAL PERMITE 1 O 2)
          const estaDeshabilitado = !estaSeleccionado && metodosSeleccionados.length >= maxMetodos && tipoPago === 'PARCIAL';

          return (
            <button
              key={metodo.id_metodo_pago_pk}
              onClick={() => !estaDeshabilitado && onToggleMetodo(metodo.id_metodo_pago_pk)}
              disabled={estaDeshabilitado}
              className={`py-3 px-1.5 border rounded transition flex flex-col items-center justify-center space-y-1 ${
                estaSeleccionado
                  ? 'border-purple-600 bg-purple-100'
                  : estaDeshabilitado
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icono className={`w-4 h-4 ${estaSeleccionado ? 'text-purple-700' : 'text-gray-400'}`} />
              <p className="text-xs text-gray-700 text-center leading-tight">{metodo.metodo_pago}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SeleccionMetodos;
