import React, { useState, useEffect } from 'react';
import { X, Receipt, Wallet, Banknote, CreditCard, Building2 } from 'lucide-react';

function ModalPago({ show, total, onClose, onSuccess }) {
  const [paymentStep, setPaymentStep] = useState('type');
  const [paymentType, setPaymentType] = useState(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});

  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', icon: Banknote },
    { id: 'tarjeta', name: 'Tarjeta', icon: CreditCard },
    { id: 'transferencia', name: 'Transferencia', icon: Building2 },
  ];

  useEffect(() => {
    if (show) {
      setPaymentStep('type');
      setPaymentType(null);
      setSelectedPaymentMethods([]);
      setPaymentAmounts({});
    }
  }, [show]);

  const selectPaymentType = (type) => {
    setPaymentType(type);
    setPaymentStep('methods');
  };

  const togglePaymentMethod = (methodId) => {
    if (paymentType === 'total') {
      // En modo total, solo un método
      setSelectedPaymentMethods([methodId]);
      setPaymentAmounts({ [methodId]: total.toFixed(2) });
    } else {
      // En modo parcial - MANTENER MONTOS AL CAMBIAR
      if (selectedPaymentMethods.includes(methodId)) {
        // Deseleccionar método
        const newSelected = selectedPaymentMethods.filter(id => id !== methodId);
        setSelectedPaymentMethods(newSelected);

        // Si queda solo un método, recalcular su monto
        if (newSelected.length === 1) {
          const remainingMethod = newSelected[0];
          const currentAmount = parseFloat(paymentAmounts[remainingMethod]) || 0;
          setPaymentAmounts({
            ...paymentAmounts,
            [remainingMethod]: currentAmount
          });
        }
      } else {
        // Seleccionar nuevo método
        if (selectedPaymentMethods.length < 2) {
          const newSelected = [...selectedPaymentMethods, methodId];
          setSelectedPaymentMethods(newSelected);

          // Si ya hay un método seleccionado con monto, calcular el complemento
          if (newSelected.length === 2) {
            const firstMethod = newSelected[0];
            const firstAmount = parseFloat(paymentAmounts[firstMethod]) || 0;
            const remaining = total - firstAmount;

            setPaymentAmounts({
              ...paymentAmounts,
              [methodId]: remaining >= 0 ? remaining.toFixed(2) : "0.00"
            });
          }
        } else {
          alert("Solo se pueden usar dos métodos de pago en modo parcial");
        }
      }
    }
  };

  const getTotalPaid = () =>
    Object.values(paymentAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  const getRemainingPayment = () => total - getTotalPaid();

  const handlePaymentAmountChange = (methodId, value) => {
    const numericValue = parseFloat(value) || 0;
    let newAmounts = { ...paymentAmounts, [methodId]: numericValue };

    // Si hay dos métodos en parcial, ajusta automáticamente el segundo
    if (paymentType === 'parcial' && selectedPaymentMethods.length === 2) {
      const otherMethod = selectedPaymentMethods.find(id => id !== methodId);
      if (otherMethod) {
        const restante = total - numericValue;
        newAmounts[otherMethod] = restante >= 0 ? restante.toFixed(2) : "0.00";
      }
    }

    setPaymentAmounts(newAmounts);
  };

  const canProcessPayment = () => {
    if (paymentType === 'total') {
      return Math.abs(getRemainingPayment()) < 0.01 && selectedPaymentMethods.length > 0;
    } else {
      // En parcial, validar que la suma sea igual al total
      const totalPaid = getTotalPaid();
      return Math.abs(totalPaid - total) < 0.01 && selectedPaymentMethods.length > 0;
    }
  };

  const handleProcessPayment = () => {
    if (!canProcessPayment()) {
      alert('Verifique los montos ingresados');
      return;
    }

    // Preparar datos del pago para enviar
    const paymentData = {
      tipo: paymentType,
      metodos: selectedPaymentMethods.map(methodId => ({
        metodo: methodId,
        monto: parseFloat(paymentAmounts[methodId]) || 0
      })),
      totalPagado: getTotalPaid(),
      saldoPendiente: getRemainingPayment()
    };

    onSuccess(paymentType, getRemainingPayment(), paymentData);
  };

  const handleBack = () => {
    // Volver al paso anterior SIN borrar los datos
    setPaymentStep('type');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {paymentStep === 'type' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">PROCESAR PAGO</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Total */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-0.5">TOTAL A PAGAR</p>
                <p className="text-2xl font-bold text-blue-600">L. {total.toFixed(2)}</p>
              </div>

              {/* Opciones */}
              <div className="space-y-2">
                <button
                  onClick={() => selectPaymentType('total')}
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
                  onClick={() => selectPaymentType('parcial')}
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
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">MÉTODOS DE PAGO</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    paymentType === 'total'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {paymentType === 'total' ? 'Total' : 'Parcial'}
                </span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-4 space-y-4">
                {/* Mostrar total */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 mb-0.5">TOTAL A PAGAR</p>
                  <p className="text-xl font-bold text-blue-600">L. {total.toFixed(2)}</p>
                </div>

                {/* Métodos */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {paymentType === 'total' ? 'Seleccione método' : 'Seleccione dos métodos'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPaymentMethods.includes(method.id);
                      return (
                        <button
                          key={method.id}
                          onClick={() => togglePaymentMethod(method.id)}
                          className={`p-2 border-2 rounded-lg transition ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 mx-auto mb-1 ${
                              isSelected ? 'text-blue-600' : 'text-gray-400'
                            }`}
                          />
                          <p className="text-xs font-medium text-gray-700">{method.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Montos */}
                {selectedPaymentMethods.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {paymentType === 'total' ? 'Monto a pagar' : 'Distribuya el monto'}
                    </p>
                    <div className="space-y-2">
                      {selectedPaymentMethods.map((methodId, index) => {
                        const method = paymentMethods.find((m) => m.id === methodId);
                        const Icon = method.icon;

                        // En modo total, todos readonly
                        // En modo parcial, el segundo es readonly
                        const isReadOnly = paymentType === 'total' ||
                          (paymentType === 'parcial' && selectedPaymentMethods.length === 2 && index === 1);

                        return (
                          <div key={methodId} className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1">
                              <input
                                type="number"
                                step="0.01"
                                value={paymentAmounts[methodId] || ''}
                                onChange={(e) => handlePaymentAmountChange(methodId, e.target.value)}
                                placeholder="0.00"
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                              />
                              <p className="text-xs text-gray-500 mt-1">{method.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumen para parcial */}
                    {paymentType === 'parcial' && selectedPaymentMethods.length === 2 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Total ingresado:</span>
                          <span className="font-semibold text-green-700">L. {getTotalPaid().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-700">Falta por pagar:</span>
                          <span className={`font-semibold ${Math.abs(getRemainingPayment()) < 0.01 ? 'text-green-700' : 'text-red-600'}`}>
                            L. {Math.abs(getRemainingPayment()).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
              >
                Atrás
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={!canProcessPayment()}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                  canProcessPayment()
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {paymentType === 'total' ? 'Procesar Pago' : 'Registrar Pagos'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalPago;