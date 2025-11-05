import React, { useState, useEffect } from 'react';
import { Search, Eye, Printer, Download, Filter, Calendar, CreditCard, X } from 'lucide-react';
import { Paginator } from 'primereact/paginator';
import { obtenerHistorialFacturas, obtenerDatosFacturaPDF } from '../../../AXIOS.SERVICES/factura-axios';
import { procesarPago } from '../../../AXIOS.SERVICES/payments-axios';
import { generarPDFFactura, descargarPDFFactura } from './generarPDFFactura';
import ModalPago from "../pagos/ModalPago";
import VerDetallesFactura from './VerDetallesFactura';

const ListaFacturas = () => {
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

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      const response = await obtenerHistorialFacturas();
      if (response.success) {
        setFacturas(response.data);
      } else {
        console.error('Error al cargar facturas:', response.mensaje);
        setFacturas([]);
      }
    } catch (error) {
      console.error('Error inesperado al cargar facturas:', error);
      setFacturas([]);
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
      // MOSTRAR EN CONSOLA QUÉ SE VA A ENVIAR
      console.log('📤 DATOS A ENVIAR AL BACKEND:', JSON.stringify(datosPago, null, 2));

      // LLAMAR AL SERVICIO PARA PROCESAR EL PAGO
      const response = await procesarPago(datosPago);

      console.log('📥 RESPUESTA DEL BACKEND:', response);

      if (response.success) {
        // MOSTRAR MENSAJE DE ÉXITO
        alert(response.mensaje || 'Pago procesado exitosamente');

        // CERRAR MODAL Y LIMPIAR SELECCIONES
        setShowModalPago(false);
        setFacturaSeleccionada(null);

        // RECARGAR FACTURAS PARA VER CAMBIOS
        cargarFacturas();
      } else {
        alert(response.mensaje || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('❌ ERROR AL PROCESAR PAGO:', error);
      alert('Error al procesar el pago: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  //====================IMPRIMIR_PDF====================
  const handleImprimirFactura = async (factura) => {
    try {
      const response = await obtenerDatosFacturaPDF(factura.numero_factura);
      if (response.success) {
        // Generar el PDF
        const doc = generarPDFFactura(response.data);

        // Convertir a blob y crear URL
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);

        // Mostrar en modal
        setPdfUrl(url);
        setShowPDFPreview(true);
      } else {
        alert('Error al obtener datos de la factura');
      }
    } catch (error) {
      console.error('Error al imprimir PDF:', error);
      alert('Error al generar PDF');
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

  //====================DESCARGAR_PDF====================
  const handleDescargarFactura = async (factura) => {
    try {
      const response = await obtenerDatosFacturaPDF(factura.numero_factura);
      if (response.success) {
        descargarPDFFactura(response.data);
      } else {
        alert('Error al obtener datos de la factura');
      }
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al generar PDF');
    }
  };

  // Handler para mostrar detalles
  const handleVerFactura = (factura) => {
    setFacturaVista(factura);
    setShowDetallesFactura(true);
  };

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto bg-white shadow-xl rounded-lg min-h-screen">
      {/*HEADER*/}
      <div className="mb-6">
  <p className="text-gray-600 text-center font-bold italic">Gestiona y visualiza todas las facturas del sistema</p>
      </div>

      {/*FILTROS_Y_BUSQUEDA*/}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/*BUSQUEDA*/}
          <div className="md:col-span-2">
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
                <option value="ANULADA">Anuladas</option>
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

      {/*RESUMEN_DE_ESTADISTICAS*/}
      <div className="flex gap-2 mb-4 max-w-3xl mx-auto justify-center">
        <div className="bg-blue-500 rounded shadow-sm p-1.5 w-40">
          <div className="flex items-center justify-between">
            <p className="text-white text-xs font-medium">TOTAL FACTURAS</p>
            <p className="text-base font-bold text-white">{facturas.length}</p>
          </div>
        </div>
        <div className="bg-green-500 rounded shadow-sm p-1.5 w-40">
          <div className="flex items-center justify-between">
            <p className="text-white text-xs font-medium">PAGADAS</p>
            <p className="text-base font-bold text-white">
              {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PAGADA').length}
            </p>
          </div>
        </div>
        <div className="bg-orange-500 rounded shadow-sm p-1.5 w-40">
          <div className="flex items-center justify-between">
            <p className="text-white text-xs font-medium">PARCIAL</p>
            <p className="text-base font-bold text-white">
              {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PARCIAL').length}
            </p>    
          </div>
        </div>
        <div className="bg-yellow-500 rounded shadow-sm p-1.5 w-40">
          <div className="flex items-center justify-between">
            <p className="text-white text-xs font-medium">PENDIENTES</p>
            <p className="text-base font-bold text-white">
              {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PENDIENTE').length}
            </p>
          </div>
        </div>
      </div>

      {/*TABLA_DE_FACTURAS*/}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">N° FACTURA</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">FECHA</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">CLIENTE</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">VENDEDOR</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase">TOTAL</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase">SALDO</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase">ESTADO</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">ACCIONES</th>
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
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{factura.numero_factura}</div>
                    </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString('es-HN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {factura.nombre_cliente ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {`${factura.nombre_cliente} ${factura.apellido_cliente || ''}`}
                        </div>
                        {factura.identidad_cliente && (
                          <div className="text-xs text-gray-500">{factura.identidad_cliente}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">Consumidor Final</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-600">{factura.usuario}</div>
                    <div className="text-xs text-gray-500">{factura.nombre_sucursal}</div>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(factura.total)}</div>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <div className={`text-sm font-semibold ${factura.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(factura.saldo)}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded ${getEstadoBadge(factura.nombre_estado)}`}>
                      {factura.nombre_estado?.toUpperCase() || 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleVerFactura(factura)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>

                      {estadoUpper === 'PAGADA' ? (
                        <>
                          {/* BOTONES PARA FACTURAS PAGADAS */}
                          <button
                            onClick={() => handleImprimirFactura(factura)}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="Imprimir"
                          >
                            <Printer size={16} />
                          </button>

                          <button
                            onClick={() => handleDescargarFactura(factura)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Descargar PDF"
                          >
                            <Download size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* BOTÓN PARA FACTURAS PENDIENTES O PARCIALES */}
                          <button
                            onClick={() => handleAbrirModalPago(factura)}
                            className={`px-2.5 py-1 text-white text-[0.7rem] font-medium rounded transition-colors ${
                              estadoUpper === 'PARCIAL'
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {estadoUpper === 'PARCIAL' ? 'Continuar pago' : 'Realizar pago'}
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron facturas</p>
            <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/*PAGINACION*/}
      {facturasFiltradas.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{facturasFiltradas.length}</span> de <span className="font-semibold">{facturas.length}</span> facturas
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-11/12 h-5/6 flex flex-col">
            {/* HEADER DEL MODAL */}
            <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
              <h3 className="text-xl font-bold">Preview de Factura</h3>
              <button
                onClick={handleCerrarPreview}
                className="hover:bg-blue-700 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* CONTENIDO - IFRAME CON EL PDF */}
            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-2 border-gray-300 rounded"
                title="Preview de Factura"
              />
            </div>

            {/* FOOTER DEL MODAL */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={handleCerrarPreview}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES FACTURA */}
      {showDetallesFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowDetallesFactura(false)}
            >
              <X size={22} />
            </button>
            <VerDetallesFactura
              numero={facturaVista?.numero_factura}
              fecha={facturaVista?.fecha_emision}
              estado={facturaVista?.nombre_estado}
              cliente={facturaVista?.nombre_cliente}
              items={facturaVista?.items || []}
              subtotal={facturaVista?.subtotal}
              descuento={facturaVista?.descuento}
              impuesto={facturaVista?.impuesto}
              total={facturaVista?.total}
              saldo={facturaVista?.saldo}
              pagos={facturaVista?.pagos || []}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaFacturas;