import React from "react";

// Recibe los datos de la factura por props
const VerDetallesFactura = ({
  numero = "FAC-2025-013",
  fecha = "3/11/2025",
  estado = "PAGADA",
  cliente = "Cliente General",
  items = [
    {
      descripcion: "COLLAR AZUL GRANDE",
      tipo: "PRODUCTO",
      cantidad: 1,
      precio: 200,
      descuento: 100,
      total: 300,
    },
  ],
  subtotal = 260.87,
  descuento = 0.0,
  impuesto = 39.13,
  total = 300.0,
  saldo = 0.0,
  pagos = [
    {
      fecha: "3/11/2025",
      metodo: "TARJETA",
      tipo: "TOTAL",
      monto: 300,
    },
  ],
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">FACTURA</h2>
      <div className="flex justify-between mb-2">
        <div>
          <div className="text-sm">Número: <span className="font-semibold">{numero}</span></div>
          <div className="text-sm">Fecha: <span className="font-semibold">{fecha}</span></div>
        </div>
        <div className="text-sm">Estado: <span className="font-semibold">{estado}</span></div>
      </div>
      <div className="mb-2">
        <div className="font-bold">CLIENTE:</div>
        <div>{cliente}</div>
      </div>
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2">Descripción</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Cant.</th>
            <th className="p-2">Precio Unit.</th>
            <th className="p-2">Descuento</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="bg-gray-50">
              <td className="p-2">{item.descripcion}</td>
              <td className="p-2">{item.tipo}</td>
              <td className="p-2 text-center">{item.cantidad}</td>
              <td className="p-2 text-right">L {Number(item.precio).toFixed(2)}</td>
              <td className="p-2 text-right">L {Number(item.descuento).toFixed(2)}</td>
              <td className="p-2 text-right">L {Number(item.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-end mb-4">
  <div>Subtotal: <span className="ml-2">L {Number(subtotal).toFixed(2)}</span></div>
  <div>Descuento: <span className="ml-2">L {Number(descuento).toFixed(2)}</span></div>
  <div>Impuesto (15%): <span className="ml-2">L {Number(impuesto).toFixed(2)}</span></div>
  <div className="font-bold text-lg mt-2">TOTAL: <span className="ml-2">L {Number(total).toFixed(2)}</span></div>
  <div className="font-bold text-green-600">SALDO: <span className="ml-2">L {Number(saldo).toFixed(2)}</span></div>
      </div>
      <div className="mt-6">
        <div className="font-bold mb-2">HISTORIAL DE PAGOS:</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-2">Fecha</th>
              <th className="p-2">Método</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago, idx) => (
              <tr key={idx} className="bg-gray-50">
                <td className="p-2">{pago.fecha}</td>
                <td className="p-2">{pago.metodo}</td>
                <td className="p-2">{pago.tipo}</td>
                <td className="p-2 text-right">L {Number(pago.monto).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerDetallesFactura;
