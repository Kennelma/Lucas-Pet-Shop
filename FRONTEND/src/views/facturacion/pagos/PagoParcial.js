import React, { useState, useEffect } from 'react';
import { ArrowLeft, Banknote, CreditCard, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
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
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los métodos de pago',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  //====================CÁLCULO: SALDO RESTANTE====================
  const saldoRestante = total - parseFloat(montoParcial || 0);

  //====================FUNCIÓN: CONFIRMAR PAGO====================
  const handleConfirm = async () => {
    // Validar que hay un método seleccionado
    if (!metodoPago) {
      await Swal.fire({
        icon: 'warning',
        title: 'Método requerido',
        text: 'Debes seleccionar un método de pago',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Validar monto
    const monto = parseFloat(montoParcial);
    if (!montoParcial || monto <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'El monto debe ser mayor a 0',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (monto >= total) {
      await Swal.fire({
        icon: 'warning',
        title: 'Monto muy alto',
        text: 'Para pagar el total usa la opción "Pago Total"',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    await onConfirm({
      metodos: [{
        id_metodo_pago_fk: metodoPago.id,
        monto: monto
      }],
      monto: monto
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
    <div className="space-y-3">
      {/* HEADER CON BOTÓN ATRÁS */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Pago Parcial</h3>
      </div>

      {/* RESUMEN COMPACTO */}
      <div className="flex gap-2">
        {/* Bloque Total de la factura */}
        <div className="bg-orange-50 border border-orange-200 rounded px-3 py-2 text-center flex-1">
          <p className="text-xs text-gray-600">TOTAL FACTURA</p>
          <p className="text-lg font-bold text-orange-700">L {total.toFixed(2)}</p>
        </div>

        {/* Mostrar abono y restante solo si hay monto válido */}
        {montoParcial && parseFloat(montoParcial) > 0 && parseFloat(montoParcial) < total && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-center flex-1">
              <p className="text-xs text-gray-600">ABONO AHORA</p>
              <p className="text-lg font-bold text-blue-700">L {parseFloat(montoParcial).toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-center flex-1">
              <p className="text-xs text-gray-600">RESTANTE</p>
              <p className="text-lg font-bold text-red-700">L {saldoRestante.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>

      {/* INPUT DE MONTO A PAGAR */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">
          ¿Cuánto quiere abonar el cliente?
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-bold">L</div>
          <input
            type="number"
            value={montoParcial}
            onChange={(e) => setMontoParcial(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            max={total}
            className="w-full pl-8 pr-4 py-2 text-lg font-medium border-2 border-orange-300 rounded focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Sugerencias rápidas */}
        <div className="flex gap-1 mt-1">
          {[total * 0.25, total * 0.5, total * 0.75].map((sugerencia, idx) => (
            <button
              key={idx}
              onClick={() => setMontoParcial(sugerencia.toFixed(2))}
              className="flex-1 py-1 px-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {['25%', '50%', '75%'][idx]}
              <div className="text-xs text-gray-500">L {sugerencia.toFixed(0)}</div>
            </button>
          ))}
        </div>

        {/* MENSAJE DE ERROR SI EL MONTO ES INVÁLIDO */}
        {montoParcial && (parseFloat(montoParcial) <= 0 || parseFloat(montoParcial) >= total) && (
          <p className="mt-1 text-xs text-red-600">
            ⚠ El monto debe ser mayor a L.0.00 y menor a L.{total.toFixed(2)}
          </p>
        )}
      </div>

      {/* SECCIÓN DE SELECCIÓN DE MÉTODO */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Seleccione UN método de pago (ÚNICO)</p>

        {/* LOADING SPINNER */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          /* GRID DE MÉTODOS DE PAGO CON ICONOS */
          <div className="grid grid-cols-3 gap-1">
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
                  className={`py-2 px-1 border rounded transition flex flex-col items-center justify-center space-y-1 text-xs ${
                    seleccionado
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icono className={`w-4 h-4 ${seleccionado ? 'text-orange-600' : 'text-gray-500'}`} />
                  <span className="leading-tight">{metodo.metodo_pago.trim()}</span>
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
        className={`w-full mt-3 py-2 text-sm font-medium rounded transition uppercase ${
          isValid
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        PROCESAR PAGO PARCIAL
      </button>
    </div>
  );
};

export default PagoParcial;