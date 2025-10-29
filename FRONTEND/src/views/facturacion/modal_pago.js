import React, { useState, useEffect } from 'react';
import { X, Receipt, Wallet, Banknote, CreditCard, Building2, Smartphone, Check } from 'lucide-react';

function ModalPago({ show, total, onClose, onSuccess }) {
  const [paymentStep, setPaymentStep] = useState('type');
  const [paymentType, setPaymentType] = useState(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});

  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', icon: Banknote, color: 'bg-green-500' },
    { id: 'tarjeta', name: 'Tarjeta', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'transferencia', name: 'Transferencia', icon: Building2, color: 'bg-purple-500' },
    { id: 'movil', name: 'Pago Móvil', icon: Smartphone, color: 'bg-orange-500' },
  ];

  // Resetear el modal cuando se cierra o abre
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
    if (selectedPaymentMethods.includes(methodId)) {
      setSelectedPaymentMethods(selectedPaymentMethods.filter(id => id !== methodId));
      const newAmounts = { ...paymentAmounts };
      delete newAmounts[methodId];
      setPaymentAmounts(newAmounts);
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, methodId]);
      if (paymentType === 'total' && selectedPaymentMethods.length === 0) {
        setPaymentAmounts({ [methodId]: total.toFixed(2) });
      }
    }
  };

  const handlePaymentAmountChange = (methodId, value) => {
    setPaymentAmounts({ ...paymentAmounts, [methodId]: value });
  };

  const handleQuickFillPayment = (methodId) => {
    const remaining = getRemainingPayment();
    if (remaining > 0) {
      setPaymentAmounts({ ...paymentAmounts, [methodId]: remaining.toFixed(2) });
    }
  };

  const getTotalPaid = () => {
    return Object.values(paymentAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const getRemainingPayment = () => {
    return total - getTotalPaid();
  };

  const canProcessPayment = () => {
    if (paymentType === 'total') {
      return Math.abs(getRemainingPayment()) < 0.01 && selectedPaymentMethods.length > 0;
    } else {
      return getTotalPaid() > 0 && getTotalPaid() <= total && selectedPaymentMethods.length > 0;
    }
  };

  const handleProcessPayment = () => {
    if (!canProcessPayment()) {
      alert('Verifique los montos ingresados');
      return;
    }

    onSuccess(paymentType, getRemainingPayment());
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50 overflow-y-auto">
      {paymentStep === 'type' ? (
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Procesar Pago</h3>
              <p className="text-sm text-slate-500 mt-1">Factura #001235</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg mb-6 text-center">
            <p className="text-sm text-slate-600 mb-1">Total a pagar</p>
            <p className="text-4xl font-bold text-blue-600">L. {total.toFixed(2)}</p>
          </div>

          <h4 className="text-lg font-semibold text-slate-800 mb-4 text-center">
            ¿Cómo desea procesar el pago?
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => selectPaymentType('total')}
              className="group p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all bg-gradient-to-br from-white to-blue-50"
            >
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-xl font-bold text-slate-800 mb-2">Pago Total</h5>
              <p className="text-sm text-slate-600 mb-4">
                El cliente pagará el monto completo de la factura
              </p>
              <div className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-semibold">
                L. {total.toFixed(2)}
              </div>
            </button>

            <button
              onClick={() => selectPaymentType('parcial')}
              className="group p-6 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all bg-gradient-to-br from-white to-orange-50"
            >
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-xl font-bold text-slate-800 mb-2">Pago Parcial</h5>
              <p className="text-sm text-slate-600 mb-4">
                El cliente realizará un abono, quedará saldo pendiente
              </p>
              <div className="bg-orange-100 text-orange-700 py-2 px-4 rounded-lg text-sm font-semibold">
                Abono flexible
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 my-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-slate-800">Métodos de Pago</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  paymentType === 'total' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {paymentType === 'total' ? 'Pago Total' : 'Pago Parcial'}
                </span>
              </div>
              <p className="text-sm text-slate-500">Factura #001235</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg mb-6">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Total Factura</p>
              <p className="text-xl font-semibold text-slate-800">L. {total.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Pagado</p>
              <p className="text-xl font-semibold text-blue-600">L. {getTotalPaid().toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Pendiente</p>
              <p className={`text-xl font-semibold ${getRemainingPayment() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                L. {getRemainingPayment().toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Seleccione Método(s) de Pago</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethods.includes(method.id);
                return (
                  <button
                    key={method.id}
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow'
                    }`}
                  >
                    <div className={`${method.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">{method.name}</p>
                    {isSelected && (
                      <div className="mt-2">
                        <Check className="w-5 h-5 text-blue-500 mx-auto" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPaymentMethods.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Ingrese Montos</h4>
              <div className="space-y-4">
                {selectedPaymentMethods.map((methodId) => {
                  const method = paymentMethods.find(m => m.id === methodId);
                  const Icon = method.icon;
                  return (
                    <div key={methodId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className={`${method.color} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 mb-1">{method.name}</p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">L.</span>
                            <input
                              type="number"
                              step="0.01"
                              value={paymentAmounts[methodId] || ''}
                              onChange={(e) => handlePaymentAmountChange(methodId, e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <button
                            onClick={() => handleQuickFillPayment(methodId)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            {paymentType === 'total' ? 'Total' : 'Pendiente'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white z-10">
            <button
              onClick={() => setPaymentStep('type')}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              ← Cambiar tipo
            </button>
            <button
              onClick={handleProcessPayment}
              disabled={!canProcessPayment()}
              className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-colors ${
                canProcessPayment()
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {paymentType === 'total' && Math.abs(getRemainingPayment()) < 0.01
                ? '✓ Procesar Pago Total'
                : paymentType === 'parcial' && getTotalPaid() > 0
                ? '✓ Registrar Pago Parcial'
                : 'Ingrese Montos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModalPago;