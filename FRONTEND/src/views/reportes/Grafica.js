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
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Comparativa Mensual de los Últimos 3 Meses
          </h3>
        </div>
      </div>

      <div className="flex gap-6 text-sm mb-4">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-blue-600" />
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-600 font-medium">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowDownRight className="w-4 h-4 text-red-600" />
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-600 font-medium">Gastos</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={datos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="mes" 
            tick={{ fill: '#6b7280', fontFamily: 'Poppins, sans-serif' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontFamily: 'Poppins, sans-serif' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => `L ${(value / 1000).toFixed(0)}K`}
            domain={[0, 100000]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', fontFamily: 'Poppins, sans-serif' }}
            iconType="square"
          />
          <ReferenceLine 
            y={100000} 
            stroke="#dc2626" 
            strokeDasharray="3 3" 
            label={{ value: 'Límite L 100K', position: 'right', fill: '#dc2626', fontFamily: 'Poppins, sans-serif' }} 
          />
          <Bar dataKey="ingresos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="gastos" fill="#dc2626" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Grafica;