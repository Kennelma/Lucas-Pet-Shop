import React, { useState, useEffect } from 'react';
import {
  Download,
  AlertCircle,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  CalendarDays,
  Eye,
  X
} from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { descargarPDFTabla } from './pdf.js';

const Tabla = ({ obtenerRegistroFinanciero, obtenerHistorialReportes }) => {
  const [datosTabla, setDatosTabla] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState('todos');
  const [vistaActiva, setVistaActiva] = useState('anual');
  const [mesDiarioSeleccionado, setMesDiarioSeleccionado] = useState(new Date().getMonth() + 1);
  const [mesesConDatos, setMesesConDatos] = useState([]);
  const [diasConDatos, setDiasConDatos] = useState([]);

  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth();
  const diaActual = new Date().getDate();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  useEffect(() => {
    if (obtenerRegistroFinanciero && obtenerHistorialReportes) {
      cargarDatos();
    } else {
      setError('No se han proporcionado las funciones para obtener los datos');
      setCargando(false);
    }
  }, [anioSeleccionado, vistaActiva, mesDiarioSeleccionado, obtenerRegistroFinanciero, obtenerHistorialReportes]);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    try {
      if (vistaActiva === 'anual') {
        const response = await obtenerRegistroFinanciero(anioSeleccionado);

        if (!response || !response.Consulta) {
          throw new Error('No se pudieron cargar los datos');
        }

        const mesesConOperaciones = response.registros.map(r => r.mes);
        setMesesConDatos(mesesConOperaciones);

        const datosFormateados = response.registros.map((registro, index) => {
          const ingresos = Number(registro.total_ingresos) || 0;
          const gastos = Number(registro.total_gastos) || 0;
          const total = ingresos - gastos;

          return {
            id: index + 1,
            mes: meses[registro.mes - 1],
            mesNumero: registro.mes,
            ingreso: ingresos,
            gasto: gastos,
            total,
            mesIndex: registro.mes - 1
          };
        });

        setDatosTabla(datosFormateados);

      } else {
        const diasEnMes = new Date(anioSeleccionado, mesDiarioSeleccionado, 0).getDate();

        const promesasDias = [];
        for (let dia = 1; dia <= diasEnMes; dia++) {
          promesasDias.push(
            obtenerHistorialReportes(anioSeleccionado, mesDiarioSeleccionado, dia)
          );
        }

        const resultados = await Promise.all(promesasDias);

        const diasConOperaciones = [];
        const datosFormateados = [];
        let idContador = 1;

        resultados.forEach((response, index) => {
          const dia = index + 1;

          if (response && response.Consulta && response.historial && response.historial.length > 0) {
            const registro = response.historial[0];
            const ingresos = Number(registro.total_ingresos) || 0;
            const gastos = Number(registro.total_gastos) || 0;
            const total = ingresos - gastos;

            if (ingresos > 0 || gastos > 0) {
              diasConOperaciones.push(dia);
              datosFormateados.push({
                id: idContador++,
                dia: dia,
                fecha: `${dia}/${mesDiarioSeleccionado}/${anioSeleccionado}`,
                ingreso: ingresos,
                gasto: gastos,
                total: total,
                cantidadFacturas: Number(registro.cantidad_facturas) || 0,
                mesIndex: mesDiarioSeleccionado - 1
              });
            }
          }
        });

        setDiasConDatos(diasConOperaciones);
        setDatosTabla(datosFormateados);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      setDatosTabla([]);
    } finally {
      setCargando(false);
    }
  };

  // Función para abrir modal con detalles
  const handleVerDetalle = (rowData) => {
    setDetalleSeleccionado(rowData);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDetalleSeleccionado(null);
  };

  // Calcular totales
  const totalIngresos = datosTabla.reduce((sum, d) => sum + (d?.ingreso || 0), 0);
  const totalGastos = datosTabla.reduce((sum, d) => sum + (d?.gasto || 0), 0);
  const totalGeneral = totalIngresos - totalGastos;

  // Función para descargar PDF
  const handleDescargarPDF = () => {
    if (vistaActiva === 'anual') {
      if (mesSeleccionado === 'todos') {
        descargarPDFTabla(
          datosTabla,
          totalIngresos,
          totalGastos,
          totalGeneral,
          anioSeleccionado,
          null
        );
      } else {
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
    } else {
      descargarPDFTabla(
        datosTabla,
        totalIngresos,
        totalGastos,
        totalGeneral,
        anioSeleccionado,
        `${meses[mesDiarioSeleccionado - 1]} - Diario`
      );
    }
  };

  // Columna ID
  const bodyId = (rowData) => (
    <div className="flex items-center justify-center">
      <span className="text-gray-800 font-semibold text-sm">{rowData.id}</span>
    </div>
  );

  // Columna Mes o Día
  const bodyPeriodo = (rowData) => {
    if (vistaActiva === 'anual') {
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
    } else {
      const esHoy = rowData.dia === diaActual &&
                    mesDiarioSeleccionado === (mesActual + 1) &&
                    anioSeleccionado === anioActual;
      return (
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-800 font-semibold text-sm">
            {rowData.fecha}
          </span>
          {esHoy && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              Hoy
            </span>
          )}
        </div>
      );
    }
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

  // Columna Acciones
  const bodyAcciones = (rowData) => (
    <div className="flex items-center justify-center">
      <button
        onClick={() => handleVerDetalle(rowData)}
        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
        title="Ver detalle"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );

  // Footers
  const footerPeriodo = () => (
    <strong className="text-gray-800 text-sm font-bold">
      TOTAL {vistaActiva === 'anual' ? anioSeleccionado : `${meses[mesDiarioSeleccionado - 1]} ${anioSeleccionado}`}
    </strong>
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

                {/* Controles superiores */}
                <div className="flex justify-between items-center mb-4">

                  <div className="flex items-center gap-3">
                    {/* Toggle de vista Anual/Diaria */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setVistaActiva('anual')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                          vistaActiva === 'anual'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Anual
                      </button>
                      <button
                        onClick={() => setVistaActiva('diaria')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                          vistaActiva === 'diaria'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Diaria
                      </button>
                    </div>

                    {/* Selector de mes para vista diaria */}
                    {vistaActiva === 'diaria' && (
                      <select
                        value={mesDiarioSeleccionado}
                        onChange={(e) => setMesDiarioSeleccionado(Number(e.target.value))}
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 bg-white font-medium shadow-sm"
                      >
                        {mesesConDatos.length > 0 ? (
                          mesesConDatos.map(mesNum => (
                            <option key={mesNum} value={mesNum}>
                              {meses[mesNum - 1]}
                            </option>
                          ))
                        ) : (
                          meses.map((mes, index) => (
                            <option key={index} value={index + 1}>
                              {mes}
                            </option>
                          ))
                        )}
                      </select>
                    )}

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
                </div>

                {datosTabla.length === 0 && !cargando ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No hay datos disponibles</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {vistaActiva === 'anual'
                        ? 'No hay registros para este año'
                        : 'No hay registros para este mes'
                      }
                    </p>
                  </div>
                ) : (
                  <DataTable
                    value={datosTabla}
                    loading={cargando}
                    paginator
                    rows={vistaActiva === 'anual' ? 5 : 10}
                    rowsPerPageOptions={vistaActiva === 'anual' ? [5, 10, 15] : [10, 15, 20, 31]}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
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
                      field={vistaActiva === 'anual' ? 'mes' : 'fecha'}
                      header={vistaActiva === 'anual' ? 'MES' : 'FECHA'}
                      body={bodyPeriodo}
                      footer={footerPeriodo}
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
                    <Column
                      header="ACCIONES"
                      body={bodyAcciones}
                      className="text-sm text-center"
                      style={{ width: '100px' }}
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
                  {vistaActiva === 'anual' && (
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
                        <optgroup label="Meses con datos">
                          {mesesConDatos.map((mesNum) => (
                            <option key={mesNum} value={mesNum - 1}>
                              {meses[mesNum - 1]}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Ingresos:</span>
                      <span className="font-bold text-green-700">
                        L {vistaActiva === 'anual' && mesSeleccionado === 'todos'
                          ? totalIngresos.toLocaleString('es-HN')
                          : vistaActiva === 'anual' && mesSeleccionado !== 'todos'
                          ? (datosTabla.find(m => m.mesIndex === parseInt(mesSeleccionado))?.ingreso || 0).toLocaleString('es-HN')
                          : totalIngresos.toLocaleString('es-HN')
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Gastos:</span>
                      <span className="font-bold text-red-700">
                        L {vistaActiva === 'anual' && mesSeleccionado === 'todos'
                          ? totalGastos.toLocaleString('es-HN')
                          : vistaActiva === 'anual' && mesSeleccionado !== 'todos'
                          ? (datosTabla.find(m => m.mesIndex === parseInt(mesSeleccionado))?.gasto || 0).toLocaleString('es-HN')
                          : totalGastos.toLocaleString('es-HN')
                        }
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-semibold">Balance:</span>
                        <span className={`font-bold ${
                          (vistaActiva === 'anual' && mesSeleccionado === 'todos'
                            ? totalGeneral
                            : vistaActiva === 'anual' && mesSeleccionado !== 'todos'
                            ? datosTabla.find(m => m.mesIndex === parseInt(mesSeleccionado))?.total || 0
                            : totalGeneral
                          ) >= 0
                            ? 'text-blue-700'
                            : 'text-orange-700'
                        }`}>
                          L {vistaActiva === 'anual' && mesSeleccionado === 'todos'
                            ? totalGeneral.toLocaleString('es-HN')
                            : vistaActiva === 'anual' && mesSeleccionado !== 'todos'
                            ? (datosTabla.find(m => m.mesIndex === parseInt(mesSeleccionado))?.total || 0).toLocaleString('es-HN')
                            : totalGeneral.toLocaleString('es-HN')
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDescargarPDF}
                    disabled={cargando || datosTabla.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF {
                      vistaActiva === 'anual'
                        ? (mesSeleccionado === 'todos' ? 'Anual' : meses[parseInt(mesSeleccionado)])
                        : `${meses[mesDiarioSeleccionado - 1]}`
                    }
                  </button>

                  <p className="text-xs text-gray-500 text-center italic">
                    {vistaActiva === 'anual'
                      ? (mesSeleccionado === 'todos'
                          ? 'Se descargará el reporte completo del año'
                          : 'Se descargará el reporte del mes seleccionado'
                        )
                      : `Se descargará el reporte diario de ${meses[mesDiarioSeleccionado - 1]}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SIMPLE DE DETALLE */}
      {modalAbierto && detalleSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50">
       <div className="bg-white rounded-lg shadow-xl max-w-sm w-[85%] scale-90">
     {/* Header */}
            <div className="bg-gray-50 px-6 py-4 rounded-t-lg border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-500">
                Detalle del Reporte
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {vistaActiva === 'anual'
                  ? `${detalleSeleccionado.mes} ${anioSeleccionado}`
                  : detalleSeleccionado.fecha
                }
              </p>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Ingresos:</span>
                <span className="text-lg font-semibold text-green-600">
                  L {detalleSeleccionado.ingreso.toLocaleString('es-HN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Gastos:</span>
                <span className="text-lg font-semibold text-red-600">
                  L {detalleSeleccionado.gasto.toLocaleString('es-HN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-500">Balance:</span>
                <span className={`text-lg font-bold ${
                  detalleSeleccionado.total >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  L {detalleSeleccionado.total.toLocaleString('es-HN')}
                </span>
              </div>

              {vistaActiva === 'diaria' && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Facturas:</span>
                  <span className="text-lg font-semibold text-gray-600">
                    {detalleSeleccionado.cantidadFacturas || 0}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200 flex justify-end">
              <button
                onClick={cerrarModal}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tabla;