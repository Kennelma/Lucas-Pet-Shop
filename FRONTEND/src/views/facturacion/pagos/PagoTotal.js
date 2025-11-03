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
        setMetodosSeleccionados([...metodosSeleccionados, {
          id: metodo.id_metodo_pago_pk,
          nombre: metodo.metodo_pago.trim(),
          monto: ''
        }]);
      }
    }
  };

  //====================FUNCIÓN: ACTUALIZAR MONTO DE UN MÉTODO====================
  const actualizarMonto = (id, monto) => {
    setMetodosSeleccionados(metodosSeleccionados.map(m =>
      m.id === id ? { ...m, monto } : m
    ));
  };

  //====================CÁLCULOS DINÁMICOS====================
  const sumaMontos = metodosSeleccionados.reduce((sum, m) => sum + (parseFloat(m.monto) || 0), 0); // SUMA TOTAL DE MONTOS INGRESADOS
  const montosValidos = metodosSeleccionados.every(m => m.monto && parseFloat(m.monto) > 0); // VALIDAR QUE TODOS LOS MONTOS SEAN > 0

  //====================FUNCIÓN: CONFIRMAR PAGO====================
  const handleConfirm = () => {
    const metodos = metodosSeleccionados.map(m => ({
      id_metodo_pago_fk: m.id,
      monto: parseFloat(m.monto)
    }));

    onConfirm({
      metodos,
      monto: total
    });
  };

  //====================RENDER====================
  return (
    <div className="space-y-4">
      {/* HEADER CON BOTÓN ATRÁS */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Pago Total</h3>
      </div>

      {/* TARJETA DE RESUMEN: TOTAL, INGRESADO, RESTANTE */}
      <div className="bg-gradient from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex justify-between items-start">
          {/* MONTO TOTAL A PAGAR */}
          <div>
            <p className="text-sm text-green-700 mb-1">Monto a Pagar</p>
            <p className="text-2xl font-bold text-green-900">L {total.toFixed(2)}</p>
          </div>

          {/* SALDO INGRESADO Y RESTANTE - SOLO VISIBLE SI HAY MÉTODOS SELECCIONADOS */}
          {metodosSeleccionados.length > 0 && (
            <div className="text-right space-y-2">
              {/* MONTO INGRESADO */}
              <div>
                <p className="text-xs text-green-700 mb-1">Ingresado</p>
                <p className={`text-xl font-bold ${
                  sumaMontos === total ? 'text-green-900' :
                  sumaMontos > total ? 'text-red-600' : 'text-orange-600'
                }`}>
                  L {sumaMontos.toFixed(2)}
                </p>
              </div>
              {/* MONTO RESTANTE */}
              <div>
                <p className="text-xs text-green-700 mb-1">Restante</p>
                <p className={`text-xl font-bold ${
                  total - sumaMontos === 0 ? 'text-green-900' :
                  total - sumaMontos < 0 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  L {(total - sumaMontos).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DE SELECCIÓN DE MÉTODOS */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Seleccione método(s) de pago</p>

        {/* LOADING SPINNER */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* GRID DE MÉTODOS DE PAGO CON ICONOS */}
            <div className="grid grid-cols-3 gap-3">
              {metodosPago.map((metodo) => {
                const Icono = iconosPorMetodo[metodo.metodo_pago.trim().toUpperCase()] || Banknote;
                const seleccionado = metodosSeleccionados.find(m => m.id === metodo.id_metodo_pago_pk);
                const bloqueado = !seleccionado && metodosSeleccionados.length >= 2; // BLOQUEAR SI YA HAY 2 SELECCIONADOS

                return (
                  <button
                    key={metodo.id_metodo_pago_pk}
                    onClick={() => toggleMetodo(metodo)}
                    disabled={bloqueado}
                    className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                      seleccionado
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : bloqueado
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <Icono className="w-6 h-6" />
                    <span className="text-sm font-medium">{metodo.metodo_pago.trim()}</span>
                  </button>
                );
              })}
            </div>

            {/* INPUTS DE MONTOS - SOLO PARA MÉTODOS SELECCIONADOS */}
            {metodosSeleccionados.length > 0 && (
              <div className="space-y-3 mt-4">
                {metodosSeleccionados.map((metodo) => (
                  <div key={metodo.id}>
                    <label className="text-xs text-gray-600 mb-1 block">{metodo.nombre}</label>
                    <input
                      type="number"
                      value={metodo.monto}
                      onChange={(e) => actualizarMonto(metodo.id, e.target.value)}
                      placeholder="Monto"
                      step="0.01"
                      className="w-full p-2 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                ))}

                {/* VALIDACIÓN DE SUMA - SOLO SI HAY 2 MÉTODOS */}
                {metodosSeleccionados.length > 1 && (
                  <div className="text-sm">
                    <p className="text-gray-600">Suma: L {sumaMontos.toFixed(2)}</p>
                    <p className={sumaMontos !== total ? 'text-red-600' : 'text-green-600'}>
                      {sumaMontos === total
                        ? '✓ Los montos coinciden'
                        : '⚠ Los montos no coinciden con el total'}
                    </p>
                  </div>
                )}
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
          (metodosSeleccionados.length === 1 && parseFloat(metodosSeleccionados[0].monto) !== total) ||
          (metodosSeleccionados.length > 1 && sumaMontos !== total)
        }
        className={`w-full mt-4 py-3 font-medium rounded-xl transition ${
          metodosSeleccionados.length > 0 && montosValidos &&
          ((metodosSeleccionados.length === 1 && parseFloat(metodosSeleccionados[0].monto) === total) ||
           (metodosSeleccionados.length > 1 && sumaMontos === total))
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Confirmar Pago Total
      </button>
    </div>
  );
};

export default PagoTotal;