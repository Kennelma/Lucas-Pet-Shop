import React, { useState, useEffect } from 'react';
import { 
  Download, 
  AlertCircle, 
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  CalendarDays
} from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { descargarPDFTabla } from './pdf.js';

const Tabla = () => {
  const [datosTabla, setDatosTabla] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState('todos'); // 'todos' o índice del mes
  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

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

      // Siempre mostrar los 12 meses del año
      const datosFormateados = meses.map((mes, index) => {
        const ingreso = response.data[index]?.ingresos_netos || 0;
        const gasto = response.data[index]?.gastos || 0;
        const total = ingreso - gasto;
        return { 
          id: index + 1,
          mes: mes, 
          ingreso, 
          gasto, 
          total,
          mesIndex: index
        };
      });

      setDatosTabla(datosFormateados);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      setDatosTabla([]);
    } finally {
      setCargando(false);
    }
  };

  // Calcular totales
  const totalIngresos = datosTabla.reduce((sum, d) => sum + (d?.ingreso || 0), 0);
  const totalGastos = datosTabla.reduce((sum, d) => sum + (d?.gasto || 0), 0);
  const totalGeneral = totalIngresos - totalGastos;

  // Función para descargar PDF
  const handleDescargarPDF = () => {
    if (mesSeleccionado === 'todos') {
      // Descargar PDF anual
      descargarPDFTabla(
        datosTabla,
        totalIngresos,
        totalGastos,
        totalGeneral,
        anioSeleccionado,
        null
      );
    } else {
      // Descargar PDF de un mes específico
      const mesData = datosTabla.find(m => m.mesIndex === parseInt(mesSeleccionado));
      if (mesData) {
        descargarPDFTabla(
          [mesData],
          mesData.ingreso,
          mesData.gasto,
          mesData.total,
          anioSeleccionado,
          mesData.mes
        );
      }
    }
  };

  // Columna ID
  const bodyId = (rowData) => (
    <div className="flex items-center justify-center">
      <span className="text-gray-800 font-semibold text-sm">{rowData.id}</span>
    </div>
  );

  // Columna Mes
  const bodyMes = (rowData) => {
    const esActual = rowData.mesIndex === mesActual && anioSeleccionado === anioActual;
    return (
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-800 font-semibold text-sm">
          {rowData.mes}
        </span>
        {esActual && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
            Actual
          </span>
        )}
      </div>
    );
  };

  // Columna Ingresos
  const bodyIngresos = (rowData) => (
    <div className="flex items-center gap-1.5">
      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
      <span className="text-green-700 font-bold text-sm">
        L {rowData.ingreso.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Gastos
  const bodyGastos = (rowData) => (
    <div className="flex items-center gap-1.5">
      <DollarSign className="w-3.5 h-3.5 text-red-600" />
      <span className="text-red-700 font-bold text-sm">
        L {rowData.gasto.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Total
  const bodyTotal = (rowData) => (
    <div className="flex items-center">
      <span className={`font-bold text-sm ${rowData.total >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
        L {rowData.total.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Footers
  const footerMes = () => (
    <strong className="text-gray-800 text-sm font-bold">TOTAL {anioSeleccionado}</strong>
  );
  const footerIngresos = () => (
    <span className="text-green-800 font-bold text-sm">L {totalIngresos.toLocaleString('es-HN')}</span>
  );
  const footerGastos = () => (
    <span className="text-red-800 font-bold text-sm">L {totalGastos.toLocaleString('es-HN')}</span>
  );
  const footerTotal = () => (
    <span className={`font-bold text-sm ${totalGeneral >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
      L {totalGeneral.toLocaleString('es-HN')}
    </span>
  );

  return (
    <>
      <style>
        {`
          .datatable-compact .p-datatable-tbody > tr > td {
            padding: 0.5rem 0.5rem !important;
          }
          .datatable-compact .p-datatable-thead > tr > th {
            padding: 0.5rem 0.5rem !important;
          }
          .datatable-compact .p-datatable-tfoot > tr > td {
            padding: 0.5rem 0.5rem !important;
          }
        `}
      </style>

      <div className="min-h-screen p-4 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
        <div className="max-w-7xl mx-auto">
          
          {/* Estados de carga y error */}
          {cargando && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-700 font-medium">Cargando datos...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <button 
                  onClick={cargarDatos}
                  className="text-sm text-red-600 underline mt-1 hover:text-red-800"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {/* Tabla principal */}
            <div className="flex-1">
              <div className="bg-white rounded-xl p-6 font-poppins" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-800">
                    Resumen Mensual {anioSeleccionado}
                  </h2>
                  
                  {/* Selector de año */}
                  <select 
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 bg-white font-medium shadow-sm"
                  >
                    {aniosDisponibles.map(anio => (
                      <option key={anio} value={anio}>
                        {anio === anioActual ? `${anio} (Actual)` : anio}
                      </option>
                    ))}
                  </select>
                </div>

                {datosTabla.length === 0 && !cargando ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No hay datos disponibles</p>
                    <p className="text-gray-400 text-sm mt-2">Seleccione otro año o verifique la conexión</p>
                  </div>
                ) : (
                  <DataTable
                    value={datosTabla}
                    loading={cargando}
                    showGridlines
                    tableStyle={{ width: '100%' }}
                    className="font-poppins datatable-gridlines datatable-compact"
                    size="small"
                    rowClassName={() => 'hover:bg-blue-50 cursor-pointer'}
                  >
                    <Column 
                      field="id" 
                      header="ID" 
                      body={bodyId}
                      sortable 
                      className="text-sm text-center"
                      style={{ width: '60px' }}
                    />
                    <Column 
                      field="mes" 
                      header="MES" 
                      body={bodyMes}
                      footer={footerMes}
                      sortable 
                      className="text-sm"
                    />
                    <Column 
                      field="ingreso" 
                      header="INGRESOS" 
                      body={bodyIngresos}
                      footer={footerIngresos}
                      className="text-sm"
                      style={{ width: 'auto' }}
                    />
                    <Column 
                      field="gasto" 
                      header="GASTOS" 
                      body={bodyGastos}
                      footer={footerGastos}
                      className="text-sm"
                      style={{ width: 'auto' }}
                    />
                    <Column 
                      field="total" 
                      header="BALANCE" 
                      body={bodyTotal}
                      footer={footerTotal}
                      className="text-sm"
                      style={{ width: 'auto' }}
                    />
                  </DataTable>
                )}
              </div>
            </div>

            {/* Panel lateral de descarga */}
            <div className="w-80">
              <div className="bg-white rounded-xl p-6 font-poppins sticky top-4" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-gray-800">
                    Descargar Reporte
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Selector de mes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Período
                    </label>
                    <select 
                      value={mesSeleccionado}
                      onChange={(e) => setMesSeleccionado(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 bg-white font-medium shadow-sm"
                    >
                      <option value="todos">Todo el año {anioSeleccionado}</option>
                      <optgroup label="Meses individuales">
                        {meses.map((mes, index) => (
                          <option key={index} value={index}>
                            {mes}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Vista previa de totales */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Ingresos:</span>
                      <span className="font-bold text-green-700">
                        L {mesSeleccionado === 'todos' 
                          ? totalIngresos.toLocaleString('es-HN')
                          : (datosTabla[parseInt(mesSeleccionado)]?.ingreso || 0).toLocaleString('es-HN')
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Gastos:</span>
                      <span className="font-bold text-red-700">
                        L {mesSeleccionado === 'todos' 
                          ? totalGastos.toLocaleString('es-HN')
                          : (datosTabla[parseInt(mesSeleccionado)]?.gasto || 0).toLocaleString('es-HN')
                        }
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-semibold">Balance:</span>
                        <span className={`font-bold ${
                          (mesSeleccionado === 'todos' ? totalGeneral : datosTabla[parseInt(mesSeleccionado)]?.total || 0) >= 0
                            ? 'text-blue-700'
                            : 'text-orange-700'
                        }`}>
                          L {mesSeleccionado === 'todos' 
                            ? totalGeneral.toLocaleString('es-HN')
                            : (datosTabla[parseInt(mesSeleccionado)]?.total || 0).toLocaleString('es-HN')
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de descarga */}
                  <button
                    onClick={handleDescargarPDF}
                    disabled={cargando || datosTabla.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF {mesSeleccionado === 'todos' ? 'Anual' : meses[parseInt(mesSeleccionado)]}
                  </button>

                  <p className="text-xs text-gray-500 text-center italic">
                    {mesSeleccionado === 'todos' 
                      ? 'Se descargará el reporte completo del año'
                      : 'Se descargará el reporte del mes seleccionado'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tabla;