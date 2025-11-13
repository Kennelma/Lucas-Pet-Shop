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

  // Obtener las últimas 3 compras SOLO para mostrar en la lista
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
      style={{ width: '28rem' }}
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

        {/* Content */}
        <div className="px-6 pb-4">
          {/* Profile Name */}
          <h2 className="text-center text-base font-semibold text-black mb-4">
            {cliente.nombre_cliente} {cliente.apellido_cliente}
          </h2>

          {/* Últimas Compras */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <i className="pi pi-shopping-bag text-black" style={{ fontSize: '14px' }}></i>
              <h3 className="font-bold text-black" style={{ fontSize: '11px' }}>Últimas Compras (Último Mes)</h3>
            </div>
            {loading ? (
              <div className="text-center py-4">
                <i className="pi pi-spin pi-spinner text-teal-600" style={{ fontSize: '24px' }}></i>
              </div>
            ) : recentPurchases.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {recentPurchases.map((order) => (
                  <div key={order.id}>
                    <div className="bg-gray-50 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-black" style={{ fontSize: '11px' }}>{order.id}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-black" style={{ fontSize: '11px' }}>{order.date}</span>
                          <button
                            onClick={() => toggleFactura(order.id)}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-100 hover:bg-teal-200 transition-colors"
                            title="Ver productos"
                          >
                            <i className={`pi ${expandedFactura === order.id ? 'pi-eye-slash' : 'pi-eye'} text-teal-700`} style={{ fontSize: '10px' }}></i>
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-black" style={{ fontSize: '11px' }}>
                        L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Detalles expandibles */}
                    {expandedFactura === order.id && (
                      <div className="mt-1 bg-white rounded-lg border border-teal-200 shadow-sm p-2 animate-fadeIn">
                        <p className="font-bold text-teal-700 mb-1.5" style={{ fontSize: '10px' }}>Productos:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {order.detalles.map((detalle, idx) => (
                            <div key={idx} className="flex justify-between items-start text-gray-700 border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                              <div className="flex-1 pr-2">
                                <p className="font-medium leading-tight" style={{ fontSize: '9px' }}>
                                  {detalle.nombre_item}
                                </p>
                                <p className="text-gray-500" style={{ fontSize: '8px' }}>
                                  {detalle.cantidad_item} x L {parseFloat(detalle.precio_item).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <p className="font-bold text-gray-900 flex-shrink-0" style={{ fontSize: '9px' }}>
                                L {parseFloat(detalle.total_item).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-gray-500" style={{ fontSize: '11px' }}>
                  No hay compras en el último mes
                </p>
              </div>
            )}
          </div>

          {/* TOTAL GASTADO */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-1.5 mb-2 border border-green-200">
            <p className="font-bold text-green-700" style={{ fontSize: '11px' }}>
              Total Gastado (Mes): L {totalSpent.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-around pt-2 pb-1 border-t border-gray-200">
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">{totalOrders}</p>
              <p className="text-xs text-gray-600">Compras (Mes)</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">
                {cliente.fecha_registro ? new Date(cliente.fecha_registro).getFullYear() : 'N/A'}
              </p>
              <p className="text-xs text-gray-600">Cliente desde</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </Dialog>
  );
};

export default ModalPerfilCliente;