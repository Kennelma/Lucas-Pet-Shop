import React from 'react';

function InputMontos({
  metodos,
  metodosSeleccionados,
  paymentAmounts,
  onAmountChange,
  onAmountBlur,
  tipoPago,
  total
}) {
  if (metodosSeleccionados.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">
        {tipoPago === 'parcial' ? 'Distribuya el monto' : 'Monto a pagar'}
      </p>
      <div className="space-y-1">
        {metodosSeleccionados.map((methodId, index) => {
          const method = metodos.find((m) => m.id === methodId);
          const Icon = method.icon;
          const isReadOnly = tipoPago === 'parcial'
            ? metodosSeleccionados.length === 2 && index === 1
            : methodId !== 'EFECTIVO';

          const isEfectivo = methodId === 'EFECTIVO';

          return (
            <div key={methodId} className="space-y-1">
              {/* Input principal */}
              <div className="flex items-center gap-2">
                <Icon className="w-3 h-3 text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmounts[methodId] || ''}
                  onChange={(e) => onAmountChange(methodId, e.target.value)}
                  onBlur={(e) => onAmountBlur(methodId, e.target.value)}
                  placeholder="0.00"
                  readOnly={isReadOnly}
                  className={`flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                <span className="text-xs text-gray-500 w-20 text-right">
                  {method.name === 'Transferencia' ? 'Transfer.' : method.name}
                </span>
              </div>

              {/* Campo de cambio solo para efectivo en pago total */}
              {tipoPago === 'total' && isEfectivo && (
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3 text-gray-500" />
                  <input
                    type="number"
                    step="0.01"
                    value={
                      paymentAmounts[methodId]
                        ? Math.max(0, parseFloat(paymentAmounts[methodId]) - total).toFixed(2)
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
