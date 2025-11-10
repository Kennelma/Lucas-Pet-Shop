import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-green-600">Ingresos: L {payload[0].value.toLocaleString()}</p>
        <p className="text-red-600">Gastos: L {payload[1].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const GraficaRecharts = ({
  ingresos = [],
  gastos = [],
  meses = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ]
}) => {

  // 🔢 calcular los últimos 3 meses
  const indicesUltimos3 = useMemo(() => {
    const now = new Date();
    const mesActual = now.getMonth();
    const arr = [];
    for (let i = 2; i >= 0; i--) arr.push((mesActual - i + 12) % 12);
    return arr;
  }, []);

  // 🧮 Transformar datos al formato que espera Recharts
  const datos = useMemo(() => {
    return indicesUltimos3.map((idx, index) => {
      // Obtener valor de ingresos
      const vIngreso = ingresos[idx];
      let valorIngreso = 0;
      if (vIngreso != null) {
        if (typeof vIngreso === 'number') valorIngreso = vIngreso;
        else if (typeof vIngreso === 'object') valorIngreso = Number(vIngreso.monto ?? vIngreso.amount ?? 0) || 0;
      }

      // Obtener valor de gastos
      const vGasto = gastos[idx];
      let valorGasto = 0;
      if (vGasto != null) {
        if (typeof vGasto === 'number') valorGasto = vGasto;
        else if (typeof vGasto === 'object') valorGasto = Number(vGasto.monto ?? vGasto.amount ?? 0) || 0;
      }

      return {
        mes: meses[idx] || `Mes ${idx + 1}`,
        ingresos: valorIngreso,
        gastos: valorGasto
      };
    });
  }, [ingresos, gastos, indicesUltimos3, meses]);

  return (
    // Gráfico principal
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Comparativa Mensual</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Gastos</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={datos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="mes" 
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => `L ${(value / 1000).toFixed(0)}K`}
            domain={[0, 100000]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <ReferenceLine y={100000} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Límite L 100K', position: 'right', fill: '#ef4444' }} />
          <Bar dataKey="ingresos" fill="#24b910ff" radius={[8, 8, 0, 0]} />
          <Bar dataKey="gastos" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficaRecharts;