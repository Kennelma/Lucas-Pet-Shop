import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

// ============================================
// DATOS DE EJEMPLO (Simula respuesta de API)
// ============================================
const mockApiData = [
  { month: 'Ene', tipoA: 800, tipoB: 400 },
  { month: 'Feb', tipoA: 1150, tipoB: 550 },
  { month: 'Mar', tipoA: 1250, tipoB: 950 },
  { month: 'Abr', tipoA: 1500, tipoB: 1100 },
  { month: 'May', tipoA: 2000, tipoB: 1100 },
  { month: 'Jun', tipoA: 2200, tipoB: 1200 },
  { month: 'Jul', tipoA: 2000, tipoB: 1300 },
  { month: 'Ago', tipoA: 2200, tipoB: 1450 },
  { month: 'Sep', tipoA: 2300, tipoB: 1300 },
  { month: 'Oct', tipoA: 2100, tipoB: 1900 },
  { month: 'Nov', tipoA: 1500, tipoB: 1300 },
  { month: 'Dic', tipoA: 1300, tipoB: 1250 }
];

// ============================================
// COMPONENTE PRINCIPAL - MÓDULO DE REPORTES
// ============================================
const Reportes = () => {
  // Estado para almacenar los datos del gráfico
  const [chartData, setChartData] = useState(mockApiData);
  
  // Estado para nombres personalizables de las barras
  const [labelTipoA, setLabelTipoA] = useState('Tipo A');
  const [labelTipoB, setLabelTipoB] = useState('Tipo B');

  // ============================================
  // FUNCIÓN: Calcular porcentaje de cambio
  // ============================================
  const calculatePercentageChange = (data) => {
    return data.map((item, index) => {
      if (index === 0) {
        return { ...item, percentChange: 0 };
      }
      const prevTotal = data[index - 1].tipoA + data[index - 1].tipoB;
      const currentTotal = item.tipoA + item.tipoB;
      const change = ((currentTotal - prevTotal) / prevTotal) * 100;
      return { ...item, percentChange: change };
    });
  };

  // Datos con porcentaje de cambio calculado
  const dataWithPercentage = calculatePercentageChange(chartData);

  // ============================================
  // COMPONENTE: Tooltip personalizado
  // ============================================
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.month}</p>
          <p className="text-cyan-600">
            {labelTipoA}: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-gray-700">
            {labelTipoB}: <span className="font-bold">{payload[1].value}</span>
          </p>
          {payload[0].payload.percentChange !== undefined && (
            <p className={`text-sm ${payload[0].payload.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Cambio: {payload[0].payload.percentChange.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // ============================================
  // RENDERIZADO DEL COMPONENTE
  // ============================================
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto">
        
        {/* ============================================
            SECCIÓN: ENCABEZADO
            ============================================ */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Módulo de Reportes
          </h1>
          <p className="text-gray-600">
            Visualización de datos mensuales con comparación de dos tipos
          </p>
        </div>

        {/* ============================================
            SECCIÓN: CONTROLES DE CONFIGURACIÓN
            ============================================ */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Configuración de Etiquetas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input para Tipo A */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre para Barra Clara (Tipo A)
              </label>
              <input
                type="text"
                value={labelTipoA}
                onChange={(e) => setLabelTipoA(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Ej: Nuevas Contrataciones"
              />
            </div>
            
            {/* Input para Tipo B */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre para Barra Oscura (Tipo B)
              </label>
              <input
                type="text"
                value={labelTipoB}
                onChange={(e) => setLabelTipoB(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                placeholder="Ej: Renovaciones"
              />
            </div>
          </div>
        </div>

        {/* ============================================
            SECCIÓN: TARJETAS DE MÉTRICAS
            ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Tipo A */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Total {labelTipoA}</p>
                <p className="text-3xl font-bold mt-2">
                  {chartData.reduce((sum, item) => sum + item.tipoA, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Tipo B */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Total {labelTipoB}</p>
                <p className="text-3xl font-bold mt-2">
                  {chartData.reduce((sum, item) => sum + item.tipoB, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Combinado */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Combinado</p>
                <p className="text-3xl font-bold mt-2">
                  {chartData.reduce((sum, item) => sum + item.tipoA + item.tipoB, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            SECCIÓN: GRÁFICO PRINCIPAL
            ============================================ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Comparación Mensual
            </h2>
            <p className="text-gray-600 text-sm">
              Visualización de {labelTipoA} vs {labelTipoB} con línea de tendencia de cambio porcentual
            </p>
          </div>

          {/* Contenedor del gráfico con altura responsive */}
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart
              data={dataWithPercentage}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              {/* Grid de fondo */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              
              {/* Eje X - Meses */}
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '14px', fontWeight: '500' }}
              />
              
              {/* Eje Y izquierdo - Valores de barras */}
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                style={{ fontSize: '14px' }}
                label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }}
              />
              
              {/* Eje Y derecho - Porcentaje de cambio */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#ef4444"
                style={{ fontSize: '14px' }}
                label={{ value: '% Cambio', angle: 90, position: 'insideRight' }}
              />
              
              {/* Tooltip personalizado */}
              <Tooltip content={<CustomTooltip />} />
              
              {/* Leyenda */}
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              
              {/* Barra clara - Tipo A */}
              <Bar 
                yAxisId="left"
                dataKey="tipoA" 
                fill="#06b6d4" 
                name={labelTipoA}
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              
              {/* Barra oscura - Tipo B */}
              <Bar 
                yAxisId="left"
                dataKey="tipoB" 
                fill="#374151" 
                name={labelTipoB}
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              
              {/* Línea de tendencia - Porcentaje de cambio */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentChange"
                stroke="#ef4444"
                strokeWidth={2}
                name="% Cambio"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ============================================
            SECCIÓN: TABLA DE DATOS
            ============================================ */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Datos Detallados
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {labelTipoA}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {labelTipoB}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Cambio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataWithPercentage.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-600 font-semibold">
                      {row.tipoA.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      {row.tipoB.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      {(row.tipoA + row.tipoB).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.percentChange >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {row.percentChange >= 0 ? '↑' : '↓'} {Math.abs(row.percentChange).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================
            SECCIÓN: NOTAS PARA IMPLEMENTACIÓN
            ============================================ */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📋 Notas para Implementación
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Reemplazar <code className="bg-blue-100 px-2 py-1 rounded">mockApiData</code> con datos de tu API</li>
            <li>• Los datos deben tener la estructura: <code className="bg-blue-100 px-2 py-1 rounded">{`{ month: string, tipoA: number, tipoB: number }`}</code></li>
            <li>• Usa <code className="bg-blue-100 px-2 py-1 rounded">setChartData()</code> para actualizar con datos reales</li>
            <li>• El componente es totalmente independiente y reutilizable</li>
            <li>• Los colores pueden personalizarse en las clases de Tailwind</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reportes;