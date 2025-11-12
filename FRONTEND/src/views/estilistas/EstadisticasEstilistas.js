//IMPORTACIONES
import React, { useState, useEffect } from 'react';
import { verBonificacionesEstilistas } from '../../AXIOS.SERVICES/employees-axios';
import Swal from 'sweetalert2';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EstadisticasEstilistas = () => {
  //ESTADOS
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bonificaciones, setBonificaciones] = useState([]);
  const [loadingBonificaciones, setLoadingBonificaciones] = useState(false);
  const [chartType, setChartType] = useState('bar');

  //PALETA_DE_COLORES_PARA_GRAFICOS
  const colores = [
    '#DC2626',
    '#2563EB',
    '#059669',
    '#D97706',
    '#7C3AED',
    '#DB2777',
    '#0891B2',
    '#EA580C',
    '#65A30D',
    '#4F46E5',
    '#BE123C',
    '#0D9488',
    '#CA8A04',
    '#9333EA',
    '#C026D3'
  ];

  //EFFECT_PARA_CARGAR_FECHAS_INICIALES_(MES_ACTUAL)
  useEffect(() => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const formatFecha = (fecha) => {
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    };

    setStartDate(formatFecha(primerDia));
    setEndDate(formatFecha(ultimoDia));
  }, []);

  //EFFECT_PARA_RECARGAR_DATOS_AL_CAMBIAR_FECHAS
  useEffect(() => {
    if (startDate && endDate) {
      cargarBonificaciones();
    }
  }, [startDate, endDate]);

  //FUNCION_PARA_CARGAR_BONIFICACIONES_DESDE_API
  const cargarBonificaciones = async () => {
    if (!startDate || !endDate) return;

    //VALIDAR_QUE_FECHA_INICIO_NO_SEA_MAYOR_A_FECHA_FIN
    if (new Date(startDate) > new Date(endDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'La fecha de inicio no puede ser mayor a la fecha de fin',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    setLoadingBonificaciones(true);

    try {
      const bonificacionesData = await verBonificacionesEstilistas(startDate, endDate);
      setBonificaciones(bonificacionesData);
    } catch (error) {
      console.error('Error al cargar bonificaciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las bonificaciones',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoadingBonificaciones(false);
    }
  };

  //TRANSFORMAR_DATOS_PARA_GRAFICOS
  const data = bonificaciones.map((b, index) => ({
    estilista: b.nombre_estilista || 'Sin nombre',
    mascotas: parseInt(b.cantidad_mascotas) || 0,
    color: colores[index % colores.length]
  }));

  //CALCULAR_TOTAL_DE_MASCOTAS
  const totalMascotas = data.reduce((sum, item) => sum + item.mascotas, 0);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">

        {/*FILTROS_DE_FECHA*/}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <label className="text-sm font-medium text-gray-700">Desde:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <label className="text-sm font-medium text-gray-700">Hasta:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/*ESTADO_LOADING*/}
        {loadingBonificaciones ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No hay datos disponibles para el rango seleccionado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/*SECCION_GRAFICOS*/}
            <div className="bg-white rounded-lg shadow-lg p-6">

              {/*BOTONES_DE_SELECCION_DE_GRAFICO*/}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    chartType === 'bar'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Barras
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    chartType === 'pie'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Circular
                </button>
              </div>

              {/*CONTENEDOR_DE_GRAFICOS*/}
              <div className="w-full h-64">
                {chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="estilista"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="mascotas"
                        radius={[8, 8, 0, 0]}
                        name="Mascotas Atendidas"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={{
                          fill: '#374151',
                          fontSize: 11,
                          formatter: (value, entry, index) => {
                            const item = data[index];
                            return `${item.estilista} (${item.mascotas})`;
                          }
                        }}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="mascotas"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/*SECCION_TABLA_DE_DETALLES*/}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Detalle por Estilista</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-sm">Estilista</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 text-sm">Mascotas</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 text-sm">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.estilista}
                        </td>
                        <td className="text-center py-2 px-3 font-medium text-sm">{item.mascotas}</td>
                        <td className="text-center py-2 px-3 text-sm">
                          {((item.mascotas / totalMascotas) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 font-bold">
                      <td className="py-2 px-3 text-sm">TOTAL</td>
                      <td className="text-center py-2 px-3 text-sm">{totalMascotas}</td>
                      <td className="text-center py-2 px-3 text-sm">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasEstilistas;
