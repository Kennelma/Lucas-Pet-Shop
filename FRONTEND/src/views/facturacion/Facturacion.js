import React, { useState } from 'react';
import { Printer, Download, Mail, FileText, Plus, Trash2, Edit, Eye, Search, ShoppingCart, User, Calendar } from 'lucide-react';

export default function FacturaView() {
  const [activeTab, setActiveTab] = useState('nueva'); // 'nueva' o 'facturas'
  const [selectedFactura, setSelectedFactura] = useState(null);

  // Estado para nueva factura
  const [nuevaFactura, setNuevaFactura] = useState({
    cliente: '',
    rtn_cliente: '',
    telefono: '',
    email: '',
    direccion: '',
    vendedor: '',
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: 'Efectivo'
  });

  const [itemsFactura, setItemsFactura] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({
    codigo: '',
    cantidad: 1,
    descripcion: '',
    precio_unitario: 0,
    ajuste_precio: 0,
    tipo_item: 'SERVICIO',
    estilista: '',
    num_mascotas: 0
  });

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
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const agregarItem = () => {
    if (!nuevoItem.descripcion || nuevoItem.precio_unitario <= 0) {
      alert('Por favor completa la descripción y el precio del item');
      return;
    }

    const total = (nuevoItem.cantidad * nuevoItem.precio_unitario) + parseFloat(nuevoItem.ajuste_precio || 0);
    
    setItemsFactura([...itemsFactura, {
      ...nuevoItem,
      id: Date.now(),
      total_linea: total
    }]);

    setNuevoItem({
      codigo: '',
      cantidad: 1,
      descripcion: '',
      precio_unitario: 0,
      ajuste_precio: 0,
      tipo_item: 'SERVICIO',
      estilista: '',
      num_mascotas: 0
    });
  };

  const eliminarItem = (id) => {
    setItemsFactura(itemsFactura.filter(item => item.id !== id));
  };

  const calcularSubtotal = () => {
    return itemsFactura.reduce((sum, item) => sum + item.total_linea, 0);
  };

  const calcularImpuesto = () => {
    return calcularSubtotal() * 0.15;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularImpuesto();
  };

  const guardarFactura = () => {
    if (!nuevaFactura.cliente || itemsFactura.length === 0) {
      alert('Por favor completa los datos del cliente y agrega al menos un item');
      return;
    }

    alert('Factura guardada exitosamente!');
    // Aquí iría la lógica para guardar en la base de datos
    
    // Limpiar formulario
    setNuevaFactura({
      cliente: '',
      rtn_cliente: '',
      telefono: '',
      email: '',
      direccion: '',
      vendedor: '',
      fecha: new Date().toISOString().split('T')[0],
      metodo_pago: 'Efectivo'
    });
    setItemsFactura([]);
  };

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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                <div>
                <h1 className="text-xl font-semibold text-gray-800">Sistema de Facturación</h1>
                </div>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('nueva')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'nueva'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus size={20} />
                Nueva Factura
              </div>
            </button>
            <button
              onClick={() => setActiveTab('facturas')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'facturas'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={20} />
                Facturas
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'nueva' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Nueva Factura</h2>
            </div>

            {/* Información del Cliente */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <User size={20} />
                Información del Cliente
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <input
                    type="text"
                    value={nuevaFactura.cliente}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, cliente: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={nuevaFactura.telefono}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={nuevaFactura.email}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RTN Cliente</label>
                  <input
                    type="text"
                    value={nuevaFactura.rtn_cliente}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, rtn_cliente: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0000-0000-000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                  <select
                    value={nuevaFactura.vendedor}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, vendedor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar vendedor</option>
                    <option value="Maria Gonzalez">María González</option>
                    <option value="Pedro Lopez">Pedro López</option>
                    <option value="Ana Reyes">Ana Reyes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={nuevaFactura.fecha}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, fecha: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={nuevaFactura.direccion}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, direccion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección del cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    value={nuevaFactura.metodo_pago}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, metodo_pago: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Agregar Items */}
            <div className="mb-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Agregar Productos/Servicios</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
                    <input
                      type="text"
                      value={nuevoItem.codigo}
                      onChange={(e) => setNuevoItem({...nuevoItem, codigo: e.target.value})}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                      placeholder="ST01"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cant.</label>
                    <input
                      type="number"
                      min="1"
                      value={nuevoItem.cantidad}
                      onChange={(e) => setNuevoItem({...nuevoItem, cantidad: parseInt(e.target.value) || 1})}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción *</label>
                    <input
                      type="text"
                      value={nuevoItem.descripcion}
                      onChange={(e) => setNuevoItem({...nuevoItem, descripcion: e.target.value})}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Nombre del item"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit. *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={nuevoItem.precio_unitario}
                      onChange={(e) => setNuevoItem({...nuevoItem, precio_unitario: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ajuste</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={nuevoItem.ajuste_precio}
                      onChange={(e) => setNuevoItem({...nuevoItem, ajuste_precio: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={nuevoItem.tipo_item}
                      onChange={(e) => setNuevoItem({...nuevoItem, tipo_item: e.target.value})}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="SERVICIO">Servicio</option>
                      <option value="PRODUCTO">Producto</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estilista</label>
                    <select
                      value={nuevoItem.estilista}
                      onChange={(e) => setNuevoItem({...nuevoItem, estilista: e.target.value})}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">N/A</option>
                      <option value="Ana Reyes">Ana Reyes</option>
                      <option value="Luis García">Luis García</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={agregarItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus size={18} />
                  Agregar Item
                </button>
              </div>
            </div>

            {/* Tabla de Items */}
            {itemsFactura.length > 0 && (
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Código</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Cant.</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">P. Unit.</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Ajuste</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-gray-600 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsFactura.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm">{item.codigo}</td>
                        <td className="py-3 px-3 text-center text-sm font-medium">{item.cantidad}</td>
                        <td className="py-3 px-3">
                          <p className="text-sm font-medium text-gray-800">{item.descripcion}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.tipo_item}</span>
                            {item.estilista && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.estilista}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-sm">{formatCurrency(item.precio_unitario)}</td>
                        <td className="py-3 px-3 text-right text-sm text-amber-600">
                          {item.ajuste_precio > 0 ? `+${formatCurrency(item.ajuste_precio)}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right text-sm font-semibold">{formatCurrency(item.total_linea)}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => eliminarItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totales y Botones */}
            <div className="flex justify-between items-end">
              <div className="space-x-3">
                <button
                  onClick={guardarFactura}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                >
                  Guardar Factura
                </button>
                <button
                  onClick={() => {
                    setNuevaFactura({
                      cliente: '',
                      rtn_cliente: '',
                      telefono: '',
                      email: '',
                      direccion: '',
                      vendedor: '',
                      fecha: new Date().toISOString().split('T')[0],
                      metodo_pago: 'Efectivo'
                    });
                    setItemsFactura([]);
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Limpiar
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 min-w-xs">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(calcularSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">IVA (15%):</span>
                    <span className="font-semibold">{formatCurrency(calcularImpuesto())}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-400">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(calcularTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facturas' && (
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
        )}
      </div>
    </div>
  );
}