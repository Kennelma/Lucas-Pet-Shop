import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

const Grafica = ({
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
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Comparativa Últimos 3 Meses
          </h3>
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
              domain={[0, 100000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={100000} 
              stroke="#dc2626" 
              strokeDasharray="3 3" 
              label={{ value: 'Límite L 100K', position: 'right', fill: '#dc2626', fontFamily: 'Poppins, sans-serif', fontSize: 10 }} 
            />
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