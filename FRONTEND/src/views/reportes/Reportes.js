import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Wallet 
} from 'lucide-react';
import Grafica from './Grafica.js';
import Tabla from './Tabla.js';
import ResumenDiario from './ResumenDiario';
import { verResumenDiario } from '../../AXIOS.SERVICES/reports-axios.js';
import { descargarPDF } from './pdf.js';
import { verGraficosMensual } from '../../AXIOS.SERVICES/reports-axios.js';

const Reportes = () => {
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  // Cargar datos desde la API
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

  const mesActual = new Date().getMonth();
  const nombreMesActual = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ][mesActual];

  // Datos del mes actual
  const ingresosMesActual = ingresos[mesActual]?.monto || 0;
  const gastosMesActual = gastos[mesActual]?.monto || 0;
  const gananciaMesActual = ingresosMesActual - gastosMesActual;

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-purple-100">
          <h1 className="text-3xl font-bold text-slate-700 mb-1">📊 Reportes Financieros</h1>
          <p className="text-slate-500">
            Análisis del año {anioSeleccionado}
          </p>
        </div>

        {/* Tarjetas del Mes Actual */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            📅 Resumen de {nombreMesActual} {anioSeleccionado}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TarjetaFinanciera 
              color="green" 
              titulo="Ingresos" 
              valor={ingresosMesActual} 
              icon={<TrendingUp className="w-7 h-7 text-green-600" />} 
            />
            <TarjetaFinanciera 
              color="red" 
              titulo="Gastos" 
              valor={gastosMesActual} 
              icon={<TrendingDown className="w-7 h-7 text-red-600" />} 
            />
            <TarjetaFinanciera 
              color={gananciaMesActual >= 0 ? "blue" : "orange"} 
              titulo="Ganancia" 
              valor={gananciaMesActual} 
              icon={<Wallet className={`w-7 h-7 ${gananciaMesActual >= 0 ? "text-blue-600" : "text-orange-600"}`} />} 
            />
          </div>
        </div>

        {/* Estados de carga y error */}
        {cargando && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 font-medium">Cargando datos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div className="flex-1">
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

       {/* Gráfica */}
{!cargando && (
  <div className="mb-6 flex gap-6">
    {/* Gráfico - cuadrado */}
    <div className="w-1/2 aspect-square">
      <Grafica 
        ingresos={ingresos}
        gastos={gastos}
        meses={meses}
      />
    </div>
    
    {/* ResumenDiario - cuadrado del mismo tamaño */}
    <div className="w-1/2 aspect-square">
      <ResumenDiario verResumenDiario={verResumenDiario} />
    </div>
  </div>
)}

        {/* Tabla Compacta */}
        {!cargando && (
          <div className="bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-700">📋 Detalle Mensual</h2>
                <div className="flex items-center gap-3">
                  <select 
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                    className="px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
                  >
                    {aniosDisponibles.map(anio => (
                      <option key={anio} value={anio}>{anio}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => descargarPDF()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mes</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-green-700">Ingresos</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-red-700">Gastos</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {datosTabla.map((dato, index) => {
                    const esMesActual = index === mesActual;
                    return (
                      <tr 
                        key={index} 
                        className={`hover:bg-slate-50 transition-colors ${esMesActual ? 'bg-purple-50 font-semibold' : ''}`}
                      >
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {dato.mes} {esMesActual && <span className="text-purple-600">●</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-700">
                          L {dato.ingreso.toLocaleString('es-HN')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-700">
                          L {dato.gasto.toLocaleString('es-HN')}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${dato.ganancia >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                          L {dato.ganancia.toLocaleString('es-HN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                  <tr className="font-bold">
                    <td className="px-4 py-3 text-sm text-slate-800">TOTAL ANUAL</td>
                    <td className="px-4 py-3 text-sm text-right text-green-800">
                      L {datosTabla.reduce((sum, d) => sum + d.ingreso, 0).toLocaleString('es-HN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-800">
                      L {datosTabla.reduce((sum, d) => sum + d.gasto, 0).toLocaleString('es-HN')}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right ${
                      datosTabla.reduce((sum, d) => sum + d.ganancia, 0) >= 0 ? 'text-blue-800' : 'text-orange-800'
                    }`}>
                      L {datosTabla.reduce((sum, d) => sum + d.ganancia, 0).toLocaleString('es-HN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
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
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-700',
      value: 'text-green-800'
    },
    red: {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-700',
      value: 'text-red-800'
    },
    blue: {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      value: 'text-blue-800'
    },
    orange: {
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      value: 'text-orange-800'
    }
  };

  const colors = colorMap[color];

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl shadow-lg p-5 border ${colors.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colors.text} text-xs font-medium mb-1`}>{titulo}</p>
          <p className={`text-2xl font-bold ${colors.value}`}>
            L {valor.toLocaleString('es-HN')}
          </p>
        </div>
        <div className="bg-white rounded-full p-3 shadow-md">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Reportes;