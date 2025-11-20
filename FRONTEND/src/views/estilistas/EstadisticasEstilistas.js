//IMPORTACIONES
import React, { useState, useEffect } from 'react';
import { verBonificacionesEstilistas, verEstilistas, eliminarEstilista } from '../../AXIOS.SERVICES/employees-axios';
import Swal from 'sweetalert2';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, List, Scissors } from 'lucide-react';
import ModalAgregarEstilista from './modal-agregar';
import ModalTablaEstilistas from './modal-tabla-estilistas';

const EstadisticasEstilistas = () => {
  //ESTADOS
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bonificaciones, setBonificaciones] = useState([]);
  const [loadingBonificaciones, setLoadingBonificaciones] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalTabla, setShowModalTabla] = useState(false);
  const [estilistas, setEstilistas] = useState([]);

  // Paleta de colores para gráficos
  const colores = [
    '#E91E63',
    '#4CAF50',
    '#a443ffff',
    '#2196F3',
    '#FFC107',
    '#EC407A',
    '#26C6DA',
    '#FF5722',
    '#8BC34A',
    '#F06292',
    '#4DD0E1',
    '#FFB74D',
    '#9575CD',
    '#4DB6AC',
    '#FF8A65'
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

  //EFFECT_PARA_CARGAR_ESTILISTAS
  useEffect(() => {
    cargarEstilistas();
  }, []);

  //FUNCION_PARA_CARGAR_ESTILISTAS
  const cargarEstilistas = async () => {
    try {
      const data = await verEstilistas();
      setEstilistas(data || []);
    } catch (error) {
      // Error al cargar estilistas
    }
  };

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

  //PREPARAR_DATOS_PARA_GRAFICOS
  const data = estilistas
    .map((estilista, index) => {
      // Buscar si este estilista tiene bonificaciones en el rango de fechas
      const bonificacion = bonificaciones.find(
        b => b.id_estilista_pk === estilista.id_estilista_pk
      );

      return {
        id_estilista_pk: estilista.id_estilista_pk,
        estilista: estilista.nombre_estilista || 'Sin nombre',
        nombreCompleto: `${estilista.nombre_estilista || 'Sin nombre'} ${estilista.apellido_estilista || ''}`.trim(),
        mascotas: bonificacion ? parseInt(bonificacion.cantidad_mascotas) || 0 : 0,
        color: colores[index % colores.length]
      };
    });

  //CALCULAR_TOTAL_DE_MASCOTAS
  const totalMascotas = data.reduce((sum, item) => sum + item.mascotas, 0);

  //FUNCION_PARA_ELIMINAR_ESTILISTA
  const handleEliminar = async (id) => {
    try {
      const response = await eliminarEstilista(id);
      if (response && response.Consulta) {
        await cargarEstilistas();
        await cargarBonificaciones();
        Swal.fire('Eliminado', 'Estilista eliminado correctamente', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el estilista', 'error');
    }
  };

  return (
    <div className="mb-3">
      <div className="max-w-7xl mx-auto">

        {/*ESTADO_LOADING*/}
        {loadingBonificaciones ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : estilistas.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-lg">
            <p className="text-gray-500 text-lg">No hay estilistas registrados en el sistema</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/*SECCION_GRAFICOS*/}
            <div className="flex-1 bg-white rounded-lg p-3 h-fit shadow-lg">

              {/*BOTONES_Y_FILTROS*/}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-3">

                {/*BOTONES_DE_SELECCION_DE_GRAFICO*/}
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                      chartType === 'bar'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Barras
                  </button>
                  <button
                    onClick={() => setChartType('pie')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                      chartType === 'pie'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Circular
                  </button>
                </div>

                {/*FILTROS_DE_FECHA*/}
                <div className="flex flex-row gap-1.5 items-center">
                  <label className="text-xs font-medium text-gray-700">Desde:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-1.5 py-0.5 border border-gray-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500 focus:border-transparent w-[120px]"
                  />
                  <label className="text-xs font-medium text-gray-700">Hasta:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent w-[120px]"
                  />
                </div>
              </div>

              {/*CONTENEDOR_DE_GRAFICOS*/}
              <div className="w-full h-[300px]">
                {data.length > 0 ? (
                  chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="estilista"
                        angle={0}
                        textAnchor="middle"
                        height={60}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        interval={0}
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
                            return `${item.estilista}`;
                          }
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="mascotas"
                      >
                        {data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          color: '#374151',
                          fontSize: '11px',
                          padding: '6px 8px'
                        }}
                        formatter={(value, name, props) => [
                          `${value} mascotas`,
                          props.payload.estilista
                        ]}
                        labelStyle={{ color: '#374151', fontWeight: 'normal', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  )
                ) : null}
              </div>
            </div>

            {/*SECCION_DETALLE_ESTILISTAS*/}
            <div className="flex-1 bg-white rounded-lg overflow-hidden shadow-lg">

              {/* Header */}
              <div className="relative px-4 pt-4 pb-3 bg-[#F3D568]">
                <div className="relative mb-3">
                  <p className="text-base font-semibold tracking-wider text-center">DETALLE DE ESTILISTAS</p>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => setShowModalAgregar(true)}
                    style={{ borderRadius: '12px' }}
                    className="flex-1 px-2 py-1 bg-white hover:bg-gray-50 text-black text-xs flex items-center justify-center gap-1  "
                  >
                    <Plus className="w-3 h-3" />
                    AGREGAR
                  </button>
                  <button
                    onClick={() => setShowModalTabla(true)}
                    style={{ borderRadius: '12px' }}
                     className="flex-1 px-2 py-1 bg-white hover:bg-gray-50 text-slate-900 text-[10px] font-medium flex items-center justify-center gap-1"
                    >
                    <List className="w-3 h-3" />
                    LISTA COMPLETA
                  </button>
                </div>
              </div>

              {/* Lista de Estilistas */}
              <div className="px-4 py-3 space-y-2 h-[230px] overflow-y-auto border-t border-slate-100">
                {data.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Scissors className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Sin datos</p>
                    <p className="text-slate-400 text-xs mt-1">No hay estilistas registrados</p>
                  </div>
                ) : (
                  data.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors duration-200 group"
                      style={{ backgroundColor: '#F4F2F7' }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="text-xs text-slate-900 uppercase truncate" style={{ marginTop: '1rem' }}>{item.nombreCompleto}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-semibold text-black-600 whitespace-nowrap">{item.mascotas} mascotas</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total - Abajo */}
              <div className="px-4 py-3 bg-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Total Mascotas</span>
                  <span className="text-sm font-bold text-gray-900">{totalMascotas}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar Estilista */}
      <ModalAgregarEstilista
        isOpen={showModalAgregar}
        onClose={() => setShowModalAgregar(false)}
        onSave={async () => {
          await cargarEstilistas();
          await cargarBonificaciones();
        }}
        estilistas={estilistas}
      />

      {/* Modal Tabla de Estilistas */}
      <ModalTablaEstilistas
        visible={showModalTabla}
        onHide={() => setShowModalTabla(false)}
        onRefresh={async () => {
          await cargarEstilistas();
          await cargarBonificaciones();
        }}
        onDelete={handleEliminar}
      />
    </div>
  );
};

export default EstadisticasEstilistas;