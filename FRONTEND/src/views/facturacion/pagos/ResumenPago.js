import React from 'react';

//COMPONENTE PARA MOSTRAR RESUMEN DEL PAGO
//SOPORTA DOS MODOS: COMPACTO (CON SALDO Y RESTANTE) Y NORMAL (SOLO TOTAL)
function ResumenPago({ total, tipoPago, totalPagado, restante, esCompacto = false }) {

  if (esCompacto) {
    //VERSIÓN COMPACTA - MUESTRA TOTAL, SALDO INGRESADO Y RESTANTE
    //USADA EN PAGO PARCIAL DONDE SE NECESITA VER EL SALDO PENDIENTE
    return (
      <div className="flex gap-2">
        {/* BLOQUE: TOTAL A PAGAR */}
        <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center space-y-0.5 w-full">
          <p className="text-xs text-gray-600 leading-none">TOTAL A PAGAR</p>
          <p className="text-sm font-bold text-blue-600 leading-none">L. {total.toFixed(2)}</p>
        </div>

        {/* BLOQUE: MONTO INGRESADO Y SALDO RESTANTE */}
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

  //VERSIÓN NORMAL - SOLO MUESTRA EL TOTAL A PAGAR
  //USADA EN PAGO TOTAL DONDE NO SE REQUIERE DETALLE DE SALDO
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
      <p className="text-xs text-gray-600">TOTAL</p>
      <p className="text-base font-bold text-blue-600">L. {total.toFixed(2)}</p>
    </div>
  );
}

export default ResumenPago;
