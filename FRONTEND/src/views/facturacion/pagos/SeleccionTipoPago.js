import React from 'react';
import { Receipt, Wallet } from 'lucide-react';
import { obtenerTiposPago } from '../../../AXIOS.SERVICES/payments-axios';

function SeleccionTipoPago({ total, onSelectTipo }) {

  // MANEJAR SELECCION DE TIPO Y OBTENER ID DEL BACKEND
  const handleSelectTipo = async (tipoNombre) => {
    try {
      const response = await obtenerTiposPago(tipoNombre.toUpperCase());

      if (response.success && response.data.length > 0) {
        const tipoData = response.data[0];

        //PASAR AL PADRE: { tipo: 'total'|'parcial', id: 1|2 }
        onSelectTipo({
          tipo: tipoNombre,
          id: tipoData.id_tipo_pago_pk,
          nombre: tipoData.tipo_pago
        });
      } else {
        alert('Error al obtener tipo de pago');
      }
    } catch (error) {
      console.error('Error al obtener tipo de pago:', error);
      alert('Error al obtener tipo de pago');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Total */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600 mb-0.5">TOTAL A PAGAR</p>
        <p className="text-2xl font-bold text-blue-600">L. {total.toFixed(2)}</p>
      </div>

      {/* Opciones */}
      <div className="space-y-2">
        <button
          onClick={() => handleSelectTipo('total')}
          className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900">Pago Total</p>
            <p className="text-xs text-gray-600">L. {total.toFixed(2)}</p>
          </div>
        </button>

        <button
          onClick={() => handleSelectTipo('parcial')}
          className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900">Pago Parcial</p>
            <p className="text-xs text-gray-600">Pagar con dos métodos</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default SeleccionTipoPago;
