import React from 'react';

//COMPONENTE PARA INGRESAR MONTOS DE PAGO POR CADA MÉTODO SELECCIONADO
function InputMontos({
  metodos,                  //ARRAY DE MÉTODOS DE PAGO DISPONIBLES
  metodosSeleccionados,     //ARRAY DE IDS DE MÉTODOS SELECCIONADOS
  paymentAmounts,           //OBJETO CON MONTOS INGRESADOS {id_metodo: monto}
  onAmountChange,           //FUNCIÓN PARA MANEJAR CAMBIOS EN INPUTS
  onAmountBlur,             //FUNCIÓN PARA MANEJAR PÉRDIDA DE FOCO
  tipoPago,                 //TIPO DE PAGO: 'TOTAL' O 'PARCIAL'
  total                     //MONTO TOTAL A PAGAR
}) {
  //SI NO HAY MÉTODOS SELECCIONADOS, NO MOSTRAR NADA
  if (metodosSeleccionados.length === 0) return null;

  return (
    <div>
      {/* TÍTULO DINÁMICO SEGÚN TIPO DE PAGO */}
      <p className="text-xs font-medium text-gray-700 mb-1">
        {tipoPago === 'PARCIAL' ? 'Distribuya el monto' : 'Monto a pagar'}
      </p>

      {/* MENSAJE DE AYUDA PARA DOS MÉTODOS */}
      {metodosSeleccionados.length === 2 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
          <p className="text-xs text-blue-800 text-center">
            💡 Ingrese el monto en el primer método, el segundo se completará automáticamente
          </p>
        </div>
      )}

      <div className="space-y-1">
        {metodosSeleccionados.map((idMetodo, index) => {
          //BUSCAR INFORMACIÓN DEL MÉTODO EN EL ARRAY DE MÉTODOS
          const metodo = metodos.find((m) => m.id_metodo_pago_pk === idMetodo);
          const Icono = metodo.icon;

          //DETERMINAR SI EL INPUT DEBE SER READONLY
          //CUANDO HAY 2 MÉTODOS: EL SEGUNDO SE CALCULA AUTOMÁTICAMENTE
          //TOTAL: SOLO EFECTIVO ES EDITABLE (PERMITE PAGAR DE MÁS)
          const esReadOnly = metodosSeleccionados.length === 2 && index === 1
            ? true  // Segundo método en pago dual siempre es readonly
            : tipoPago === 'TOTAL' && metodo.metodo_pago !== 'EFECTIVO';

          const esEfectivo = metodo.metodo_pago === 'EFECTIVO';

          return (
            <div key={idMetodo} className="space-y-1">
              {/* INPUT PARA INGRESAR MONTO DEL MÉTODO */}
              <div className="flex items-center gap-2">
                <Icono className="w-3 h-3 text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmounts[idMetodo] || ''}
                  onChange={(e) => onAmountChange(idMetodo, e.target.value)}
                  onBlur={(e) => onAmountBlur && onAmountBlur(idMetodo, e.target.value)}
                  placeholder="0.00"
                  readOnly={esReadOnly}
                  className={`flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${
                    esReadOnly 
                      ? 'bg-orange-50 border-orange-200 cursor-not-allowed text-orange-800' 
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <span className="text-xs text-gray-500 w-20 text-right">
                  {metodo.metodo_pago === 'TRANSFERENCIA' ? 'Transfer.' : metodo.metodo_pago}
                </span>
                {/* INDICADOR DE CÁLCULO AUTOMÁTICO */}
                {metodosSeleccionados.length === 2 && index === 1 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded text-center whitespace-nowrap">
                    Auto
                  </span>
                )}
              </div>

              {/* CAMPO DE CAMBIO - SOLO PARA EFECTIVO EN PAGO TOTAL */}
              {tipoPago === 'TOTAL' && esEfectivo && (
                <div className="flex items-center gap-2">
                  <Icono className="w-3 h-3 text-gray-500" />
                  <input
                    type="number"
                    step="0.01"
                    value={
                      paymentAmounts[idMetodo]
                        ? Math.max(0, parseFloat(paymentAmounts[idMetodo]) - total).toFixed(2)
                        : '0.00'
                    }
                    readOnly={true}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  />
                  <span className="text-xs text-gray-500 w-20 text-right">Cambio</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InputMontos;
