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

  // Mostrar solo los últimos 2 gastos
  const lastTwoExpenses = filteredExpenses.slice(-2);

  const totalExpenses = filteredExpenses.reduce((total, expense) => {
    return total + (parseFloat(expense.amount) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">

        {/* Contenido Principal */}
        <div className="lg:col-span-2">

          {/* Header */}
          <div className="mb-8">
            <div className="bg-blue-700 p-4 rounded-xl shadow-lg">
              <div className="mb-2">
                <h1 className="text-xl font-light text-white mb-1">
                  ¡Hola, {usuario?.nombre || 'Administrador'}!
                </h1>
                <p className="text-sm text-blue-100">
                  Bienvenido a Lucas Pet Shop - Tu sistema de gestión veterinaria y tienda de mascotas
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <lucideReact.Calendar className="w-5 h-5" />
                <span className="text-sm font-light">
                  {today.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Accesos Directos */}
          <div className="mb-8">
            <div className="text-lg font-bold text-gray-800 mb-4">ACCESOS RÁPIDOS</div>

            {/* Primera fila */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <button
                onClick={() => navigate('/facturacion')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-100 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.FileText className="w-7 h-7 text-blue-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">FACTURACIÓN</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reportes')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-100 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.TrendingUp className="w-7 h-7 text-purple-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">REPORTES</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/clientes')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-100 shadow-md border"
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
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-100 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Bell className="w-7 h-7 text-orange-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">RECORDATORIOS</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/productos/alimentos')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-100 shadow-md border"
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Package className="w-7 h-7 text-green-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800 text-center">PRODUCTOS</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/seguridad')}
                className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl transition-all hover:bg-gray-100 shadow-md border"
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
          <div className="bg-yellow-50 rounded-xl shadow-lg border border-yellow-200">

            {/* Header */}
            <div className="bg-yellow-500 p-4 rounded-t-xl border-b border-yellow-600">
              <div className="text-center mb-3">
                <h2 className="text-sm font-bold text-gray-800 uppercase mb-3">
                  Gastos del día
                </h2>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowModalAgregar(true)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md uppercase font-semibold"
                  >
                    <lucideReact.Plus className="w-4 h-4" />
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowModalTablaGastos(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md uppercase font-semibold"
                  >
                    <lucideReact.List className="w-4 h-4" />
                    Ver Gastos
                  </button>
                </div>
              </div>

              {/* Navegación de Fecha */}
              <div className="flex items-center justify-between mt-2 p-1 bg-yellow-400/50 rounded-lg">
                <button
                  onClick={() => {
                    const newDate = new Date(filterDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setFilterDate(newDate);
                  }}
                  className="p-1 hover:bg-yellow-400 rounded transition-colors"
                >
                  <lucideReact.ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <div className="flex items-center gap-2 text-gray-800 font-medium cursor-pointer">
                  <lucideReact.Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {filterDate.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const newDate = new Date(filterDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setFilterDate(newDate);
                  }}
                  className="p-1 hover:bg-yellow-400 rounded transition-colors"
                >
                  <lucideReact.ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Lista de Gastos - Últimos 2 */}
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Cargando gastos...</div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <lucideReact.FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay gastos registrados para esta fecha</p>
                </div>
              ) : (
                lastTwoExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-white p-3 rounded-lg shadow-sm border border-yellow-200"
                  >
                    <p className="text-sm font-medium text-gray-800 mb-1">{expense.description}</p>
                    <p className="text-lg font-bold text-green-600">
                      L {parseFloat(expense.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="border-t border-yellow-300 p-4 bg-yellow-200 rounded-b-xl">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">Total del día:</span>
                <span className="text-xl font-extrabold text-green-700">
                  L {totalExpenses.toFixed(2)}
                </span>
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
  );
};

export default Dashboard;