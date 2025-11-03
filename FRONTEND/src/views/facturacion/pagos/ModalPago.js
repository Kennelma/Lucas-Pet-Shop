import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, Building2, CheckCircle2, Wallet } from 'lucide-react';
import { obtenerTodosMetodosPago, obtenerTiposPago, procesarPago } from '../../../AXIOS.SERVICES/payments-axios';

//MODAL PARA PROCESAR PAGOS DE UNA O MÚLTIPLES FACTURAS
//SOPORTA DOS MODOS:
//  1. MODO MÚLTIPLE: <ModalPago facturas={[{numero_factura, total}, ...]} />
//  2. MODO SIMPLE (LEGACY): <ModalPago numero_factura="FAC-001" total={500} />
function ModalPago({ show, numero_factura, total, facturas, onClose, onPagoExitoso }) {
  console.log('🎯 Props recibidas en ModalPago:', { numero_factura, total, facturas });

  //ESTADOS DEL COMPONENTE
  const [vista, setVista] = useState('tipo');                    //VISTA ACTUAL: 'tipo' O 'metodos'
  const [tipoPago, setTipoPago] = useState(null);                //TIPO SELECCIONADO: {tipo_pago, id_tipo_pago_pk}
  const [metodosSeleccionados, setMetodosSeleccionados] = useState([]); //MÉTODOS ELEGIDOS: [{nombre, id}]
  const [metodosPago, setMetodosPago] = useState([]);            //MÉTODOS DISPONIBLES DESDE BD
  const [tiposPago, setTiposPago] = useState([]);                //TIPOS DISPONIBLES DESDE BD (TOTAL/PARCIAL)
  const [montos, setMontos] = useState({});                      //MONTOS INGRESADOS: {id_metodo: monto}
  const [cargando, setCargando] = useState(false);               //INDICA SI ESTÁ CARGANDO DATOS INICIALES
  const [procesando, setProcesando] = useState(false);           //INDICA SI ESTÁ PROCESANDO EL PAGO

  //NORMALIZAR FACTURAS PARA SOPORTAR AMBOS MODOS (ANTIGUO Y NUEVO)
  const facturasNormalizadas = facturas || [{ numero_factura, total }];
  const totalCombinado = facturasNormalizadas.reduce((sum, f) => sum + parseFloat(f.total), 0);

  //CARGAR TIPOS Y MÉTODOS DE PAGO DESDE EL BACKEND AL ABRIR EL MODAL
  useEffect(() => {
    const cargarDatos = async () => {
      if (show) {
        setCargando(true);
        try {
          //OBTENER TIPOS DE PAGO (TOTAL/PARCIAL)
          const responseTipos = await obtenerTiposPago();
          if (responseTipos.success && responseTipos.data) {
            setTiposPago(responseTipos.data);
          }

          //OBTENER MÉTODOS DE PAGO (EFECTIVO/TARJETA/TRANSFERENCIA)
          const responseMetodos = await obtenerTodosMetodosPago();
          if (responseMetodos.success && responseMetodos.data) {
            setMetodosPago(responseMetodos.data);
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
        } finally {
          setCargando(false);
        }
      }
    };
    cargarDatos();
  }, [show]);

  //ASIGNAR ICONO SEGÚN EL NOMBRE DEL MÉTODO DE PAGO
  const getIconoMetodo = (nombreMetodo) => {
    const nombre = nombreMetodo?.toUpperCase() || '';
    if (nombre.includes('EFECTIVO')) return Banknote;
    if (nombre.includes('TARJETA')) return CreditCard;
    if (nombre.includes('TRANSFERENCIA')) return Building2;
    return Wallet;
  };

  //MANEJAR SELECCIÓN/DESELECCIÓN DE MÉTODOS DE PAGO (MÁXIMO 2)
  const handleToggleMetodo = (metodo) => {
    const metodoObj = {
      nombre: metodo.metodo_pago,
      id: metodo.id_metodo_pago_pk
    };

    const yaSeleccionado = metodosSeleccionados.find(m => m.id === metodo.id_metodo_pago_pk);

    if (yaSeleccionado) {
      //DESELECCIONAR MÉTODO Y LIMPIAR SU MONTO
      setMetodosSeleccionados(metodosSeleccionados.filter(m => m.id !== metodo.id_metodo_pago_pk));
      const nuevosMontos = { ...montos };
      delete nuevosMontos[metodo.id_metodo_pago_pk];
      setMontos(nuevosMontos);
    } else {
      //SELECCIONAR MÉTODO (SI NO SE HA ALCANZADO EL LÍMITE DE 2)
      if (metodosSeleccionados.length < 2) {
        setMetodosSeleccionados([...metodosSeleccionados, metodoObj]);
      }
    }
  };

  //PROCESAR EL PAGO Y ENVIAR AL BACKEND
  const handleProcesarPago = async () => {
    //VALIDAR QUE HAYA AL MENOS UN MÉTODO SELECCIONADO
    if (metodosSeleccionados.length === 0) {
      alert('Debe seleccionar al menos un método de pago');
      return;
    }

    //VALIDAR QUE TODOS LOS MÉTODOS TENGAN MONTO INGRESADO
    const faltanMontos = metodosSeleccionados.some(metodo => !montos[metodo.id] || parseFloat(montos[metodo.id]) <= 0);
    if (faltanMontos) {
      alert('Debe ingresar un monto válido para cada método seleccionado');
      return;
    }

    //CALCULAR TOTAL INGRESADO SUMANDO TODOS LOS MÉTODOS
    const totalIngresado = metodosSeleccionados.reduce((sum, metodo) => {
      return sum + (parseFloat(montos[metodo.id]) || 0);
    }, 0);

    //VALIDAR MONTO SEGÚN TIPO DE PAGO
    if (tipoPago?.tipo_pago === 'TOTAL' && totalIngresado < totalCombinado) {
      alert(`El monto ingresado (L.${totalIngresado.toFixed(2)}) es menor al saldo total (L.${totalCombinado.toFixed(2)}).\n\nSi el cliente paga menos, selecciona "PAGO PARCIAL".`);
      return;
    }

    if (totalIngresado > totalCombinado) {
      const diferencia = totalIngresado - totalCombinado;
      if (diferencia > 1 && tipoPago?.tipo_pago === 'PARCIAL') {
        alert(`El monto ingresado (L.${totalIngresado.toFixed(2)}) excede el saldo pendiente (L.${totalCombinado.toFixed(2)})`);
        return;
      }
    }

    //FORMATEAR DATOS PARA ENVIAR AL BACKEND
    const datosPago = {
      facturas: facturasNormalizadas.map(f => ({
        numero_factura: f.numero_factura,
        //SI ES UNA SOLA FACTURA: USA EL SALDO (PARA EVITAR PROBLEMAS DE DECIMALES)
        //SI SON MÚLTIPLES: USA EL SALDO DE CADA UNA
        monto_aplicar: facturasNormalizadas.length === 1
          ? parseFloat((f.saldo || f.total).toFixed(2))
          : parseFloat((f.saldo || f.total).toFixed(2))
      })),
      tipo_pago: tipoPago.id_tipo_pago_pk,
      metodos: metodosSeleccionados.map(metodo => ({
        id_metodo_pago: metodo.id,
        monto: parseFloat(parseFloat(montos[metodo.id]).toFixed(2))
      }))
    };

    console.log('📤 Enviando pago:', datosPago);

    setProcesando(true);
    try {
      const response = await procesarPago(datosPago);

      if (response.success) {
        //MOSTRAR DETALLES DEL PAGO PROCESADO
        const detalleFacturas = response.data.facturas.map(f =>
          `${f.numero_factura}: L.${f.monto_aplicado} (Saldo: L.${f.saldo_restante}) [${f.estado}]`
        ).join('\n');

        alert(`✅ ${response.mensaje}\n\n${detalleFacturas}\n\nMétodos usados: ${response.data.metodos_usados}\nTotal pagado: L.${response.data.monto_total_pagado}`);

        //EJECUTAR CALLBACK SI EXISTE
        if (onPagoExitoso) {
          onPagoExitoso(response.data);
        }

        onClose();
      } else {
        alert(`❌ Error: ${response.mensaje}`);
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('❌ Error al procesar el pago. Intente nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  //SI EL MODAL NO ESTÁ VISIBLE, NO RENDERIZAR NADA
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">

        {vista === 'tipo' ? (
          //VISTA 1: SELECCIÓN DE TIPO DE PAGO (TOTAL O PARCIAL)
          <>
            {/* ENCABEZADO DEL MODAL */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">PROCESAR PAGO</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* INFORMACIÓN DE FACTURA(S) A PAGAR */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                {facturasNormalizadas.length === 1 ? (
                  //UNA SOLA FACTURA
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Factura:</span>
                      <span className="font-medium text-gray-900">{facturasNormalizadas[0].numero_factura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">L {totalCombinado.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  //MÚLTIPLES FACTURAS
                  <>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {facturasNormalizadas.length} Facturas seleccionadas
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {facturasNormalizadas.map((f, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600">
                          <span>{f.numero_factura}</span>
                          <span className="font-medium">L {parseFloat(f.total).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-700">Total combinado:</span>
                      <span className="text-2xl font-bold text-gray-900">L {totalCombinado.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* BOTONES DE TIPO DE PAGO - CARGADOS DINÁMICAMENTE DESDE BD */}
              {cargando ? (
                <div className="text-center py-4 text-gray-500">Cargando...</div>
              ) : (
                <div className="space-y-2">
                  {tiposPago.map((tipo) => {
                    const isTOTAL = tipo.tipo_pago === 'TOTAL';
                    const isPARCIAL = tipo.tipo_pago === 'PARCIAL';
                    return (
                      <button
                        key={tipo.id_tipo_pago_pk}
                        onClick={() => {
                          setTipoPago(tipo);
                          setVista('metodos');
                        }}
                        className={`w-full p-4 border-2 rounded-lg transition-colors ${
                          isTOTAL
                            ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                            : isPARCIAL
                            ? 'border-orange-400 bg-orange-50 hover:bg-orange-100'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className={`font-semibold ${isTOTAL ? 'text-blue-900' : isPARCIAL ? 'text-orange-900' : 'text-gray-900'}`}>
                              PAGO {tipo.tipo_pago}
                            </div>
                            <div className={`text-sm ${isTOTAL ? 'text-blue-700' : isPARCIAL ? 'text-orange-700' : 'text-gray-600'}`}>
                              {isTOTAL
                                ? `Pagar los L.${totalCombinado.toFixed(2)} completos (1 o 2 métodos)`
                                : isPARCIAL
                                ? 'Abono parcial - queda saldo pendiente (1 o 2 métodos)'
                                : 'Hasta dos métodos de pago'}
                            </div>
                          </div>
                          {isTOTAL && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          //VISTA 2: SELECCIÓN DE MÉTODOS DE PAGO Y MONTOS
          <>
            {/* ENCABEZADO CON BADGE DE TIPO DE PAGO */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">MÉTODOS DE PAGO</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tipoPago?.tipo_pago === 'PARCIAL' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {tipoPago?.tipo_pago || 'Total'}
                </span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* RESUMEN DEL TOTAL A PAGAR */}
              <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Total a Pagar</span>
                  <span className="text-xl font-bold text-blue-900">L {totalCombinado.toFixed(2)}</span>
                </div>
                {facturasNormalizadas.length > 1 && (
                  <div className="text-xs text-blue-700 mt-1">
                    {facturasNormalizadas.length} facturas
                  </div>
                )}
              </div>

              {/* INSTRUCCIONES DE SELECCIÓN */}
              <div className="text-center py-2">
                <p className="text-sm font-medium text-gray-700">
                  Seleccione uno o dos métodos de pago
                </p>
                {metodosSeleccionados.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {metodosSeleccionados.length} método{metodosSeleccionados.length > 1 ? 's' : ''} seleccionado{metodosSeleccionados.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* GRID DE MÉTODOS DE PAGO - CARGADOS DINÁMICAMENTE DESDE BD */}
              {cargando ? (
                <div className="text-center py-4 text-gray-500">Cargando métodos...</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {metodosPago.map((metodo) => {
                    const Icon = getIconoMetodo(metodo.metodo_pago);
                    const isSelected = metodosSeleccionados.find(m => m.id === metodo.id_metodo_pago_pk);
                    const isDisabled = !isSelected && metodosSeleccionados.length >= 2;

                    return (
                      <button
                        key={metodo.id_metodo_pago_pk}
                        onClick={() => handleToggleMetodo(metodo)}
                        disabled={isDisabled}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-100'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-1 ${
                          isSelected ? 'text-purple-700' : 'text-gray-600'
                        }`} />
                        <div className="text-xs font-medium text-center text-gray-700">
                          {metodo.metodo_pago}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* INPUTS DE MONTO PARA CADA MÉTODO SELECCIONADO */}
              {metodosSeleccionados.length > 0 && (
                <div className="space-y-2">
                  {metodosSeleccionados.map((metodo) => {
                    const Icon = getIconoMetodo(metodo.nombre);
                    return (
                      <div key={metodo.id} className="bg-white border-2 border-green-500 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">{metodo.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">L</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={montos[metodo.id] || ''}
                            onChange={(e) => setMontos({ ...montos, [metodo.id]: e.target.value })}
                            placeholder="0.00"
                            className="flex-1 text-2xl font-bold text-gray-900 bg-transparent outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* VALIDACIÓN DE MONTOS PARA PAGO PARCIAL CON 2 MÉTODOS */}
                  {tipoPago?.tipo_pago === 'PARCIAL' && metodosSeleccionados.length === 2 && (
                    <div className="text-xs text-gray-600 text-center">
                      Total ingresado: L. {Object.values(montos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)} / L. {totalCombinado.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* MENSAJE DE AYUDA SEGÚN TIPO DE PAGO */}
              {metodosSeleccionados.length > 0 && (
                <div className={`rounded-lg p-2 text-xs border ${
                  tipoPago?.tipo_pago === 'TOTAL'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-orange-50 border-orange-200 text-orange-800'
                }`}>
                  {tipoPago?.tipo_pago === 'TOTAL'
                    ? '💡 Con efectivo puede pagar de más (cambio automático)'
                    : '⚠️ Asegúrate de ingresar solo el monto que el cliente paga ahora'}
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={() => setVista('tipo')}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-white text-gray-700 font-medium rounded"
                disabled={procesando}
              >
                Atrás
              </button>
              <button
                onClick={handleProcesarPago}
                disabled={procesando || metodosSeleccionados.length === 0}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded transition-colors ${
                  procesando || metodosSeleccionados.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {procesando ? 'PROCESANDO...' : 'PROCESAR PAGO E IMPRIMIR'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalPago;