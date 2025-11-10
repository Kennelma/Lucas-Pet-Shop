import React, { useState, useEffect } from "react";
import { obtenerDetalleFacturaSeleccionada } from "../../../AXIOS.SERVICES/factura-axios";

const VerDetallesFactura = ({ numFactura, onClose }) => {
  const [datosFactura, setDatosFactura] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🟦 useEffect ejecutado con numFactura:", numFactura);
    
    // ✅ Validación PRIMERO antes de hacer nada
    if (!numFactura) {
      console.warn("⚠️ No se recibió numFactura válido. Abortando petición.");
      setError("Número de factura no proporcionado");
      setCargando(false);
      return;
    }

    const cargarDetallesFactura = async () => {
      try {
        setCargando(true);
        setError(null);

        console.log("📡 Solicitando detalle para:", numFactura);
        const respuesta = await obtenerDetalleFacturaSeleccionada(numFactura);
        console.log("🟢 Detalle recibido del servicio:", respuesta);

        if (respuesta.success && respuesta.data) {
          setDatosFactura(respuesta.data);
        } else {
          setError(respuesta.mensaje || "No se encontraron datos de la factura");
          setDatosFactura([]);
        }
      } catch (error) {
        console.error("❌ Error en cargarDetallesFactura:", error);
        setError("Error de conexión");
        setDatosFactura([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDetallesFactura();
  }, [numFactura]);

  const items = datosFactura || [];
  const factura = items[0] || {};

  // Calcular totales
 const calcularTotales = () => {
  const subtotal = items.reduce((sum, item) => {
    const cantidad = Number(item.cantidad_item || item.cantidad || 1);
    const precio = Number(item.precio_item || item.precio || 0);
    const ajuste = Number(item.ajuste_precio || item.ajuste || 0);
    return sum + (cantidad * precio) + ajuste;
  }, 0);
 // ✅ Asegurar que descuento sea un número
  const descuento = Number(factura.descuento || 0);
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

  const totales = items && items.length > 0 ? calcularTotales() : {
    subtotal: ((factura.subtotal_gravado || 0) + (factura.subtotal_exento || 0)).toFixed(2),
    descuento: (factura.descuento || 0).toFixed(2),
    impuesto: (factura.impuesto || 0).toFixed(2),
    total: (factura.total || 0).toFixed(2)
  };

  if (cargando) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg text-center">
        <p>Cargando detalles de factura: {numFactura}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-red-500">{error}</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      {onClose && (
        <button
          onClick={onClose}
          className="float-right text-2xl hover:text-gray-700 bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
        >
          ×
        </button>
      )}

      <h2 className="text-2xl font-bold text-center mb-6">DETALLES DE FACTURA</h2>

      <div className="mb-6 text-center">
        <div className="text-lg font-semibold bg-blue-50 p-3 rounded">
          Factura: <span className="text-blue-600">{factura.numero_factura || "N/A"}</span>
        </div>
      </div>

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
          {items && items.length > 0 ? (
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
          <span className="text-green-600">L {totales.total}</span>
        </div>
      </div>
    </div>
  );
};

export default VerDetallesFactura;