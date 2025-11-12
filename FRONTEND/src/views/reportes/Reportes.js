import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3
} from 'lucide-react';
import Grafica from './Grafica.js';
import ResumenDiario from './ResumenDiario';
import { verResumenDiario, verGraficosMensual } from '../../AXIOS.SERVICES/reports-axios.js';

const Reportes = () => {
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatosActual();
  }, []);

  const cargarDatosActual = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const anioActual = new Date().getFullYear();
      const response = await verGraficosMensual({ anio: anioActual });
      
      if (!response.ok || !response.data) {
        throw new Error('No se pudieron cargar los datos');
      }

      const ingresosFormateados = response.data.map(item => ({ monto: item.ingresos_netos || 0 }));
      const gastosFormateados = response.data.map(item => ({ monto: item.gastos || 0 }));

      setIngresos(ingresosFormateados);
      setGastos(gastosFormateados);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      const datosCero = Array(12).fill({ monto: 0 });
      setIngresos(datosCero);
      setGastos(datosCero);
    } finally {
      setCargando(false);
    }
  };

  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();
  
  const nombreMesActual = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ][mesActual];

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Datos del mes actual
  const ingresosMesActual = ingresos[mesActual]?.monto || 0;
  const gastosMesActual = gastos[mesActual]?.monto || 0;
  const gananciaMesActual = ingresosMesActual - gastosMesActual;

  return (
    <div className="reportes-module min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            REPORTES FINANCIEROS
          </h1>
          <p className="text-center text-gray-600 italic" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}>
            Gráficas y resumen del año actual
          </p>
        </div>

        {/* Tarjetas del Mes Actual */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-800">
              Resumen de {nombreMesActual} {anioActual}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TarjetaFinanciera 
              color="green" 
              titulo="Ingresos" 
              valor={ingresosMesActual} 
              icon={<ArrowUpRight className="w-6 h-6" />} 
            />
            <TarjetaFinanciera 
              color="red" 
              titulo="Gastos" 
              valor={gastosMesActual} 
              icon={<ArrowDownRight className="w-6 h-6" />} 
            />
            <TarjetaFinanciera 
              color={gananciaMesActual >= 0 ? "blue" : "orange"} 
              titulo="Ganancia" 
              valor={gananciaMesActual} 
              icon={<Wallet className="w-6 h-6" />} 
            />
          </div>
        </div>

        {/* Estado de carga */}
        {cargando && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-700 font-medium">Cargando datos del año actual...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button 
                onClick={cargarDatosActual}
                className="text-sm text-red-600 underline mt-1 hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Gráfica y Resumen Diario */}
        {!cargando && (
          <div className="mb-6 flex gap-6">
            <div className="w-1/2 aspect-square">
              <Grafica 
                ingresos={ingresos}
                gastos={gastos}
                meses={meses}
              />
            </div>
            
            <div className="w-1/2 aspect-square">
              <ResumenDiario verResumenDiario={verResumenDiario} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de tarjeta financiera
const TarjetaFinanciera = ({ color, titulo, valor, icon }) => {
  const colorMap = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      value: 'text-green-800',
      icon: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      value: 'text-red-800',
      icon: 'text-red-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      value: 'text-blue-800',
      icon: 'text-blue-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      value: 'text-orange-800',
      icon: 'text-orange-600'
    }
  };

  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} rounded-xl shadow-sm p-5 border ${colors.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colors.text} text-xs font-medium mb-2`}>{titulo}</p>
          <p className={`text-xl font-semibold ${colors.value}`}>
            L {valor.toLocaleString('es-HN')}
          </p>
        </div>
        <div className={`${colors.icon} bg-white rounded-lg p-3 shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Reportes;