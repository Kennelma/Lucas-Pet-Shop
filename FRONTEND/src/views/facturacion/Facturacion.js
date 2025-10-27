import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, User, Package, Trash2, ShoppingCart, FileText, Printer, Mail } from 'lucide-react';
import { Toast } from 'primereact/toast';

// IMPORTA TUS SERVICIOS Y COMPONENTES REALES
import { verClientes } from '../../AXIOS.SERVICES/clients-axios';
import FormularioCliente from '../clientes/modal-agregar';
import ModalPago from './modal_pago'; // Tu modal de pago real

function InvoiceModule() {
  const [activeTab, setActiveTab] = useState('nueva');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactura, setSelectedFactura] = useState(null);

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
        }
      ]
    }
  ]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await verClientes();
        setClientes(data);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };
    fetchClientes();
  }, []);

  // Búsqueda de clientes en tiempo real
  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    
    if (value.trim().length >= 3) {
      const filtered = clientes.filter(c => 
        c.nombre_cliente.toLowerCase().includes(value.toLowerCase()) ||
        c.apellido_cliente.toLowerCase().includes(value.toLowerCase()) ||
        c.identidad_cliente.includes(value) ||
        `${c.nombre_cliente} ${c.apellido_cliente}`.toLowerCase().includes(value.toLowerCase())
      );
      
      setClientesFiltrados(filtered);
      setMostrarSugerencias(true);
    } else {
      setClientesFiltrados([]);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarCliente = (cliente) => {
    setSelectedCustomer({
      id: cliente.id_cliente_pk,
      name: `${cliente.nombre_cliente} ${cliente.apellido_cliente}`,
      identidad: cliente.identidad_cliente,
      phone: cliente.telefono_cliente || 'N/A',
      address: 'N/A'
    });
    setCustomerSearch('');
    setMostrarSugerencias(false);
  };

  const handleAddNewCustomer = () => {
    setShowRegisterForm(true);
    setMostrarSugerencias(false);
    setCustomerSearch(''); // Limpiar búsqueda al abrir modal
  };

  const handleClienteAgregado = async () => {
    // Recargar lista de clientes después de agregar uno nuevo
    setShowRegisterForm(false);
    
    try {
      // Esperar un momento para que la base de datos se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const data = await verClientes();
      console.log('Clientes después de agregar:', data);
      
      if (!data || data.length === 0) {
        console.error('No se pudieron cargar los clientes');
        return;
      }
      
      setClientes(data);
      
      // Buscar el cliente con el ID más alto (el recién agregado)
      const ultimoCliente = data.reduce((prev, current) => 
        (prev.id_cliente_pk > current.id_cliente_pk) ? prev : current
      );
      
      console.log('Último cliente (recién agregado):', ultimoCliente);
      
      // Seleccionarlo automáticamente con su nombre completo
      const clienteSeleccionado = {
        id: ultimoCliente.id_cliente_pk,
        name: `${ultimoCliente.nombre_cliente} ${ultimoCliente.apellido_cliente}`,
        identidad: ultimoCliente.identidad_cliente,
        phone: ultimoCliente.telefono_cliente || 'N/A',
        address: 'N/A'
      };
      
      setSelectedCustomer(clienteSeleccionado);
      console.log('Cliente seleccionado:', clienteSeleccionado);
      
    } catch (error) {
      console.error('Error al recargar clientes:', error);
    }
    
    setCustomerSearch('');
    setMostrarSugerencias(false);
  };

  const handleContinueWithoutCustomer = () => {
    setSelectedCustomer({ id: 0, name: 'Público en General', identidad: 'N/A' });
    setCustomerSearch('');
    setMostrarSugerencias(false);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
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
        rtn: selectedCustomer?.identidad || 'N/A',
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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Sistema de Facturación</h1>
          </div>
        </div>
      </div>

      {/* Tabs de navegación*/}
      <div className="flex rounded-lg bg-gray-200 p-1 text-sm shadow-sm mb-4 mx-3">
        <label className="flex-1 whitespace-nowrap">
          <input 
            type="radio" 
            name="factura-tab" 
            checked={activeTab === "nueva"} 
            onChange={() => setActiveTab("nueva")} 
            className="hidden" 
          />
          <span className={`flex items-center justify-center gap-1 rounded-lg py-2 px-3 cursor-pointer transition-all duration-150 ${
              activeTab === "nueva"
                ? "bg-white font-semibold text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Plus size={16} />
            Nueva Factura
          </span>
        </label>
        
        <label className="flex-1 whitespace-nowrap">
          <input 
            type="radio" 
            name="factura-tab" 
            checked={activeTab === "facturas"} 
            onChange={() => setActiveTab("facturas")} 
            className="hidden" 
          />
          <span className={`flex items-center justify-center gap-1 rounded-lg py-2 px-3 cursor-pointer transition-all duration-150 ${
              activeTab === "facturas"
                ? "bg-white font-semibold text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FileText size={16} />
            Facturas
          </span>
        </label>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {activeTab === 'nueva' ? (
          // CONTENIDO NUEVA FACTURA
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Cliente
                  </h2>
                  
                  {!selectedCustomer ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => handleCustomerSearch(e.target.value)}
                        placeholder="Buscar por nombre o identidad..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Ingrese al menos 3 caracteres para buscar
                      </p>

                      {/* Sugerencias de búsqueda */}
                      {mostrarSugerencias && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {clientesFiltrados.length > 0 ? (
                            <>
                              {clientesFiltrados.map((cliente) => (
                                <button
                                  key={cliente.id_cliente_pk}
                                  onClick={() => seleccionarCliente(cliente)}
                                  className="w-full p-2 text-left hover:bg-blue-50 border-b border-slate-200 last:border-0 transition-colors text-sm"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium text-slate-800 truncate">
                                      {cliente.nombre_cliente} {cliente.apellido_cliente}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 flex-shrink-0">
                                      <span>ID: {cliente.identidad_cliente}</span>
                                      {cliente.telefono_cliente && (
                                        <span>Tel: {cliente.telefono_cliente}</span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                              <div className="p-2 bg-slate-50 border-t border-slate-300">
                                <button
                                  onClick={handleAddNewCustomer}
                                  className="w-full py-1 px-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium text-xs flex items-center justify-center gap-1"
                                >
                                  <Plus size={12} />
                                  Agregar Nuevo Cliente
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="p-3">
                              <p className="text-center text-slate-600 mb-2 text-sm">
                                No se encontraron clientes con "{customerSearch}"
                              </p>
                              <button
                                onClick={handleAddNewCustomer}
                                className="w-full py-1 px-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium text-xs flex items-center justify-center gap-1 mb-1"
                              >
                                <Plus size={12} />
                                Agregar Nuevo Cliente
                              </button>
                              <button
                                onClick={handleContinueWithoutCustomer}
                                className="w-full py-1 px-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-medium text-xs"
                              >
                                Continuar sin Cliente
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2 flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">
                            {selectedCustomer.name}
                          </p>
                          <div className="flex items-baseline gap-2 text-xs text-slate-600 flex-shrink-0">
                            <span>ID: {selectedCustomer.identidad}</span>
                            {selectedCustomer.phone && selectedCustomer.phone !== 'N/A' && (
                              <span>Tel: {selectedCustomer.phone}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={clearCustomer}
                          className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    Productos
                  </h2>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar producto..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  {productSearch && (
                    <div className="mb-3 max-h-32 overflow-y-auto border border-slate-200 rounded-lg">
                      {products
                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(product => (
                          <button
                            key={product.id}
                            onClick={() => addItem(product)}
                            className="w-full p-2 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0 text-sm"
                          >
                            <p className="font-medium text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-600">L. {product.price.toFixed(2)} - Stock: {product.stock}</p>
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <p className="text-sm">No hay productos agregados</p>
                      </div>
                    ) : (
                      items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-600">L. {item.price.toFixed(2)}</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            className="w-16 px-1 py-1 border border-slate-300 rounded text-center text-sm"
                          />
                          <p className="w-20 text-right font-semibold text-slate-800 text-sm">
                            L. {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                  <h2 className="text-base font-semibold text-slate-800 mb-3">Resumen</h2>
                  
                  <div className="space-y-2 mb-4 pb-3 border-b border-slate-200">
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>Subtotal:</span>
                      <span>L. {getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>ISV (15%):</span>
                      <span>L. {getISV().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-300">
                      <span>Total:</span>
                      <span>L. {getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={openPaymentModal}
                      disabled={items.length === 0}
                      className={`w-full py-2 rounded font-medium transition-colors text-sm ${
                        items.length > 0
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Procesar Pago
                    </button>
                    <button className="w-full py-2 border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-50 transition-colors text-sm">
                      Guardar como Borrador
                    </button>
                    <button className="w-full py-1 text-slate-500 hover:text-slate-700 text-xs">
                      Cancelar Factura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // CONTENIDO FACTURAS
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 space-y-3">
              <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-800">Facturas Recientes</h2>
                  <span className="text-xs text-gray-500">{facturas.length} facturas</span>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredFacturas.map((factura) => (
                    <div 
                      key={factura.id_factura_pk}
                      className={`p-2 border rounded cursor-pointer transition-colors text-sm ${
                        facturaActual?.id_factura_pk === factura.id_factura_pk ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFactura(factura)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-blue-600">#{factura.numero_factura}</span>
                          <p className="font-medium text-gray-800 truncate">{factura.cliente.nombre}</p>
                          <p className="text-xs text-gray-500">{formatDate(factura.fecha_emision)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-semibold text-gray-800 text-sm">{formatCurrency(factura.total)}</p>
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold border ${getEstadoBadge(factura.estado)}`}>
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
                  <div className="flex justify-end gap-1 mb-3">
                    <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm text-sm">
                      <Printer size={14} />
                      <span className="font-medium">Imprimir</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm text-sm">
                      <Mail size={14} />
                      <span className="font-medium">Email</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText size={20} />
                            <h1 className="text-lg font-bold">FACTURA</h1>
                          </div>
                          <p className="text-blue-100 text-xs">Servicios Veterinarios y Pet Grooming</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">#{facturaActual.numero_factura}</p>
                          <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getEstadoBadge(facturaActual.estado)}`}>
                            {facturaActual.estado}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 border-b text-sm">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Emisor</h3>
                        <p className="font-bold text-gray-800 mb-0.5">{facturaActual.sucursal}</p>
                        <p className="text-xs text-gray-600">Atendido por: {facturaActual.usuario}</p>
                        <p className="text-xs text-gray-600">Fecha: {formatDateTime(facturaActual.fecha_emision)}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Cliente</h3>
                        <p className="font-bold text-gray-800 mb-0.5">{facturaActual.cliente.nombre}</p>
                        <p className="text-xs text-gray-600">RTN: {facturaActual.cliente.rtn}</p>
                        <p className="text-xs text-gray-600">Tel: {facturaActual.cliente.telefono}</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-2 px-1 text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                            <th className="text-center py-2 px-1 text-xs font-semibold text-gray-600 uppercase">Cant.</th>
                            <th className="text-right py-2 px-1 text-xs font-semibold text-gray-600 uppercase">P. Unit.</th>
                            <th className="text-right py-2 px-1 text-xs font-semibold text-gray-600 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {facturaActual.detalles.map((detalle, index) => (
                            <tr key={detalle.id_detalle_pk} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <td className="py-2 px-1">
                                <p className="font-medium text-gray-800 text-xs">{detalle.nombre_item}</p>
                                <span className="text-xs text-gray-500">{detalle.tipo_item}</span>
                                {detalle.estilista && <span className="text-xs text-gray-500 ml-1">• {detalle.estilista}</span>}
                              </td>
                              <td className="py-2 px-1 text-center font-medium text-gray-700 text-xs">{detalle.cantidad_item}</td>
                              <td className="py-2 px-1 text-right text-gray-700 text-xs">{formatCurrency(detalle.precio_item)}</td>
                              <td className="py-2 px-1 text-right font-semibold text-gray-800 text-xs">{formatCurrency(detalle.total_linea)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-gray-50 px-4 py-3">
                      <div className="max-w-xs ml-auto space-y-1 text-sm">
                        <div className="flex justify-between text-gray-700">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(facturaActual.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Impuesto (15%):</span>
                          <span className="font-medium">{formatCurrency(facturaActual.impuesto)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-300">
                          <span>TOTAL:</span>
                          <span>{formatCurrency(facturaActual.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-center">
                      <p className="text-xs">Gracias por su preferencia</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de registro de cliente - USA TU COMPONENTE REAL */}
      <FormularioCliente
        isOpen={showRegisterForm}
        onClose={() => setShowRegisterForm(false)}
        onClienteAgregado={handleClienteAgregado}
      />

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