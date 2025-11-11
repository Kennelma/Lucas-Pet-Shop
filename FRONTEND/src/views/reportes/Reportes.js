import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  AlertCircle, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  FileText
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
  const [ingresosTabla, setIngresosTabla] = useState([]);
  const [gastosTabla, setGastosTabla] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  // Cargar datos del año actual para gráfica y tarjetas (solo una vez)
  useEffect(() => {
    cargarDatosActual();
  }, []);

  // Cargar datos para tabla según año seleccionado
  useEffect(() => {
    if (anioSeleccionado === new Date().getFullYear()) {
      // Si es el año actual, usar los datos ya cargados
      setIngresosTabla(ingresos);
      setGastosTabla(gastos);
    } else {
      // Si es otro año, cargar datos específicos
      cargarDatosTabla();
    }
  }, [anioSeleccionado]);

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
      setIngresosTabla(ingresosFormateados); // Inicialmente la tabla también usa datos actuales
      setGastosTabla(gastosFormateados);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      const datosCero = Array(12).fill({ monto: 0 });
      setIngresos(datosCero);
      setGastos(datosCero);
      setIngresosTabla(datosCero);
      setGastosTabla(datosCero);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosTabla = async () => {
    setCargandoTabla(true);
    
    try {
      const response = await verGraficosMensual({ anio: anioSeleccionado });
      
      if (response.ok && response.data) {
        const ingresosFormateados = response.data.map(item => ({ monto: item.ingresos_netos || 0 }));
        const gastosFormateados = response.data.map(item => ({ monto: item.gastos || 0 }));

        setIngresosTabla(ingresosFormateados);
        setGastosTabla(gastosFormateados);
      }
    } catch (err) {
      console.error('Error al cargar datos de tabla:', err);
      const datosCero = Array(12).fill({ monto: 0 });
      setIngresosTabla(datosCero);
      setGastosTabla(datosCero);
    } finally {
      setCargandoTabla(false);
    }
  };

  const mesActual = new Date().getMonth();
  const nombreMesActual = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ][mesActual];

  // Datos del mes actual (SIEMPRE del año actual)
  const ingresosMesActual = ingresos[mesActual]?.monto || 0;
  const gastosMesActual = gastos[mesActual]?.monto || 0;
  const gananciaMesActual = ingresosMesActual - gastosMesActual;

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Datos para la tabla (cambian según año seleccionado)
  const datosTabla = meses.map((mes, index) => {
    const ingreso = ingresosTabla[index]?.monto || 0;
    const gasto = gastosTabla[index]?.monto || 0;
    const ganancia = ingreso - gasto;
    return { mes, ingreso, gasto, ganancia };
  });

  const anioActual = new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  const totalIngresos = datosTabla.reduce((sum, d) => sum + d.ingreso, 0);
  const totalGastos = datosTabla.reduce((sum, d) => sum + d.gasto, 0);
  const gananciaTotal = totalIngresos - totalGastos;

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-7 h-7 text-green-600" />
            <h1 className="text-2xl font-semibold text-gray-800">Reportes Financieros</h1>
          </div>
          <p className="text-sm text-gray-600 ml-10">
            Gráficas y resumen del año actual | Tabla del año {anioSeleccionado}
          </p>
        </div>

        {/* Tarjetas del Mes Actual (SIEMPRE año actual) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-800">
              Resumen de {nombreMesActual} {anioActual} (Actual)
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

        {/* Estados de carga y error */}
        {cargando && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-700 font-medium">Cargando datos del año actual...</p>
          </div>
        )}

        {cargandoTabla && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <p className="text-sm text-green-700 font-medium">Cargando datos del año {anioSeleccionado}...</p>
          </div>
        )}

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

        {/* Gráfica (SIEMPRE año actual) */}
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

        {/* Tabla Compacta (cambia según año seleccionado) */}
        {!cargando && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Detalle Mensual - Año {anioSeleccionado}
                    {anioSeleccionado !== anioActual && (
                      <span className="text-sm font-normal text-green-600 ml-2">
                        (Histórico)
                      </span>
                    )}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
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
                  <button
                    onClick={() => descargarPDF(datosTabla, totalIngresos, totalGastos, gananciaTotal)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PDF {anioSeleccionado}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mes</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-green-700">Ingresos</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-red-700">Gastos</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {datosTabla.map((dato, index) => {
                    const esMesActual = index === mesActual && anioSeleccionado === anioActual;
                    return (
                      <tr 
                        key={index} 
                        className={`hover:bg-gray-50 transition-colors ${esMesActual ? 'bg-green-50 font-medium' : ''}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {dato.mes} {esMesActual && <span className="text-green-600 font-semibold">● Actual</span>}
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
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr className="font-semibold">
                    <td className="px-4 py-3 text-sm text-gray-800">TOTAL {anioSeleccionado}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-800">
                      L {totalIngresos.toLocaleString('es-HN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-800">
                      L {totalGastos.toLocaleString('es-HN')}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right ${
                      gananciaTotal >= 0 ? 'text-blue-800' : 'text-orange-800'
                    }`}>
                      L {gananciaTotal.toLocaleString('es-HN')}
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