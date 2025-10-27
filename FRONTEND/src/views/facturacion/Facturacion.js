import React, { useState } from 'react';
import { Printer, Download, Mail, FileText, Plus, Trash2, Eye, Search, User, X, Percent } from 'lucide-react';
import ModalPago from './modal_pago'; // Asegúrate de tener ModalPago.jsx en la misma carpeta (tal como lo pegaste antes)

export default function FacturaView() {
  const [activeTab, setActiveTab] = useState('nueva');
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [mostrarDescuento, setMostrarDescuento] = useState(false);
  const [descuento, setDescuento] = useState(0);

  const [nuevaFactura, setNuevaFactura] = useState({
    nombre: '',
    apellido: '',
    identidad: ''
  });

  const [itemsFactura, setItemsFactura] = useState([]);
  const [estilistasDisponibles] = useState(['Ana Reyes', 'Luis García', 'María González', 'Carlos Ruiz']);

  // Cambiado a estado mutable para poder agregar facturas localmente
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
        nombre: 'Carlos',
        apellido: 'Mendoza',
        identidad: '0801-1990-12345'
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
          estilistas: ['Ana Reyes', 'Luis García']
        },
        {
          id_detalle_pk: 2,
          cantidad_item: 1,
          nombre_item: 'Paquete Especial - Baño + Corte + Spa',
          precio_item: 180.00,
          ajuste_precio: 20.00,
          num_mascotas_atendidas: 1,
          total_linea: 200.00,
          tipo_item: 'PROMOCION',
          descrip_ajuste: 'Pelo enredado',
          estilistas: ['Ana Reyes']
        },
        {
          id_detalle_pk: 3,
          cantidad_item: 3,
          nombre_item: 'Shampoo Premium 500ml',
          precio_item: 50.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: null,
          total_linea: 150.00,
          tipo_item: 'PRODUCTO',
          estilistas: []
        }
      ]
    },
    {
      id_factura_pk: 2,
      numero_factura: 10244,
      fecha_emision: '2025-10-14 15:20:00',
      RTN: '08011999123456',
      subtotal: 625.00,
      impuesto: 93.75,
      descuento: 0,
      total: 718.75,
      saldo: 0,
      sucursal: 'Sucursal Centro',
      usuario: 'Pedro López',
      estado: 'PAGADA',
      cliente: {
        nombre: 'Ana',
        apellido: 'Martínez',
        identidad: '0801-1985-98765'
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
          estilistas: ['Luis García']
        },
        {
          id_detalle_pk: 5,
          cantidad_item: 2,
          nombre_item: 'Collar Antipulgas Medium',
          precio_item: 150.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: null,
          total_linea: 300.00,
          tipo_item: 'PRODUCTO',
          estilistas: []
        },
        {
          id_detalle_pk: 6,
          cantidad_item: 1,
          nombre_item: 'Combo Desparasitación + Vitaminas',
          precio_item: 175.00,
          ajuste_precio: 0,
          num_mascotas_atendidas: 1,
          total_linea: 175.00,
          tipo_item: 'PROMOCION',
          estilistas: ['Carlos Ruiz']
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const agregarFilaVacia = () => {
    setItemsFactura([...itemsFactura, {
      id: Date.now(),
      cantidad: 1,
      descripcion: '',
      precio_unitario: '',
      ajuste_precio: '',
      tipo_item: 'SERVICIO',
      estilistas: [],
      num_mascotas: '',
      total_linea: 0,
      editing: true
    }]);
  };

  const actualizarItem = (id, campo, valor) => {
    setItemsFactura(itemsFactura.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [campo]: valor };

        // Calcular total automáticamente
        const cantidadCalculo = updatedItem.tipo_item === 'PRODUCTO'
          ? (parseFloat(updatedItem.cantidad) || 0)
          : (parseFloat(updatedItem.num_mascotas) || 0);
        const precioUnit = parseFloat(updatedItem.precio_unitario) || 0;
        const ajuste = parseFloat(updatedItem.ajuste_precio) || 0;

        updatedItem.total_linea = (cantidadCalculo * precioUnit) + ajuste;

        return updatedItem;
      }
      return item;
    }));
  };

  const agregarEstilistaAItem = (itemId, estilista) => {
    setItemsFactura(itemsFactura.map(item => {
      if (item.id === itemId && !item.estilistas.includes(estilista)) {
        return { ...item, estilistas: [...item.estilistas, estilista] };
      }
      return item;
    }));
  };

  const eliminarEstilistaDeItem = (itemId, estilista) => {
    setItemsFactura(itemsFactura.map(item => {
      if (item.id === itemId) {
        return { ...item, estilistas: item.estilistas.filter(e => e !== estilista) };
      }
      return item;
    }));
  };

  const eliminarItem = (id) => {
    setItemsFactura(itemsFactura.filter(item => item.id !== id));
  };

  const calcularSubtotal = () => {
    return itemsFactura.reduce((sum, item) => sum + item.total_linea, 0);
  };

  const calcularImpuesto = () => {
    return (calcularSubtotal() - (descuento || 0)) * 0.15;
  };

  const calcularTotal = () => {
    return calcularSubtotal() - (descuento || 0) + calcularImpuesto();
  };

  const guardarFactura = () => {
    if (!nuevaFactura.nombre || !nuevaFactura.apellido || itemsFactura.length === 0) {
      alert('Por favor completa los datos del cliente y agrega al menos un item');
      return;
    }

    // Validar que todos los items tengan datos completos
    const itemsIncompletos = itemsFactura.filter(item =>
      !item.descripcion || !item.precio_unitario ||
      (item.tipo_item !== 'PRODUCTO' && (!item.num_mascotas || item.estilistas.length === 0)) ||
      (item.tipo_item === 'PRODUCTO' && !item.cantidad)
    );

    if (itemsIncompletos.length > 0) {
      alert('Por favor completa todos los datos de los items');
      return;
    }

    alert('Factura guardada exitosamente!');

    setNuevaFactura({
      nombre: '',
      apellido: '',
      identidad: ''
    });
    setItemsFactura([]);
    setDescuento(0);
    setMostrarDescuento(false);
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
    f.cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cliente.identidad.includes(searchTerm)
  );

  const facturaActual = selectedFactura || facturas[0];

  // --- NUEVA LÓGICA: Modal de pago y añadir factura localmente cuando pago exitoso ---
  const [showModalPago, setShowModalPago] = useState(false);

  const abrirModalPago = () => {
    // validar mínimo antes de abrir (opcional)
    if (!nuevaFactura.nombre || !nuevaFactura.apellido) {
      alert('Por favor completa los datos del cliente antes de generar la factura.');
      return;
    }
    if (itemsFactura.length === 0) {
      alert('Agrega al menos un item antes de generar la factura.');
      return;
    }
    setShowModalPago(true);
  };
  const cerrarModalPago = () => setShowModalPago(false);

  const handlePagoExitoso = (paymentType, restante) => {
    // Construir objeto factura similar a los existentes y añadirlo localmente
    const nextId = Date.now();
    const maxNum = facturas.length > 0 ? Math.max(...facturas.map(f => f.numero_factura)) : 10000;
    const numero_factura = maxNum + 1;

    const subtotalCalc = calcularSubtotal();
    const impuestoCalc = calcularImpuesto();
    const totalCalc = calcularTotal();
    const saldo = Math.max(0, parseFloat(restante) || 0);

    const detalles = itemsFactura.map((it, idx) => {
      return {
        id_detalle_pk: Date.now() + idx,
        cantidad_item: it.cantidad ? parseFloat(it.cantidad) : (it.tipo_item === 'PRODUCTO' ? 1 : (it.num_mascotas || 0)),
        nombre_item: it.descripcion || '',
        precio_item: parseFloat(it.precio_unitario) || 0,
        ajuste_precio: parseFloat(it.ajuste_precio) || 0,
        num_mascotas_atendidas: it.tipo_item === 'PRODUCTO' ? null : (it.num_mascotas || null),
        total_linea: parseFloat(it.total_linea) || 0,
        tipo_item: it.tipo_item || 'SERVICIO',
        estilistas: it.estilistas || []
      };
    });

    const nueva = {
      id_factura_pk: nextId,
      numero_factura,
      fecha_emision: new Date().toISOString(),
      RTN: '08011999123456',
      subtotal: subtotalCalc,
      impuesto: impuestoCalc,
      descuento: descuento || 0,
      total: totalCalc,
      saldo: saldo,
      sucursal: 'Sucursal Centro',
      usuario: '', // lo dejamos vacío o lo puedes poblar si lo tienes
      estado: saldo > 0 ? 'PENDIENTE' : 'PAGADA',
      cliente: {
        nombre: nuevaFactura.nombre,
        apellido: nuevaFactura.apellido,
        identidad: nuevaFactura.identidad
      },
      detalles
    };

    // Añadir al comienzo de la lista (puedes cambiar el orden si prefieres)
    setFacturas([nueva, ...facturas]);
    setSelectedFactura(nueva);

    // cerrar modal y limpiar formulario (opcional, aquí lo hago)
    setShowModalPago(false);
    setNuevaFactura({
      nombre: '',
      apellido: '',
      identidad: ''
    });
    setItemsFactura([]);
    setDescuento(0);
    setMostrarDescuento(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-800">Sistema de Facturación</h1>
            </div>
          </div>
        </div>

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

      <div className="max-w-7xl mx-auto px-6 py-4">
        {activeTab === 'nueva' && (
          <div className="bg-white rounded-lg shadow-md p-4">
            {/* Información del Cliente */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User size={16} />
                Información del Cliente
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={nuevaFactura.nombre}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, nombre: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={nuevaFactura.apellido}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, apellido: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apellido"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Identidad</label>
                  <input
                    type="text"
                    value={nuevaFactura.identidad}
                    onChange={(e) => setNuevaFactura({...nuevaFactura, identidad: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0000-0000-00000"
                  />
                </div>
              </div>
            </div>

            {/* Tabla de Items */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Detalles de la Factura</h3>
              <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                      <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Cant.</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Precio Unit.</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Ajuste</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 uppercase w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsFactura.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 align-top">
                          <select
                            value={item.tipo_item}
                            onChange={(e) => actualizarItem(item.id, 'tipo_item', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          >
                            <option value="SERVICIO">Servicio</option>
                            <option value="PRODUCTO">Producto</option>
                            <option value="PROMOCION">Promoción</option>
                          </select>
                        </td>

                        {/* Descripción + Estilistas dentro de la misma celda */}
                        <td className="py-2 px-2 align-top">
                          <div>
                            <input
                              type="text"
                              value={item.descripcion}
                              onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded mb-2"
                              placeholder="Descripción del item"
                            />

                            {/* etiquetas y estilistas se muestran aquí (misma fila) */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.tipo_item}</span>
                              {item.estilistas && item.estilistas.length > 0 && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  {item.estilistas.join(', ')}
                                </span>
                              )}

                              {/* selector de estilistas integrado en la misma celda */}
                              {(item.tipo_item === 'SERVICIO' || item.tipo_item === 'PROMOCION') && (
                                <div className="flex items-center gap-2 ml-2">
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        agregarEstilistaAItem(item.id, e.target.value);
                                        e.target.value = '';
                                      }
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded"
                                  >
                                    <option value="">Agregar estilista...</option>
                                    {estilistasDisponibles.map(e => (
                                      <option key={e} value={e}>{e}</option>
                                    ))}
                                  </select>
                                  <div className="flex flex-wrap gap-1">
                                    {item.estilistas.map(est => (
                                      <span key={est} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs">
                                        {est}
                                        <button
                                          onClick={() => eliminarEstilistaDeItem(item.id, est)}
                                          className="hover:text-blue-900"
                                        >
                                          <X size={10} />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-2 align-top">
                          <input
                            type="number"
                            min="1"
                            value={item.tipo_item === 'PRODUCTO' ? (item.cantidad || '') : (item.num_mascotas || '')}
                            onChange={(e) => {
                              const campo = item.tipo_item === 'PRODUCTO' ? 'cantidad' : 'num_mascotas';
                              actualizarItem(item.id, campo, e.target.value);
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                            placeholder={item.tipo_item === 'PRODUCTO' ? 'Cant.' : '# Masc.'}
                          />
                        </td>

                        <td className="py-2 px-2 align-top">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.precio_unitario || ''}
                            onChange={(e) => actualizarItem(item.id, 'precio_unitario', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-right"
                            placeholder="0.00"
                          />
                        </td>

                        <td className="py-2 px-2 align-top">
                          {(item.tipo_item === 'SERVICIO' || item.tipo_item === 'PROMOCION') ? (
                            <input
                              type="number"
                              step="0.01"
                              value={item.ajuste_precio || ''}
                              onChange={(e) => actualizarItem(item.id, 'ajuste_precio', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-right"
                              placeholder="0.00"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs block text-center">-</span>
                          )}
                        </td>

                        <td className="py-2 px-2 align-top text-right font-semibold">{formatCurrency(item.total_linea)}</td>

                        <td className="py-2 px-2 align-top text-center">
                          <button
                            onClick={() => eliminarItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <button
                  onClick={agregarFilaVacia}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  ➕ Agregar detalle
                </button>
              </div>
            </div>

            {/* Totales y Botones */}
            <div className="flex justify-between items-end mt-4">
              <div className="space-x-2">
                
                <button
                  onClick={() => {
                    setNuevaFactura({
                      nombre: '',
                      apellido: '',
                      identidad: ''
                    });
                    setItemsFactura([]);
                    setDescuento(0);
                    setMostrarDescuento(false);
                  }}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                  Limpiar
                </button>

                {/* NUEVO: Botón para abrir modal de pago y generar factura */}
                <button
                  onClick={abrirModalPago}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  💳 Generar Factura
                </button>
              </div>

              {/* BOTÓN AGREGAR DESCUENTO (antes de los cálculos) */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => setMostrarDescuento(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Percent size={12} />
                  <span className="ml-1">Agregar descuento</span>
                </button>

                <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-300">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-gray-700 text-sm gap-8">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(calcularSubtotal())}</span>
                    </div>

                    {/* input de descuento aparece cuando mostrarDescuento es true */}
                    {mostrarDescuento && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Descuento:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={calcularSubtotal()}
                          value={descuento || ''}
                          onChange={(e) => setDescuento(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button
                          onClick={() => {
                            setDescuento(0);
                            setMostrarDescuento(false);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-700 text-sm gap-8">
                      <span className="font-medium">IVA (15%):</span>
                      <span className="font-semibold">{formatCurrency(calcularImpuesto())}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-1.5 border-t-2 border-gray-400 gap-8">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(calcularTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facturas' && (
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
                    placeholder="Buscar por número, cliente o identidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
                            <div className="text-sm font-medium text-gray-800">{factura.cliente.nombre} {factura.cliente.apellido}</div>
                            <div className="text-xs text-gray-500">{factura.cliente.identidad}</div>
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

            <div className="col-span-7">
              {facturaActual && (
                <>
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
                          <p className="text-xs text-blue-100 mt-1">ID: {facturaActual.id_factura_pk}</p>
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
                        <p className="text-sm text-gray-600">RTN: {facturaActual.RTN}</p>
                        {/* Vendedor/Usuario y Fecha removidos a petición */}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
                        <p className="font-bold text-gray-800 mb-1">{facturaActual.cliente.nombre} {facturaActual.cliente.apellido}</p>
                        <p className="text-sm text-gray-600">Identidad: {facturaActual.cliente.identidad}</p>
                      </div>
                    </div>

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
                                <div className="flex gap-3 mt-1 flex-wrap">
                                  <span className="text-xs text-gray-500">
                                    <span className="font-semibold">{detalle.tipo_item}</span>
                                  </span>
                                  {detalle.estilistas && detalle.estilistas.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      Estilista{detalle.estilistas.length > 1 ? 's' : ''}: <span className="font-semibold">{detalle.estilistas.join(', ')}</span>
                                    </span>
                                  )}
                                  {detalle.num_mascotas_atendidas && detalle.tipo_item !== 'PRODUCTO' && (
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
                              <td className="py-3 px-2 text-center font-medium text-gray-700">
                                {detalle.tipo_item === 'PRODUCTO' ? detalle.cantidad_item : detalle.num_mascotas_atendidas}
                              </td>
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

      {/* ModalPago: se abre al hacer click en "Generar Factura" */}
      <ModalPago
        show={showModalPago}
        total={calcularTotal()}
        onClose={cerrarModalPago}
        onSuccess={handlePagoExitoso}
      />
    </div>
  );
}
