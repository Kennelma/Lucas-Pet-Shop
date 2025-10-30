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
    // Limpiar datos cuando se cambia de tipo de pago
    setSelectedPaymentMethods([]);
    setPaymentAmounts({});
    setPaymentType(type);
    setPaymentStep('methods');
  };

  const togglePaymentMethod = (methodId) => {
    if (paymentType === 'total') {
      // En modo total, solo un método
      setSelectedPaymentMethods([methodId]);
      setPaymentAmounts({ [methodId]: total.toFixed(2) });
    } else {
      // En modo parcial
      if (selectedPaymentMethods.includes(methodId)) {
        // Deseleccionar método - solo eliminar el método deseleccionado
        const newSelected = selectedPaymentMethods.filter(id => id !== methodId);
        setSelectedPaymentMethods(newSelected);
        
        // Crear nuevo objeto de montos preservando los métodos que quedan
        const newAmounts = { ...paymentAmounts };
        delete newAmounts[methodId]; // Solo eliminar el monto del método deseleccionado
        setPaymentAmounts(newAmounts);
        
      } else {
        // Seleccionar nuevo método
        if (selectedPaymentMethods.length < 2) {
          const newSelected = [...selectedPaymentMethods, methodId];
          setSelectedPaymentMethods(newSelected);

          const newAmounts = { ...paymentAmounts };
          
          // Si es el primer método, inicializar con 0.00
          if (newSelected.length === 1) {
            newAmounts[methodId] = '0.00';
          } 
          // Si es el segundo método y ya hay un método con monto, calcular automáticamente el restante
          else if (newSelected.length === 2) {
            const otherMethod = newSelected.find(id => id !== methodId);
            const otherAmount = parseFloat(paymentAmounts[otherMethod]) || 0;
            const remaining = total - otherAmount;
            newAmounts[methodId] = remaining >= 0 ? remaining.toFixed(2) : "0.00";
          }
          
          setPaymentAmounts(newAmounts);
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
    let newAmounts = { ...paymentAmounts, [methodId]: value }; // Mantener como string para el input

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
      if (selectedPaymentMethods.length === 0) return false;
      
      // Si es efectivo, validar que el monto sea mayor o igual al total
      if (selectedPaymentMethods[0] === 'efectivo') {
        const efectivoAmount = parseFloat(paymentAmounts['efectivo']) || 0;
        return efectivoAmount >= total;
      }
      
      // Para otros métodos, validar que el monto sea igual al total
      return Math.abs(getRemainingPayment()) < 0.01;
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
    // Volver al paso anterior Y limpiar todos los datos
    setPaymentStep('type');
    setPaymentType(null);
    setSelectedPaymentMethods([]);
    setPaymentAmounts({});
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-auto overflow-hidden">
        {paymentStep === 'type' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
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
            <div className="flex items-center justify-between px-4 py-3">
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
            {paymentType === 'parcial' ? (
                // DISEÑO MUY COMPACTO PARA PAGO PARCIAL
                <div className="p-3 space-y-2">
                
                {/* Resumen mínimo */}
                {/* Total muy compacto */}
                <div className="flex gap-2">
                  {/* Bloque TOTAL */}
                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center space-y-0.5 w-full">
                    <p className="text-xs text-gray-600 leading-none">TOTAL A PAGAR</p>
                    <p className="text-sm font-bold text-blue-600 leading-none">L. {total.toFixed(2)}</p>
                  </div>

                  {/* Bloque Ingresado/Restante */}
                  {selectedPaymentMethods.length === 2 && (
                    <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-[11px] w-full flex flex-col justify-center space-y-0.5">
                      <span>SALDO L. {getTotalPaid().toFixed(2)}</span>
                      <span className={`font-semibold ${Math.abs(getRemainingPayment()) < 0.01 ? 'text-green-700' : 'text-red-600'}`}>
                        RESTANTE: L. {Math.abs(getRemainingPayment()).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Métodos en línea horizontal */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Seleccione dos métodos</p>
                  <div className="grid grid-cols-3 gap-1">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPaymentMethods.includes(method.id);
                      return (
                        <button
                          key={method.id}
                          onClick={() => togglePaymentMethod(method.id)}
                          className={`py-3 px-1.5 border rounded transition flex flex-col items-center justify-center space-y-1 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-700' : 'text-gray-400'}`} />
                          <p className="text-xs text-gray-700 text-center leading-tight">{method.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Montos compactos */}
                {selectedPaymentMethods.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Distribuya el monto</p>
                    <div className="space-y-1">
                      {selectedPaymentMethods.map((methodId, index) => {
                        const method = paymentMethods.find((m) => m.id === methodId);
                        const Icon = method.icon;
                        const isReadOnly = selectedPaymentMethods.length === 2 && index === 1;

                        return (
                          <div key={methodId} className="flex items-center gap-2">
                            <Icon className="w-3 h-3 text-gray-500" />
                            <input
                              type="number"
                              step="0.01"
                              value={paymentAmounts[methodId] || ''}
                              onChange={(e) => handlePaymentAmountChange(methodId, e.target.value)}
                              placeholder="0.00"
                              readOnly={isReadOnly}
                              className={`flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${
                                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                            <span className="text-xs text-gray-500 w-20 text-right">{method.name === 'Transferencia' ? 'Transfer.' : method.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // DISEÑO PARA PAGO TOTAL
              <div className="p-3 space-y-2">
                {/* Total compacto */}
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                  <p className="text-xs text-gray-600">TOTAL</p>
                  <p className="text-base font-bold text-blue-600">L. {total.toFixed(2)}</p>
                </div>

                {/* Métodos compactos */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Seleccione método</p>
                  <div className="grid grid-cols-3 gap-1">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPaymentMethods.includes(method.id);
                      return (
                        <button
                          key={method.id}
                          onClick={() => togglePaymentMethod(method.id)}
                          className={`py-3 px-1.5 border rounded transition flex flex-col items-center justify-center space-y-1 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? 'text-purple-700' : 'text-gray-400'
                            }`}
                          />
                          <p className="text-xs text-gray-700 text-center leading-tight">{method.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Monto compacto */}
                {selectedPaymentMethods.length > 0 && (
                  <div>
                    {selectedPaymentMethods.map((methodId) => {
                      const method = paymentMethods.find((m) => m.id === methodId);
                      const Icon = method.icon;
                      const isEfectivo = methodId === 'efectivo';

                      return (
                        <div key={methodId}>
                          {isEfectivo ? (
                            // Diseño como pago parcial para efectivo
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Distribuya el monto</p>
                              <div className="space-y-1">
                                {/* Input del efectivo */}
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3 h-3 text-gray-500" />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={paymentAmounts[methodId] || ''}
                                    onChange={(e) => handlePaymentAmountChange(methodId, e.target.value)}
                                    placeholder="0.00"
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                                  />
                                  <span className="text-xs text-gray-500 w-20 text-right">Efectivo</span>
                                </div>
                                
                                {/* Campo del cambio (read-only) */}
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3 h-3 text-gray-500" />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={paymentAmounts[methodId] ? Math.max(0, parseFloat(paymentAmounts[methodId]) - total).toFixed(2) : '0.00'}
                                    readOnly={true}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                                  />
                                  <span className="text-xs text-gray-500 w-20 text-right">Cambio</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Diseño normal para otros métodos
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Monto a pagar</p>
                              <div className="flex items-center gap-2">
                                <Icon className="w-3 h-3 text-gray-500" />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={paymentAmounts[methodId] || ''}
                                  readOnly={true}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                                />
                                <span className="text-xs text-gray-500 w-20 text-right">{method.name === 'Transferencia' ? 'Transfer.' : method.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Footer compacto */}
            <div className="flex gap-2 p-3">
              <button
                onClick={handleBack}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded"
              >
                Atrás
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={!canProcessPayment()}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded ${
                  canProcessPayment()
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {paymentType === 'total' ? 'PROCESAR PAGO E IMPRIMIR' : 'PROCESAR PAGOS E IMPRIMIR'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalPago;