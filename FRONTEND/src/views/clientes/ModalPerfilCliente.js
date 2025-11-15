import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { verHistorialCompras } from "../../AXIOS.SERVICES/clients-axios.js";

const ModalPerfilCliente = ({ isOpen, cliente, onClose }) => {
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedFactura, setExpandedFactura] = useState(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!cliente?.id_cliente_pk) return;

      setLoading(true);
      try {
        const response = await verHistorialCompras(cliente.id_cliente_pk);

        console.log('Respuesta del historial:', response);

        if (response.Consulta && response.historial) {
          console.log('Historial recibido:', response.historial);
          setHistorialCompras(response.historial);

          // Calcular total gastado de TODAS las facturas del mes
          const total = response.historial.reduce((acc, factura) => {
            const monto = parseFloat(factura.total_factura) || 0;
            return acc + monto;
          }, 0);

          setTotalSpent(total);
          setTotalOrders(response.historial.length);
        }
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      cargarHistorial();
      setExpandedFactura(null); // Resetear al abrir
    }
  }, [isOpen, cliente]);

  const toggleFactura = (facturaId) => {
    setExpandedFactura(expandedFactura === facturaId ? null : facturaId);
  };

  if (!cliente) return null;
  // Obtener TODAS las compras del último mes
  const recentPurchases = historialCompras.map(factura => ({
    id: factura.numero_factura,
    date: new Date(factura.fecha_emision).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' }),
    total: parseFloat(factura.total_factura) || 0,
    detalles: factura.detalles || []
  }));

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      className="rounded-[20px] overflow-hidden"
      style={{ width: '40rem' }}
      modal
      closable={true}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      showHeader={false}
    >
      <div className="relative -mx-6 -mt-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-3 z-20 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <i className="pi pi-times text-white text-lg"></i>
        </button>

        {/* Header Background */}
        <div className="absolute left-0 top-0 w-full h-24 bg-gradient-to-r from-teal-700 to-teal-600 rounded-t-[20px] z-0"></div>

        {/* Profile Image */}
        <div className="relative flex justify-center pt-8 pb-3 z-10">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="12" cy="12" r="12" fill="#14b8a6"/>
              <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="white"/>
              <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V20Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Content - Layout horizontal */}
        <div className="px-6 pb-4">
          {/* Profile Name */}
          <h2 className="text-center text-base font-semibold text-black mb-4">
            {cliente.nombre_cliente} {cliente.apellido_cliente}
          </h2>

          {/* Layout de 2 columnas */}
          <div className="flex gap-4">
            {/* Columna Izquierda - Datos del Cliente */}
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              {/* Total de Compras */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-center border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Total de Compras</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>

              {/* Total Gastado */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                <p className="text-xs text-green-700 mb-1 font-medium">Total Gastado (Mes)</p>
                <p className="text-lg font-bold text-green-800">
                  L {totalSpent.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Columna Derecha - Facturas */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <i className="pi pi-shopping-bag text-black" style={{ fontSize: '14px' }}></i>
                <h3 className="font-bold text-black" style={{ fontSize: '12px' }}>Facturas de ese Cliente</h3>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <i className="pi pi-spin pi-spinner text-teal-600" style={{ fontSize: '24px' }}></i>
                </div>
              ) : recentPurchases.length > 0 ? (
                <div className="bg-white border-2 border-gray-300 rounded-lg p-3 max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    {recentPurchases.map((order) => (
                      <div key={order.id} className="relative">
                        <div className="bg-gray-50 rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-black" style={{ fontSize: '12px' }}>{order.id}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black" style={{ fontSize: '12px' }}>{order.date}</span>
                              <button
                                onClick={() => toggleFactura(order.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-100 hover:bg-teal-200 transition-colors relative z-10"
                                title="Ver productos"
                              >
                                <i className={`pi ${expandedFactura === order.id ? 'pi-times' : 'pi-eye'} text-teal-700`} style={{ fontSize: '11px' }}></i>
                              </button>
                            </div>
                          </div>
                          <p className="font-bold text-black" style={{ fontSize: '12px' }}>
                            L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>

                        {/* Mini-modal flotante con detalles */}
                        {expandedFactura === order.id && (
                          <>
                            {/* Overlay semi-transparente */}
                            <div
                              className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
                              onClick={() => setExpandedFactura(null)}
                            ></div>

                            {/* Mini-modal */}
                            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border-2 border-teal-300 shadow-2xl p-4 animate-scaleIn overflow-hidden" style={{ width: '380px', maxHeight: '500px' }}>
                              <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                                <div>
                                  <p className="font-bold text-teal-700" style={{ fontSize: '13px' }}>Factura {order.id}</p>
                                  <p className="text-gray-500" style={{ fontSize: '10px' }}>{order.date}</p>
                                </div>
                                <button
                                  onClick={() => setExpandedFactura(null)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                                >
                                  <i className="pi pi-times text-red-600" style={{ fontSize: '12px' }}></i>
                                </button>
                              </div>

                              <p className="font-bold text-gray-700 mb-2" style={{ fontSize: '11px' }}>Productos:</p>
                              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '340px', paddingRight: '8px' }}>
                                {order.detalles.map((detalle, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                                    <div className="flex justify-between items-start gap-3">
                                      <p className="font-medium leading-tight flex-1 break-words overflow-hidden" style={{ fontSize: '11px', wordBreak: 'break-word' }}>
                                        {detalle.nombre_item} ({detalle.cantidad_item})
                                      </p>
                                      <p className="font-bold text-gray-900 flex-shrink-0 whitespace-nowrap" style={{ fontSize: '11px', minWidth: 'fit-content' }}>
                                        L {parseFloat(detalle.total_item).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <p className="font-bold text-gray-700" style={{ fontSize: '12px' }}>Total:</p>
                                  <p className="font-bold text-teal-700 text-lg">
                                    L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-gray-300">
                  <p className="text-gray-500" style={{ fontSize: '12px' }}>
                    No hay compras registradas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #14b8a6;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #0d9488;
        }
      `}</style>
    </Dialog>
  );
};

export default ModalPerfilCliente;