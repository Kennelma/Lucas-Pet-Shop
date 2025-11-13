import React, { useState, useEffect } from 'react';
import { 
  Download, 
  AlertCircle, 
  Calendar,
  FileText,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { verGraficosMensual } from '../../AXIOS.SERVICES/reports-axios.js';
import { descargarPDFTabla } from './pdf.js';

const Tabla = () => {
  const [datosTabla, setDatosTabla] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

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

  // Columna ID
  const bodyId = (rowData) => (
    <div className="flex items-center justify-center">
      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-700 font-bold text-xs">{rowData.id}</span>
      </div>
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
    <div className="flex items-center justify-end gap-1.5">
      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
      <span className="text-green-700 font-bold text-sm">
        L {rowData.ingreso.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Gastos
  const bodyGastos = (rowData) => (
    <div className="flex items-center justify-end gap-1.5">
      <DollarSign className="w-3.5 h-3.5 text-red-600" />
      <span className="text-red-700 font-bold text-sm">
        L {rowData.gasto.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Total
  const bodyTotal = (rowData) => (
    <div className="flex items-center justify-end">
      <span className={`font-bold text-sm ${rowData.total >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
        L {rowData.total.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Acciones
  const bodyAcciones = (rowData) => (
    <div className="flex items-center justify-center">
      <button
        onClick={() => descargarPDFMes(rowData)}
        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition-colors"
        title="Descargar PDF del mes"
      >
        <Download className="w-4 h-4" />
      </button>
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

  // Funciones de acciones
  const descargarPDFMes = (rowData) => {
    console.log('Descargar PDF del mes:', rowData);
    // TODO: Aquí se generará el PDF con los días del mes seleccionado
    alert(`Generando PDF de ${rowData.mes} ${anioSeleccionado}\n\nMostrará ingresos por día.\n(Pendiente: integrar con endpoint)`);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
        
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

        {/* Tabla compacta */}
        {!cargando && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
            {/* Encabezado compacto */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <FileText className="w-4 h-4 text-green-700" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-800">
                    Resumen Mensual {anioSeleccionado}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Selector de año */}
                  <select 
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 bg-white font-medium shadow-sm"
                  >
                    {aniosDisponibles.map(anio => (
                      <option key={anio} value={anio}>
                        {anio === anioActual ? `${anio} (Actual)` : anio}
                      </option>
                    ))}
                  </select>

                  {/* Botón PDF general */}
                  <button
                    onClick={() => descargarPDFTabla(
                      datosTabla,
                      totalIngresos,
                      totalGastos,
                      totalGeneral,
                      anioSeleccionado,
                      null
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF Anual
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla compacta */}
            <div className="p-3">
              <style>{`
                .tabla-compacta .p-datatable-thead > tr > th,
                .tabla-compacta .p-datatable-tbody > tr > td,
                .tabla-compacta .p-datatable-tfoot > tr > td {
                  padding: 0.4rem 0.5rem !important;
                  font-size: 0.813rem !important;
                }
                
                .tabla-compacta .p-datatable-thead > tr > th {
                  background: #f9fafb !important;
                  font-weight: 600 !important;
                  border-bottom: 2px solid #e5e7eb !important;
                }

                .tabla-compacta .p-datatable-tfoot > tr > td {
                  background: #f3f4f6 !important;
                  border-top: 2px solid #d1d5db !important;
                  font-weight: 700 !important;
                }

                .tabla-compacta button {
                  border-radius: 0.375rem !important;
                }
              `}</style>

              <DataTable
                value={datosTabla}
                className="tabla-compacta font-poppins"
                showGridlines
                responsiveLayout="scroll"
                emptyMessage="No hay datos disponibles"
                rowClassName={(rowData, index) =>
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }
              >
                <Column
                  header="ID"
                  body={bodyId}
                  style={{ width: "60px", textAlign: "center" }}
                />
                <Column
                  header="MES"
                  body={bodyMes}
                  footer={footerMes}
                />
                <Column
                  header="INGRESOS"
                  body={bodyIngresos}
                  footer={footerIngresos}
                  style={{ textAlign: "right" }}
                />
                <Column
                  header="GASTOS"
                  body={bodyGastos}
                  footer={footerGastos}
                  style={{ textAlign: "right" }}
                />
                <Column
                  header="BALANCE"
                  body={bodyTotal}
                  footer={footerTotal}
                  style={{ textAlign: "right" }}
                />
                <Column
                  header="ACCIONES"
                  body={bodyAcciones}
                  style={{ width: "80px", textAlign: "center" }}
                />
              </DataTable>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabla;