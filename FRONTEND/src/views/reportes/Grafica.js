import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-blue-600 flex items-center gap-1">
          <ArrowUpRight className="w-4 h-4" />
          Ingresos: L {payload[0].value.toLocaleString()}
        </p>
        <p className="text-red-600 flex items-center gap-1">
          <ArrowDownRight className="w-4 h-4" />
          Gastos: L {payload[1].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Grafica = ({ obtenerRegistroFinanciero, anio }) => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indiceInicio, setIndiceInicio] = useState(0); // Para controlar qué 3 meses mostrar

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Cargar datos del endpoint
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar el año actual si no se proporciona
        const anioActual = anio || new Date().getFullYear();

        const response = await obtenerRegistroFinanciero(anioActual);

        if (response.Consulta && response.registros) {
          setRegistros(response.registros);

          // Calcular índice inicial para mostrar los últimos 3 meses con datos
          const mesActual = new Date().getMonth();
          const maxIndice = Math.max(0, mesActual - 2);
          setIndiceInicio(maxIndice);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        console.error('Error al cargar registros financieros:', err);
        setError('Error al cargar los datos del servidor');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [anio, obtenerRegistroFinanciero]);

  // Calcular los 3 meses a mostrar según indiceInicio
  const mesesAMostrar = useMemo(() => {
    const indices = [];
    for (let i = 0; i < 3; i++) {
      indices.push(indiceInicio + i);
    }
    return indices;
  }, [indiceInicio]);

  // Transformar datos al formato que espera Recharts
  const datos = useMemo(() => {
    // Crear un mapa de los registros por mes
    const registrosPorMes = {};
    registros.forEach(registro => {
      registrosPorMes[registro.mes - 1] = {
        ingresos: Number(registro.total_ingresos) || 0,
        gastos: Number(registro.total_gastos) || 0
      };
    });

    // Generar datos para los 3 meses seleccionados
    return mesesAMostrar.map((idx) => {
      const registro = registrosPorMes[idx] || { ingresos: 0, gastos: 0 };

      return {
        mes: meses[idx] || `Mes ${idx + 1}`,
        ingresos: registro.ingresos,
        gastos: registro.gastos
      };
    });
  }, [registros, mesesAMostrar, meses]);

  // Calcular el máximo valor para ajustar el dominio del gráfico
  const maxValor = useMemo(() => {
    const valores = datos.flatMap(d => [d.ingresos, d.gastos]);
    const max = Math.max(...valores, 0);
    // Redondear hacia arriba a la siguiente unidad de 10000
    return Math.ceil(max / 10000) * 10000 || 100000;
  }, [datos]);

  // Funciones para navegar entre meses
  const irMesesAnteriores = () => {
    if (indiceInicio > 0) {
      setIndiceInicio(prev => Math.max(0, prev - 1));
    }
  };

  const irMesesSiguientes = () => {
    if (indiceInicio < 9) { // Máximo índice para que quepan 3 meses (9, 10, 11)
      setIndiceInicio(prev => Math.min(9, prev + 1));
    }
  };

  const puedeRetroceder = indiceInicio > 0;
  const puedeAvanzar = indiceInicio < 9;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            COMPARATIVA MENSUAL
          </div>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center gap-2">
          <button
            onClick={irMesesAnteriores}
            disabled={!puedeRetroceder}
            className={`p-1.5 rounded-lg transition-all ${
              puedeRetroceder
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title="Meses anteriores"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs text-gray-600 font-medium px-2">
            {meses[mesesAMostrar[0]]} - {meses[mesesAMostrar[2]]}
          </span>

          <button
            onClick={irMesesSiguientes}
            disabled={!puedeAvanzar}
            className={`p-1.5 rounded-lg transition-all ${
              puedeAvanzar
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title="Meses siguientes"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="mes"
              tick={{ fill: '#6b7280', fontFamily: 'Poppins, sans-serif', fontSize: 11 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontFamily: 'Poppins, sans-serif', fontSize: 10 }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => `L ${(value / 1000).toFixed(0)}K`}
              domain={[0, maxValor]}
            />
            <Tooltip content={<CustomTooltip />} />
            {maxValor >= 100000 && (
              <ReferenceLine
                y={100000}
                stroke="#dc2626"
                strokeDasharray="3 3"
                label={{ value: 'Límite L 100K', position: 'right', fill: '#dc2626', fontFamily: 'Poppins, sans-serif', fontSize: 10 }}
              />
            )}
            <Bar dataKey="ingresos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="gastos" fill="#dc2626" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-4 text-xs mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-600 font-medium uppercase">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-600 rounded"></div>
          <span className="text-gray-600 font-medium uppercase">Gastos</span>
        </div>
      </div>
    </div>
  );
};

export default Grafica;