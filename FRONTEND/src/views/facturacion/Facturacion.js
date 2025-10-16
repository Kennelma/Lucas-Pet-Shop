import React, { useState } from 'react';
import { Printer, Download, Mail, FileText, Plus, Trash2, Edit, Eye, Search } from 'lucide-react';

export default function FacturaView() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);

  const [facturas] = useState([
    {
      id_factura_pk: 1,
      numero_factura: 10245,
      fecha_emision: '2025-10-15 10:30:00',
      RTN: '08011999123456',
      subtotal: 850.00,
      impuesto: 127.50,
      descuento: 50.00,
      total: 927.50,
      saldo: 927.50,
      id_sucursal_fk: 1,
      id_usuario_fk: 5,
      id_estado_fk: 1,
      id_cliente_fk: 23,
      sucursal: 'Sucursal Centro',
      usuario: 'María González',
      estado: 'PENDIENTE',
      cliente: {
        nombre: 'Carlos Mendoza',
        rtn: '08011990654321',
        telefono: '9876-5432',
        direccion: 'Col. Alameda, Tegucigalpa'
      },
      detalles: [
        {
          id_detalle_pk: 1,
          cantidad_item: 2,
          nombre_item: 'Baño Completo - Raza Grande',
          precio_item: 250.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: 2,
          total_linea: 500.00,
          tipo_item: 'SERVICIO',
          estilista: 'Ana Reyes'
        },
        {
          id_detalle_pk: 2,
          cantidad_item: 1,
          nombre_item: 'Corte de Pelo Especial',
          precio_item: 180.00,
          ajuste_precio: 20.00,
          num_mascotas_atendidas: 1,
          total_linea: 200.00,
          tipo_item: 'SERVICIO',
          descrip_ajuste: 'Pelo enredado',
          estilista: 'Ana Reyes'
        },
        {
          id_detalle_pk: 3,
          cantidad_item: 3,
          nombre_item: 'Shampoo Premium 500ml',
          precio_item: 50.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: null,
          total_linea: 150.00,
          tipo_item: 'PRODUCTO'
        }
      ]
    },
    {
      id_factura_pk: 2,
      numero_factura: 10244,
      fecha_emision: '2025-10-14 15:20:00',
      RTN: '08011999123456',
      subtotal: 450.00,
      impuesto: 67.50,
      descuento: 0,
      total: 517.50,
      saldo: 0,
      id_sucursal_fk: 1,
      id_usuario_fk: 3,
      id_estado_fk: 2,
      id_cliente_fk: 18,
      sucursal: 'Sucursal Centro',
      usuario: 'Pedro López',
      estado: 'PAGADA',
      cliente: {
        nombre: 'Ana Martínez',
        rtn: '08011985987654',
        telefono: '9123-4567',
        direccion: 'Col. Kennedy, Tegucigalpa'
      },
      detalles: [
        {
          id_detalle_pk: 4,
          cantidad_item: 1,
          nombre_item: 'Baño Básico - Raza Pequeña',
          precio_item: 150.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: 1,
          total_linea: 150.00,
          tipo_item: 'SERVICIO',
          estilista: 'Luis García'
        },
        {
          id_detalle_pk: 5,
          cantidad_item: 2,
          nombre_item: 'Collar Antipulgas',
          precio_item: 150.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: null,
          total_linea: 300.00,
          tipo_item: 'PRODUCTO'
        }
      ]
    },
    {
      id_factura_pk: 3,
      numero_factura: 10243,
      fecha_emision: '2025-10-13 11:45:00',
      RTN: '08011999123456',
      subtotal: 680.00,
      impuesto: 102.00,
      descuento: 30.00,
      total: 752.00,
      saldo: 752.00,
      id_sucursal_fk: 2,
      id_usuario_fk: 5,
      id_estado_fk: 1,
      id_cliente_fk: 45,
      sucursal: 'Sucursal Norte',
      usuario: 'María González',
      estado: 'PENDIENTE',
      cliente: {
        nombre: 'Roberto Flores',
        rtn: '08011992456789',
        telefono: '9654-3210',
        direccion: 'Col. Miraflores, San Pedro Sula'
      },
      detalles: [
        {
          id_detalle_pk: 6,
          cantidad_item: 1,
          nombre_item: 'Spa Completo + Masaje',
          precio_item: 380.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: 1,
          total_linea: 380.00,
          tipo_item: 'SERVICIO',
          estilista: 'Ana Reyes'
        },
        {
          id_detalle_pk: 7,
          cantidad_item: 1,
          nombre_item: 'Tratamiento Antipulgas',
          precio_item: 200.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: 1,
          total_linea: 200.00,
          tipo_item: 'SERVICIO',
          estilista: 'Ana Reyes'
        },
        {
          id_detalle_pk: 8,
          cantidad_item: 1,
          nombre_item: 'Cepillo de Cerdas Suaves',
          precio_item: 100.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: null,
          total_linea: 100.00,
          tipo_item: 'PRODUCTO'
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value) => {
    return `L ${value.toFixed(2)}`;
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('es-HN');
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'PAGADA': 'bg-green-100 text-green-800 border-green-300',
      'ANULADA': 'bg-red-100 text-red-800 border-red-300'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const filteredFacturas = facturas.filter(f => 
    f.numero_factura.toString().includes(searchTerm) ||
    f.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cliente.rtn.includes(searchTerm)
  );

  const facturaActual = selectedFactura || facturas[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText size={32} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sistema de Facturación</h1>
                <p className="text-sm text-gray-500">Gestión de facturas y servicios</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              <span className="font-semibold">Nueva Factura</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Lista de facturas - Izquierda */}
          <div className="col-span-5 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Facturas Recientes</h2>
                <span className="text-sm text-gray-500">{facturas.length} facturas</span>
              </div>

              {/* Buscador */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por número, cliente o RTN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tabla de facturas */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">N° Factura</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFacturas.map((factura) => (
                      <tr 
                        key={factura.id_factura_pk}
                        className={`border-b hover:bg-blue-50 cursor-pointer transition-colors ${
                          facturaActual?.id_factura_pk === factura.id_factura_pk ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => setSelectedFactura(factura)}
                      >
                        <td className="py-3 px-3">
                          <span className="font-semibold text-blue-600">#{factura.numero_factura}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-medium text-gray-800">{factura.cliente.nombre}</div>
                          <div className="text-xs text-gray-500">{factura.cliente.rtn}</div>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">{formatDate(factura.fecha_emision)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-800">{formatCurrency(factura.total)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(factura.estado)}`}>
                            {factura.estado}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFactura(factura);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detalle de factura - Derecha */}
          <div className="col-span-7">
            {facturaActual && (
              <>
                {/* Botones de acción de la factura */}
                <div className="flex justify-end gap-2 mb-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                    <Printer size={18} />
                    <span className="text-sm font-medium">Imprimir</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                    <Download size={18} />
                    <span className="text-sm font-medium">PDF</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Mail size={18} />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                </div>

                {/* Factura */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  {/* Encabezado */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <FileText size={28} />
                          <h1 className="text-2xl font-bold">FACTURA</h1>
                        </div>
                        <p className="text-blue-100 text-sm">Servicios Veterinarios y Pet Grooming</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">#{facturaActual.numero_factura}</p>
                        <p className="text-xs text-blue-100 mt-1">ID: {facturaActual.id_factura_pk}</p>
                        <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(facturaActual.estado)}`}>
                          {facturaActual.estado}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="grid grid-cols-2 gap-6 p-6 border-b">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Emisor</h3>
                      <p className="font-bold text-gray-800 mb-1">{facturaActual.sucursal}</p>
                      <p className="text-sm text-gray-600">RTN: {facturaActual.RTN}</p>
                      <p className="text-sm text-gray-600 mt-2">Atendido por: {facturaActual.usuario}</p>
                      <p className="text-sm text-gray-600">Fecha: {formatDateTime(facturaActual.fecha_emision)}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
                      <p className="font-bold text-gray-800 mb-1">{facturaActual.cliente.nombre}</p>
                      <p className="text-sm text-gray-600">RTN: {facturaActual.cliente.rtn}</p>
                      <p className="text-sm text-gray-600">Tel: {facturaActual.cliente.telefono}</p>
                      <p className="text-sm text-gray-600">{facturaActual.cliente.direccion}</p>
                    </div>
                  </div>

                  {/* Tabla de detalles */}
                  <div className="p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                          <th className="text-center py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Cant.</th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">P. Unit.</th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Ajuste</th>
                          <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturaActual.detalles.map((detalle, index) => (
                          <tr key={detalle.id_detalle_pk} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="py-3 px-2">
                              <p className="font-medium text-gray-800 text-sm">{detalle.nombre_item}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  <span className="font-semibold">{detalle.tipo_item}</span>
                                </span>
                                {detalle.estilista && (
                                  <span className="text-xs text-gray-500">
                                    Estilista: <span className="font-semibold">{detalle.estilista}</span>
                                  </span>
                                )}
                                {detalle.num_mascotas_atendidas && (
                                  <span className="text-xs text-gray-500">
                                    Mascotas: <span className="font-semibold">{detalle.num_mascotas_atendidas}</span>
                                  </span>
                                )}
                              </div>
                              {detalle.descrip_ajuste && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                  {detalle.descrip_ajuste}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center font-medium text-gray-700">{detalle.cantidad_item}</td>
                            <td className="py-3 px-2 text-right text-gray-700 text-sm">{formatCurrency(detalle.precio_item)}</td>
                            <td className="py-3 px-2 text-right text-sm">
                              {detalle.ajuste_precio > 0 ? (
                                <span className="text-amber-600 font-medium">+{formatCurrency(detalle.ajuste_precio)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right font-semibold text-gray-800 text-sm">{formatCurrency(detalle.total_linea)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totales */}
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="max-w-xs ml-auto space-y-2">
                      <div className="flex justify-between text-gray-700 text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(facturaActual.subtotal)}</span>
                      </div>
                      {facturaActual.descuento > 0 && (
                        <div className="flex justify-between text-green-600 text-sm">
                          <span>Descuento:</span>
                          <span className="font-medium">-{formatCurrency(facturaActual.descuento)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-700 text-sm">
                        <span>Impuesto (15%):</span>
                        <span className="font-medium">{formatCurrency(facturaActual.impuesto)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(facturaActual.total)}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold text-blue-600 pt-1">
                        <span>Saldo Pendiente:</span>
                        <span>{formatCurrency(facturaActual.saldo)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-center">
                    <p className="text-sm">Gracias por su preferencia</p>
                    <p className="text-xs text-blue-100 mt-1">Factura generada electrónicamente</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Modal de Facturación</h2>
            <p className="text-gray-600 mb-6">Este modal será implementado en el archivo modal_facturar</p>
            <button 
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}