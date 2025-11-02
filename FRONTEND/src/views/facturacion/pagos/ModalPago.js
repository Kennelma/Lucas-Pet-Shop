import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, Building2 } from 'lucide-react';
import { procesarPago, obtenerCatalogoMetodosPago } from '../../../AXIOS.SERVICES/payments-axios';
import SeleccionTipoPago from './SeleccionTipoPago';
import ResumenPago from './ResumenPago';
import SeleccionMetodos from './SeleccionMetodos';
import IngresoMontos from './IngresoMontos';

function ModalPago({ show, numero_factura, total, onClose, onSuccess }) {
  const [paymentStep, setPaymentStep] = useState('type');
  const [paymentType, setPaymentType] = useState(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const iconMap = {
    'EFECTIVO': Banknote,
    'TARJETA': CreditCard,
    'TRANSFERENCIA': Building2,
  };

  useEffect(() => {
    if (show) {
      setPaymentStep('type');
      setPaymentType(null);
      setSelectedPaymentMethods([]);
      setPaymentAmounts({});
      cargarMetodosPago();
    }
  }, [show]);

  const cargarMetodosPago = async () => {
    try {
      const response = await obtenerCatalogoMetodosPago();
      if (response.success && response.data.length > 0) {
        const metodosConIconos = response.data.map(metodo => ({
          id: metodo.id_metodo_pago_pk,
          nombre: metodo.metodo_pago,
          name: metodo.metodo_pago.charAt(0) + metodo.metodo_pago.slice(1).toLowerCase(),
          icon: iconMap[metodo.metodo_pago] || Banknote
        }));
        setPaymentMethods(metodosConIconos);
      }
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const selectPaymentType = (tipoData) => {
    setPaymentType(tipoData);
    setPaymentStep('methods');
  };

  const togglePaymentMethod = (methodId) => {
    if (paymentType.tipo === 'total') {
      setSelectedPaymentMethods([methodId]);
      setPaymentAmounts({ [methodId]: total.toFixed(2) });
    } else {
      if (selectedPaymentMethods.includes(methodId)) {
        const newSelected = selectedPaymentMethods.filter(id => id !== methodId);
        const newAmounts = { ...paymentAmounts };
        delete newAmounts[methodId];

        if (newSelected.length === 1) {
          newAmounts[newSelected[0]] = '';
        }

        setSelectedPaymentMethods(newSelected);
        setPaymentAmounts(newAmounts);
      } else {
        if (selectedPaymentMethods.length < 2) {
          const newSelected = [...selectedPaymentMethods, methodId];
          const newAmounts = { ...paymentAmounts };

          if (newSelected.length === 1) {
            newAmounts[methodId] = '';
          } else {
            const otherMethod = newSelected.find(id => id !== methodId);
            const otherAmount = parseFloat(paymentAmounts[otherMethod]) || 0;
            newAmounts[methodId] = Math.max(0, total - otherAmount).toFixed(2);
          }

          setSelectedPaymentMethods(newSelected);
          setPaymentAmounts(newAmounts);
        }
      }
    }
  };

  const getTotalPaid = () =>
    Object.values(paymentAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  const handlePaymentAmountChange = (methodId, value) => {
    const newAmounts = { ...paymentAmounts, [methodId]: value };

    if (paymentType?.tipo === 'parcial' && selectedPaymentMethods.length === 2) {
      const otherMethod = selectedPaymentMethods.find(id => id !== methodId);
      if (otherMethod) {
        newAmounts[otherMethod] = Math.max(0, total - (parseFloat(value) || 0)).toFixed(2);
      }
    }

    setPaymentAmounts(newAmounts);
  };

  const handlePaymentAmountBlur = (methodId, value) => {
    if (value && !isNaN(parseFloat(value))) {
      handlePaymentAmountChange(methodId, parseFloat(value).toFixed(2));
    }
  };

  const canProcessPayment = () => {
    if (!selectedPaymentMethods.length) return false;

    const totalPaid = getTotalPaid();

    if (paymentType?.tipo === 'total') {
      return selectedPaymentMethods[0] === 'EFECTIVO'
        ? totalPaid >= total
        : Math.abs(totalPaid - total) < 0.01;
    }

    return Math.abs(totalPaid - total) < 0.01;
  };

  const handleProcessPayment = async () => {
    if (!canProcessPayment()) {
      alert('Verifique los montos ingresados');
      return;
    }

    setLoading(true);
    try {
      const datosPago = {
        numero_factura,
        tipo_pago: paymentType.id,
        metodos: selectedPaymentMethods.map(methodId => {
          const metodo = paymentMethods.find(m => m.id === methodId);
          return {
            metodo: metodo.nombre,
            monto: parseFloat(paymentAmounts[methodId])
          };
        })
      };

      const response = await procesarPago(datosPago);

      if (response.success) {
        alert(response.mensaje);
        onSuccess(paymentType.tipo, total - getTotalPaid());
        onClose();
      } else {
        alert(response.mensaje || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setPaymentStep('type');
    setPaymentType(null);
    setSelectedPaymentMethods([]);
    setPaymentAmounts({});
  };

  if (!show) return null;

  const esParcial = paymentType?.tipo === 'parcial';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {paymentStep === 'type' ? (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900">PROCESAR PAGO</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <SeleccionTipoPago total={total} onSelectTipo={selectPaymentType} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">MÉTODOS DE PAGO</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  esParcial ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {esParcial ? 'Parcial' : 'Total'}
                </span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <ResumenPago
                total={total}
                tipoPago={paymentType.tipo}
                totalPagado={getTotalPaid()}
                restante={total - getTotalPaid()}
                esCompacto={esParcial}
              />

              <SeleccionMetodos
                metodos={paymentMethods}
                metodosSeleccionados={selectedPaymentMethods}
                onToggleMetodo={togglePaymentMethod}
                tipoPago={paymentType.tipo}
                maxMetodos={esParcial ? 2 : 1}
              />

              <IngresoMontos
                metodos={paymentMethods}
                metodosSeleccionados={selectedPaymentMethods}
                paymentAmounts={paymentAmounts}
                onAmountChange={handlePaymentAmountChange}
                onAmountBlur={handlePaymentAmountBlur}
                tipoPago={paymentType.tipo}
                total={total}
              />
            </div>

            <div className="flex gap-2 p-3">
              <button
                onClick={handleBack}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded"
              >
                Atrás
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={!canProcessPayment() || loading}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded ${
                  canProcessPayment() && !loading
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Procesando...' : 'PROCESAR PAGO E IMPRIMIR'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalPago;
