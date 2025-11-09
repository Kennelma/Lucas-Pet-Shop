import React, { useState, useEffect, useRef } from 'react';
import { Download, BarChart3, Table2, Wallet, Calendar, AlertCircle, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import VistaNormal from './VistaNormal.js';
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
  const [vistaAnual, setVistaAnual] = useState(false); // Toggle entre mensual y anual
  
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

      const ingresosFormateados = response.data.map(item => ({
        monto: item.ingresos_netos || 0
      }));

      const gastosFormateados = response.data.map(item => ({
        monto: item.gastos || 0
      }));

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
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // OBTENER MES ACTUAL
  const mesActual = new Date().getMonth();
  const nombreMesActual = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mesActual];

  // CALCULAR DATOS DEL MES ACTUAL
  const ingresosMesActual = ingresos[mesActual]?.monto || 0;
  const gastosMesActual = gastos[mesActual]?.monto || 0;
  const gananciaMesActual = ingresosMesActual - gastosMesActual;

  // CALCULAR TOTALES ANUALES
  const totalIngresos = ingresos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const totalGastos = gastos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const gananciaTotal = totalIngresos - totalGastos;

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const datosTabla = meses.map((mes, index) => {
    const ingreso = ingresos[index]?.monto || 0;
    const gasto = gastos[index]?.monto || 0;
    const ganancia = ingreso - gasto;
    return { mes, ingreso, gasto, ganancia };
  });

  const anioActual = new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Selector de año y botones de navegación */}
        <div className="sticky top-4 z-50 p-4 mb-6 mt-20">
          <div className="flex flex-wrap gap-3 justify-center items-center">
            {/* Selector de año */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-lg border border-purple-200">
              <Calendar className="w-5 h-5 text-purple-600" />
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
              >
                {aniosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>

            {/* Botón toggle Mensual/Anual */}
            <button
              onClick={() => setVistaAnual(!vistaAnual)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
            >
              <CalendarDays className="w-5 h-5" />
              {vistaAnual ? 'Ver Mensual' : 'Ver Anual'}
            </button>

            {/* Botones de navegación */}
            <button
              onClick={() => scrollToSection(vistaNormalRef)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
            >
              <Wallet className="w-5 h-5" />
              Vista Normal
            </button>
            <button
              onClick={() => scrollToSection(graficaRef)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="w-5 h-5" />
              Gráfica
            </button>
            <button
              onClick={() => scrollToSection(tablaRef)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
            >
              <Table2 className="w-5 h-5" />
              Tabla
            </button>
            <button
              onClick={() => descargarPDF(datosTabla, totalIngresos, totalGastos, gananciaTotal)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* TARJETAS - Vista Condicional */}
        <div className="mb-8">
          {!vistaAnual ? (
            // VISTA MENSUAL
            <>
              <h2 className="text-2xl font-bold text-slate-700 mb-4 text-center">
                📅 Resumen de {nombreMesActual} {anioSeleccionado}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Ingresos del mes actual */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg p-6 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 text-sm font-medium mb-2">Total Ingresos</p>
                      <p className="text-4xl font-bold text-green-800">
                        L {ingresosMesActual.toLocaleString('es-HN')}
                      </p>
                    </div>
                    <div className="bg-white rounded-full p-4 shadow-md">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Total Gastos del mes actual */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl shadow-lg p-6 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-700 text-sm font-medium mb-2">Total Gastos</p>
                      <p className="text-4xl font-bold text-red-800">
                        L {gastosMesActual.toLocaleString('es-HN')}
                      </p>
                    </div>
                    <div className="bg-white rounded-full p-4 shadow-md">
                      <TrendingDown className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Ganancia Total del mes actual */}
                <div className={`bg-gradient-to-br ${gananciaMesActual >= 0 ? 'from-blue-50 to-cyan-50' : 'from-orange-50 to-amber-50'} rounded-3xl shadow-lg p-6 border ${gananciaMesActual >= 0 ? 'border-blue-100' : 'border-orange-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${gananciaMesActual >= 0 ? 'text-blue-700' : 'text-orange-700'} text-sm font-medium mb-2`}>
                        Ganancia Total
                      </p>
                      <p className={`text-4xl font-bold ${gananciaMesActual >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                        L {gananciaMesActual.toLocaleString('es-HN')}
                      </p>
                    </div>
                    <div className="bg-white rounded-full p-4 shadow-md">
                      <Wallet className={`w-8 h-8 ${gananciaMesActual >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // VISTA ANUAL
            <>
              <h2 className="text-2xl font-bold text-slate-700 mb-4 text-center">
                📊 Resumen Anual {anioSeleccionado}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Ingresos anual */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg p-6 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 text-sm font-medium mb-2">Total Ingresos</p>
                      <p className="text-4xl font-bold text-green-800">
                        L {totalIngresos.toLocaleString('es-HN')}
                      </p>
                    </div>
                    <div className="bg-white rounded-full p-4 shadow-md">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Total Gastos anual */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl shadow-lg p-6 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-700 text-sm font-medium mb-2">Total Gastos</p>
                      <p className="text-4xl font-bold text-red-800">
                        L {totalGastos.toLocaleString('es-HN')}
                      </p>
                    </div>
                    <div className="bg-white rounded-full p-4 shadow-md">
                      <TrendingDown className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Ganancia Total anual */}
                <div className={`bg-gradient-to-br ${gananciaTotal >= 0 ? 'from-blue-50 to-cyan-50' : 'from-orange-50 to-amber-50'} rounded-3xl shadow-lg p-6 border ${gananciaTotal >= 0 ? 'border-blue-100' : 'border-orange-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${gananciaTotal >= 0 ? 'text-blue-700' : 'text-orange-700'} text-sm font-medium mb-2`}>
                        Ganancia Total
                      </p>
                      <p className={`text-4xl font-bold ${gananciaTotal >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                        L {gananciaTotal.toLocaleString('es-HN')}
                      </p>
                    </div>
                    <div className="bg-white rounded-full p-4 shadow-md">
                      <Wallet className={`w-8 h-8 ${gananciaTotal >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Indicador de carga */}
        {cargando && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 font-medium">Cargando datos financieros de {anioSeleccionado}...</p>
          </div>
        )}

        {/* Mensaje de error */}
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

        {/* Contenido principal */}
        {!cargando && (
          <>
            <div ref={vistaNormalRef}>
              <VistaNormal 
                totalIngresos={totalIngresos}
                totalGastos={totalGastos}
                gananciaTotal={gananciaTotal}
                anioSeleccionado={anioSeleccionado}
              />
            </div>

            <div ref={graficaRef}>
              <Grafica 
                ingresos={ingresos}
                gastos={gastos}
                meses={meses}
              />
            </div>

            <div ref={tablaRef}>
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
  );
};

export default Reportes;