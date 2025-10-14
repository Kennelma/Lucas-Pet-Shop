import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertTriangle, ChevronLeft, ChevronRight, Package, FileText, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  
  //CONSTANTES PARA CERRAR SESIONES
  const token = sessionStorage.getItem('token')  
  const usuario = JSON.parse(sessionStorage.getItem('usuario'))  
  
  //PROTECCI;ON, SI NO HAY TOKEN DE SESIÓN, LO MANDA AL LOGIN Protección
  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])
  
  console.log("Token:", token)
  console.log("Usuario:", usuario?.nombre)
  
  const handleLogout = () => {
    sessionStorage.removeItem('token')  // ⬅️ Cambio
    sessionStorage.removeItem('usuario')  // ⬅️ Cambio
    navigate('/login')  // ⬅️ Mejor que window.location.href
  }



  
  // Obtener fecha actual en hora de Honduras (UTC-6)
  const getHondurasDate = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const hondurasTime = new Date(utc + (3600000 * -6));
    return hondurasTime;
  };

  const today = getHondurasDate();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

  const lowStockProducts = [
    { name: 'Vacuna - 20Mg', stock: 3, min: 8, price: 'L. 28.00' },
    { name: 'Vitamina C - 20Mg', stock: 2, min: 6, price: 'L. 22.00' },
    { name: 'Comida - 60Kg', stock: 2, min: 10, price: 'L. 25.00' }
  ];

  const expenses = [
    { description: 'Compra alimento', amount: 1500 },
    { description: 'Pago servicios', amount: 800 },
    { description: 'Mantenimiento', amount: 1200 },
    { description: 'Vacunas', amount: 2300 }
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const days = [];
    const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const isSelected = isValidDay && dayNumber === selectedDate;
      const isToday = isValidDay && 
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

  return (
    <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
     

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Columna Izquierda Principal */}
        <div className="lg:col-span-3 space-y-4">
          {/* Accesos Directos */}
          <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Accesos Directos
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition-all group">
                <FileText className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                <p className="mt-2 text-gray-700 font-semibold text-xs">Facturación</p>
              </button>
              <button className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition-all group">
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

          <div className="grid grid-cols-2 gap-4">
            {/* Gastos del Mes */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md rounded-xl p-4 border border-orange-200">
              <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-orange-500 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Gastos del Mes
              </h2>
              <div className="space-y-2 mb-3">
                {expenses.map((expense, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 px-2 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-100 transition-all">
                    <span className="text-sm text-gray-700 font-medium">{expense.description}</span>
                    <span className="text-sm font-bold text-orange-700">L. {expense.amount.toLocaleString()}</span>
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
            </div>

            {/* Productos de Bajo Stock */}
            <div className="bg-white shadow-md rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-red-500 rounded-lg">
                  <Package className="w-4 h-4 text-white" />
                </div>
                Bajo Stock
              </h2>
              <div className="space-y-2">
                {lowStockProducts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">Mín: {item.min} • {item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{item.stock}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-700 font-semibold">
                        Crítico
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Calendario */}
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
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1.5">
                  {day.substring(0, 1)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;