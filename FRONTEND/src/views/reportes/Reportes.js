import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  FileText
} from 'lucide-react';
import Grafica from './Grafica.js';
import Tabla from './Tabla';
import { obtenerRegistroFinanciero, obtenerReporteDiario, obtenerHistorialReportes } from '../../AXIOS.SERVICES/reports-axios.js';

const Reportes = () => {
  const [pestanaActiva, setPestanaActiva] = useState('reportes');
  const [registrosFinancieros, setRegistrosFinancieros] = useState([]);
  const [reporteDiario, setReporteDiario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoDiario, setCargandoDiario] = useState(true);
  const [error, setError] = useState(null);
  const [errorDiario, setErrorDiario] = useState(null);

  useEffect(() => {
    if (pestanaActiva === 'reportes') {
      cargarDatosActual();
      cargarReporteDiario();
    }
  }, [pestanaActiva]);

  const cargarDatosActual = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const anioActual = new Date().getFullYear();
      const response = await obtenerRegistroFinanciero(anioActual);
      
      if (!response.Consulta || !response.registros) {
        throw new Error('No se pudieron cargar los datos');
      }

      setRegistrosFinancieros(response.registros);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      setRegistrosFinancieros([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarReporteDiario = async () => {
    setCargandoDiario(true);
    setErrorDiario(null);
    
    try {
      const response = await obtenerReporteDiario();
      
      if (!response.Consulta || !response.reporte) {
        throw new Error('No se pudieron cargar los datos del día');
      }

      // El endpoint devuelve un array con un solo objeto
      setReporteDiario(response.reporte[0]);

    } catch (err) {
      console.error('Error al cargar reporte diario:', err);
      setErrorDiario('Error al cargar el reporte diario.');
      setReporteDiario(null);
    } finally {
      setCargandoDiario(false);
    }
  };

  const anioActual = new Date().getFullYear();
  const fechaActual = new Date();
  
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Obtener datos del reporte diario
  const ingresosDiarios = reporteDiario ? Number(reporteDiario.ingresos) || 0 : 0;
  const gastosDiarios = reporteDiario ? Number(reporteDiario.gastos) || 0 : 0;
  const saldoDiario = ingresosDiarios - gastosDiarios;

  // Formatear fecha para mostrar
  const fechaFormateada = fechaActual.toLocaleDateString('es-HN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>

        {/* Titulo */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundImage: 'url("/h100.png")',
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

        {/* Pestañas de navegación */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1.5">
            <button
              onClick={() => setPestanaActiva('reportes')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                pestanaActiva === 'reportes'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reportes Financieros
            </button>
            <button
              onClick={() => setPestanaActiva('tabla')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                pestanaActiva === 'tabla'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Historial de Reportes
            </button>
          </div>
        </div>

        {/* Contenido según pestaña activa */}
        {pestanaActiva === 'reportes' ? (
          <>
            {/* Resumen Financiero del Día - HORIZONTAL */}
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Resumen Financiero del Día
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {fechaFormateada}
                  </p>
                </div>

                {/* Estado de carga del reporte diario */}
                {cargandoDiario ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600 ml-3">Cargando reporte del día...</p>
                  </div>
                ) : errorDiario ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700">{errorDiario}</p>
                      <button 
                        onClick={cargarReporteDiario}
                        className="text-sm text-red-600 underline mt-1 hover:text-red-800"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-around gap-8">
                    
                    {/* Gastos */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 rounded-xl">
                        <ArrowDownRight className="w-7 h-7 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                          Gastos del Día
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          L {gastosDiarios.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                          Ingresos del Día
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          L {ingresosDiarios.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Separador vertical */}
                    <div className="h-16 w-px bg-gray-300"></div>

                    {/* Saldo Neto */}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${saldoDiario >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                        <Wallet className={`w-7 h-7 ${saldoDiario >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${saldoDiario >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          Saldo del Día
                        </p>
                        <p className={`text-2xl font-bold ${saldoDiario >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                          L {saldoDiario.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                  </div>
                )}
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

            {/* Gráfica - Ahora ocupa todo el ancho */}
            {!cargando && (
              <div className="mb-6">
                <div className="h-96">
                  <Grafica 
                    obtenerRegistroFinanciero={obtenerRegistroFinanciero}
                    anio={anioActual}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <Tabla 
            obtenerRegistroFinanciero={obtenerRegistroFinanciero}
            obtenerHistorialReportes={obtenerHistorialReportes}
          />
        )}
      </div>
    </div>
  );
};

export default Reportes;