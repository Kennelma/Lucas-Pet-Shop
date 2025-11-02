import React, { useState, useEffect } from 'react';
import { Search, Eye, Printer, Download, Filter, Calendar } from 'lucide-react';
import { obtenerHistorialFacturas } from '../../../AXIOS.SERVICES/factura-axios';
import ModalPago from "../modal_pago";

const ListaFacturas = () => {
  //====================ESTADOS====================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODAS');
  const [filterFecha, setFilterFecha] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalPago, setShowModalPago] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

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
  };

  //====================OBTENER_BADGE_ESTADO====================
  const getEstadoBadge = (estado) => {
    const estadoUpper = estado?.toUpperCase();
    const badges = {
      PAGADA: 'bg-green-100 text-green-800 border-green-200',
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      VENCIDA: 'bg-red-100 text-red-800 border-red-200',
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

  //====================MANEJAR_MODAL_PAGO====================
  const handleAbrirModalPago = (factura) => {
    setFacturaSeleccionada(factura);
    setShowModalPago(true);
  };

  const handleCerrarModalPago = () => {
    setShowModalPago(false);
    setFacturaSeleccionada(null);
  };

  const handlePagoExitoso = (tipoPago, saldoRestante) => {
    console.log('Pago procesado:', { tipoPago, saldoRestante, factura: facturaSeleccionada });
    setShowModalPago(false);
    setFacturaSeleccionada(null);
    cargarFacturas();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/*HEADER*/}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Facturas</h1>
        <p className="text-gray-600">Gestiona y visualiza todas las facturas del sistema</p>
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
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="TODAS">Todos los estados</option>
                <option value="PAGADA">Pagadas</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="VENCIDA">Vencidas</option>
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
                onChange={(e) => setFilterFecha(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/*RESUMEN_DE_ESTADISTICAS*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-1">Total Facturas</p>
          <p className="text-2xl font-bold text-gray-800">{facturas.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm mb-1">Pagadas</p>
          <p className="text-2xl font-bold text-green-600">
            {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PAGADA').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'PENDIENTE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm mb-1">Vencidas</p>
          <p className="text-2xl font-bold text-red-600">
            {facturas.filter(f => f.nombre_estado?.toUpperCase() === 'VENCIDA').length}
          </p>
        </div>
      </div>

      {/*TABLA_DE_FACTURAS*/}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Número Factura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Saldo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Cargando facturas...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                facturasFiltradas.map((factura, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{factura.numero_factura}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString('es-HN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {factura.nombre_cliente ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {`${factura.nombre_cliente} ${factura.apellido_cliente || ''}`}
                          </div>
                          {factura.identidad_cliente && (
                            <div className="text-xs text-gray-500">{factura.identidad_cliente}</div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">Consumidor Final</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{factura.usuario}</div>
                      <div className="text-xs text-gray-500">{factura.nombre_sucursal}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(factura.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-semibold ${factura.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(factura.saldo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getEstadoBadge(factura.nombre_estado)}`}>
                        {factura.nombre_estado?.toUpperCase() || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => console.log('Ver factura', factura.numero_factura)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        {factura.nombre_estado?.toUpperCase() === 'PENDIENTE' ? (
                          <button
                            onClick={() => handleAbrirModalPago(factura)}
                            className="px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                            title="Continuar pago"
                          >
                            Continuar Pago
                          </button>
                        ) : (
                          <button
                            onClick={() => console.log('Imprimir factura', factura.numero_factura)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Imprimir"
                          >
                            <Printer size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Anterior
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/*MODAL_DE_PAGO*/}
      {facturaSeleccionada && (
        <ModalPago
          show={showModalPago}
          numero_factura={facturaSeleccionada.numero_factura}
          total={parseFloat(facturaSeleccionada.saldo) || 0}
          onClose={handleCerrarModalPago}
          onSuccess={handlePagoExitoso}
        />
      )}
    </div>
  );
};

export default ListaFacturas;