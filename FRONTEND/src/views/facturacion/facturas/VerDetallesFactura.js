import React from "react";

const VerDetallesFactura = ({ datosFactura = {}, onClose }) => {
  const { factura = {}, items = [] } = datosFactura;

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString('es-HN');
  };

  // Calcular totales basados en los items
  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => {
      const cantidad = item.cantidad_item || item.cantidad || 1;
      const precio = item.precio_item || item.precio || 0;
      const ajuste = item.ajuste_precio || item.ajuste || 0;
      return sum + (cantidad * precio) + Number(ajuste);
    }, 0);

    const descuento = factura.descuento || 0;
    const subtotalConDescuento = subtotal - descuento;
    const impuesto = subtotalConDescuento * 0.15;
    const total = subtotalConDescuento + impuesto;

    return {
      subtotal: subtotal.toFixed(2),
      descuento: descuento.toFixed(2),
      impuesto: impuesto.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const totales = items.length > 0 ? calcularTotales() : {
    subtotal: (factura.subtotal || 0).toFixed(2),
    descuento: (factura.descuento || 0).toFixed(2),
    impuesto: (factura.impuesto || 0).toFixed(2),
    total: (factura.total || 0).toFixed(2)
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      {onClose && (
        <button
          onClick={onClose}
          className="float-right text-2xl hover:text-gray-700"
        >
          ×
        </button>
      )}

      <h2 className="text-2xl font-bold text-center mb-6">DETALLES DE FACTURA</h2>

      {/* INFORMACIÓN BÁSICA */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm">
            <span className="font-semibold">Número:</span> {factura.numero_factura || "N/A"}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Fecha:</span> {formatFecha(factura.fecha_emision)}
          </div>
        </div>
        <div>
          <div className="text-sm">
            <span className="font-semibold">Cliente:</span> {factura.nombre_cliente || "CLIENTE GENERAL"}
          </div>
          {factura.RTN && (
            <div className="text-sm">
              <span className="font-semibold">RTN:</span> {factura.RTN}
            </div>
          )}
        </div>
      </div>

      {/* TABLA SIMPLIFICADA - 5 COLUMNAS */}
      <table className="w-full text-sm mb-6 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left font-bold border border-gray-300">CANTIDAD</th>
            <th className="p-3 text-left font-bold border border-gray-300">NOMBRE</th>
            <th className="p-3 text-right font-bold border border-gray-300">PRECIO UNIT.</th>
            <th className="p-3 text-right font-bold border border-gray-300">AJUSTE</th>
            <th className="p-3 text-right font-bold border border-gray-300">TOTAL LÍNEA</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, idx) => {
              const cantidad = item.cantidad_item || item.cantidad || 1;
              const nombre = item.nombre_item || item.nombre || "Item";
              const precio = item.precio_item || item.precio || 0;
              const ajuste = item.ajuste_precio || item.ajuste || 0;
              const totalLinea = (cantidad * precio) + Number(ajuste);

              return (
                <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="p-3 text-center border border-gray-300">{cantidad}</td>
                  <td className="p-3 border border-gray-300">{nombre}</td>
                  <td className="p-3 text-right border border-gray-300">L {Number(precio).toFixed(2)}</td>
                  <td className="p-3 text-right border border-gray-300">L {Number(ajuste).toFixed(2)}</td>
                  <td className="p-3 text-right border border-gray-300 font-medium">
                    L {totalLinea.toFixed(2)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500 border border-gray-300">
                No hay items en esta factura
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* TOTALES */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Subtotal:</span>
          <span>L {totales.subtotal}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Descuento:</span>
          <span>L {totales.descuento}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Impuesto (15%):</span>
          <span>L {totales.impuesto}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
          <span>TOTAL:</span>
          <span>L {totales.total}</span>
        </div>
      </div>
    </div>
  );
};

export default VerDetallesFactura;