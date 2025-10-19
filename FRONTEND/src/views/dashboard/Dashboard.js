import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Package,
  FileText,
  TrendingUp,
  Users,
  Edit3,
  Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import ModalAgregarGasto from './modal_nuevo_gasto';
import ModalActualizarGasto from './modal_actualizar_gasto';
import { ver, eliminarRegistro } from '../../AXIOS.SERVICES/empresa-axios';

const Dashboard = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null);

  const token = sessionStorage.getItem('token');
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // 🔹 Fecha Honduras
  const getHondurasDate = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * -6);
  };

  const today = getHondurasDate();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const renderCalendar = () => {
    const days = [];
    const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const isSelected = isValidDay && dayNumber === selectedDate;
      const isToday =
        isValidDay &&
        dayNumber === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => isValidDay && setSelectedDate(dayNumber)}
          className={`h-9 flex items-center justify-center rounded-lg text-sm transition-all
            ${!isValidDay ? 'text-gray-300 cursor-default' : ''}
            ${isSelected ? 'bg-blue-500 text-white font-semibold' : ''}
            ${isToday && !isSelected ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
            ${isValidDay && !isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
          `}
          disabled={!isValidDay}
        >
          {isValidDay ? dayNumber : ''}
        </button>
      );
    }
    return days;
  };

  // 🔹 Cargar gastos desde la API
  const cargarGastos = async () => {
    setIsLoading(true);
    try {
      const data = await ver('GASTOS');
      if (Array.isArray(data)) {
        setExpenses(
          data.map((item) => ({
            id: item.id_gasto_pk,
            description: item.detalle_gasto,
            amount: Number(item.monto_gasto),
          }))
        );
      }
    } catch (err) {
      console.error('Error al cargar gastos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Cargar productos con bajo stock
  const cargarStockBajo = async () => {
    try {
      const data = await ver('PRODUCTOS_BAJO_STOCK'); // tu endpoint o entidad para stock bajo
      if (Array.isArray(data)) {
        setLowStock(data);
      }
    } catch (err) {
      console.error('Error al cargar productos con bajo stock:', err);
    }
  };

  useEffect(() => {
    cargarGastos();
    cargarStockBajo();
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

  return (
    <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {/* Accesos Directos */}
          <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Accesos Directos
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/facturacion')}
                className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition-all group"
              >
                <FileText className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                <p className="mt-2 text-gray-700 font-semibold text-xs">Facturación</p>
              </button>
              <button
                onClick={() => navigate('/reportes')}
                className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition-all group"
              >
                <TrendingUp className="w-8 h-8 text-purple-600 group-hover:text-purple-700" />
                <p className="mt-2 text-gray-700 font-semibold text-xs">Reportes</p>
              </button>
              <button
                onClick={() => navigate('/clientes')}
                className="bg-gradient-to-br from-green-50 to-green-100 shadow-sm p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition-all group"
              >
                <Users className="w-8 h-8 text-green-600 group-hover:text-green-700" />
                <p className="mt-2 text-gray-700 font-semibold text-xs">Clientes</p>
              </button>
            </div>
          </div>

          {/* Sección de gastos */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md rounded-xl p-4 border border-orange-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-orange-500 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Gastos del Mes
              </h2>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                onClick={() => setModalVisible(true)}
              >
                Agregar gasto
              </button>
            </div>

            {isLoading ? (
              <p className="text-center text-gray-500 text-sm">Cargando...</p>
            ) : expenses.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No hay gastos registrados.</p>
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center py-1.5 px-2 bg-white bg-opacity-70 rounded-lg hover:bg-opacity-100 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 font-medium">{expense.description}</span>
                        <span className="text-xs text-gray-500">L. {expense.amount.toLocaleString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setGastoSeleccionado(expense);
                            setModalEditarVisible(true);
                          }}
                          className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => eliminarGasto(expense.id)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t-2 border-orange-300 bg-white rounded-lg p-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-sm">Total</span>
                    <span className="font-bold text-xl text-orange-600">
                      L. {expenses.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tabla de Bajo Stock */}
          <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200">
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-red-500" />
              Productos con Bajo Stock
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No hay productos con bajo stock.</p>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="p-2">Producto</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((prod) => (
                    <tr key={prod.id_producto_pk} className="border-b hover:bg-gray-50">
                      <td className="p-2">{prod.nombre_producto}</td>
                      <td className="p-2 text-center">{prod.stock_actual}</td>
                      <td className="p-2 text-center text-red-600 font-semibold">{prod.stock_minimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Calendario */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-xl p-4 sticky top-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1.5">
                  {day.substring(0, 1)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">{renderCalendar()}</div>
          </div>
        </div>
      </div>

      {/* 🟢 Modal Agregar */}
      <ModalAgregarGasto visible={modalVisible} onHide={() => setModalVisible(false)} onRefresh={recargarGastos} />

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
