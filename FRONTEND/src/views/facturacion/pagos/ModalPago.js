import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, Building2, CheckCircle2, Wallet } from 'lucide-react';
import { obtenerTodosMetodosPago, obtenerTiposPago, procesarPago } from '../../../AXIOS.SERVICES/payments-axios';

//MODAL PARA PROCESAR PAGOS DE UNA O MÚLTIPLES FACTURAS
//SOPORTA DOS MODOS:
//  1. MODO MÚLTIPLE: <ModalPago facturas={[{numero_factura, total}, ...]} />
//  2. MODO SIMPLE (LEGACY): <ModalPago numero_factura="FAC-001" total={500} />
function ModalPago({ show, numero_factura, total, facturas, onClose, onPagoExitoso }) {
  //ESTADOS DEL COMPONENTE
  const [vista, setVista] = useState('tipo');                    //VISTA ACTUAL: 'tipo', 'monto-parcial' O 'metodos'
  const [tipoPago, setTipoPago] = useState(null);                //TIPO SELECCIONADO: {tipo_pago, id_tipo_pago_pk}
  const [metodosSeleccionados, setMetodosSeleccionados] = useState([]); //MÉTODOS ELEGIDOS: [{nombre, id}]
  const [metodosPago, setMetodosPago] = useState([]);            //MÉTODOS DISPONIBLES DESDE BD
  const [tiposPago, setTiposPago] = useState([]);                //TIPOS DISPONIBLES DESDE BD (TOTAL/PARCIAL)
  const [montos, setMontos] = useState({});                      //MONTOS INGRESADOS: {id_metodo: monto}
  const [cargando, setCargando] = useState(false);               //INDICA SI ESTÁ CARGANDO DATOS INICIALES
  const [procesando, setProcesando] = useState(false);           //INDICA SI ESTÁ PROCESANDO EL PAGO
  const [montoAbono, setMontoAbono] = useState('');              //MONTO A ABONAR EN PAGO PARCIAL

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
      //DESELECCIONAR MÉTODO Y LIMPIAR MONTOS
      const nuevosMetodos = metodosSeleccionados.filter(m => m.id !== metodo.id_metodo_pago_pk);
      setMetodosSeleccionados(nuevosMetodos);
      
      const nuevosMontos = { ...montos };
      delete nuevosMontos[metodo.id_metodo_pago_pk];
      
      // Si queda solo un método, también limpiar su monto para que el usuario lo ingrese de nuevo
      if (nuevosMetodos.length === 1) {
        delete nuevosMontos[nuevosMetodos[0].id];
      }
      
      setMontos(nuevosMontos);
    } else {
      //SELECCIONAR MÉTODO (SI NO SE HA ALCANZADO EL LÍMITE DE 2)
      if (metodosSeleccionados.length < 2) {
        const nuevosMetodos = [...metodosSeleccionados, metodoObj];
        setMetodosSeleccionados(nuevosMetodos);
        
        // Si ahora hay 2 métodos y no hay montos, establecer el monto base en el primer método
        if (nuevosMetodos.length === 2 && Object.keys(montos).length === 0) {
          const nuevosMontos = {};
          // Usar monto de abono para pago parcial, o total para pago completo
          const montoBase = tipoPago?.tipo_pago === 'PARCIAL' && montoAbono 
            ? parseFloat(montoAbono) 
            : totalCombinado;
          nuevosMontos[nuevosMetodos[0].id] = montoBase.toFixed(2);
          nuevosMontos[nuevosMetodos[1].id] = '0.00';
          setMontos(nuevosMontos);
        }
      }
    }
  };

  //MANEJAR CAMBIO EN LOS MONTOS CON CÁLCULO AUTOMÁTICO
  const handleMontoChange = (idMetodo, valor) => {
    const nuevosMontos = { ...montos };
    
    // Validar que el valor sea numérico válido
    const valorNumerico = parseFloat(valor) || 0;
    nuevosMontos[idMetodo] = valor; // Mantener el valor original para el input

    //SI HAY 2 MÉTODOS SELECCIONADOS, CALCULAR EL SEGUNDO AUTOMÁTICAMENTE
    if (metodosSeleccionados.length === 2) {
      const primerMetodoId = metodosSeleccionados[0].id;
      const segundoMetodoId = metodosSeleccionados[1].id;
      
      // Determinar el monto base a usar (total o abono parcial)
      const montoBase = tipoPago?.tipo_pago === 'PARCIAL' && montoAbono 
        ? parseFloat(montoAbono) 
        : totalCombinado;
      
      if (idMetodo === primerMetodoId) {
        //SE MODIFICÓ EL PRIMER MÉTODO, CALCULAR EL SEGUNDO
        const montoRestante = Math.max(0, montoBase - valorNumerico);
        nuevosMontos[segundoMetodoId] = montoRestante.toFixed(2);
      } else if (idMetodo === segundoMetodoId) {
        //SE MODIFICÓ EL SEGUNDO MÉTODO, CALCULAR EL PRIMERO (CASO ESPECIAL)
        const montoRestante = Math.max(0, montoBase - valorNumerico);
        nuevosMontos[primerMetodoId] = montoRestante.toFixed(2);
      }
    }

    setMontos(nuevosMontos);
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

    // Determinar el monto objetivo según el tipo de pago
    const montoObjetivo = tipoPago?.tipo_pago === 'PARCIAL' && montoAbono 
      ? parseFloat(montoAbono) 
      : totalCombinado;

    //VALIDAR MONTO SEGÚN TIPO DE PAGO
    if (tipoPago?.tipo_pago === 'TOTAL' && totalIngresado < totalCombinado) {
      alert(`El monto ingresado (L.${totalIngresado.toFixed(2)}) es menor al saldo total (L.${totalCombinado.toFixed(2)}).\n\nSi el cliente paga menos, selecciona "PAGO PARCIAL".`);
      return;
    }

    if (tipoPago?.tipo_pago === 'PARCIAL') {
      // Validar que no exceda el monto de abono especificado
      if (totalIngresado > montoObjetivo + 0.05) {
        alert(`El monto ingresado (L.${totalIngresado.toFixed(2)}) excede el abono especificado (L.${montoObjetivo.toFixed(2)})`);
        return;
      }
      // Validar que no exceda el total de la factura
      if (totalIngresado > totalCombinado) {
        alert(`El monto ingresado (L.${totalIngresado.toFixed(2)}) excede el saldo pendiente (L.${totalCombinado.toFixed(2)})`);
        return;
      }
    }

    // Para pagos con dos métodos, permitir una pequeña diferencia por redondeo
    const diferenciaTolerada = metodosSeleccionados.length === 2 ? 0.05 : 1;
    
    if (totalIngresado > totalCombinado && tipoPago?.tipo_pago !== 'PARCIAL') {
      const diferencia = totalIngresado - totalCombinado;
      if (diferencia > diferenciaTolerada) {
        alert(`El monto ingresado (L.${totalIngresado.toFixed(2)}) excede el total (L.${totalCombinado.toFixed(2)})`);
        return;
      }
    }

    //FORMATEAR DATOS PARA ENVIAR AL BACKEND
    const datosPago = {
      facturas: facturasNormalizadas.map(f => ({
        numero_factura: f.numero_factura,
        //SI ES UNA SOLA FACTURA: USA EL MONTO INGRESADO (TOTAL O ABONO)
        //SI SON MÚLTIPLES: USA EL TOTAL DE CADA UNA (ASUME PAGO COMPLETO)
        monto_aplicar: facturasNormalizadas.length === 1
          ? totalIngresado
          : parseFloat(f.total)
      })),
      tipo_pago: tipoPago.id_tipo_pago_pk,
      metodos: metodosSeleccionados.map(metodo => ({
        id_metodo_pago: metodo.id,
        monto: parseFloat(montos[metodo.id])
      }))
    };

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

        handleClose();
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

  // Limpiar estados al cerrar el modal
  const handleClose = () => {
    setVista('tipo');
    setTipoPago(null);
    setMetodosSeleccionados([]);
    setMontos({});
    setMontoAbono('');
    onClose();
  };

  //SI EL MODAL NO ESTÁ VISIBLE, NO RENDERIZAR NADA
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-auto overflow-hidden">

        {vista === 'tipo' ? (
          //VISTA 1: SELECCIÓN DE TIPO DE PAGO (TOTAL O PARCIAL)
          <>
            {/* ENCABEZADO DEL MODAL */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">PROCESAR PAGO</h3>
              <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
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
                          // Si es pago parcial, ir a vista de monto, si no directo a métodos
                          if (tipo.tipo_pago === 'PARCIAL') {
                            setVista('monto-parcial');
                            setMontoAbono(''); // Limpiar monto anterior
                          } else {
                            setVista('metodos');
                          }
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
        ) : vista === 'monto-parcial' ? (
          //VISTA 2: ESPECIFICAR MONTO A ABONAR (SOLO PARA PAGO PARCIAL)
          <>
            {/* ENCABEZADO */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">MONTO A ABONAR</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
                  PAGO PARCIAL
                </span>
              </div>
              <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* RESUMEN DEL TOTAL DE LA FACTURA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Total de la Factura</span>
                  <span className="text-xl font-bold text-blue-900">L {totalCombinado.toFixed(2)}</span>
                </div>
                {facturasNormalizadas.length > 1 && (
                  <div className="text-xs text-blue-700 mt-1">
                    {facturasNormalizadas.length} facturas seleccionadas
                  </div>
                )}
              </div>

              {/* INPUT PARA MONTO A ABONAR */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  ¿Cuánto quiere abonar el cliente?
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-bold">
                    L
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={totalCombinado}
                    value={montoAbono}
                    onChange={(e) => setMontoAbono(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 text-2xl font-bold text-gray-900 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                {/* MOSTRAR SALDO RESTANTE */}
                {montoAbono && parseFloat(montoAbono) > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">Abono:</span>
                      <span className="font-semibold text-orange-900">L {parseFloat(montoAbono).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">Saldo restante:</span>
                      <span className="font-semibold text-orange-900">
                        L {Math.max(0, totalCombinado - parseFloat(montoAbono)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* MONTOS SUGERIDOS */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Montos sugeridos:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    totalCombinado * 0.25,
                    totalCombinado * 0.5,
                    totalCombinado * 0.75
                  ].map((sugerencia, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMontoAbono(sugerencia.toFixed(2))}
                      className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      L {sugerencia.toFixed(2)}
                      <div className="text-xs text-gray-500">
                        {['25%', '50%', '75%'][idx]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* VALIDACIÓN DEL MONTO */}
              {montoAbono && (parseFloat(montoAbono) <= 0 || parseFloat(montoAbono) > totalCombinado) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-xs text-red-800 text-center">
                    ⚠️ El monto debe ser mayor a L.0.00 y no exceder L.{totalCombinado.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={() => setVista('tipo')}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-white text-gray-700 font-medium rounded"
              >
                Atrás
              </button>
              <button
                onClick={() => {
                  // Limpiar métodos y montos al cambiar de monto de abono
                  setMetodosSeleccionados([]);
                  setMontos({});
                  setVista('metodos');
                }}
                disabled={!montoAbono || parseFloat(montoAbono) <= 0 || parseFloat(montoAbono) > totalCombinado}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded transition-colors ${
                  !montoAbono || parseFloat(montoAbono) <= 0 || parseFloat(montoAbono) > totalCombinado
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                CONTINUAR CON MÉTODOS DE PAGO
              </button>
            </div>
          </>
        ) : (
          //VISTA 3: SELECCIÓN DE MÉTODOS DE PAGO Y MONTOS
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">MÉTODOS DE PAGO</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tipoPago?.tipo_pago === 'PARCIAL' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {tipoPago?.tipo_pago || 'Total'}
                </span>
              </div>
              <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            {tipoPago?.tipo_pago === 'PARCIAL' ? (
              // DISEÑO MUY COMPACTO PARA PAGO PARCIAL
              <div className="p-3 space-y-2">
              
                {/* Resumen mínimo */}
                {/* Total muy compacto */}
                <div className="flex gap-2">
                  {/* Bloque TOTAL */}
                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center space-y-0.5 w-full">
                    <p className="text-xs text-gray-600 leading-none">
                      {montoAbono ? 'MONTO A ABONAR' : 'TOTAL A PAGAR'}
                    </p>
                    <p className="text-sm font-bold text-blue-600 leading-none">
                      L {(montoAbono ? parseFloat(montoAbono) : totalCombinado).toFixed(2)}
                    </p>
                  </div>

                  {/* Bloque Ingresado/Restante */}
                  {metodosSeleccionados.length === 2 && (
                    <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-[11px] w-full flex flex-col justify-center space-y-0.5">
                      <span>SALDO L. {Object.values(montos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}</span>
                      <span className={`font-semibold ${Math.abs((montoAbono ? parseFloat(montoAbono) : totalCombinado) - Object.values(montos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)) < 0.01 ? 'text-green-700' : 'text-red-600'}`}>
                        RESTANTE: L {Math.abs((montoAbono ? parseFloat(montoAbono) : totalCombinado) - Object.values(montos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Métodos en línea horizontal */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Seleccione dos métodos</p>
                  <div className="grid grid-cols-3 gap-1">
                    {cargando ? (
                      <div className="col-span-3 text-center py-4 text-gray-500">Cargando métodos...</div>
                    ) : (
                      metodosPago.map((metodo) => {
                        const Icon = getIconoMetodo(metodo.metodo_pago);
                        const isSelected = metodosSeleccionados.find(m => m.id === metodo.id_metodo_pago_pk);
                        return (
                          <button
                            key={metodo.id_metodo_pago_pk}
                            onClick={() => handleToggleMetodo(metodo)}
                            className={`py-3 px-1.5 border rounded transition flex flex-col items-center justify-center space-y-1 ${
                              isSelected
                                ? 'border-purple-600 bg-purple-100'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-700' : 'text-gray-400'}`} />
                            <p className="text-xs text-gray-700 text-center leading-tight">{metodo.metodo_pago}</p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Montos compactos */}
                {metodosSeleccionados.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Distribuya el monto</p>
                    <div className="space-y-1">
                      {metodosSeleccionados.map((metodo, index) => {
                        const metodoPago = metodosPago.find((m) => m.id_metodo_pago_pk === metodo.id);
                        const Icon = getIconoMetodo(metodoPago?.metodo_pago);
                        const isReadOnly = metodosSeleccionados.length === 2 && index === 1;

                        return (
                          <div key={metodo.id} className="flex items-center gap-2">
                            <Icon className="w-3 h-3 text-gray-500" />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={montos[metodo.id] || ''}
                              onChange={(e) => handleMontoChange(metodo.id, e.target.value)}
                              placeholder="0.00"
                              readOnly={isReadOnly}
                              className={`flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${
                                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            />
                            <span className="text-xs text-gray-500 w-20 text-right">
                              {metodoPago?.metodo_pago === 'TRANSFERENCIA' ? 'Transfer.' : metodoPago?.metodo_pago}
                            </span>
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
                  <p className="text-base font-bold text-blue-600">L {totalCombinado.toFixed(2)}</p>
                </div>

                {/* Métodos compactos */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Seleccione método</p>
                  <div className="grid grid-cols-3 gap-1">
                    {cargando ? (
                      <div className="col-span-3 text-center py-4 text-gray-500">Cargando métodos...</div>
                    ) : (
                      metodosPago.map((metodo) => {
                        const Icon = getIconoMetodo(metodo.metodo_pago);
                        const isSelected = metodosSeleccionados.find(m => m.id === metodo.id_metodo_pago_pk);
                        return (
                          <button
                            key={metodo.id_metodo_pago_pk}
                            onClick={() => handleToggleMetodo(metodo)}
                            className={`py-3 px-1.5 border rounded transition flex flex-col items-center justify-center space-y-1 ${
                              isSelected
                                ? 'border-purple-600 bg-purple-100'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-700' : 'text-gray-400'}`} />
                            <p className="text-xs text-gray-700 text-center leading-tight">{metodo.metodo_pago}</p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Monto compacto */}
                {metodosSeleccionados.length > 0 && (
                  <div>
                    {metodosSeleccionados.length === 1 ? (
                      // UN SOLO MÉTODO
                      metodosSeleccionados.map((metodo) => {
                        const metodoPago = metodosPago.find((m) => m.id_metodo_pago_pk === metodo.id);
                        const Icon = getIconoMetodo(metodoPago?.metodo_pago);
                        const isEfectivo = metodoPago?.metodo_pago === 'EFECTIVO';

                        return (
                          <div key={metodo.id}>
                            {isEfectivo ? (
                              // Diseño para efectivo
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Monto a pagar</p>
                                <div className="space-y-1">
                                  {/* Input del efectivo */}
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-3 h-3 text-gray-500" />
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={montos[metodo.id] || ''}
                                      onChange={(e) => handleMontoChange(metodo.id, e.target.value)}
                                      placeholder="0.00"
                                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                                    />
                                    <span className="text-xs text-gray-500 w-20 text-right">Efectivo</span>
                                  </div>
                                  
                                  {/* Campo del cambio */}
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-3 h-3 text-gray-500" />
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={montos[metodo.id] ? Math.max(0, parseFloat(montos[metodo.id]) - totalCombinado).toFixed(2) : '0.00'}
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
                                    value={totalCombinado.toFixed(2)}
                                    readOnly={true}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                                  />
                                  <span className="text-xs text-gray-500 w-20 text-right">
                                    {metodoPago?.metodo_pago === 'TRANSFERENCIA' ? 'Transfer.' : metodoPago?.metodo_pago}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      // DOS MÉTODOS - Diseño compacto como pago parcial
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Distribuya el monto</p>
                        <div className="space-y-1">
                          {metodosSeleccionados.map((metodo, index) => {
                            const metodoPago = metodosPago.find((m) => m.id_metodo_pago_pk === metodo.id);
                            const Icon = getIconoMetodo(metodoPago?.metodo_pago);
                            const isReadOnly = metodosSeleccionados.length === 2 && index === 1;

                            return (
                              <div key={metodo.id} className="flex items-center gap-2">
                                <Icon className="w-3 h-3 text-gray-500" />
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={montos[metodo.id] || ''}
                                  onChange={(e) => handleMontoChange(metodo.id, e.target.value)}
                                  placeholder="0.00"
                                  readOnly={isReadOnly}
                                  className={`flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${
                                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                                  }`}
                                />
                                <span className="text-xs text-gray-500 w-20 text-right">
                                  {metodoPago?.metodo_pago === 'TRANSFERENCIA' ? 'Transfer.' : metodoPago?.metodo_pago}
                                </span>
                              </div>
                            );
                          })}
                          
                          {/* Bloques compactos SALDO/RESTANTE para dos métodos */}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-green-50 border border-green-200 px-2 py-1 rounded">
                              <span className="text-xs text-green-700 font-medium">
                                SALDO L. {Object.values(montos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="bg-red-50 border border-red-200 px-2 py-1 rounded">
                              <span className="text-xs text-red-700 font-medium">
                                RESTANTE: L {Math.abs(totalCombinado - Object.values(montos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer compacto */}
            <div className="flex gap-2 p-3">
              <button
                onClick={() => {
                  // Regresar a la vista anterior según el tipo de pago
                  if (tipoPago?.tipo_pago === 'PARCIAL') {
                    setVista('monto-parcial');
                  } else {
                    setVista('tipo');
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded"
                disabled={procesando}
              >
                Atrás
              </button>
              <button
                onClick={handleProcesarPago}
                disabled={procesando || metodosSeleccionados.length === 0}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded ${
                  procesando || metodosSeleccionados.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {procesando ? 'PROCESANDO...' : (tipoPago?.tipo_pago === 'TOTAL' ? 'PROCESAR PAGO E IMPRIMIR' : 'PROCESAR PAGOS E IMPRIMIR')}
              </button>
            </div>
          </>
        )}  
      </div>
    </div>
  );
}

export default ModalPago;