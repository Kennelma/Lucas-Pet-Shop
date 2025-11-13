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
    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>

        {/* Titulo */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundImage: 'url("/h100.png")', // 👉 cambia la ruta si usas otra imagen
            backgroundColor: '#79c2faff',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left center',
            boxShadow: '0 0 8px #F4B6C240, 0 0 0 1px #F4B6C233'
          }}
        >
          <div className="flex justify-center items-center">
            <h2 className="text-2xl font-black text-center uppercase text-black">
                    REPORTES FINANCIEROS
                  </h2>
          </div>
          <p
            className="text-center text-gray-700 italic mt-2"
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}
          >
            Gráficas y resumen del año actual
          </p>
        </div>



        {/* Resumen Financiero del Día - HORIZONTAL */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-800">
              Resumen Financiero del Día
            </h2>
          </div>
          
          {/* Tarjetas en línea horizontal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-around gap-8">
              
              {/* Gastos */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <ArrowDownRight className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                    Gastos
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    L {gastosMesActual.toLocaleString('es-HN')}
                  </p>
                </div>
              </div>

              {/* Separador vertical */}
              <div className="h-16 w-px bg-gray-300"></div>

              {/* Ingresos */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <ArrowUpRight className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                    Ingresos
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    L {ingresosMesActual.toLocaleString('es-HN')}
                  </p>
                </div>
              </div>

              {/* Separador vertical */}
              <div className="h-16 w-px bg-gray-300"></div>

              {/* Saldo Neto */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${gananciaMesActual >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <Wallet className={`w-7 h-7 ${gananciaMesActual >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${gananciaMesActual >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    Saldo Neto
                  </p>
                  <p className={`text-2xl font-bold ${gananciaMesActual >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    L {gananciaMesActual.toLocaleString('es-HN')}
                  </p>
                </div>
              </div>

            </div>
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