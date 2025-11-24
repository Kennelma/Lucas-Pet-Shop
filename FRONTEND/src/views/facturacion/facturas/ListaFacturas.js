import React, { useState, useEffect } from 'react';
import { Search, Eye, Printer, Download, Filter, Calendar, CreditCard, X } from 'lucide-react';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { obtenerHistorialFacturas, obtenerDatosFacturaPDF } from '../../../AXIOS.SERVICES/factura-axios';
import { procesarPago } from '../../../AXIOS.SERVICES/payments-axios';
import { generarPDFFactura, descargarPDFFactura } from './generarPDFFactura';
import ModalPago from "../pagos/ModalPago";
import VerDetallesFactura from './VerDetallesFactura';

const ListaFacturas = ({ facturaParaImprimir, setFacturaParaImprimir }) => {
  //====================ESTADOS====================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODAS');
  const [filterFecha, setFilterFecha] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalPago, setShowModalPago] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showDetallesFactura, setShowDetallesFactura] = useState(false);
  const [facturaVista, setFacturaVista] = useState(null);

  //====================CARGAR_FACTURAS_AL_MONTAR_COMPONENTE====================
  useEffect(() => {
    cargarFacturas();
  }, []);

  //====================ABRIR_PREVIEW_AUTOMÁTICO_AL_RECIBIR_FACTURA====================
  useEffect(() => {
    const abrirPreviewAutomatico = async () => {
      if (facturaParaImprimir && facturas.length > 0) {
        const factura = facturas.find(f => f.numero_factura === facturaParaImprimir);
        if (factura) {
          await handleImprimirFactura(factura);
          setFacturaParaImprimir(null); // Limpiar después de abrir
        }
      }
    };
    abrirPreviewAutomatico();
  }, [facturaParaImprimir, facturas]);

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      const response = await obtenerHistorialFacturas();
      if (response.success) {
        setFacturas(response.data);
      } else {
        setFacturas([]);
        Swal.fire({
          icon: 'info',
          title: 'Sin facturas',
          text: 'No hay facturas registradas en el sistema',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setFacturas([]);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo cargar el historial de facturas',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  //====================FORMATEAR_MONEDA====================
  const formatCurrency = (value) => {
    return `L ${Number(value).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  //====================FORMATEAR_IDENTIDAD_INPUT====================
  const formatIdentidadInput = (value) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 4);
      if (numbers.length > 4) {
        formatted += '-' + numbers.substring(4, 8);
      }
      if (numbers.length > 8) {
        formatted += '-' + numbers.substring(8, 13);
      }
    }
    return formatted;
  };

  //====================MANEJAR_CAMBIO_BUSQUEDA====================
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (/^[\d-]*$/.test(value)) {
      setSearchTerm(formatIdentidadInput(value));
    } else {
      setSearchTerm(value);
    }
    setFirst(0);
  };

  //====================OBTENER_BADGE_ESTADO====================
  const getEstadoBadge = (estado) => {
    const estadoUpper = estado?.toUpperCase();
    const badges = {
      PAGADA: 'bg-green-100 text-green-800 border-green-200',
      PARCIAL: 'bg-orange-100 text-orange-800 border-orange-200',
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ANULADA: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return badges[estadoUpper] || badges.PENDIENTE;
  };

  //====================FILTRAR_FACTURAS====================
  const facturasFiltradas = facturas.filter(factura => {
    const matchSearch =
      factura.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.apellido_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.identidad_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
    const estadoFactura = factura.nombre_estado?.toUpperCase();
    const matchEstado = filterEstado === 'TODAS' || estadoFactura === filterEstado;
    const fechaFactura = factura.fecha_emision?.split('T')[0];
    const matchFecha = !filterFecha || fechaFactura === filterFecha;
    return matchSearch && matchEstado && matchFecha;
  });

  //====================PAGINACION====================
  const facturasPaginadas = facturasFiltradas.slice(first, first + rows);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  //====================MANEJAR_MODAL_PAGO====================
  const handleAbrirModalPago = (factura) => {
    setFacturaSeleccionada(factura);
    setShowModalPago(true);
  };

  const handleCerrarModalPago = () => {
    setShowModalPago(false);
    setFacturaSeleccionada(null);
  };

  const handlePagoExitoso = async (datosPago) => {
    try {
      const response = await procesarPago(datosPago);

      if (response.success) {
        const { saldo_restante, tipo_pago } = response.data || {};
        const saldoNumerico = parseFloat(saldo_restante) || 0;
        const esPagoParcial = saldoNumerico > 0;

        //CERRAR MODAL ANTES DE MOSTRAR ALERTA
        setShowModalPago(false);
        setShowDetallesFactura(false);
        setFacturaSeleccionada(null);
        setFacturaVista(null);

        //MOSTRAR ALERTA DIFERENTE SEGÚN TIPO DE PAGO
        if (esPagoParcial) {
          await Swal.fire({
            icon: 'success',
            title: 'Pago parcial registrado',
            html: `
              <p>${response.mensaje || 'Pago procesado exitosamente'}</p>
              <div class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                <p class="text-sm text-gray-600">Saldo restante:</p>
                <p class="text-xl font-bold text-orange-700">L ${saldoNumerico.toFixed(2)}</p>
              </div>
            `,
            confirmButtonColor: '#3085d6'
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'Pago completo',
            text: response.mensaje || 'Factura pagada totalmente',
            confirmButtonColor: '#3085d6'
          });

          //ABRIR PREVIEW DEL PDF SI ES PAGO COMPLETO
          if (facturaSeleccionada) {
            await handleImprimirFactura(facturaSeleccionada);
          }
        }

        await cargarFacturas();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.mensaje || 'Error al procesar el pago',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar pago',
        text: error?.response?.data?.mensaje || error.message || 'Error inesperado',
        confirmButtonColor: '#d33'
      });
    }
  };


  //====================IMPRIMIR_PDF====================
  const handleImprimirFactura = async (factura) => {
    try {
      const response = await obtenerDatosFacturaPDF(factura.numero_factura);
      if (response.success) {
        //Generar el PDF
        const doc = generarPDFFactura(response.data);

        // Convertir a blob y crear URL
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);

        //Mostrar en modal
        setPdfUrl(url);
        setShowPDFPreview(true);

        // Toast de éxito
        Swal.fire({
          icon: 'success',
          title: 'PDF generado',
          text: 'Vista previa lista',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener datos de la factura',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error al imprimir PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al generar el PDF de la factura',
        confirmButtonColor: '#d33'
      });
    }
  };

  //====================CERRAR_PREVIEW====================
  const handleCerrarPreview = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setShowPDFPreview(false);
  };

  //====================IMPRIMIR_PDF====================
  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  //====================DESCARGAR_PDF====================
  const handleDescargarFactura = async (factura) => {
    try {
      const response = await obtenerDatosFacturaPDF(factura.numero_factura);
      if (response.success) {
        descargarPDFFactura(response.data);
        Swal.fire({
          icon: 'success',
          title: 'Descarga exitosa',
          text: 'La factura se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener datos de la factura',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al generar el PDF de la factura',
        confirmButtonColor: '#d33'
      });
    }
  };

//ANTES CON ID_FACTURA, ESTA VEZ CON EL NUMERO DE FACTURA DE LA FILA
const handleVerFactura = (factura) => {
  setFacturaVista(factura.numero_factura);
  setShowDetallesFactura(true);
};


  return (
    <div className="space-y-4 sm:space-y-6 bg-white shadow-xl rounded-lg min-h-screen w-full">
      {/*HEADER*/}
      <div className="mb-4 sm:mb-6 px-4 sm:px-6 pt-4 sm:pt-6">
        <p className="text-gray-600 text-center font-bold italic text-sm sm:text-base">Gestiona y visualiza todas las facturas del sistema</p>
      </div>

      {/*FILTROS_Y_BUSQUEDA*/}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mx-4 sm:mx-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/*BUSQUEDA*/}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por número, cliente o identidad..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/*FILTRO_POR_ESTADO*/}
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterEstado}
                onChange={(e) => {
                  setFilterEstado(e.target.value);
                  setFirst(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="TODAS">Todos los estados</option>
                <option value="PAGADA">Pagadas</option>
                <option value="PARCIAL">Parciales</option>
                <option value="PENDIENTE">Pendientes</option>
                </select>
            </div>
          </div>

          {/*FILTRO_POR_FECHA*/}
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={filterFecha}
                onChange={(e) => {
                  setFilterFecha(e.target.value);
                  setFirst(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/*RESUMEN_DE_ESTADISTICAS - RESPONSIVE*/}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mx-4 sm:mx-6 mb-4 sm:mb-6">
        <div className="bg-blue-500 rounded shadow-sm p-2 sm:p-3">
          <div className="flex flex-col items-start">
            <p className="text-white text-[0.65rem] sm:text-xs font-medium">TOTAL</p>
            <p className="text-lg sm:text-2xl font-bold text-white">{facturas.length}</p>
          </div>
        </div>
        <div className="bg-green-500 rounded shadow-sm p-2 sm:p-3">
          <div className="flex flex-col items-start">
            <p className="text-white text-[0.65rem] sm:text-xs font-medium">PAGADAS</p>
            <p className="text-lg sm:text-2xl font-bold text-white">
              {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PAGADA').length}
            </p>
          </div>
        </div>
        <div className="bg-orange-500 rounded shadow-sm p-2 sm:p-3">
          <div className="flex flex-col items-start">
            <p className="text-white text-[0.65rem] sm:text-xs font-medium">PARCIAL</p>
            <p className="text-lg sm:text-2xl font-bold text-white">
              {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PARCIAL').length}
            </p>
          </div>
        </div>
        <div className="bg-yellow-500 rounded shadow-sm p-2 sm:p-3">
          <div className="flex flex-col items-start">
            <p className="text-white text-[0.65rem] sm:text-xs font-medium">PENDIENTES</p>
            <p className="text-lg sm:text-2xl font-bold text-white">
              {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PENDIENTE').length}
            </p>
          </div>
        </div>
      </div>

      {/*TABLA_DE_FACTURAS*/}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto mx-4 sm:mx-6">
        <table className="w-full table-auto text-sm sm:text-base">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase">N° FAC</th>
              <th className="px-2 sm:px-3 py-2 text-left text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase hidden sm:table-cell">FECHA</th>
              <th className="px-2 sm:px-4 py-2 text-left text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase">CLIENTE</th>
              <th className="px-2 sm:px-3 py-2 text-left text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase hidden md:table-cell">VENDEDOR</th>
              <th className="px-2 sm:px-3 py-2 text-right text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase">TOTAL</th>
              <th className="px-2 sm:px-3 py-2 text-right text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase hidden lg:table-cell">SALDO</th>
              <th className="px-2 py-2 text-center text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase">EST</th>
              <th className="px-2 sm:px-3 py-2 text-center text-[0.65rem] sm:text-xs font-medium text-gray-700 uppercase">ACC</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-3 py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 text-sm">Cargando facturas...</span>
                  </div>
                </td>
              </tr>
            ) : (
              facturasPaginadas.map((factura, index) => {
                const estadoUpper = factura.nombre_estado?.toUpperCase();

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <td className="px-2 sm:px-4 py-2">
                      <div className="text-[0.7rem] sm:text-sm font-medium text-gray-900 break-words max-w-[80px] sm:max-w-[180px]">{factura.numero_factura}</div>
                    </td>
                  <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-xs sm:text-sm text-gray-600">
                      {factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString('es-HN', {
                        year: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      }) : '-'}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2">
                    {factura.nombre_cliente ? (
                      <div>
                        <div className="text-[0.7rem] sm:text-sm font-medium text-gray-900 break-words max-w-[100px] sm:max-w-none">
                          {`${factura.nombre_cliente} ${factura.apellido_cliente || ''}`}
                        </div>
                        {factura.identidad_cliente && (
                          <div className="text-[0.6rem] sm:text-xs text-gray-500 hidden sm:block">{factura.identidad_cliente}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[0.7rem] sm:text-sm font-medium text-gray-900">Consumidor</div>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-2 hidden md:table-cell">
                    <div className="text-xs sm:text-sm text-gray-600">{factura.usuario}</div>
                    <div className="text-[0.65rem] text-gray-500">{factura.nombre_sucursal}</div>
                  </td>
                  <td className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">
                    <div className="text-[0.7rem] sm:text-sm font-semibold text-gray-900">{formatCurrency(factura.total)}</div>
                  </td>
                  <td className="px-2 sm:px-3 py-2 text-right whitespace-nowrap hidden lg:table-cell">
                    <div className={`text-[0.7rem] sm:text-sm font-semibold ${factura.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(factura.saldo)}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className={`px-1 sm:px-2 py-1 inline-flex text-[0.6rem] sm:text-xs font-semibold rounded ${getEstadoBadge(factura.nombre_estado)}`}>
                      {factura.nombre_estado?.toUpperCase().substring(0, 3) || 'PEN'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap">
                      <button
                        onClick={() => handleVerFactura(factura)}
                        className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver"
                      >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                      </button>

                      {estadoUpper === 'PAGADA' ? (
                        <>
                          {/* BOTONES PARA FACTURAS PAGADAS */}
                          <button
                            onClick={() => handleImprimirFactura(factura)}
                            className="p-1 sm:p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="Imprimir"
                          >
                            <Printer size={14} className="sm:w-4 sm:h-4" />
                          </button>

                          <button
                            onClick={() => handleDescargarFactura(factura)}
                            className="p-1 sm:p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Descargar"
                          >
                            <Download size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* BOTÓN PARA FACTURAS PENDIENTES O PARCIALES */}
                          <button
                            onClick={() => handleAbrirModalPago(factura)}
                            className={`px-1.5 sm:px-2.5 py-1 text-white text-[0.6rem] sm:text-[0.7rem] font-medium rounded transition-colors whitespace-nowrap ${
                              estadoUpper === 'PARCIAL'
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <span className="hidden sm:inline">{estadoUpper === 'PARCIAL' ? 'Continuar' : 'Pagar'}</span>
                            <span className="sm:hidden">Pago</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>

        {/*SIN_RESULTADOS*/}
        {facturasFiltradas.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">No se encontraron facturas</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/*PAGINACION*/}
      {facturasFiltradas.length > 0 && (
        <div className="mt-4 sm:mt-6 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            <span className="hidden sm:inline">Mostrando <span className="font-semibold">{Math.min(rows, facturasFiltradas.length)}</span> de <span className="font-semibold">{facturasFiltradas.length}</span> facturas</span>
            <span className="sm:hidden"><span className="font-semibold">{facturasFiltradas.length}</span> facturas</span>
          </div>
          <Paginator
            first={first}
            rows={rows}
            totalRecords={facturasFiltradas.length}
            onPageChange={onPageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            className="p-paginator-sm"
          />
        </div>
      )}

      {/*MODAL_DE_PAGO*/}
      <ModalPago
        show={showModalPago}
        factura={facturaSeleccionada}
        total={facturaSeleccionada ? parseFloat(facturaSeleccionada.saldo) || 0 : 0}
        onClose={handleCerrarModalPago}
        onPagoConfirmado={handlePagoExitoso}
      />

      {/*MODAL_PREVIEW_PDF*/}
      {showPDFPreview && pdfUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col relative">
            {/* BOTÓN CERRAR EN LA ESQUINA */}
            <button
              onClick={handleCerrarPreview}
              className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors shadow-lg"
              title="Cerrar"
            >
              <X size={16} />
            </button>

            {/* CONTENIDO - IFRAME */}
            <div className="flex-1 overflow-hidden bg-gray-100 rounded-lg">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0 rounded-lg"
                title="Vista previa de factura"
              />
            </div>
          </div>
        </div>
      )}
        {/* MODAL DE DETALLES FACTURA - VERSIÓN CORREGIDA */}
      {showDetallesFactura && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50"
          onClick={() => setShowDetallesFactura(false)} // Cerrar al hacer clic fuera
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro
          >
            <VerDetallesFactura
              numFactura={facturaVista}
              onClose={() => setShowDetallesFactura(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ListaFacturas;