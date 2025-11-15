import React, { useState, useEffect } from 'react';
import { ArrowLeft, Banknote, CreditCard, Building2 } from 'lucide-react';
import { obtenerMetodosPagos } from '../../../AXIOS.SERVICES/payments-axios';

//====================COMPONENTE PAGO TOTAL====================
// PERMITE REALIZAR UN PAGO COMPLETO CON UNO O DOS MÉTODOS DE PAGO
const PagoTotal = ({ total, idTipoPago, onBack, onConfirm }) => {
  //====================ESTADOS====================
  const [metodosSeleccionados, setMetodosSeleccionados] = useState([]); // MÉTODOS DE PAGO SELECCIONADOS
  const [metodosPago, setMetodosPago] = useState([]); // CATÁLOGO DE MÉTODOS DE PAGO DESDE BD
  const [loading, setLoading] = useState(true); // ESTADO DE CARGA

  //====================MAPEO DE ICONOS POR MÉTODO====================
  const iconosPorMetodo = {
    'EFECTIVO': Banknote,
    'TARJETA': CreditCard,
    'TRANSFERENCIA': Building2
  };

  //====================EFECTO: CARGAR MÉTODOS AL MONTAR====================
  useEffect(() => {
    cargarMetodosPago();
  }, []);

  //====================FUNCIÓN: CARGAR MÉTODOS DE PAGO DESDE BD====================
  const cargarMetodosPago = async () => {
    setLoading(true);
    try {
      const response = await obtenerMetodosPagos();
      if (response.success && response.data) {
        setMetodosPago(response.data);
      }
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    } finally {
      setLoading(false);
    }
  };

  //====================FUNCIÓN: SELECCIONAR/DESELECCIONAR MÉTODO====================
  // MÁXIMO 2 MÉTODOS PERMITIDOS
  const toggleMetodo = (metodo) => {
    const existe = metodosSeleccionados.find(m => m.id === metodo.id_metodo_pago_pk);

    if (existe) {
      // SI YA ESTÁ SELECCIONADO, LO QUITAMOS
      setMetodosSeleccionados(metodosSeleccionados.filter(m => m.id !== metodo.id_metodo_pago_pk));
    } else {
      // SOLO PERMITIMOS AGREGAR SI HAY MENOS DE 2 MÉTODOS SELECCIONADOS
      if (metodosSeleccionados.length < 2) {
        const nombreMetodo = metodo.metodo_pago.trim().toUpperCase();
        const esTransferenciaOTarjeta = nombreMetodo === 'TRANSFERENCIA' || nombreMetodo === 'TARJETA';
        const esPrimerMetodo = metodosSeleccionados.length === 0;
        
        // Si es transferencia o tarjeta y es el primer método, asignar el total automáticamente
        const montoInicial = (esTransferenciaOTarjeta && esPrimerMetodo) ? total.toFixed(2) : '';
        
        setMetodosSeleccionados([...metodosSeleccionados, {
          id: metodo.id_metodo_pago_pk,
          nombre: metodo.metodo_pago.trim(),
          monto: montoInicial
        }]);
      }
    }
  };

  //====================FUNCIÓN: ACTUALIZAR MONTO CON CÁLCULO AUTOMÁTICO====================
  const actualizarMonto = (id, monto) => {
    if (metodosSeleccionados.length === 2) {
      // SOLO ACTUALIZAR EL MONTO DEL MÉTODO ACTUAL, SIN CALCULAR AUTOMÁTICAMENTE EL OTRO
      setMetodosSeleccionados(metodosSeleccionados.map(m =>
        m.id === id ? { ...m, monto } : m
      ));
    } else {
      // UN SOLO MÉTODO: actualización normal (permite cambio en efectivo)
      setMetodosSeleccionados(metodosSeleccionados.map(m =>
        m.id === id ? { ...m, monto } : m
      ));
    }
  };

  //====================CÁLCULO DEL CAMBIO PARA EFECTIVO====================
  const calcularCambio = (metodo) => {
    const isEfectivo = metodo.nombre.trim().toUpperCase() === 'EFECTIVO';
    if (!isEfectivo || !metodo.monto) return 0;
    
    const efectivoRecibido = parseFloat(metodo.monto) || 0;
    
    if (metodosSeleccionados.length === 1) {
      // MÉTODO ÚNICO: cambio sobre el total
      return Math.max(0, efectivoRecibido - total);
    } else {
      // MÉTODO MIXTO: cambio sobre lo que debe pagar en efectivo
      const otroMetodo = metodosSeleccionados.find(m => m.id !== metodo.id);
      const montoOtroMetodo = parseFloat(otroMetodo.monto) || 0;
      const debeEfectivo = total - montoOtroMetodo;
      return Math.max(0, efectivoRecibido - debeEfectivo);
    }
  };

  //====================CÁLCULOS DINÁMICOS====================
  const sumaMontos = metodosSeleccionados.reduce((sum, m) => {
    const isEfectivo = m.nombre.trim().toUpperCase() === 'EFECTIVO';
    const montoIngresado = parseFloat(m.monto) || 0;
    const esMetodoUnico = metodosSeleccionados.length === 1;
    
    // Para efectivo: usar el mínimo entre lo ingresado y lo que debe pagar
    if (isEfectivo) {
      if (esMetodoUnico) {
        return sum + Math.min(montoIngresado, total);
      } else {
        // Mixto: calcular cuánto debe pagar en efectivo
        const otroMetodo = metodosSeleccionados.find(m2 => m2.id !== m.id);
        const montoOtro = parseFloat(otroMetodo.monto) || 0;
        const debeEfectivo = total - montoOtro;
        return sum + Math.min(montoIngresado, Math.max(0, debeEfectivo));
      }
    }
    return sum + montoIngresado;
  }, 0);
  
  const montosValidos = metodosSeleccionados.every(m => {
    const isEfectivo = m.nombre.trim().toUpperCase() === 'EFECTIVO';
    const montoIngresado = parseFloat(m.monto) || 0;
    const esMetodoUnico = metodosSeleccionados.length === 1;
    
    if (isEfectivo) {
      if (esMetodoUnico) {
        // Único: debe ser >= total (permite cambio)
        return m.monto && montoIngresado >= total;
      } else {
        // Mixto: debe cubrir al menos lo que falta después del otro método
        const otroMetodo = metodosSeleccionados.find(m2 => m2.id !== m.id);
        const montoOtro = parseFloat(otroMetodo.monto) || 0;
        const debeEfectivo = Math.max(0, total - montoOtro);
        return m.monto && montoIngresado >= debeEfectivo;
      }
    }
    // Para métodos mixtos o otros métodos: debe ser > 0
    return m.monto && montoIngresado > 0;
  });

  //====================FUNCIÓN: CONFIRMAR PAGO====================
  const handleConfirm = () => {
    const metodos = metodosSeleccionados.map(m => {
      const isEfectivo = m.nombre.trim().toUpperCase() === 'EFECTIVO';
      const montoRecibido = parseFloat(m.monto) || 0;
      const cambio = calcularCambio(m);
      
      // Calcular el monto real a registrar (sin el cambio)
      const montoReal = isEfectivo ? montoRecibido - cambio : montoRecibido;
      
      return {
        id_metodo_pago_fk: m.id,
        monto: montoReal,
        efectivo_recibido: isEfectivo ? montoRecibido : undefined,
        cambio: isEfectivo && cambio > 0 ? cambio : undefined
      };
    });

    onConfirm({
      metodos,
      monto: total
    });
  };

  //====================RENDER====================
  return (
    <div className="space-y-3">
      {/* HEADER CON BOTÓN ATRÁS */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Pago Total</h3>
      </div>

      {/* RESUMEN COMPACTO */}
      <div className="flex gap-2">
        {/* Bloque Total */}
        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-center flex-1">
          <p className="text-xs text-gray-600">TOTAL A PAGAR</p>
          <p className="text-lg font-bold text-blue-600">L {total.toFixed(2)}</p>
        </div>

        {/* Bloques de seguimiento - solo si hay métodos seleccionados */}
        {metodosSeleccionados.length > 0 && (
          <>
            <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-center flex-1">
              <p className="text-xs text-gray-600">INGRESADO</p>
              <p className={`text-lg font-bold ${
                Math.abs(sumaMontos - total) < 0.01 ? 'text-green-700' :
                sumaMontos > total ? 'text-red-600' : 'text-orange-600'
              }`}>
                L {sumaMontos.toFixed(2)}
              </p>
            </div>
            
            {/* Mostrar CAMBIO si es efectivo único y hay cambio */}
            {metodosSeleccionados.length === 1 && 
             metodosSeleccionados[0].nombre.trim().toUpperCase() === 'EFECTIVO' &&
             metodosSeleccionados[0].monto && 
             parseFloat(metodosSeleccionados[0].monto) > total ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-center flex-1">
                <p className="text-xs text-gray-600">CAMBIO</p>
                <p className="text-lg font-bold text-yellow-700">
                  L {calcularCambio(metodosSeleccionados[0]).toFixed(2)}
                </p>
              </div>
            ) : (
              <div className={`rounded px-3 py-2 text-center flex-1 border ${
                Math.abs(total - sumaMontos) < 0.01 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <p className="text-xs text-gray-600">RESTANTE</p>
                <p className={`text-lg font-bold ${
                  Math.abs(total - sumaMontos) < 0.01 ? 'text-green-700' : 'text-red-600'
                }`}>
                  L {Math.abs(total - sumaMontos).toFixed(2)}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* SECCIÓN DE SELECCIÓN DE MÉTODOS */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">
          {metodosSeleccionados.length === 0 ? 'Seleccione método de pago' : 
           metodosSeleccionados.length === 1 ? 'ÚNICO (1 método) o seleccione otro para MIXTO' : 
           'MIXTO (2 métodos)'}
        </p>

        {/* LOADING SPINNER */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* GRID DE MÉTODOS DE PAGO CON ICONOS */}
            <div className="grid grid-cols-3 gap-1">
              {metodosPago.map((metodo) => {
                const Icono = iconosPorMetodo[metodo.metodo_pago.trim().toUpperCase()] || Banknote;
                const seleccionado = metodosSeleccionados.find(m => m.id === metodo.id_metodo_pago_pk);
                const bloqueado = !seleccionado && metodosSeleccionados.length >= 2; // BLOQUEAR SI YA HAY 2 SELECCIONADOS

                return (
                  <button
                    key={metodo.id_metodo_pago_pk}
                    onClick={() => toggleMetodo(metodo)}
                    disabled={bloqueado}
                    className={`py-2 px-1 border rounded transition flex flex-col items-center justify-center space-y-1 text-xs ${
                      seleccionado
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : bloqueado
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icono className={`w-4 h-4 ${seleccionado ? 'text-blue-600' : bloqueado ? 'text-gray-300' : 'text-gray-500'}`} />
                    <span className="leading-tight">{metodo.metodo_pago.trim()}</span>
                  </button>
                );
              })}
            </div>

            {/* INPUTS DE MONTOS - SOLO PARA MÉTODOS SELECCIONADOS */}
            {metodosSeleccionados.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  {metodosSeleccionados.length === 1 
                    ? (metodosSeleccionados[0].nombre.trim().toUpperCase() === 'EFECTIVO' 
                      ? 'Ingrese el efectivo recibido (permite cambio)' 
                      : 'Monto exacto a cobrar')
                    : 'Ingrese primero el monto de Transferencia/Tarjeta, luego el efectivo recibido'}
                </p>
                
                {metodosSeleccionados.map((metodo, index) => {
                  const Icono = iconosPorMetodo[metodo.nombre.trim().toUpperCase()] || Banknote;
                  const isEfectivo = metodo.nombre.trim().toUpperCase() === 'EFECTIVO';
                  const nombreMetodo = metodo.nombre.trim().toUpperCase();
                  const esTransferenciaOTarjeta = nombreMetodo === 'TRANSFERENCIA' || nombreMetodo === 'TARJETA';
                  const isReadOnly = metodosSeleccionados.length === 1 && esTransferenciaOTarjeta;
                  
                  return (
                    <div key={metodo.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icono className="w-3 h-3 text-gray-500" />
                        <input
                          type="number"
                          value={metodo.monto}
                          onChange={(e) => actualizarMonto(metodo.id, e.target.value)}
                          placeholder={isEfectivo && metodosSeleccionados.length === 1 
                            ? `Mín: ${total.toFixed(2)}` 
                            : "0.00"
                          }
                          step="0.01"
                          min="0"
                          readOnly={isReadOnly}
                          className={`flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="text-xs text-gray-500 w-16 text-right">
                          {metodo.nombre.trim() === 'TRANSFERENCIA' ? 'Transfer.' : metodo.nombre.trim()}
                        </span>
                      </div>
                      
                      {/* Mostrar cambio para efectivo (único o mixto) */}
                      {isEfectivo && metodo.monto && calcularCambio(metodo) > 0 && (
                        <div className="flex items-center gap-2">
                          <Icono className="w-3 h-3 text-green-500" />
                          <input
                            type="number"
                            value={calcularCambio(metodo).toFixed(2)}
                            readOnly={true}
                            className="flex-1 px-2 py-1 text-sm border border-green-300 rounded bg-green-50 cursor-not-allowed"
                          />
                          <span className="text-xs text-green-600 w-16 text-right font-medium">Cambio</span>
                        </div>
                      )}
                      
                      {/* Mostrar advertencia si efectivo es insuficiente */}
                      {isEfectivo && metodo.monto && (() => {
                        const efectivoRecibido = parseFloat(metodo.monto) || 0;
                        let minimoRequerido = total;
                        
                        if (metodosSeleccionados.length === 2) {
                          const otroMetodo = metodosSeleccionados.find(m => m.id !== metodo.id);
                          const montoOtro = parseFloat(otroMetodo.monto) || 0;
                          minimoRequerido = total - montoOtro;
                        }
                        
                        return efectivoRecibido < minimoRequerido && (
                          <div className="text-xs text-red-600 mt-1">
                            ⚠ Efectivo insuficiente. Mínimo: L {minimoRequerido.toFixed(2)}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}

                {/* VALIDACIÓN DE SUMA - SOLO SI HAY 2 MÉTODOS */}
                {metodosSeleccionados.length > 1 && (() => {
                  const metodoEfectivo = metodosSeleccionados.find(m => m.nombre.trim().toUpperCase() === 'EFECTIVO');
                  const cambio = metodoEfectivo ? calcularCambio(metodoEfectivo) : 0;
                  const estaCompleto = Math.abs(sumaMontos - total) < 0.01;
                  
                  return (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-green-50 border border-green-200 px-2 py-1 rounded">
                        <span className="text-xs text-green-700 font-medium">
                          PAGADO: L {sumaMontos.toFixed(2)}
                        </span>
                      </div>
                      {cambio > 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 px-2 py-1 rounded">
                          <span className="text-xs text-yellow-700 font-medium">
                            CAMBIO: L {cambio.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className={`px-2 py-1 rounded border ${
                          estaCompleto ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <span className={`text-xs font-medium ${
                            estaCompleto ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {estaCompleto ? '✓ COMPLETO' : `FALTA: L ${Math.abs(total - sumaMontos).toFixed(2)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* BOTÓN CONFIRMAR */}
      <button
        onClick={handleConfirm}
        disabled={
          metodosSeleccionados.length === 0 ||
          !montosValidos ||
          (metodosSeleccionados.length > 1 && Math.abs(sumaMontos - total) >= 0.01)
        }
        className={`w-full mt-3 py-2 text-sm font-medium rounded transition uppercase ${
          metodosSeleccionados.length > 0 && montosValidos &&
          (metodosSeleccionados.length === 1 || Math.abs(sumaMontos - total) < 0.01)
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        PROCESAR PAGO TOTAL
      </button>
    </div>
  );
};

export default PagoTotal;