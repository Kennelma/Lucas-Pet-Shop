import React, { useState } from 'react';
import { Search, Eye, Printer, Download, Filter, Calendar } from 'lucide-react';

const ListaFacturas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODAS');
  const [filterFecha, setFilterFecha] = useState('');

  // Datos de ejemplo - esto vendría de tu API
  const facturasEjemplo = [
    {
      id: 1,
      numeroFactura: 'FAC-2024-001',
      fecha: '2024-10-28',
      cliente: {
        nombre: 'Juan Pérez',
        identidad: '0801-1990-12345',
        rtn: '0801-1990-123456'
      },
      vendedor: 'María González',
      sucursal: 'Principal',
      subtotal: 450.00,
      descuento: 50.00,
      impuesto: 60.00,
      total: 460.00,
      saldoPendiente: 0.00,
      estado: 'PAGADA'
    },
    {
      id: 2,
      numeroFactura: 'FAC-2024-002',
      fecha: '2024-10-27',
      cliente: {
        nombre: 'Ana Martínez',
        identidad: '0801-1985-67890',
        rtn: '0801-1985-678901'
      },
      vendedor: 'Carlos López',
      sucursal: 'Sucursal Norte',
      subtotal: 850.00,
      descuento: 0.00,
      impuesto: 127.50,
      total: 977.50,
      saldoPendiente: 477.50,
      estado: 'PENDIENTE'
    },
    {
      id: 3,
      numeroFactura: 'FAC-2024-003',
      fecha: '2024-10-26',
      cliente: {
        nombre: 'Roberto Sánchez',
        identidad: '0801-1992-11111',
        rtn: '0801-1992-111112'
      },
      vendedor: 'María González',
      sucursal: 'Principal',
      subtotal: 1200.00,
      descuento: 100.00,
      impuesto: 165.00,
      total: 1265.00,
      saldoPendiente: 1265.00,
      estado: 'VENCIDA'
    },
  ];

  const formatCurrency = (value) => {
    return `L ${Number(value).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      PAGADA: 'bg-green-100 text-green-800 border-green-200',
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      VENCIDA: 'bg-red-100 text-red-800 border-red-200',
      ANULADA: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return badges[estado] || badges.PENDIENTE;
  };

  const facturasFiltradas = facturasEjemplo.filter(factura => {
    const matchSearch =
      factura.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente.identidad.includes(searchTerm);

    const matchEstado = filterEstado === 'TODAS' || factura.estado === filterEstado;
    const matchFecha = !filterFecha || factura.fecha === filterFecha;

    return matchSearch && matchEstado && matchFecha;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Facturas</h1>
        <p className="text-gray-600">Gestiona y visualiza todas las facturas del sistema</p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por número, cliente o identidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por Estado */}
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

          {/* Filtro por Fecha */}
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

      {/* Resumen de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-1">Total Facturas</p>
          <p className="text-2xl font-bold text-gray-800">{facturasEjemplo.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm mb-1">Pagadas</p>
          <p className="text-2xl font-bold text-green-600">
            {facturasEjemplo.filter(f => f.estado === 'PAGADA').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {facturasEjemplo.filter(f => f.estado === 'PENDIENTE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm mb-1">Vencidas</p>
          <p className="text-2xl font-bold text-red-600">
            {facturasEjemplo.filter(f => f.estado === 'VENCIDA').length}
          </p>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Número Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facturasFiltradas.map((factura) => (
                <tr key={factura.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{factura.numeroFactura}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(factura.fecha).toLocaleDateString('es-HN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{factura.cliente.nombre}</div>
                    <div className="text-xs text-gray-500">{factura.cliente.identidad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{factura.vendedor}</div>
                    <div className="text-xs text-gray-500">{factura.sucursal}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(factura.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-semibold ${factura.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(factura.saldoPendiente)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getEstadoBadge(factura.estado)}`}>
                      {factura.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => console.log('Ver factura', factura.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => console.log('Imprimir factura', factura.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Imprimir"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => console.log('Descargar factura', factura.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {facturasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron facturas</p>
            <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {facturasFiltradas.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{facturasFiltradas.length}</span> de <span className="font-semibold">{facturasEjemplo.length}</span> facturas
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
    </div>
  );
};

export default ListaFacturas;