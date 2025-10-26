import React, { useState } from 'react';
import { Search, Plus, X, User, Package, Trash2, ShoppingCart, FileText, Printer, Mail } from 'lucide-react';
import ModalPago from './modal_pago';

function InvoiceModule() {
  const [activeTab, setActiveTab] = useState('nueva');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: '',
    lastName: '',
    rtn: '',
    phone: '',
    address: ''
  });
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactura, setSelectedFactura] = useState(null);

  const existingCustomers = [
    { id: 1, name: 'María González', rtn: '08011990123456', phone: '9876-5432', address: 'Col. Los Álamos' },
    { id: 2, name: 'Carlos Pérez', rtn: '05031985654321', phone: '3344-5566', address: 'Barrio La Granja' }
  ];

  const products = [
    { id: 1, name: 'Alimento Perro Adulto 20kg', price: 450.00, stock: 15 },
    { id: 2, name: 'Arena para Gato 10kg', price: 120.00, stock: 30 },
    { id: 3, name: 'Collar Antipulgas', price: 85.00, stock: 25 },
    { id: 4, name: 'Shampoo Antipulgas', price: 95.00, stock: 20 }
  ];

  const [facturas, setFacturas] = useState([
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
          total_linea: 300.00,
          tipo_item: 'PRODUCTO'
        }
      ]
    }
  ]);

  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    
    if (value.length >= 8) {
      setSearchAttempted(true);
      const found = existingCustomers.find(c => 
        c.rtn.includes(value) || c.id.toString() === value
      );
      
      if (found) {
        setSelectedCustomer(found);
        setShowModal(false);
        setCustomerSearch('');
      } else {
        setShowModal(true);
        setSelectedCustomer(null);
      }
    } else {
      setSearchAttempted(false);
      setShowModal(false);
      if (value === '') {
        setSelectedCustomer(null);
      }
    }
  };

  const handleAddNewCustomer = () => {
    setShowModal(false);
    setShowRegisterForm(true);
    setNewCustomerData({
      firstName: '',
      lastName: '',
      rtn: customerSearch,
      phone: '',
      address: ''
    });
  };

  const handleSaveNewCustomer = () => {
    if (!newCustomerData.firstName || !newCustomerData.lastName) {
      alert('Por favor ingrese nombre y apellido');
      return;
    }

    const newCustomer = {
      id: Date.now(),
      name: `${newCustomerData.firstName} ${newCustomerData.lastName}`,
      rtn: newCustomerData.rtn,
      phone: newCustomerData.phone,
      address: newCustomerData.address
    };

    setSelectedCustomer(newCustomer);
    setShowRegisterForm(false);
    setCustomerSearch('');
  };

  const handleCancelRegister = () => {
    setShowRegisterForm(false);
    setNewCustomerData({
      firstName: '',
      lastName: '',
      rtn: '',
      phone: '',
      address: ''
    });
  };

  const handleContinueWithoutCustomer = () => {
    setShowModal(false);
    setSelectedCustomer({ id: 0, name: 'Público en General', rtn: 'N/A' });
    setCustomerSearch('');
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setSearchAttempted(false);
  };

  const addItem = (product) => {
    const existingItem = items.find(item => item.id === product.id);
    if (existingItem) {
      setItems(items.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
    setProductSearch('');
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity: parseInt(quantity) } : item
      ));
    }
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getISV = () => {
    return getSubtotal() * 0.15;
  };

  const getTotal = () => {
    return getSubtotal() + getISV();
  };

  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentType, remainingPayment) => {
    const nuevaFactura = {
      id_factura_pk: facturas.length + 1,
      numero_factura: 10245 + facturas.length,
      fecha_emision: new Date().toISOString().slice(0, 19).replace('T', ' '),
      RTN: '08011999123456',
      subtotal: getSubtotal(),
      impuesto: getISV(),
      descuento: 0,
      total: getTotal(),
      saldo: paymentType === 'total' ? 0 : remainingPayment,
      sucursal: 'Sucursal Centro',
      usuario: 'Usuario Actual',
      estado: paymentType === 'total' ? 'PAGADA' : 'PENDIENTE',
      cliente: {
        nombre: selectedCustomer?.name || 'Público en General',
        rtn: selectedCustomer?.rtn || 'N/A',
        telefono: selectedCustomer?.phone || 'N/A',
        direccion: selectedCustomer?.address || 'N/A'
      },
      detalles: items.map((item, index) => ({
        id_detalle_pk: Date.now() + index,
        cantidad_item: item.quantity,
        nombre_item: item.name,
        precio_item: item.price,
        ajuste_precio: 0,
        total_linea: item.price * item.quantity,
        tipo_item: 'PRODUCTO'
      }))
    };

    setFacturas([nuevaFactura, ...facturas]);

    if (paymentType === 'total') {
      alert('¡Factura procesada exitosamente con pago total!');
    } else {
      alert(`¡Pago parcial registrado! Pendiente: L. ${remainingPayment.toFixed(2)}`);
    }
    
    setShowPaymentModal(false);
    setItems([]);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setActiveTab('facturas');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header con pestañas */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Facturación</h1>
          </div>
          
          <div className="flex gap-2 border-b border-gray-200 -mb-px">
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

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'nueva' ? (
          // CONTENIDO NUEVA FACTURA
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Cliente
                  </h2>
                  
                  {!selectedCustomer ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => handleCustomerSearch(e.target.value)}
                        placeholder="Buscar por RTN o ID del cliente..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Ingrese al menos 8 dígitos para buscar
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-lg">{selectedCustomer.name}</p>
                          <p className="text-sm text-slate-600 mt-1">RTN: {selectedCustomer.rtn}</p>
                          {selectedCustomer.phone && (
                            <p className="text-sm text-slate-600">Tel: {selectedCustomer.phone}</p>
                          )}
                          {selectedCustomer.address && (
                            <p className="text-sm text-slate-600">{selectedCustomer.address}</p>
                          )}
                        </div>
                        <button
                          onClick={clearCustomer}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Productos
                  </h2>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar producto..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {productSearch && (
                    <div className="mb-4 max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                      {products
                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(product => (
                          <button
                            key={product.id}
                            onClick={() => addItem(product)}
                            className="w-full p-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0"
                          >
                            <p className="font-medium text-slate-800">{product.name}</p>
                            <p className="text-sm text-slate-600">L. {product.price.toFixed(2)} - Stock: {product.stock}</p>
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No hay productos agregados</p>
                      </div>
                    ) : (
                      items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{item.name}</p>
                            <p className="text-sm text-slate-600">L. {item.price.toFixed(2)}</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                          />
                          <p className="w-24 text-right font-semibold text-slate-800">
                            L. {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Resumen</h2>
                  
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>L. {getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>ISV (15%):</span>
                      <span>L. {getISV().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-slate-800">
                      <span>Total:</span>
                      <span>L. {getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={openPaymentModal}
                      disabled={items.length === 0}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        items.length > 0
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Procesar Pago
                    </button>
                    <button className="w-full py-3 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      Guardar como Borrador
                    </button>
                    <button className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm">
                      Cancelar Factura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // CONTENIDO FACTURAS
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5 space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Facturas Recientes</h2>
                  <span className="text-sm text-gray-500">{facturas.length} facturas</span>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  {filteredFacturas.map((factura) => (
                    <div 
                      key={factura.id_factura_pk}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        facturaActual?.id_factura_pk === factura.id_factura_pk ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFactura(factura)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-blue-600">#{factura.numero_factura}</span>
                          <p className="text-sm font-medium text-gray-800">{factura.cliente.nombre}</p>
                          <p className="text-xs text-gray-500">{formatDate(factura.fecha_emision)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatCurrency(factura.total)}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(factura.estado)}`}>
                            {factura.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-7">
              {facturaActual && (
                <>
                  <div className="flex justify-end gap-2 mb-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                      <Printer size={18} />
                      <span className="text-sm font-medium">Imprimir</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                      <Mail size={18} />
                      <span className="text-sm font-medium">Email</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
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
                          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(facturaActual.estado)}`}>
                            {facturaActual.estado}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-6 border-b">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Emisor</h3>
                        <p className="font-bold text-gray-800 mb-1">{facturaActual.sucursal}</p>
                        <p className="text-sm text-gray-600">Atendido por: {facturaActual.usuario}</p>
                        <p className="text-sm text-gray-600">Fecha: {formatDateTime(facturaActual.fecha_emision)}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
                        <p className="font-bold text-gray-800 mb-1">{facturaActual.cliente.nombre}</p>
                        <p className="text-sm text-gray-600">RTN: {facturaActual.cliente.rtn}</p>
                        <p className="text-sm text-gray-600">Tel: {facturaActual.cliente.telefono}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                            <th className="text-center py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Cant.</th>
                            <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">P. Unit.</th>
                            <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {facturaActual.detalles.map((detalle, index) => (
                            <tr key={detalle.id_detalle_pk} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <td className="py-3 px-2">
                                <p className="font-medium text-gray-800 text-sm">{detalle.nombre_item}</p>
                                <span className="text-xs text-gray-500">{detalle.tipo_item}</span>
                                {detalle.estilista && <span className="text-xs text-gray-500 ml-2">• {detalle.estilista}</span>}
                              </td>
                              <td className="py-3 px-2 text-center font-medium text-gray-700">{detalle.cantidad_item}</td>
                              <td className="py-3 px-2 text-right text-gray-700 text-sm">{formatCurrency(detalle.precio_item)}</td>
                              <td className="py-3 px-2 text-right font-semibold text-gray-800 text-sm">{formatCurrency(detalle.total_linea)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-gray-50 px-6 py-4">
                      <div className="max-w-xs ml-auto space-y-2">
                        <div className="flex justify-between text-gray-700 text-sm">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(facturaActual.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700 text-sm">
                          <span>Impuesto (15%):</span>
                          <span className="font-medium">{formatCurrency(facturaActual.impuesto)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                          <span>TOTAL:</span>
                          <span>{formatCurrency(facturaActual.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-center">
                      <p className="text-sm">Gracias por su preferencia</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modales de nueva factura */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Cliente no encontrado</h3>
              <p className="text-slate-600">
                No se encontró ningún cliente con el RTN/ID: <span className="font-semibold">{customerSearch}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddNewCustomer}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar Nuevo Cliente
              </button>
              <button
                onClick={handleContinueWithoutCustomer}
                className="w-full py-3 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Continuar sin Cliente
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Registro Rápido de Cliente</h3>
                <p className="text-sm text-slate-500 mt-1">Complete los datos básicos del cliente</p>
              </div>
              <button
                onClick={handleCancelRegister}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomerData.firstName}
                  onChange={(e) => setNewCustomerData({...newCustomerData, firstName: e.target.value})}
                  placeholder="Ej: María"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomerData.lastName}
                  onChange={(e) => setNewCustomerData({...newCustomerData, lastName: e.target.value})}
                  placeholder="Ej: González"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  RTN / ID
                </label>
                <input
                  type="text"
                  value={newCustomerData.rtn}
                  onChange={(e) => setNewCustomerData({...newCustomerData, rtn: e.target.value})}
                  placeholder="Ej: 08011990123456"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})}
                  placeholder="Ej: 9876-5432"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dirección
                </label>
                <textarea
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData({...newCustomerData, address: e.target.value})}
                  placeholder="Ej: Col. Los Álamos, Casa #123"
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p><span className="font-semibold">Nota:</span> Solo nombre y apellido son obligatorios. Los demás datos son opcionales.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelRegister}
                className="flex-1 py-3 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewCustomer}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Guardar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      <ModalPago
        show={showPaymentModal}
        total={getTotal()}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default InvoiceModule;