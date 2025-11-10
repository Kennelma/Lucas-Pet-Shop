import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  BarChart3, 
  Table2, 
  Wallet, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  CalendarDays 
} from 'lucide-react';
import Grafica from './Grafica.js';
import Tabla from './Tabla.js';
import { descargarPDF } from './pdf.js';
import { verGraficosMensual } from '../../AXIOS.SERVICES/reports-axios.js';

const Reportes = () => {
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [vistaAnual, setVistaAnual] = useState(false);
  
  const vistaNormalRef = useRef(null);
  const graficaRef = useRef(null);
  const tablaRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, [anioSeleccionado]);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await verGraficosMensual({ anio: anioSeleccionado });
      
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
      setIngresos(Array(12).fill({ monto: 0 }));
      setGastos(Array(12).fill({ monto: 0 }));
    } finally {
      setCargando(false);
    }
  };

  const scrollToSection = (ref) => {
    const element = ref.current;
    if (element) {
      const offset = 180; // Aumentado para compensar el header fijo
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const mesActual = new Date().getMonth();
  const nombreMesActual = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ][mesActual];

  const ingresosMesActual = ingresos[mesActual]?.monto || 0;
  const gastosMesActual = gastos[mesActual]?.monto || 0;
  const gananciaMesActual = ingresosMesActual - gastosMesActual;

  const totalIngresos = ingresos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const totalGastos = gastos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const gananciaTotal = totalIngresos - totalGastos;

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const datosTabla = meses.map((mes, index) => {
    const ingreso = ingresos[index]?.monto || 0;
    const gasto = gastos[index]?.monto || 0;
    const ganancia = ingreso - gasto;
    return { mes, ingreso, gasto, ganancia };
  });

  const anioActual = new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-24">
      {/* ==== ENCABEZADO FIJO ==== */}
      <div className="fixed top-16 left-0 right-0 z-50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center items-center">
            
            {/* Botones de navegación */}
            <button onClick={() => scrollToSection(graficaRef)} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-200">
              <BarChart3 className="w-5 h-5" /> Gráfica
            </button>
            <button onClick={() => scrollToSection(tablaRef)} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-200">
              <Table2 className="w-5 h-5" /> Tabla
            </button>
          </div>
        </div>
      </div>

      {/* ==== CONTENIDO ==== */}
      <div className="max-w-7xl mx-auto">
        <div className="p-6">
          {/* ==== TARJETAS MENSUAL ==== */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-700 mb-4 text-center">
              📅 Resumen de {nombreMesActual} {anioSeleccionado}
            </h2>
            <VistaFinanciera 
              ingresos={ingresosMesActual}
              gastos={gastosMesActual}
              ganancia={gananciaMesActual}
            />
          </div>

          {/* ==== ESTADOS ==== */}
          {cargando && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 font-medium">Cargando datos financieros de {anioSeleccionado}...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-red-700 font-medium">{error}</p>
                <button 
                  onClick={cargarDatos}
                  className="text-red-600 underline text-sm mt-1 hover:text-red-800"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* ==== CONTENIDO ==== */}
          {!cargando && (
            <>
              <div ref={vistaNormalRef}>
                <VistaNormal anioSeleccionado={anioSeleccionado} />
              </div>

              <div ref={graficaRef}>
                <Grafica ingresos={ingresos} gastos={gastos} meses={meses} />
              </div>

              <div ref={tablaRef}>
                <div className="bg-white rounded-2xl shadow-md p-6 mb-4 border border-purple-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-700">📋 Tabla de Datos</h2>
                    <button
                      onClick={() => descargarPDF(datosTabla, totalIngresos, totalGastos, gananciaTotal)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
                    >
                      <Download className="w-5 h-5" /> Descargar PDF
                    </button>
                  </div>
                </div>
                <Tabla 
                  datosTabla={datosTabla}
                  totalIngresos={totalIngresos}
                  totalGastos={totalGastos}
                  gananciaTotal={gananciaTotal}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ====== SUBCOMPONENTES ====== */

// Vista de tarjetas financieras (mensual / anual)
const VistaFinanciera = ({ ingresos, gastos, ganancia }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Tarjeta color="green" titulo="Total Ingresos" valor={ingresos} icon={<TrendingUp className="w-8 h-8 text-green-600" />} />
    <Tarjeta color="red" titulo="Total Gastos" valor={gastos} icon={<TrendingDown className="w-8 h-8 text-red-600" />} />
    <Tarjeta color={ganancia >= 0 ? "blue" : "orange"} titulo="Ganancia Total" valor={ganancia} icon={<Wallet className={`w-8 h-8 ${ganancia >= 0 ? "text-blue-600" : "text-orange-600"}`} />} />
  </div>
);

// Tarjeta individual
const Tarjeta = ({ color, titulo, valor, icon }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-3xl shadow-lg p-6 border border-${color}-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-${color}-700 text-sm font-medium mb-2`}>{titulo}</p>
        <p className={`text-4xl font-bold text-${color}-800`}>
          L {valor.toLocaleString('es-HN')}
        </p>
      </div>
      <div className="bg-white rounded-full p-4 shadow-md">{icon}</div>
    </div>
  </div>
);

// Vista general SIN tarjetas duplicadas
const VistaNormal = ({ anioSeleccionado }) => (
  <div className="mt-6">
    <div className="bg-white rounded-2xl shadow-md p-8 mb-6 border border-purple-100">
      <h1 className="text-4xl font-bold text-slate-700 mb-2">📊 Reportes Financieros</h1>
      <p className="text-slate-500 text-lg">
        Análisis de ingresos, gastos y ganancias del año {anioSeleccionado}
      </p>
    </div>
    {/* ✅ TARJETAS ELIMINADAS - Solo quedan las de arriba */}
  </div>
);

export default Reportes;