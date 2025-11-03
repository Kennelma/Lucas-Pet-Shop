import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import PagoTotal from './PagoTotal';
import PagoParcial from './PagoParcial';
import { obtenerTiposPago } from '../../../AXIOS.SERVICES/payments-axios';

const ModalPago = ({ show, onClose, total = 0, onPagoConfirmado, factura }) => {
  const [tipoPago, setTipoPago] = useState('');
  const [tiposPago, setTiposPago] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      cargarTiposPago();
    }
  }, [show]);

  const cargarTiposPago = async () => {
    setLoading(true);
    try {
      const response = await obtenerTiposPago();
      if (response.success && response.data) {
        setTiposPago(response.data);
      }
    } catch (error) {
      console.error('Error al cargar tipos de pago:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTipoPagoSelect = (tipo) => {
    setTipoPago(tipo);
  };

  const handleBack = () => {
    setTipoPago('');
  };

  const handleConfirm = (datosPago) => {
    // Agregar los datos completos de la factura y tipo de pago
    const datosCompletos = {
      numero_factura: factura?.numero_factura,
      id_tipo: tipoPago.id,
      total: factura?.total || total,
      saldo: factura?.saldo || total,
      ...datosPago
    };

    if (onPagoConfirmado) {
      onPagoConfirmado(datosCompletos);
    }
    handleBack();
    if (onClose) {
      onClose();
    }
  };

  const handleCloseModal = () => {
    handleBack();
    if (onClose) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Procesar Pago
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selección de tipo de pago */}
          {!tipoPago && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Monto Total</p>
                <p className="text-3xl font-bold text-gray-900">L {total.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Pago
                </label>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {tiposPago.map((tipo) => (
                      <button
                        key={tipo.id_tipo_pago_pk}
                        onClick={() => handleTipoPagoSelect({
                          id: tipo.id_tipo_pago_pk,
                          nombre: tipo.tipo_pago.trim()
                        })}
                        className="p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 font-medium transition"
                      >
                        {tipo.tipo_pago.trim()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pago total */}
          {tipoPago && tipoPago.nombre?.toUpperCase() === 'TOTAL' && (
            <PagoTotal
              total={total}
              idTipoPago={tipoPago.id}
              onBack={handleBack}
              onConfirm={handleConfirm}
            />
          )}

          {/* Pago parcial */}
          {tipoPago && tipoPago.nombre?.toUpperCase() === 'PARCIAL' && (
            <PagoParcial
              total={total}
              idTipoPago={tipoPago.id}
              onBack={handleBack}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPago;