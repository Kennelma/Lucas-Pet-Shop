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

  const handleBackToList = () => {
    setExpandedFactura(null);
  };

  if (!cliente) return null;
  // Obtener TODAS las compras del último mes
  const recentPurchases = historialCompras.map(factura => ({
    id: factura.numero_factura,
    date: new Date(factura.fecha_emision).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' }),
    total: parseFloat(factura.total_factura) || 0,
    detalles: factura.detalles || []
  }));

  const selectedOrder = expandedFactura ? recentPurchases.find(order => order.id === expandedFactura) : null;

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      className="rounded-lg overflow-hidden"
      style={{ width: '28rem' }}
      modal
      closable={false}
      position="center"
      dismissableMask={true}
      draggable={false}
      resizable={false}
      showHeader={false}
    >
      <div className="bg-white -mx-6 -mt-6">
        {/* Header simple */}
        <div className="bg-[#DEFFAD] px-6 pt-6 pb-2 rounded-t-lg">
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-4 h-14"> {/* más separación y altura fija */}
      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center self-center">
        {/* reemplaza por tu SVG preferido para alineado más estable */}
        <svg className="w-6 h-6 text-white block" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z"/>
        </svg>
      </div>

      <div className="flex flex-col justify-center h-full">
        <div className="text-md font-semibold text-gray-800 mt-3">
          {cliente.nombre_cliente} {cliente.apellido_cliente}
        </div>
        <p className="text-xs text-gray-700 leading-tight">Perfil del Cliente</p>
      </div>
    </div>

    <button
      onClick={onClose}
      className="w-7 h-7 rounded hover:bg-green-600 flex items-center justify-center"
    >
      <i className="pi pi-times text-gray-800 text-sm"></i>
    </button>
  </div>
</div>


        {/* Contenido compacto */}
        <div className="px-9 py-3">
          {!selectedOrder ? (
            <>
              {/* Estadísticas compactas */}
              <div className="flex gap-1.5 mb-3">
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 flex-shrink-0" style={{ width: '140px' }}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 whitespace-nowrap" >No. Compras: </div>
                    <div className="text-ms font-bold text-gray-800 whitespace-nowrap">{totalOrders}</div>

                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 whitespace-nowrap">Total Gastado: </div>
                    <div className="text-ms font-bold text-gray-800 whitespace-nowrap">
                      L {totalSpent.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Facturas */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Historial de Facturas</h2>

                {loading ? (
                  <div className="text-center py-8">
                    <i className="pi pi-spin pi-spinner text-gray-600 text-2xl"></i>
                  </div>
                ) : recentPurchases.length > 0 ? (
                  <div className="space-y-2">
                    {recentPurchases.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-gray-800 text-sm">{order.id}</div>
                          <div className="text-xs text-gray-500">{order.date}</div>
                          <div className="text-sm font-bold text-gray-800">
                            L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                          </div>
                          <button
                            onClick={() => toggleFactura(order.id)}
                            className="w-8 h-8 rounded bg-green-100 hover:bg-[#DEFFAD] flex items-center justify-center"
                          >
                            <i className="pi pi-eye text-green-700 text-xs"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                    <i className="pi pi-inbox text-gray-400 text-3xl mb-2"></i>
                    <div className="text-gray-500 text-sm">No hay compras registradas</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Vista de detalles de factura */}
              <div className="mb-3">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm mb-3"
                >
                  <i className="pi pi-arrow-left text-xs"></i>
                  <span>Volver a facturas</span>
                </button>
                
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-gray-800 text-sm">{selectedOrder.id}</div>
                    <div className="text-xs text-gray-500">{selectedOrder.date}</div>
                    <div className="text-sm font-bold text-gray-800">
                      L {selectedOrder.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2">Productos comprados</div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {selectedOrder.detalles.map((detalle, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-gray-800 flex-1">{detalle.nombre_item}</div>
                        <div className="text-xs text-gray-500 text-center" style={{ width: '70px' }}>Cant: {detalle.cantidad_item}</div>
                        <div className="text-sm font-bold text-gray-800 text-right" style={{ width: '90px' }}>
                          L {parseFloat(detalle.total_item).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      
    </Dialog>
  );
};

export default ModalPerfilCliente;