import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
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
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los tipos de pago',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error al cargar tipos de pago:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#d33'
      });
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

  const handleConfirm = async (datosPago) => {
    console.log('🎯 ModalPago.handleConfirm - INICIO');
    // Agregar los datos completos de la factura y tipo de pago
    const datosCompletos = {
      numero_factura: factura?.numero_factura,
      id_tipo: tipoPago.id,
      total: factura?.total || total,
      saldo: factura?.saldo || total,
      ...datosPago
    };

    console.log('📦 Datos completos a enviar:', datosCompletos);

    if (onPagoConfirmado) {
      console.log('📤 Llamando a onPagoConfirmado (handlePaymentSuccess)');
      await onPagoConfirmado(datosCompletos);
    }
    console.log('🔄 Limpiando modal...');
    handleBack();
    console.log('✅ ModalPago.handleConfirm - FIN');
  };

  const handleCloseModal = () => {
    handleBack();
    if (onClose) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            PROCESAR PAGO
          </h2>
          <button
            onClick={handleCloseModal}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Selección de tipo de pago */}
          {!tipoPago && (
            <div className="space-y-3">
              {/* Resumen de factura */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Factura:</span>
                  <span className="font-medium text-gray-900">{factura?.numero_factura || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">L {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Tipos de pago separados en divs */}
              {loading ? (
                <div className="text-center py-4 text-gray-500">Cargando...</div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Seleccione el tipo de pago</p>

                  {/* PAGO TOTAL */}
                  {tiposPago.find(tipo => tipo.tipo_pago === 'TOTAL') && (
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-3 shadow-sm">
                      <button
                        onClick={() => handleTipoPagoSelect({
                          id: tiposPago.find(tipo => tipo.tipo_pago === 'TOTAL').id_tipo_pago_pk,
                          nombre: 'TOTAL'
                        })}
                        className="w-full text-left hover:bg-blue-100 rounded-xl p-1 transition-colors uppercase"
                      >
                        <div className="font-semibold text-blue-900 text-base mb-1">
                          PAGO TOTAL
                        </div>
                        <div className="text-xs text-blue-700">
                          Pagar L.{total.toFixed(2)} completos → ÚNICO o MIXTO (1-2 métodos)
                        </div>
                      </button>
                    </div>
                  )}

                  {/* PAGO PARCIAL */}
                  {tiposPago.find(tipo => tipo.tipo_pago === 'PARCIAL') && (
                    <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-3 shadow-sm">
                      <button
                        onClick={() => handleTipoPagoSelect({
                          id: tiposPago.find(tipo => tipo.tipo_pago === 'PARCIAL').id_tipo_pago_pk,
                          nombre: 'PARCIAL'
                        })}
                        className="w-full text-left hover:bg-orange-100 rounded-xl p-1 transition-colors uppercase"
                      >
                        <div className="font-semibold text-orange-900 text-base mb-1">
                          PAGO PARCIAL
                        </div>
                        <div className="text-xs text-orange-700">
                          Abono parcial → queda saldo pendiente → ÚNICO (1 método)
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
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