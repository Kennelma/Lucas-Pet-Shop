import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as lucideReact from 'lucide-react';
import Swal from 'sweetalert2';
import ModalAgregarGasto from './modal_nuevo_gasto';
import ModalActualizarGasto from './modal_actualizar_gasto';
import { ver, eliminarRegistro } from '../../AXIOS.SERVICES/empresa-axios';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
  const [expandedExpenses, setExpandedExpenses] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [filterDate, setFilterDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' o 'monthly'
  const [calendarViewMode, setCalendarViewMode] = useState('days'); // 'days' o 'months'

  const token = sessionStorage.getItem('token');
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const getHondurasDate = () => {
    return new Date();
  };

  const today = getHondurasDate();

  // 🔹 Cargar gastos desde la API
  const cargarGastos = async () => {
    setIsLoading(true);
    try {
      const data = await ver('GASTOS');
      if (Array.isArray(data)) {
        setExpenses(
          data.map((item) => {
         // solución temporal para ajuste de zona horaria (pendiente)
            let dateObj = new Date(item.fecha_registro_gasto || Date.now());
            dateObj.setTime(dateObj.getTime() - 24 * 60 * 60 * 1000);
            const normalizedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0);
            
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

  const recargarGastos = () => cargarGastos();

  // 🔹 Eliminar gasto
  const eliminarGasto = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar gasto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await eliminarRegistro(id, 'GASTOS');
        if (res.Consulta) {
          Swal.fire('Eliminado', 'El gasto fue eliminado correctamente.', 'success');
          cargarGastos();
        } else {
          Swal.fire('Error', res.error || 'No se pudo eliminar el gasto.', 'error');
        }
      } catch (err) {
        Swal.fire('Error', err.message || 'Error al eliminar gasto.', 'error');
      }
    }
  };
  
  // Filtrar gastos por fecha seleccionada usando hora local
  const filteredExpenses = expenses.filter(expense => {
    const d1 = expense.date;
    const d2 = filterDate;
    
    if (viewMode === 'monthly') {
      // Vista mensual: filtrar por año y mes en hora local
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth()
      );
    } else {
      // Vista diaria: filtrar por año, mes y día en hora local
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    }
  });
  
  // Calcular total asegurándose de que amount sea número
  const totalExpenses = filteredExpenses.reduce((total, expense) => {
    return total + (parseFloat(expense.amount) || 0);
  }, 0);

  // Generar días del calendario
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    if (calendarViewMode === 'months') {
      setCalendarMonth(new Date(calendarMonth.getFullYear() - 1, calendarMonth.getMonth()));
    } else {
      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
    }
  };

  const handleNextMonth = () => {
    if (calendarViewMode === 'months') {
      setCalendarMonth(new Date(calendarMonth.getFullYear() + 1, calendarMonth.getMonth()));
    } else {
      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
    }
  };

  const handleDateClick = (day) => {
    const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleMonthClick = (monthIndex) => {
    const newDate = new Date(calendarMonth.getFullYear(), monthIndex, 1);
    setFilterDate(newDate);
    setCalendarMonth(newDate);
    setViewMode('monthly');
    setCalendarViewMode('days');
  };

  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarMonth);
  const calendarDays = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Estilos personalizados para scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FEF3C7;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D97706;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B45309;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #92400E;
        }
      `}</style>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-6">
        <div className="bg-blue-700 p-3 rounded-lg shadow-lg">
          <div className="mb-2">
            <h1 className="text-xl font-light text-white mb-1">
              ¡Hola, {usuario?.nombre || 'Administrador'}!
            </h1>
            <p className="text-xs text-blue-100">Bienvenido a Lucas Pet Shop - Tu sistema de gestión veterinaria y tienda de mascotas</p>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <lucideReact.Calendar className="w-5 h-5" />
            <span className="text-xs">
              {today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex-1 max-w-md h-40 bg-gray-50 rounded-lg overflow-hidden ml-8">
          <img
            className="w-full h-full object-cover"
            src="/dashboard.jpg"
            alt="Dashboard Lucas Pet Shop"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Accesos Directos */}
          <div>
            <div className="text-xl font-bold text-gray-800 mb-1">ACCESOS RÁPIDOS</div>
            {/* Primera fila - 3 tarjetas */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button 
                onClick={() => navigate('/facturacion')}
                className="group relative overflow-hidden bg-gray-50 p-3 rounded-lg transition-all hover:bg-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all"></div>
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.FileText className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="text-sm text-gray-800 text-center">FACTURACIÓN</div>
                </div>
              </button>
              <button 
                onClick={() => navigate('/reportes')}
                className="group relative overflow-hidden bg-gray-50 p-3 rounded-lg transition-all hover:bg-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all"></div>
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="text-sm text-gray-800 text-center">REPORTES</div>
                </div>
              </button>
              <button 
                onClick={() => navigate('/clientes')}
                className="group relative overflow-hidden bg-gray-50 p-3 rounded-lg transition-all hover:bg-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 transition-all"></div>
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Users className="w-6 h-6 text-indigo-600 mb-2" />
                  <div className="text-sm text-gray-800 text-center">CLIENTES</div>
                </div>
              </button>
            </div>
            
            {/* Segunda fila - 2 tarjetas centradas */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              <button 
                onClick={() => navigate('/recordatorios')}
                className="group relative overflow-hidden bg-gray-50 p-3 rounded-lg transition-all hover:bg-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all"></div>
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Bell className="w-6 h-6 text-orange-600 mb-2" />
                  <div className="text-sm text-gray-800 text-center">RECORDATORIOS</div>
                </div>
              </button>
              <button 
                onClick={() => navigate('/productos/alimentos')}
                className="group relative overflow-hidden bg-gray-50 p-3 rounded-lg transition-all hover:bg-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all"></div>
                <div className="relative flex flex-col items-center justify-center h-full">
                  <lucideReact.Package className="w-6 h-6 text-green-600 mb-2" />
                  <div className="text-sm text-gray-800 text-center">PRODUCTOS</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="lg:col-span-1 space-y-3">
          {/* Botón Ver Gastos */}
          <div className="flex justify-end">
            <button
              onClick={() => setExpandedExpenses(!expandedExpenses)}
              className="bg-yellow-400 px-3 py-2 rounded text-sm font-medium text-gray-800 hover:bg-yellow-500 transition-colors"
            >
              VER Y AGREGAR GASTOS
            </button>
          </div>
          
          {/* Calendario simplificado */}
          <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => {
                  if (calendarViewMode === 'days') {
                    setFilterDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1));
                    setViewMode('monthly');
                  }
                }}
                className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors"
              >
                {calendarViewMode === 'months' 
                  ? calendarMonth.getFullYear()
                  : calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
                }
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (calendarViewMode === 'days') {
                      // Cambiar a vista mensual
                      setViewMode('monthly');
                      setCalendarViewMode('months');
                    } else {
                      // Cambiar a vista diaria
                      setViewMode('daily');
                      setCalendarViewMode('days');
                    }
                  }}
                  className="bg-blue-500 px-2 py-1 rounded text-xs font-medium text-white hover:bg-blue-600 transition-colors"
                >
                  {calendarViewMode === 'days' ? 'Día' : 'Mes'}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
                    <lucideReact.ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                    <lucideReact.ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
{calendarViewMode === 'months' ? (
              // Vista de meses del año
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                ].map((monthName, monthIndex) => (
                  <button
                    key={monthIndex}
                    onClick={() => handleMonthClick(monthIndex)}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      viewMode === 'monthly' && 
                      filterDate.getFullYear() === calendarMonth.getFullYear() &&
                      filterDate.getMonth() === monthIndex
                        ? 'bg-yellow-400 text-gray-800 border-yellow-500' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-yellow-50 hover:border-yellow-300'
                    }`}
                  >
                    {monthName}
                  </button>
                ))}
              </div>
            ) : (
              // Vista de días del mes
              <>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["D","L","M","M","J","V","S"].map((d,i)=>(
                    <div key={i} className="text-xs text-gray-400 text-center font-medium">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const weeks = [];
                    let days = [];
                    let startDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
                    startDay = startDay === 0 ? 6 : startDay - 1;
                    for (let i = 0; i < startDay; i++) days.push(null);
                    for (let d = 1; d <= daysInMonth; d++) {
                      days.push(d);
                      if (days.length === 7) {
                        weeks.push(days);
                        days = [];
                      }
                    }
                    if (days.length) {
                      while (days.length < 7) days.push(null);
                      weeks.push(days);
                    }
                    return weeks.flat().map((day, idx) => (
                      <div key={idx} className="h-8 flex items-center justify-center">
                        {day && (
                          <button 
                            onClick={() => {
                              const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                              setFilterDate(newDate);
                              if (viewMode === 'monthly') {
                                setViewMode('daily');
                              }
                            }}
                            className={`text-sm w-full h-full flex items-center justify-center rounded cursor-pointer transition-colors ${
                              viewMode === 'daily' && 
                              filterDate.getFullYear() === calendarMonth.getFullYear() &&
                              filterDate.getMonth() === calendarMonth.getMonth() &&
                              filterDate.getDate() === day
                                ? 'bg-blue-600 text-white font-bold' 
                                : viewMode === 'monthly'
                                ? 'text-gray-600 hover:bg-blue-100'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {day}
                          </button>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Ventana Desplegable */}
          {expandedExpenses && (
            <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-yellow-50 text-gray-800 shadow-2xl overflow-hidden z-50 animate-in slide-in-from-right">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {viewMode === 'monthly' 
                      ? `Gastos de ${filterDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
                      : `Gastos del ${filterDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`
                    }
                  </h3>
                  <button
                    onClick={() => setExpandedExpenses(false)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <lucideReact.X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Contenido */}
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#D97706 #FEF3C7'
                  }}
                >
                  {/* Lista de Gastos */}
                  <div>
                    <p className="text-sm text-gray-600 mb-3 font-semibold uppercase tracking-wider">Desglose</p>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Cargando...</p>
                      </div>
                    ) : expenses.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No hay gastos registrados</p>
                    ) : (
                      <div className="space-y-4">
                        {filteredExpenses.map((expense) => (
                          <div key={expense.id} className="group p-3 rounded-lg hover:bg-yellow-100 transition-all">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 flex-1">{expense.description}</span>
                              <div className="flex items-center gap-3 ml-4">
                                <span className="font-medium text-gray-800">L. {expense.amount.toLocaleString()}</span>
                                <button
                                  onClick={() => {
                                    setGastoSeleccionado(expense);
                                    setModalEditarVisible(true);
                                  }}
                                  className="text-gray-600 hover:text-blue-600 transition-colors opacity-60 hover:opacity-100"
                                  title="Editar gasto"
                                >
                                  <lucideReact.Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => eliminarGasto(expense.id)}
                                  className="text-gray-600 hover:text-red-600 transition-colors opacity-60 hover:opacity-100"
                                  title="Eliminar gasto"
                                >
                                  <lucideReact.Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Línea sumatoria */}
                    {!isLoading && filteredExpenses.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-light text-sm">
                            {viewMode === 'monthly' ? 'Total del mes' : 'Total del día'}
                          </span>
                          <span className="text-gray-800 font-semibold text-lg">
                            L. {totalExpenses.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setModalVisible(true);
                      setExpandedExpenses(false); // Cerrar panel al abrir modal
                    }}
                    className="w-full bg-yellow-400 text-gray-800 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <lucideReact.Plus className="w-5 h-5 text-gray-800" />
                    Agregar Gasto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overlay */}
          {expandedExpenses && (
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setExpandedExpenses(false)}
            ></div>
          )}
        </div>
      </div>

      {/* 🟢 Modal Agregar */}
      <ModalAgregarGasto 
        visible={modalVisible} 
        onHide={() => setModalVisible(false)} 
        onRefresh={recargarGastos} 
      />

      {/* 🔵 Modal Editar */}
      <ModalActualizarGasto
        visible={modalEditarVisible}
        onHide={() => setModalEditarVisible(false)}
        gastoSeleccionado={gastoSeleccionado}
        onRefresh={recargarGastos}
      />
    </div>
  );
};

export default Dashboard;