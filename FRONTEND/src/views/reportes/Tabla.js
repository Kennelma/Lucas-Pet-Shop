import React, { useState, useEffect } from 'react';
import { 
  Download, 
  AlertCircle, 
  Calendar,
  FileText,
  Filter
} from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { verGraficosMensual } from '../../AXIOS.SERVICES/reports-axios.js';
import { descargarPDFTabla } from './pdf.js';

const Tabla = () => {
  const [datosTabla, setDatosTabla] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [vistaActual, setVistaActual] = useState('anual'); // 'anual' o 'mensual'

  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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

      const datosFormateados = meses.map((mes, index) => {
        const ingreso = response.data[index]?.ingresos_netos || 0;
        const gasto = response.data[index]?.gastos || 0;
        const ganancia = ingreso - gasto;
        return { mes, ingreso, gasto, ganancia };
      });

      setDatosTabla(datosFormateados);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      const datosCero = meses.map(mes => ({ mes, ingreso: 0, gasto: 0, ganancia: 0 }));
      setDatosTabla(datosCero);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar datos según la vista seleccionada
  const datosFiltrados = vistaActual === 'mensual' 
    ? [datosTabla[mesActual]] 
    : datosTabla;

  // Calcular totales
  const totalIngresos = datosFiltrados.reduce((sum, d) => sum + (d?.ingreso || 0), 0);
  const totalGastos = datosFiltrados.reduce((sum, d) => sum + (d?.gasto || 0), 0);
  const gananciaTotal = totalIngresos - totalGastos;

  // Funciones para el body de las columnas
  const bodyMes = (rowData) => {
    const esMesActual = rowData.mes === meses[mesActual] && anioSeleccionado === anioActual;
    return (
      <span className="text-slate-700 font-medium">
        {rowData.mes}
        {esMesActual && vistaActual === 'anual' && (
          <span className="text-green-600 font-semibold ml-2">● Actual</span>
        )}
      </span>
    );
  };

  const bodyIngresos = (rowData) => (
    <span className="text-green-700 font-semibold">
      L {rowData.ingreso.toLocaleString('es-HN')}
    </span>
  );

  const bodyGastos = (rowData) => (
    <span className="text-red-700 font-semibold">
      L {rowData.gasto.toLocaleString('es-HN')}
    </span>
  );

  const bodyGanancia = (rowData) => (
    <span className={`font-bold ${rowData.ganancia >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
      L {rowData.ganancia.toLocaleString('es-HN')}
    </span>
  );

  // Footers para totales
  const footerMes = () => <strong className="text-slate-800">TOTAL {anioSeleccionado}</strong>;
  const footerIngresos = () => (
    <span className="text-green-800 font-bold">L {totalIngresos.toLocaleString('es-HN')}</span>
  );
  const footerGastos = () => (
    <span className="text-red-800 font-bold">L {totalGastos.toLocaleString('es-HN')}</span>
  );
  const footerGanancia = () => (
    <span className={`font-bold ${gananciaTotal >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
      L {gananciaTotal.toLocaleString('es-HN')}
    </span>
  );

  const manejarDescargaPDF = () => {
    descargarPDFTabla(
      datosFiltrados, 
      totalIngresos, 
      totalGastos, 
      gananciaTotal,
      anioSeleccionado,
      vistaActual === 'mensual' ? meses[mesActual] : null
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-7 h-7 text-green-600" />
            <h1 className="text-2xl font-semibold text-gray-800">Tabla de Reportes</h1>
          </div>
          <p className="text-sm text-gray-600 ml-10">
            Detalle mensual de ingresos, gastos y ganancias
          </p>
        </div>

        {/* Estados de carga y error */}
        {cargando && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-700 font-medium">
              Cargando datos del año {anioSeleccionado}...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button 
                onClick={cargarDatos}
                className="text-sm text-red-600 underline mt-1 hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Tabla */}
        {!cargando && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-semibold text-gray-800">
                    {vistaActual === 'mensual' 
                      ? `${meses[mesActual]} ${anioSeleccionado}`
                      : `Detalle Anual ${anioSeleccionado}`
                    }
                    {anioSeleccionado !== anioActual && (
                      <span className="text-sm font-normal text-green-600 ml-2">
                        (Histórico)
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Selector de año */}
                  <select 
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                    className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 bg-white"
                  >
                    {aniosDisponibles.map(anio => (
                      <option key={anio} value={anio}>
                        {anio} {anio === anioActual ? '(Actual)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Selector de vista */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setVistaActual('anual')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        vistaActual === 'anual'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Anual
                    </button>
                    <button
                      onClick={() => setVistaActual('mensual')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        vistaActual === 'mensual'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      Mes Actual
                    </button>
                  </div>

                  {/* Botón de descarga PDF */}
                  <button
                    onClick={manejarDescargaPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PDF {vistaActual === 'mensual' ? meses[mesActual] : anioSeleccionado}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tabla con PrimeReact */}
            <div className="p-6">
              <DataTable
                value={datosFiltrados}
                className="font-poppins"
                showGridlines
                responsiveLayout="scroll"
                emptyMessage="No hay datos disponibles"
                rowClassName={(rowData, index) => {
                  const esMesActual = rowData.mes === meses[mesActual] && 
                                      anioSeleccionado === anioActual && 
                                      vistaActual === 'anual';
                  return esMesActual 
                    ? 'bg-green-50 font-medium' 
                    : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
                }}
              >
                <Column 
                  header="Mes" 
                  body={bodyMes} 
                  footer={footerMes} 
                  className="text-sm font-medium" 
                />
                <Column 
                  header="Ingresos" 
                  body={bodyIngresos} 
                  footer={footerIngresos} 
                  className="text-sm text-right" 
                />
                <Column 
                  header="Gastos" 
                  body={bodyGastos} 
                  footer={footerGastos} 
                  className="text-sm text-right" 
                />
                <Column 
                  header="Ganancia" 
                  body={bodyGanancia} 
                  footer={footerGanancia} 
                  className="text-sm text-right" 
                />
              </DataTable>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabla;