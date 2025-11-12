import React, { useState, useEffect } from 'react';
import { 
  Download, 
  AlertCircle, 
  Calendar,
  FileText,
  Trash2,
  Eye,
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
  const [mesSeleccionado, setMesSeleccionado] = useState('todos'); // 'todos' o número de mes
  const [tipoPeriodo, setTipoPeriodo] = useState('mensual'); // 'diario', 'mensual', 'anual'

  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    cargarDatos();
  }, [anioSeleccionado, mesSeleccionado]);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await verGraficosMensual({ anio: anioSeleccionado });
      
      if (!response.ok || !response.data) {
        throw new Error('No se pudieron cargar los datos');
      }

      // Formatear datos según el período seleccionado
      let datosFormateados = [];
      
      if (mesSeleccionado === 'todos') {
        // Vista mensual del año completo
        datosFormateados = meses.map((mes, index) => {
          const ingreso = response.data[index]?.ingresos_netos || 0;
          const gasto = response.data[index]?.gastos || 0;
          const total = ingreso - gasto;
          return { 
            id: index + 1,
            periodo: mes, 
            ingreso, 
            gasto, 
            total,
            tipo: 'mes',
            detalles: `Resumen del mes de ${mes}`
          };
        });
      } else {
        // Vista diaria de un mes específico (simulado por ahora)
        const diasEnMes = new Date(anioSeleccionado, parseInt(mesSeleccionado) + 1, 0).getDate();
        datosFormateados = Array.from({ length: diasEnMes }, (_, i) => {
          const dia = i + 1;
          // Por ahora datos simulados, se reemplazarán con endpoint real
          const ingreso = 0;
          const gasto = 0;
          const total = ingreso - gasto;
          return {
            id: dia,
            periodo: `${dia} de ${meses[parseInt(mesSeleccionado)]}`,
            ingreso,
            gasto,
            total,
            tipo: 'dia',
            detalles: `Ventas del día ${dia}`
          };
        });
      }

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
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-700 font-bold text-sm">{rowData.id}</span>
      </div>
    </div>
  );

  // Columna Período (Mes o Día)
  const bodyPeriodo = (rowData) => {
    const esActual = rowData.periodo === meses[mesActual] && anioSeleccionado === anioActual && mesSeleccionado === 'todos';
    return (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700 font-medium">
          {rowData.periodo}
        </span>
        {esActual && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
            Actual
          </span>
        )}
      </div>
    );
  };

  // Columna Ingresos
  const bodyIngresos = (rowData) => (
    <div className="flex items-center justify-end gap-2">
      <TrendingUp className="w-4 h-4 text-green-600" />
      <span className="text-green-700 font-bold">
        L {rowData.ingreso.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Gastos
  const bodyGastos = (rowData) => (
    <div className="flex items-center justify-end gap-2">
      <DollarSign className="w-4 h-4 text-red-600" />
      <span className="text-red-700 font-bold">
        L {rowData.gasto.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Total
  const bodyTotal = (rowData) => (
    <div className="flex items-center justify-end">
      <span className={`font-bold text-lg ${rowData.total >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
        L {rowData.total.toLocaleString('es-HN')}
      </span>
    </div>
  );

  // Columna Acciones
  const bodyAcciones = (rowData) => (
    <div className="flex items-center gap-2 justify-center">
      <button
        onClick={() => verDetalles(rowData)}
        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
        title="Ver detalles"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => descargarPDF(rowData)}
        className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
        title="Descargar PDF"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        onClick={() => eliminarRegistro(rowData)}
        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  // Footers
  const footerPeriodo = () => (
    <strong className="text-gray-800 text-base">TOTAL {anioSeleccionado}</strong>
  );
  const footerIngresos = () => (
    <span className="text-green-800 font-bold text-base">L {totalIngresos.toLocaleString('es-HN')}</span>
  );
  const footerGastos = () => (
    <span className="text-red-800 font-bold text-base">L {totalGastos.toLocaleString('es-HN')}</span>
  );
  const footerTotal = () => (
    <span className={`font-bold text-base ${totalGeneral >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
      L {totalGeneral.toLocaleString('es-HN')}
    </span>
  );

  // Funciones de acciones (preparadas para endpoints)
  const verDetalles = (rowData) => {
    console.log('Ver detalles de:', rowData);
    // TODO: Abrir modal con detalles de facturas/ventas del período
    alert(`Detalles de ${rowData.periodo}\n\nFacturas y ventas realizadas en este período.\n(Pendiente: integrar con endpoint)`);
  };

  const descargarPDF = (rowData) => {
    console.log('Descargar PDF de:', rowData);
    // TODO: Generar PDF específico del día/mes
    alert(`Generando PDF de ${rowData.periodo}\n\n(Pendiente: integrar con endpoint)`);
  };

  const eliminarRegistro = (rowData) => {
    console.log('Eliminar registro:', rowData);
    // TODO: Confirmar y eliminar con endpoint
    if (window.confirm(`¿Eliminar registro de ${rowData.periodo}?`)) {
      alert('(Pendiente: integrar con endpoint de eliminación)');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
        
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            HISTORIAL DE REPORTES
          </h1>
          <p className="text-center text-gray-600 italic" style={{ fontSize: '15px' }}>
            Registro detallado de movimientos financieros
          </p>
        </div>

        {/* Estados de carga y error */}
        {cargando && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-700 font-medium">
              Cargando datos...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
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

        {/* Tabla */}
        {!cargando && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {mesSeleccionado === 'todos' 
                      ? `Resumen Anual`
                      : `${meses[parseInt(mesSeleccionado)]} (Días)`
                    }
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Selector de año */}
                  
                  {/* Selector de mes */}
                  <select 
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                    className="text-sm px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 bg-white font-medium shadow-sm"
                  >
                    <option value="todos">Ver todos los meses</option>
                    {meses.map((mes, index) => (
                      <option key={index} value={index}>
                        {mes}
                      </option>
                    ))}
                  </select>

                  {/* Botón de descarga PDF general */}
                  <button
                    onClick={() => descargarPDFTabla(
                      datosTabla, 
                      totalIngresos, 
                      totalGastos, 
                      totalGeneral,
                      anioSeleccionado,
                      mesSeleccionado !== 'todos' ? meses[parseInt(mesSeleccionado)] : null
                    )}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Descargar PDF General
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tabla con PrimeReact */}
            <div className="p-8">
              <DataTable
                value={datosTabla}
                className="font-poppins"
                showGridlines
                responsiveLayout="scroll"
                emptyMessage="No hay datos disponibles para el período seleccionado"
                rowClassName={(rowData, index) => 
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }
              >
                <Column 
                  header="ID" 
                  body={bodyId} 
                  className="text-base font-medium py-4" 
                  style={{ width: '80px', padding: '1rem' }}
                />
                <Column 
                  header="Período" 
                  body={bodyPeriodo} 
                  footer={footerPeriodo} 
                  className="text-base font-medium py-4" 
                  style={{ padding: '1rem' }}
                />
                <Column 
                  header="Ingresos" 
                  body={bodyIngresos} 
                  footer={footerIngresos} 
                  className="text-base text-right py-4" 
                  style={{ padding: '1rem' }}
                />
                <Column 
                  header="Gastos" 
                  body={bodyGastos} 
                  footer={footerGastos} 
                  className="text-base text-right py-4" 
                  style={{ padding: '1rem' }}
                />
                <Column 
                  header="Total" 
                  body={bodyTotal} 
                  footer={footerTotal} 
                  className="text-base text-right py-4" 
                  style={{ padding: '1rem' }}
                />
                <Column 
                  header="Acciones" 
                  body={bodyAcciones} 
                  className="text-base py-4" 
                  style={{ width: '150px', padding: '1rem' }}
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