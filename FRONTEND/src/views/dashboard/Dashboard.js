import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as lucideReact from 'lucide-react';
import Swal from 'sweetalert2';
import ModalAgregarGasto from './modal_nuevo_gasto';
import ModalTablaGastos from './modal_tabla_gastos';
import { ver } from '../../AXIOS.SERVICES/empresa-axios';

const Dashboard = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalTablaGastos, setShowModalTablaGastos] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());

  const token = sessionStorage.getItem('token');
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));

  useEffect(() => {
    if (!token) navigate('/login');

    // Mostrar mensaje de bienvenida si viene del login
    const showWelcome = sessionStorage.getItem('showWelcome');
    if (showWelcome === 'true') {
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso',
        timer: 2500,
        showConfirmButton: false,
      });
      sessionStorage.removeItem('showWelcome');
    }
  }, [token, navigate]);

  const today = new Date();

  const cargarGastos = async () => {
    setIsLoading(true);
    try {
      const data = await ver('GASTOS');
      if (Array.isArray(data)) {
        setExpenses(
          data.map((item) => {
            const normalizedDate = new Date(item.fecha_registro_gasto || Date.now());
            return {
              id: item.id_gasto_pk,
              description: item.detalle_gasto,
              amount: Number(item.monto_gasto),
              date: normalizedDate
            };
          })
        );
      }
    } catch (err) {
      console.error('Error al cargar gastos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  const filteredExpenses = expenses.filter(expense => {
    const d1 = expense.date;
    const d2 = filterDate;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  });

  // Mostrar solo los últimos 5 gastos
  const lastTwoExpenses = filteredExpenses.slice(-5);

  const totalExpenses = filteredExpenses.reduce((total, expense) => {
    return total + (parseFloat(expense.amount) || 0);
  }, 0);

  return (
    <>
      <style>
        {`
          .modal {
            z-index: 10500 !important;
          }
          .modal-backdrop {
            z-index: 10499 !important;
          }
        `}
      </style>
      <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
      <div className="font-['Poppins']">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">

        {/* Contenido Principal */}
        <div className="lg:col-span-2">

          {/* Header */}
          <div className="mb-8">
            <div
              className="rounded-xl p-4 bg-cover bg-center"
              style={{
                backgroundImage: 'url("/H13.png")',
                backgroundColor: '#BAF2BB',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div className="mb-2">
                <h1 className="text-xl font-light text-black mb-1">
                  ¡Hola, {usuario?.nombre || 'Administrador'}!
                </h1>
                <p className="text-sm text-gray-800 poppins">
                  Bienvenido a tu sistema de gestión veterinaria y tienda de mascotas
                </p>
              </div>

            </div>
          </div>

          {/* Accesos Directos */}
          <div className="mb-8">
            <div className="text-lg font-bold text-gray-800 mb-4 text-center">ACCESOS RÁPIDOS</div>

            {/* Primera fila */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <button
                onClick={() => navigate('/facturacion')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-200 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.FileText className="w-7 h-7 text-blue-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">FACTURACIÓN</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reportes')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-200 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.TrendingUp className="w-7 h-7 text-purple-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">REPORTES</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/clientes')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-200 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Users className="w-7 h-7 text-indigo-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">CLIENTES</div>
                </div>
              </button>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/recordatorios')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-200 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Bell className="w-7 h-7 text-orange-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">RECORDATORIOS</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/productos/alimentos')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-200 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Package className="w-7 h-7 text-green-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">PRODUCTOS</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/seguridad')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-200 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Shield className="w-7 h-7 text-red-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">SEGURIDAD</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Gestión de Gastos */}
        <div className="lg:col-span-1">
          <div className="w-full">

            {/* Card Principal */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

              {/* Header */}
              <div className="relative px-4 pt-2 pb-1 bg-[#FFCC33]">
                <div className="relative mb-1">
                  <p className="text-base font-semibold tracking-wider text-center">GASTOS DE HOY</p>
              </div>

                {/* Navegación de Fecha */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <button
                    onClick={() => {
                      const newDate = new Date(filterDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setFilterDate(newDate);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                  >
                    <lucideReact.ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-slate-700 font-medium bg-white px-2 py-1 rounded-lg border-2 border-yellow-400 flex-1 min-w-0">
                    <lucideReact.Calendar className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-slate-900 text-[10px] sm:text-xs whitespace-nowrap">{filterDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                  </div>

                  <button
                    onClick={() => {
                      const newDate = new Date(filterDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setFilterDate(newDate);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                  >
                    <lucideReact.ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModalAgregar(true)}
                    style={{ borderRadius: '12px' }}
                    className="flex-1 px-2 py-1 bg-white hover:bg-gray-50 text-black text-[9px] flex items-center justify-center gap-1 font-medium border-2 border-yellow-400"
                  >
                    <lucideReact.Plus className="w-2.5 h-2.5" />
                    AGREGAR
                  </button>
                  <button
                    onClick={() => setShowModalTablaGastos(true)}
                    style={{ borderRadius: '12px' }}
                    className="flex-1 px-2 py-1 bg-white hover:bg-gray-50 text-slate-900 text-[9px] font-medium flex items-center justify-center gap-1 border-2 border-yellow-400"
                  >
                    <lucideReact.List className="w-1rem h-2.5" />
                    HISTORIAL
                  </button>
                </div>
              </div>

              {/* Lista de Gastos  */}
              <div className="px-4 py-3 space-y-2 h-[300px] overflow-y-auto border-t border-slate-100">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin mb-3">
                      <div className="w-8 h-8 border-2 border-[#F4F2F7] border-t-emerald-600 rounded-full"></div>
                    </div>
                    <p className="text-slate-500 text-sm">Cargando...</p>
                  </div>
                ) : filteredExpenses.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <lucideReact.ArrowUpRight className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Sin gastos</p>
                    <p className="text-slate-400 text-xs mt-1">Agrega tu primer gasto del día</p>
                  </div>
                ) : (
                  lastTwoExpenses.map((expense, idx) => (
                    <div
                       key={expense.id}
                      className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 group"
                      style={{ backgroundColor: '#F4F2F7' }}
                    >
                      <div className="flex-1">
                        <p className="text-xs text-slate-900 uppercase">{expense.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black-600">L {parseFloat(expense.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total - Abajo */}
              <div className="px-4 py-3 border-t border-slate-100 bg-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-ls font-bold text-gray-900 uppercase tracking-wider">Total</span>
                  <span className="text-ls font-bold text-gray-900">L {totalExpenses.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modal Agregar Gasto */}
      <ModalAgregarGasto
        visible={showModalAgregar}
        onHide={() => setShowModalAgregar(false)}
        onRefresh={cargarGastos}
      />

      {/* Modal Tabla de Gastos */}
      <ModalTablaGastos
        visible={showModalTablaGastos}
        onHide={() => setShowModalTablaGastos(false)}
        onRefresh={cargarGastos}
      />
    </div>
    </div>
    </>
  );
};

export default Dashboard;