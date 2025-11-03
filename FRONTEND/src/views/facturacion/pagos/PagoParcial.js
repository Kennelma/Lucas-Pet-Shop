import React, { useState, useEffect } from 'react';
import { ArrowLeft, Banknote, CreditCard, Building2 } from 'lucide-react';
import { obtenerMetodosPagos } from '../../../AXIOS.SERVICES/payments-axios';

//====================COMPONENTE PAGO PARCIAL====================
// PERMITE REALIZAR UN PAGO PARCIAL CON UN SOLO MÉTODO DE PAGO
const PagoParcial = ({ total, idTipoPago, onBack, onConfirm }) => {
  //====================ESTADOS====================
  const [montoParcial, setMontoParcial] = useState(''); // MONTO A PAGAR AHORA
  const [metodoPago, setMetodoPago] = useState(null); // MÉTODO DE PAGO SELECCIONADO
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

  //====================CÁLCULO: SALDO RESTANTE====================
  const saldoRestante = total - parseFloat(montoParcial || 0);

  //====================FUNCIÓN: CONFIRMAR PAGO====================
  const handleConfirm = () => {
    onConfirm({
      metodos: [{
        id_metodo_pago_fk: metodoPago.id,
        monto: parseFloat(montoParcial)
      }],
      monto: parseFloat(montoParcial)
    });
  };

  //====================VALIDACIÓN====================
  // EL MONTO DEBE SER > 0 Y < TOTAL, Y DEBE HABER UN MÉTODO SELECCIONADO
  const isValid = montoParcial &&
                  parseFloat(montoParcial) > 0 &&
                  parseFloat(montoParcial) < total &&
                  metodoPago;

  //====================RENDER====================
  return (
    <div className="space-y-4">
      {/* HEADER CON BOTÓN ATRÁS */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Pago Parcial</h3>
      </div>

      {/* TARJETA DE RESUMEN: TOTAL, A PAGAR AHORA, RESTANTE */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
        <div className="flex justify-between items-start">
          {/* MONTO TOTAL DE LA FACTURA */}
          <div>
            <p className="text-sm text-orange-700 mb-1">Monto Total</p>
            <p className="text-2xl font-bold text-orange-900">L {total.toFixed(2)}</p>
          </div>

          {/* MONTO A PAGAR AHORA Y RESTANTE - SOLO VISIBLE SI HAY MONTO VÁLIDO */}
          {montoParcial && parseFloat(montoParcial) > 0 && parseFloat(montoParcial) < total && (
            <div className="text-right space-y-2">
              {/* MONTO A PAGAR AHORA */}
              <div>
                <p className="text-xs text-orange-700 mb-1">A Pagar Ahora</p>
                <p className="text-xl font-bold text-orange-900">
                  L {parseFloat(montoParcial).toFixed(2)}
                </p>
              </div>
              {/* SALDO RESTANTE */}
              <div>
                <p className="text-xs text-orange-700 mb-1">Restante</p>
                <p className="text-xl font-bold text-orange-900">
                  L {saldoRestante.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INPUT DE MONTO A PAGAR */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Monto a Pagar Ahora
        </label>
        <input
          type="number"
          value={montoParcial}
          onChange={(e) => setMontoParcial(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          max={total}
          className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg font-medium focus:border-orange-500 focus:outline-none"
        />
        {/* MENSAJE DE ERROR SI EL MONTO ES >= TOTAL */}
        {montoParcial && parseFloat(montoParcial) >= total && (
          <p className="mt-2 text-sm font-medium text-red-600">
            ⚠ El monto debe ser menor al total
          </p>
        )}
      </div>

      {/* SECCIÓN DE SELECCIÓN DE MÉTODO */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Método de Pago</p>

        {/* LOADING SPINNER */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* GRID DE MÉTODOS DE PAGO CON ICONOS */
          <div className="grid grid-cols-3 gap-3">
            {metodosPago.map((metodo) => {
              const Icono = iconosPorMetodo[metodo.metodo_pago.trim().toUpperCase()] || Banknote;
              const seleccionado = metodoPago?.id === metodo.id_metodo_pago_pk;

              return (
                <button
                  key={metodo.id_metodo_pago_pk}
                  onClick={() => setMetodoPago({
                    id: metodo.id_metodo_pago_pk,
                    nombre: metodo.metodo_pago.trim()
                  })}
                  className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                    seleccionado
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  <Icono className="w-6 h-6" />
                  <span className="text-sm font-medium">{metodo.metodo_pago.trim()}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTÓN CONFIRMAR */}
      <button
        onClick={handleConfirm}
        disabled={!isValid}
        className={`w-full mt-4 mb-2 py-2 text-sm font-medium rounded-lg transition ${
          isValid
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Confirmar Pago Parcial
      </button>
    </div>
  );
};

export default PagoParcial;