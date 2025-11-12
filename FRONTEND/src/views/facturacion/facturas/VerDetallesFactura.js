import React, { useState, useEffect } from "react";
import { obtenerDetalleFacturaSeleccionada } from "../../../AXIOS.SERVICES/factura-axios";

const VerDetallesFactura = ({ numFactura, onClose }) => {
  const [datosFactura, setDatosFactura] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🟦 useEffect ejecutado con numFactura:", numFactura);
    
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
        console.log("🟢 Datos completos:", JSON.stringify(respuesta.data, null, 2));

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

  console.log("📊 Datos de factura para totales:", factura);

  const calcularTotales = () => {
    // Usar los valores directamente del primer registro (factura)
    const exento = Number(factura.subtotal_exento || 0);
    const gravado = Number(factura.subtotal_gravado || 0);
    const descuento = Number(factura.descuento || 0);
    const impuesto = Number(factura.impuesto || 0);
    const total = Number(factura.total || 0);
    const saldo = Number(factura.saldo || 0);

    console.log("💰 Valores calculados:", { exento, gravado, descuento, impuesto, total, saldo });

    return {
      exento: exento.toFixed(2),
      gravado: gravado.toFixed(2),
      descuento: descuento.toFixed(2),
      impuesto: impuesto.toFixed(2),
      total: total.toFixed(2),
      saldo: saldo.toFixed(2)
    };
  };

  const totales = calcularTotales();

  if (cargando) {
    return (
      <div className="max-w-xl mx-auto bg-white p-3 rounded-lg shadow-lg text-center font-['Poppins']">
        <p className="text-sm">Cargando detalles de factura: {numFactura}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white p-3 rounded-lg shadow-lg text-center font-['Poppins']">
        <p className="text-red-500 text-sm">{error}</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-3 bg-red-500 text-white px-3 py-1.5 text-sm rounded hover:bg-red-600"
          >
            Cerrar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-3 rounded-lg shadow-lg font-['Poppins']">
      {onClose && (
        <button
          onClick={onClose}
          className="float-right text-xl hover:text-gray-700 bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center"
        >
          ×
        </button>
      )}

      <h2 className="text-sm font-bold text-center mb-3">DETALLES DE FACTURA</h2>

      <div className="mb-3 text-center">
        <div className="text-sm font-semibold bg-blue-50 p-2 rounded">
          Factura: <span className="text-blue-600">{factura.numero_factura || "N/A"}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs mb-3 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-1.5 text-left font-bold border border-gray-300">CANT.</th>
              <th className="p-1.5 text-left font-bold border border-gray-300">NOMBRE</th>
              <th className="p-1.5 text-right font-bold border border-gray-300">PRECIO</th>
              <th className="p-1.5 text-right font-bold border border-gray-300">AJUSTE</th>
              <th className="p-1.5 text-right font-bold border border-gray-300">TOTAL</th>
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
                    <td className="p-1.5 text-center border border-gray-300">{cantidad}</td>
                    <td className="p-1.5 border border-gray-300">{nombre}</td>
                    <td className="p-1.5 text-right border border-gray-300">L {Number(precio).toFixed(2)}</td>
                    <td className="p-1.5 text-right border border-gray-300">L {Number(ajuste).toFixed(2)}</td>
                    <td className="p-1.5 text-right border border-gray-300 font-medium">
                      L {totalLinea.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-3 text-gray-500 text-xs border border-gray-300">
                  No hay items en esta factura
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
        <div className="flex justify-between mb-1 text-xs">
          <span className="font-semibold">Subtotal Exento:</span>
          <span>L {totales.exento}</span>
        </div>
        <div className="flex justify-between mb-1 text-xs">
          <span className="font-semibold">Subtotal Gravado:</span>
          <span>L {totales.gravado}</span>
        </div>
        <div className="flex justify-between mb-1 text-xs">
          <span className="font-semibold">Descuento:</span>
          <span>L {totales.descuento}</span>
        </div>
        <div className="flex justify-between mb-1 text-xs">
          <span className="font-semibold">Impuesto (15%):</span>
          <span>L {totales.impuesto}</span>
        </div>
        <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1.5 mt-1.5">
          <span>TOTAL:</span>
          <span className="text-green-600">L {totales.total}</span>
        </div>
        <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1.5 mt-1.5">
          <span>SALDO PENDIENTE:</span>
          <span className={totales.saldo > 0 ? "text-red-600" : "text-green-600"}>
            L {totales.saldo}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerDetallesFactura;