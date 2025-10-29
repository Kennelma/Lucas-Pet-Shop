import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, User, Package, Trash2, ShoppingCart, FileText, Printer, Mail } from 'lucide-react';

// IMPORTA TUS SERVICIOS Y COMPONENTES REALES
import { verClientes } from '../../AXIOS.SERVICES/clients-axios';
import { verProductosDisponibles } from '../../AXIOS.SERVICES/products-axios';
import { verServicios } from '../../AXIOS.SERVICES/services-axios';
import FormularioCliente from '../clientes/modal-agregar';
import ModalPago from './modal_pago';

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
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [products, setProducts] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const productSearchRef = useRef(null);
  const [vistaProductos, setVistaProductos] = useState(null); // null = no seleccionado

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

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await verProductosDisponibles();
        console.log('Productos cargados:', data);
        setProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const data = await verServicios('PELUQUERIA');
        console.log('Servicios cargados:', data);
        setServicios(data);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      }
    };
    fetchServicios();
  }, []);

  useEffect(() => {
    const fetchPromociones = async () => {
      try {
        const data = await verServicios('PROMOCIONES');
        console.log('Promociones cargadas:', data);
        setPromociones(data);
      } catch (error) {
        console.error('Error al cargar promociones:', error);
      }
    };
    fetchPromociones();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productSearchRef.current && !productSearchRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setCustomerSearch('');
  };

  const handleClienteAgregado = async () => {
    setShowRegisterForm(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = await verClientes();
      if (!data || data.length === 0) return;
      setClientes(data);
      const ultimoCliente = data.reduce((prev, current) => 
        (prev.id_cliente_pk > current.id_cliente_pk) ? prev : current
      );
      setSelectedCustomer({
        id: ultimoCliente.id_cliente_pk,
        name: `${ultimoCliente.nombre_cliente} ${ultimoCliente.apellido_cliente}`,
        identidad: ultimoCliente.identidad_cliente,
        phone: ultimoCliente.telefono_cliente || 'N/A',
        address: 'N/A'
      });
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

  const addItem = (item, tipo) => {
    let itemData;
    
    if (tipo === 'producto') {
      itemData = {
        id: item.id_producto_pk,
        name: item.nombre_producto,
        price: parseFloat(item.precio_producto),
        stock: item.stock,
        quantity: 1,
        tipo: 'PRODUCTO'
      };
      
      const existingItem = items.find(i => i.id === item.id_producto_pk && i.tipo === 'PRODUCTO');
      if (existingItem) {
        const nuevaCantidad = existingItem.quantity + 1;
        if (nuevaCantidad > item.stock) {
          alert(`Stock insuficiente. Solo hay ${item.stock} unidades disponibles`);
          return;
        }
        setItems(items.map(i => 
          i.id === item.id_producto_pk && i.tipo === 'PRODUCTO' ? { ...i, quantity: nuevaCantidad } : i
        ));
        setProductSearch('');
        setShowProductDropdown(false);
        return;
      }
    } else if (tipo === 'servicio') {
      itemData = {
        id: item.id_servicio_peluqueria_pk,
        name: item.nombre_servicio_peluqueria,
        price: parseFloat(item.precio_servicio),
        stock: 999,
        quantity: 1,
        tipo: 'SERVICIO',
        duracion: item.duracion_estimada
      };
    } else if (tipo === 'promocion') {
      itemData = {
        id: item.id_promocion_pk,
        name: item.nombre_promocion,
        price: parseFloat(item.precio_promocion),
        stock: 999,
        quantity: 1,
        tipo: 'PROMOCION',
        dias: item.dias_promocion
      };
    }
    
    setItems([...items, itemData]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const updateQuantity = (id, quantity, tipo) => {
    const item = items.find(i => i.id === id && i.tipo === tipo);
    if (quantity <= 0) {
      removeItem(id, tipo);
    } else if (tipo === 'PRODUCTO' && quantity > item.stock) {
      alert(`Stock insuficiente. Solo hay ${item.stock} unidades disponibles`);
    } else {
      setItems(items.map(item => 
        item.id === id && item.tipo === tipo ? { ...item, quantity: parseInt(quantity) } : item
      ));
    }
  };

  const removeItem = (id, tipo) => setItems(items.filter(item => !(item.id === id && item.tipo === tipo)));
  const getSubtotal = () => items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getISV = () => getSubtotal() * 0.15;
  const getTotal = () => getSubtotal() + getISV();
  const openPaymentModal = () => setShowPaymentModal(true);

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
        tipo_item: item.tipo
      }))
    };
    setFacturas([nuevaFactura, ...facturas]);
    alert(paymentType === 'total' ? '¡Factura procesada exitosamente!' : `Pago parcial: L.${remainingPayment.toFixed(2)} pendiente`);
    setShowPaymentModal(false);
    setItems([]);
    setSelectedCustomer(null);
    setActiveTab('facturas');
  };

  const formatCurrency = (value) => `L ${value.toFixed(2)}`;
  const formatDateTime = (datetime) => new Date(datetime).toLocaleString('es-HN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
  const formatDate = (datetime) => new Date(datetime).toLocaleDateString('es-HN');
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Facturación</h1>
          </div>
          <div className="flex gap-2 border-b border-gray-200 -mb-px">
            <button onClick={() => setActiveTab('nueva')} className={`px-6 py-3 font-semibold transition-all ${activeTab === 'nueva' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2"><Plus size={20} />Nueva Factura</div>
            </button>
            <button onClick={() => setActiveTab('facturas')} className={`px-6 py-3 font-semibold transition-all ${activeTab === 'facturas' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2"><FileText size={20} />Facturas</div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'nueva' ? (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />Cliente
                  </h2>
                  {!selectedCustomer ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" value={customerSearch} onChange={(e) => handleCustomerSearch(e.target.value)} placeholder="Buscar por nombre o identidad..." className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <p className="text-xs text-slate-500 mt-2">Ingrese al menos 3 caracteres</p>
                      {mostrarSugerencias && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {clientesFiltrados.length > 0 ? (
                            <>
                              {clientesFiltrados.map((cliente) => (
                                <button key={cliente.id_cliente_pk} onClick={() => seleccionarCliente(cliente)} className="w-full p-3 text-left hover:bg-blue-50 border-b border-slate-200 last:border-0 transition-colors">
                                  <p className="font-semibold text-slate-800">{cliente.nombre_cliente} {cliente.apellido_cliente}</p>
                                  <p className="text-sm text-slate-600">Identidad: {cliente.identidad_cliente}</p>
                                  {cliente.telefono_cliente && <p className="text-sm text-slate-600">Tel: {cliente.telefono_cliente}</p>}
                                </button>
                              ))}
                              <div className="p-2 bg-slate-50 border-t-2 border-slate-300">
                                <button onClick={handleAddNewCustomer} className="w-full py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
                                  <Plus size={16} />Agregar Nuevo Cliente
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="p-4">
                              <p className="text-center text-slate-600 mb-3">No se encontraron clientes</p>
                              <button onClick={handleAddNewCustomer} className="w-full py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
                                <Plus size={16} />Agregar Nuevo Cliente
                              </button>
                              <button onClick={handleContinueWithoutCustomer} className="w-full mt-2 py-2 px-3 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm">
                                Continuar sin Cliente
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-lg">{selectedCustomer.name}</p>
                          <p className="text-sm text-slate-600 mt-1">Identidad: {selectedCustomer.identidad}</p>
                          {selectedCustomer.phone !== 'N/A' && <p className="text-sm text-slate-600">Tel: {selectedCustomer.phone}</p>}
                        </div>
                        <button onClick={clearCustomer} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                          <X className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-wrap rounded-lg bg-gray-200 p-1 text-sm shadow-sm mb-4">
                    <label className="flex-1 text-center">
                      <input 
                        type="radio" 
                        name="vistaProductos" 
                        checked={vistaProductos === "productos"} 
                        onChange={() => setVistaProductos(vistaProductos === "productos" ? null : "productos")} 
                        className="hidden" 
                      />
                      <span 
                        onClick={() => setVistaProductos(vistaProductos === "productos" ? null : "productos")}
                        className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 ${
                          vistaProductos === "productos"
                            ? "bg-white font-semibold text-gray-800 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        PRODUCTOS
                      </span>
                    </label>
                    
                    <label className="flex-1 text-center">
                      <input 
                        type="radio" 
                        name="vistaProductos" 
                        checked={vistaProductos === "servicios"} 
                        onChange={() => setVistaProductos(vistaProductos === "servicios" ? null : "servicios")} 
                        className="hidden" 
                      />
                      <span 
                        onClick={() => setVistaProductos(vistaProductos === "servicios" ? null : "servicios")}
                        className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 ${
                          vistaProductos === "servicios"
                            ? "bg-white font-semibold text-gray-800 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        SERVICIOS
                      </span>
                    </label>
                    
                    <label className="flex-1 text-center">
                      <input 
                        type="radio" 
                        name="vistaProductos" 
                        checked={vistaProductos === "promociones"} 
                        onChange={() => setVistaProductos(vistaProductos === "promociones" ? null : "promociones")} 
                        className="hidden" 
                      />
                      <span 
                        onClick={() => setVistaProductos(vistaProductos === "promociones" ? null : "promociones")}
                        className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 ${
                          vistaProductos === "promociones"
                            ? "bg-white font-semibold text-gray-800 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        PROMOCIONES
                      </span>
                    </label>
                  </div>

                  {vistaProductos && (
                    <>
                    
                    <div className="relative mb-4" ref={productSearchRef}>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} onFocus={() => setShowProductDropdown(true)} placeholder={`Buscar ${vistaProductos === 'productos' ? 'producto' : vistaProductos === 'servicios' ? 'servicio' : 'promoción'}...`} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      {showProductDropdown && (
                        <div className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto border-2 border-slate-300 rounded-lg bg-white shadow-xl">
                          {vistaProductos === 'productos' ? (
                            products.length === 0 ? (
                              <div className="p-4 text-center text-slate-500"><p>No hay productos disponibles</p></div>
                            ) : (
                              <>
                                {products.filter(p => productSearch === '' || p.nombre_producto.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))).map(product => (
                                  <button key={product.id_producto_pk} onClick={() => addItem(product, 'producto')} disabled={product.stock === 0} className="w-full p-3 hover:bg-blue-50 text-left border-b border-slate-200 last:border-0 transition-colors">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-semibold text-slate-800">{product.nombre_producto}</p>
                                        {product.sku && <p className="text-xs text-slate-400 mt-0.5">SKU: {product.sku}</p>}
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-sm font-medium text-blue-600">L. {parseFloat(product.precio_producto).toFixed(2)}</span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>Stock: {product.stock}</span>
                                          {product.tipo_producto && <span className="text-xs text-slate-500">{product.tipo_producto}</span>}
                                        </div>
                                      </div>
                                      {product.stock === 0 && <span className="text-xs text-red-500 font-semibold">AGOTADO</span>}
                                    </div>
                                  </button>
                                ))}
                                {products.filter(p => productSearch === '' || p.nombre_producto.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))).length === 0 && (
                                  <div className="p-4 text-center text-slate-500"><p>No se encontraron productos</p></div>
                                )}
                              </>
                            )
                          ) : vistaProductos === 'servicios' ? (
                            servicios.length === 0 ? (
                              <div className="p-4 text-center text-slate-500"><p>No hay servicios disponibles</p></div>
                            ) : (
                              <>
                                {servicios.filter(s => !s.activo || s.activo === 1).filter(s => productSearch === '' || s.nombre_servicio_peluqueria.toLowerCase().includes(productSearch.toLowerCase())).map(servicio => (
                                  <button key={servicio.id_servicio_peluqueria_pk} onClick={() => addItem(servicio, 'servicio')} className="w-full p-3 hover:bg-blue-50 text-left border-b border-slate-200 last:border-0 transition-colors">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-semibold text-slate-800">{servicio.nombre_servicio_peluqueria}</p>
                                        {servicio.descripcion_servicio && <p className="text-xs text-slate-500 mt-0.5">{servicio.descripcion_servicio}</p>}
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-sm font-medium text-blue-600">L. {parseFloat(servicio.precio_servicio).toFixed(2)}</span>
                                          {servicio.duracion_estimada && <span className="text-xs text-slate-500">Duración: {servicio.duracion_estimada}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {servicios.filter(s => !s.activo || s.activo === 1).filter(s => productSearch === '' || s.nombre_servicio_peluqueria.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                  <div className="p-4 text-center text-slate-500"><p>No se encontraron servicios</p></div>
                                )}
                              </>
                            )
                          ) : (
                            promociones.length === 0 ? (
                              <div className="p-4 text-center text-slate-500"><p>No hay promociones disponibles</p></div>
                            ) : (
                              <>
                                {promociones.filter(p => !p.activo || p.activo === 1).filter(p => productSearch === '' || p.nombre_promocion.toLowerCase().includes(productSearch.toLowerCase())).map(promocion => (
                                  <button key={promocion.id_promocion_pk} onClick={() => addItem(promocion, 'promocion')} className="w-full p-3 hover:bg-blue-50 text-left border-b border-slate-200 last:border-0 transition-colors">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-semibold text-slate-800">{promocion.nombre_promocion}</p>
                                        {promocion.descripcion_promocion && <p className="text-xs text-slate-500 mt-0.5">{promocion.descripcion_promocion}</p>}
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-sm font-medium text-blue-600">L. {parseFloat(promocion.precio_promocion).toFixed(2)}</span>
                                          {promocion.dias_promocion && <span className="text-xs text-green-600 font-semibold">Válida: {promocion.dias_promocion}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {promociones.filter(p => !p.activo || p.activo === 1).filter(p => productSearch === '' || p.nombre_promocion.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                  <div className="p-4 text-center text-slate-500"><p>No se encontraron promociones</p></div>
                                )}
                              </>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {items.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No hay productos agregados</p>
                        </div>
                      ) : (
                        items.map(item => (
                          <div key={`${item.id}-${item.tipo}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">{item.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-slate-600">L. {item.price.toFixed(2)}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{item.tipo}</span>
                              </div>
                            </div>
                            {item.tipo === 'PRODUCTO' ? (
                              <input type="number" min="1" max={item.stock} value={item.quantity} onChange={(e) => updateQuantity(item.id, e.target.value, item.tipo)} className="w-20 px-2 py-1 border border-slate-300 rounded text-center" title={`Stock: ${item.stock}`} />
                            ) : (
                              <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.id, e.target.value, item.tipo)} className="w-20 px-2 py-1 border border-slate-300 rounded text-center" />
                            )}
                            <p className="w-24 text-right font-semibold text-slate-800">L. {(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeItem(item.id, item.tipo)} className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Resumen</h2>
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>L. {getSubtotal().toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>ISV (15%):</span><span>L. {getISV().toFixed(2)}</span></div>
                    <div className="flex justify-between text-xl font-bold text-slate-800"><span>Total:</span><span>L. {getTotal().toFixed(2)}</span></div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={openPaymentModal} disabled={items.length === 0} className={`w-full py-3 rounded-lg font-semibold transition-colors ${items.length > 0 ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Procesar Pago</button>
                    <button className="w-full py-3 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Guardar Borrador</button>
                    <button className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5 space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Facturas Recientes</h2>
                  <span className="text-sm text-gray-500">{facturas.length} facturas</span>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  {filteredFacturas.map((f) => (
                    <div key={f.id_factura_pk} className={`p-3 border rounded-lg cursor-pointer transition ${facturaActual?.id_factura_pk === f.id_factura_pk ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`} onClick={() => setSelectedFactura(f)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-blue-600">#{f.numero_factura}</span>
                          <p className="text-sm font-medium text-gray-800">{f.cliente.nombre}</p>
                          <p className="text-xs text-gray-500">{formatDate(f.fecha_emision)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatCurrency(f.total)}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(f.estado)}`}>{f.estado}</span>
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
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"><Printer size={18} /><span className="text-sm font-medium">Imprimir</span></button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Mail size={18} /><span className="text-sm font-medium">Email</span></button>
                  </div>
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <FileText size={28} />
                            <h1 className="text-2xl font-bold">FACTURA</h1>
                          </div>
                          <p className="text-blue-100 text-sm">Lucas Pet Shop</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">#{facturaActual.numero_factura}</p>
                          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(facturaActual.estado)}`}>{facturaActual.estado}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 p-6 border-b">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Emisor</h3>
                        <p className="font-bold text-gray-800 mb-1">{facturaActual.sucursal}</p>
                        <p className="text-sm text-gray-600">Usuario: {facturaActual.usuario}</p>
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

      <FormularioCliente
        isOpen={showRegisterForm}
        onClose={() => setShowRegisterForm(false)}
        onClienteAgregado={handleClienteAgregado}
      />

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