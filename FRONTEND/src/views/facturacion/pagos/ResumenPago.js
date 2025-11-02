import React from 'react';

function ResumenPago({ total, tipoPago, totalPagado, restante, esCompacto = false }) {
  if (esCompacto) {
    // Versión compacta para pago parcial
    return (
      <div className="flex gap-2">
        {/* Bloque TOTAL */}
        <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center space-y-0.5 w-full">
          <p className="text-xs text-gray-600 leading-none">TOTAL A PAGAR</p>
          <p className="text-sm font-bold text-blue-600 leading-none">L. {total.toFixed(2)}</p>
        </div>

        {/* Bloque Ingresado/Restante */}
        {totalPagado > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-[11px] w-full flex flex-col justify-center space-y-0.5">
            <span>SALDO L. {totalPagado.toFixed(2)}</span>
            <span className={`font-semibold ${Math.abs(restante) < 0.01 ? 'text-green-700' : 'text-red-600'}`}>
              RESTANTE: L. {Math.abs(restante).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Versión normal para pago total
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
      <p className="text-xs text-gray-600">TOTAL</p>
      <p className="text-base font-bold text-blue-600">L. {total.toFixed(2)}</p>
    </div>
  );
}

export default ResumenPago;
