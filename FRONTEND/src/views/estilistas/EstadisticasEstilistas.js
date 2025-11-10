import React, { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';

const EstadisticasEstilistas = ({ estilistaSeleccionado = null, onClearSelection = null, estilistas = [] }) => {
  // Estados para el filtro de fechas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datosFiltrados, setDatosFiltrados] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState(false);
  
 
  // Función para obtener los meses en el rango de fechas
  const obtenerMesesEnRango = (fechaInicio, fechaFin) => {
    const meses = [];
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    let fechaActual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    
    while (fechaActual <= fin) {
      const mesNombre = `${nombresMeses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
      meses.push({
        mes: mesNombre,
        year: fechaActual.getFullYear(),
        month: fechaActual.getMonth(),
        mascotas: 0 // Será llenado por el backend
      });
      
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
    
    return meses;
  };

  // Función para calcular días entre fechas
  const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
  };

  // Funciones para el filtro de fechas
  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('La fecha de inicio no puede ser mayor a la fecha de fin');
      return;
    }
    
    
    try {
      // Calcular meses reales en el rango
      const mesesReales = obtenerMesesEnRango(startDate, endDate);
      const diasTotales = calcularDiasEntreFechas(startDate, endDate);
      
   
      // Datos temporales vacíos hasta conectar con backend
      const datosVacios = {
        periodo: `${new Date(startDate).toLocaleDateString('es-ES')} - ${new Date(endDate).toLocaleDateString('es-ES')}`,
        totalMascotas: 0,
        diasPeriodo: diasTotales,
        porMes: mesesReales.map(mes => ({ ...mes, mascotas: 0 })),
        porEstilista: (estilistas || []).map(estilista => ({
          id: estilista.id_estilista_pk,
          nombre: `${estilista.nombre_estilista || 'Sin nombre'} ${estilista.apellido_estilista || ''}`.trim(),
          mascotas: 0
        }))
      };
      
      setDatosFiltrados(datosVacios);
      setFiltroActivo(true);
      
    } catch (error) {
      console.error('Error al filtrar datos:', error);
      alert('Error al obtener los datos filtrados');
    }
  };
// Función para limpiar el filtro
  const limpiarFiltro = () => {
    setDatosFiltrados(null);
    setFiltroActivo(false);
    setStartDate('');
    setEndDate('');
  };

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona el rango de fechas para exportar');
      return;
    }
    
    console.log('Exportando datos desde:', startDate, 'hasta:', endDate);
    // Aquí se implementará la lógica de exportación
  };

  // Calcular datos para mostrar
  const obtenerDatosParaMostrar = () => {
    // Si hay filtro activo, mostrar resumen de datos filtrados
    if (filtroActivo && datosFiltrados) {
      return {
        titulo: 'Resumen del Período',
        subtitulo: `${datosFiltrados.periodo}`,
        mascotas: datosFiltrados.totalMascotas,
        textoMascotas: 'Total de mascotas atendidas',
        iconoPersona: 'Resumen Filtrado'
      };
    }
    
    if (estilistaSeleccionado) {
      // Si hay un estilista seleccionado, mostrar sus datos individuales
      return {
        titulo: `${estilistaSeleccionado.nombre_estilista} ${estilistaSeleccionado.apellido_estilista}`,
        subtitulo: `ID: ${estilistaSeleccionado.identidad_estilista}`,
        mascotas: 0, // Será conectado con el backend 
        textoMascotas: 'Por este estilista',
        iconoPersona: ' Estilista Seleccionado'
      };
    } else {
      // Si no hay selección, mostrar estadísticas generales
      return {
        titulo: 'Rendimiento del Equipo',
        mascotas: 0, // Será la suma total del equipo desde el backend
        textoMascotas: 'Total del equipo',
        iconoPersona: ' Dashboard General'
      };
    }
  };

  const datosActuales = obtenerDatosParaMostrar();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
      {/* Header */}
      <div className="mb-6 text-center relative">
        {/* Botón Refresh - Esquina superior derecha */}
        {estilistaSeleccionado && onClearSelection && (
          <button
            onClick={() => onClearSelection()}
            className="absolute top-0 right-0 text-black hover:text-gray-600 p-2 rounded-full text-xs transition-all duration-200 hover:bg-gray-100"
            title="Ver datos generales"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      
        
        <div className="text-xl font-bold text-gray-800 mb-1">
          ESTADÍSTICAS DE RENDIMIENTO
        </div>
        <p className="text-gray-600 text-sm">
          {estilistaSeleccionado 
            ? `DATOS INDIVIDUALES DE ${estilistaSeleccionado.nombre_estilista?.toUpperCase()} ${estilistaSeleccionado.apellido_estilista?.toUpperCase()}`
            : 'MÉTRICAS GENERALES DEL EQUIPO DE PELUQUERÍA'
          }
        </p>
      </div>

      {/* Cards Dinámicas - Se actualizan según estilista seleccionado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Card 1: Información del Estilista y Mascotas Atendidas */}
        <div className={`bg-white rounded-2xl shadow-lg p-6 border md:col-span-2 ${filtroActivo ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
          {filtroActivo && datosFiltrados ? (
            // Vista del resumen cuando hay filtro activo
            <div className="space-y-6">
              {/* Header del resumen */}
              <div className="text-center border-b pb-4">
                <div className="bg-blue-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{datosActuales.titulo}</h3>
                <p className="text-sm text-gray-600">{datosActuales.subtitulo}</p>
                
                {/* Estadísticas adicionales */}
                <div className="flex justify-center gap-8 mt-4 text-xs text-gray-500">
                  <div className="text-center">
                    <p className="font-medium">{datosFiltrados.diasPeriodo}</p>
                    <p>días</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{datosFiltrados.porMes.length}</p>
                    <p>meses</p>
                  </div>
                </div>
              </div>

              {/* Resumen por estilista y por mes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Por Estilista */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Por Estilista
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {datosFiltrados.porEstilista.map((estilista, index) => (
                      <div key={estilista.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{estilista.nombre}</span>
                        <span className="text-sm font-bold text-green-600">{estilista.mascotas} mascotas</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por Mes */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Por Mes
                  </h4>
                  <div className="space-y-2">
                    {datosFiltrados.porMes.map((mes, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{mes.mes}</span>
                        <span className="text-sm font-bold text-purple-600">{mes.mascotas} mascotas</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Total mascotas:</span>
                        <span className="text-sm font-bold text-blue-600">{datosActuales.mascotas} mascotas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Vista normal sin filtro - Gráfico condicional
            <div className="space-y-6">
              {/* Header del gráfico */}
              <div className="text-center">
                <div className={`p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                  estilistaSeleccionado 
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100' 
                    : 'bg-gradient-to-r from-green-100 to-blue-100'
                }`}>
                  {estilistaSeleccionado ? (
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{datosActuales.titulo}</h3>
                <p className="text-sm text-gray-600">
                  {estilistaSeleccionado 
                    ? `Rendimiento mensual de ${estilistaSeleccionado.nombre_estilista}` 
                    : 'Rendimiento por estilista'
                  }
                </p>
              </div>

              {/* Gráfico de barras condicional */}
              <div className="bg-gray-50 rounded-xl p-6">
                {estilistaSeleccionado ? (
                  // Gráfico por meses para el estilista seleccionado
                  <div className="flex items-end justify-between h-48 gap-2">
                    {(() => {
                      const mesesGrafico = [];
                      const hoy = new Date();
                      
                      // Generar últimos 12 meses
                      for (let i = 11; i >= 0; i--) {
                        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
                        const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short' });
                        // Sin datos mock - todo en 0 hasta conectar con backend
                        const mascotas = 0;
                        
                        mesesGrafico.push({
                          mes: nombreMes,
                          mascotas: mascotas
                        });
                      }
                      
                      return mesesGrafico.map((item, index) => (
                        <div key={index} className="flex flex-col items-center flex-1 group cursor-pointer">
                          {/* Barra */}
                          <div className="w-full flex flex-col justify-end h-40 mb-2">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 relative group-hover:shadow-lg min-h-[8px]"
                            >
                              {/* Tooltip con el número */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                {item.mascotas} mascotas
                              </div>
                            </div>
                          </div>
                          {/* Etiqueta del mes */}
                          <span className="text-xs font-medium text-gray-600 transform rotate-45 origin-bottom-left">
                            {item.mes}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  // Gráfico por estilistas cuando no hay selección
                  estilistas && estilistas.length > 0 ? (
                    <div className="flex items-end justify-between h-48 gap-3">
                      {estilistas.map((estilista, index) => {
                        // Sin datos mock - todo en 0 hasta conectar con backend
                        const mascotas = 0;
                        
                        return (
                          <div key={estilista.id_estilista_pk} className="flex flex-col items-center flex-1 group cursor-pointer">
                            {/* Barra */}
                            <div className="w-full flex flex-col justify-end h-40 mb-2">
                              <div 
                                className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-300 hover:from-green-600 hover:to-green-500 relative group-hover:shadow-lg min-h-[8px]"
                              >
                                {/* Tooltip con el número */}
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                  {mascotas} mascotas
                                </div>
                              </div>
                            </div>
                            {/* Nombre del estilista */}
                            <span className="text-xs font-medium text-gray-600 text-center leading-tight max-w-full">
                              {`${estilista.nombre_estilista || 'Sin nombre'} ${estilista.apellido_estilista || ''}`.trim()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No hay estilistas registrados</p>
                    </div>
                  )
                )}
                
                {/* Leyenda */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${
                        estilistaSeleccionado 
                          ? 'bg-gradient-to-t from-blue-500 to-blue-400' 
                          : 'bg-gradient-to-t from-green-500 to-green-400'
                      }`}></div>
                      <span className="text-gray-600">
                        {estilistaSeleccionado 
                          ? 'Mascotas atendidas por mes' 
                          : 'Mascotas atendidas por estilista'
                        }
                      </span>
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">
                        {estilistaSeleccionado 
                          ? `Total de ${estilistaSeleccionado.nombre_estilista}: ${datosActuales.mascotas}` 
                          : `Total equipo: ${datosActuales.mascotas}`
                        }
                      </span> mascotas
                    </div>
                  </div>
                </div>
              </div>

              {/* Nota informativa */}
              {!estilistaSeleccionado && (
                <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  Selecciona un estilista para ver su rendimiento mensual
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 3: Filtro de Fechas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-3">Filtrar por Fechas</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleFilter}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Filtrar
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </button>
              </div>
              
              {filtroActivo && (
                <div className="pt-2">
                  <button
                    onClick={limpiarFiltro}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Limpiar Filtro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EstadisticasEstilistas;