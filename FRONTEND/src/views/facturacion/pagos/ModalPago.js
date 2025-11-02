import React, { useState } from 'react';
import { X, Banknote, CreditCard, Building2, CheckCircle2 } from 'lucide-react';

function ModalPago({ show, numero_factura, total, onClose }) {
  const [vista, setVista] = useState('tipo'); // 'tipo' o 'metodos'
  const [tipoPago, setTipoPago] = useState('total'); // 'total' o 'parcial'

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">

        {vista === 'tipo' ? (
          // VISTA 1: SELECCIÓN DE TIPO DE PAGO
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">PROCESAR PAGO</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Info de factura */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Factura:</span>
                  <span className="font-medium text-gray-900">{numero_factura}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">L {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botones de tipo de pago */}
              <div className="space-y-2">
                <button
                  onClick={() => setVista('metodos')}
                  className="w-full p-4 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-blue-900">PAGO TOTAL</div>
                      <div className="text-sm text-blue-700">Un solo método de pago</div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                </button>

                <button
                  onClick={() => { setTipoPago('parcial'); setVista('metodos'); }}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">PAGO PARCIAL</div>
                    <div className="text-sm text-gray-600">Hasta dos métodos de pago</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          // VISTA 2: SELECCIÓN DE MÉTODOS Y MONTOS
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">MÉTODOS DE PAGO</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tipoPago === 'parcial' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {tipoPago === 'parcial' ? 'Parcial' : 'Total'}
                </span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Resumen de pago */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Total de Factura</span>
                  <span className="text-xl font-bold text-blue-900">L {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white transition-all">
                  <Banknote className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-xs font-medium text-center text-gray-700">EFECTIVO</div>
                </button>
                <button className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white transition-all">
                  <CreditCard className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-xs font-medium text-center text-gray-700">TARJETA</div>
                </button>
                <button className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white transition-all">
                  <Building2 className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-xs font-medium text-center text-gray-700">TRANSFERENCIA</div>
                </button>
              </div>

              {/* Input de monto */}
              <div className="space-y-2">
                <div className="bg-white border-2 border-green-500 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">EFECTIVO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">L</span>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={total.toFixed(2)}
                      className="flex-1 text-2xl font-bold text-gray-900 bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {tipoPago === 'total' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                  💡 <strong>Efectivo:</strong> Puede pagar de más, se calculará el cambio automáticamente
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={() => setVista('tipo')}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-white text-gray-700 font-medium rounded"
              >
                Atrás
              </button>
              <button className="flex-1 py-2 px-4 text-sm font-medium rounded bg-green-500 hover:bg-green-600 text-white">
                PROCESAR PAGO E IMPRIMIR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalPago;

