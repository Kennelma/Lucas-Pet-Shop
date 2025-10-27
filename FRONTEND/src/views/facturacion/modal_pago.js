import React, { useState, useEffect } from 'react';
import { X, Receipt, Wallet, Banknote, CreditCard, Building2, Smartphone, Check, ArrowLeft, Sparkles } from 'lucide-react';

function ModalPago({ show, total, onClose, onSuccess }) {
  const [paymentStep, setPaymentStep] = useState('type');
  const [paymentType, setPaymentType] = useState(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});

  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', icon: Banknote, color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-50', borderColor: 'border-emerald-500' },
    { id: 'tarjeta', name: 'Tarjeta', icon: CreditCard, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-50', borderColor: 'border-blue-500' },
    { id: 'transferencia', name: 'Transferencia', icon: Building2, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-50', borderColor: 'border-purple-500' },
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
    if (paymentType === 'total') {
      // PAGO TOTAL: Solo permite seleccionar UN método
      if (selectedPaymentMethods.includes(methodId)) {
        // Si ya está seleccionado, deseleccionarlo
        setSelectedPaymentMethods([]);
        setPaymentAmounts({});
      } else {
        // Reemplazar cualquier selección anterior con la nueva
        setSelectedPaymentMethods([methodId]);
        setPaymentAmounts({ [methodId]: total.toFixed(2) });
      }
    } else {
      // PAGO PARCIAL: Permite múltiples métodos
      if (selectedPaymentMethods.includes(methodId)) {
        setSelectedPaymentMethods(selectedPaymentMethods.filter(id => id !== methodId));
        const newAmounts = { ...paymentAmounts };
        delete newAmounts[methodId];
        setPaymentAmounts(newAmounts);
      } else {
        setSelectedPaymentMethods([...selectedPaymentMethods, methodId]);
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
    <div className="fixed inset-0 bg-trans bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm animate-in">
      {paymentStep === 'type' ? (
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-6 transform transition-all animate-in">
          {/* Header mejorado */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Procesar Pago</h3>
                  <p className="text-sm text-slate-500">Factura #001235</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:rotate-90"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Total mejorado con gradiente y efectos */}
          <div className="relative p-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl mb-8 text-center shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <p className="text-sm text-blue-100 mb-2 font-medium">Total a pagar</p>
              <p className="text-5xl font-bold text-white mb-1">L. {total.toFixed(2)}</p>
              <div className="flex items-center justify-center gap-1 text-blue-100">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">Seleccione el tipo de pago</span>
              </div>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-slate-800 mb-6 text-center">
            ¿Cómo desea procesar el pago?
          </h4>

          {/* Cards de tipo de pago mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => selectPaymentType('total')}
              className="group relative p-8 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Receipt className="w-10 h-10 text-white" />
                </div>
                <h5 className="text-xl font-bold text-slate-800 mb-3">Pago Total</h5>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  El cliente pagará el monto completo de la factura en este momento
                </p>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-5 rounded-xl text-base font-bold shadow-md">
                  L. {total.toFixed(2)}
                </div>
              </div>
            </button>

            <button
              onClick={() => selectPaymentType('parcial')}
              className="group relative p-8 border-2 border-slate-200 rounded-2xl hover:border-orange-500 hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <h5 className="text-xl font-bold text-slate-800 mb-3">Pago Parcial</h5>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  El cliente realizará un abono, quedará saldo pendiente por pagar
                </p>
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-5 rounded-xl text-base font-bold shadow-md">
                  Abono flexible
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-6 max-h-[90vh] overflow-y-auto">
          {/* Header sticky mejorado */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b-2 border-slate-200 z-10">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-slate-800">Métodos de Pago</h3>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                    paymentType === 'total' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  }`}>
                    {paymentType === 'total' ? '✓ Pago Total' : '◐ Pago Parcial'}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Factura #001235</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:rotate-90"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Dashboard de montos mejorado */}
          <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl mb-8 shadow-inner border border-slate-200">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Total Factura</p>
              <p className="text-2xl font-bold text-slate-800">L. {total.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border-2 border-blue-200">
              <p className="text-xs text-blue-700 mb-2 font-semibold uppercase tracking-wide">Pagado</p>
              <p className="text-2xl font-bold text-blue-600">L. {getTotalPaid().toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border-2 border-orange-200">
              <p className="text-xs text-orange-700 mb-2 font-semibold uppercase tracking-wide">Pendiente</p>
              <p className={`text-2xl font-bold ${getRemainingPayment() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                L. {getRemainingPayment().toFixed(2)}
              </p>
            </div>
          </div>

          {/* Selector de métodos mejorado */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              Seleccione Método{paymentType === 'parcial' ? '(s)' : ''} de Pago
            </h4>
            {paymentType === 'total' && (
              <p className="text-sm text-blue-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                <span className="font-semibold">ℹ️ Pago Total:</span> Seleccione un solo método de pago
              </p>
            )}
            {paymentType === 'parcial' && (
              <p className="text-sm text-orange-600 mb-4 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                <span className="font-semibold">ℹ️ Pago Parcial:</span> Puede seleccionar múltiples métodos de pago
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethods.includes(method.id);
                return (
                  <button
                    key={method.id}
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `${method.borderColor} bg-gradient-to-br ${method.hoverColor} shadow-xl scale-105`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1.5 shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`${method.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg transition-transform ${isSelected ? 'scale-110' : ''}`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">{method.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input de montos mejorado */}
          {selectedPaymentMethods.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-600 rounded-full"></div>
                Ingrese Montos
              </h4>
              <div className="space-y-4">
                {selectedPaymentMethods.map((methodId) => {
                  const method = paymentMethods.find(m => m.id === methodId);
                  const Icon = method.icon;
                  return (
                    <div key={methodId} className="group flex items-center gap-4 p-5 bg-gradient-to-r from-slate-50 to-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
                      <div className={`${method.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 mb-2">{method.name}</p>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">L.</span>
                            <input
                              type="number"
                              step="0.01"
                              value={paymentAmounts[methodId] || ''}
                              onChange={(e) => handlePaymentAmountChange(methodId, e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-800 transition-all"
                            />
                          </div>
                          <button
                            onClick={() => handleQuickFillPayment(methodId)}
                            className="px-5 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            {paymentType === 'total' ? '↻ Total' : '↻ Pendiente'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer con botones mejorados */}
          <div className="flex gap-4 pt-6 border-t-2 border-slate-200 sticky bottom-0 bg-white z-10">
            <button
              onClick={() => setPaymentStep('type')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Cambiar tipo
            </button>
            <button
              onClick={handleProcessPayment}
              disabled={!canProcessPayment()}
              className={`flex-1 py-3.5 px-6 font-bold rounded-xl transition-all shadow-lg ${
                canProcessPayment()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-xl transform hover:scale-105'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {paymentType === 'total' && Math.abs(getRemainingPayment()) < 0.01
                ? '✓ Procesar Pago Total'
                : paymentType === 'parcial' && getTotalPaid() > 0
                ? '✓ Registrar Pago Parcial'
                : 'Ingrese Montos Válidos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModalPago;