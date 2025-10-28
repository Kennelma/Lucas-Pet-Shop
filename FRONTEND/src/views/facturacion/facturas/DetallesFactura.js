import React from "react";
import { Plus, Trash2 } from "lucide-react";

const keyMap = {
  PRODUCTOS: { id: "id_producto_pk", name: "nombre_producto", price: "precio_producto" },
  SERVICIOS: { id: "id_servicio_peluqueria_pk", name: "nombre_servicio_peluqueria", price: "precio_servicio" },
  PROMOCIONES: { id: "id_promocion_pk", name: "nombre_promocion", price: "precio_promocion" },
};

const DetallesFactura = ({
  items,
  addItem,
  removeItem,
  updateItem,
  calculateLineTotal,
  disponiblesItems,
  onItemTypeChange,
  onItemChange,
}) => {

  const safeTipo = (t) => (t && keyMap[t] ? t : "PRODUCTOS");

  //UTLIDAD PARA FORMATEAR TODO A LEMPIRAS
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `L ${num.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


//APARTADO DE CALCULOS
// 1. SUMA BRUTA (Suma de todas las líneas: Cantidad * Precio)
const TOTAL_BRUTO = items.reduce((sum, it) => {
  const cantidad = parseFloat(it.cantidad) || 0;
  const precio = parseFloat(it.precio) || 0;
  return sum + cantidad * precio;
}, 0);

// 2. TOTAL AJUSTES NETOS (Descuentos y recargos por línea)
const TOTAL_AJUSTE = items.reduce((sum, it) => sum + (parseFloat(it.ajuste) || 0), 0);

// 3. TOTAL FINAL NETO (El monto que incluye el ISV)
// Este es el monto final de la factura (antes de pagos)
const TOTAL_FINAL = TOTAL_BRUTO + TOTAL_AJUSTE;

// --- DESGLOSE DE ISV (15%) ---

// 4. SUBTOTAL / BASE IMPONIBLE (Monto sin ISV)
// Se divide el TOTAL_FINAL entre 1.15 para sacar el valor sin impuesto.
const DIVISOR_ISV = 1.15;
const SUBTOTAL_GRAVABLE = TOTAL_FINAL > 0 ? TOTAL_FINAL / DIVISOR_ISV : 0;
const SUBTOTAL = SUBTOTAL_GRAVABLE; // Usamos un nombre más simple para mostrar en el resumen

// 5. CÁLCULO DEL IMPUESTO (ISV)
// Se obtiene restando el SUBTOTAL del TOTAL FINAL.
const IMPUESTO = TOTAL_FINAL - SUBTOTAL;

// 6. CÁLCULO DEL DESCUENTO
// El descuento se extrae de los ajustes negativos para mostrarlo en el resumen
const DESCUENTO = TOTAL_AJUSTE < 0 ? Math.abs(TOTAL_AJUSTE) : 0;

// 7. SALDO PENDIENTE
const SALDO = TOTAL_FINAL;


  // Línea eliminada: const saldo = total; // ESTA LÍNEA ERA REDUNDANTE Y CAUSABA ERROR


  const handleTipoChange = (id, nuevoTipo) => {
    onItemTypeChange(id, nuevoTipo);
  };

  const handleItemSelect = (id, selectedId, tipoRaw) => {
    const tipo = safeTipo(tipoRaw);
    const currentItems = disponiblesItems[tipo] || [];
    const { id: idKey, name: nameKey, price: priceKey } = keyMap[tipo];

    const selectedItemData = currentItems.find(
      (i) => String(i[idKey]) === String(selectedId)
    );

    onItemChange(id, selectedId, selectedItemData, nameKey, priceKey);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-semibold text-gray-800">Detalles de Factura</h2>
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Agregar Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-36">TIPO</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-72">ITEM</th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 w-24">CANTIDAD</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 w-28">PRECIO</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 w-28">AJUSTE</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 w-32">TOTAL LÍNEA</th>
              <th className="py-3 px-2 w-5"></th>
            </tr>
          </thead>

          <tbody className="text-sm">

            {items.map((item) => {
              const tipo = safeTipo(item.tipo);
              const currentItems = disponiblesItems[tipo] || [];
              const { id: idKey, name: nameKey, price: priceKey } = keyMap[tipo];

              const selectedItemData = currentItems.find(
                (i) => String(i[idKey]) === String(item.item)
              );

              return (

                <tr key={item.id} className="border-b border-gray-100">
                  {/* Tipo */}
                  <td className="py-3 px-2">
                    <select
                      value={tipo}
                      onChange={(e) => handleTipoChange(item.id, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.keys(disponiblesItems).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>

                  {/*SELECCION DE ITEM*/}
                  <td className="py-3 px-2">
                    <select
                      value={item.item || ""}
                      onChange={(e) => handleItemSelect(item.id, e.target.value, tipo)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs leading-tight"
                    >
                      <option value="">Seleccionar...</option>
                      {currentItems.map((availableItem) => (
                        <option key={availableItem[idKey]} value={availableItem[idKey]}>
                          {availableItem[idKey]} - {availableItem[nameKey]}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Cantidad */}
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={item.cantidad ?? 0}
                      onChange={(e) => updateItem(item.id, "cantidad", e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Precio*/}
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.precio || "0.00"}
                      readOnly
                      className="w-24 px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-default focus:ring-0"
                    />
                  </td>

                  {/* Ajuste */}
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.ajuste ?? 0}
                      onChange={(e) => updateItem(item.id, "ajuste", e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Total línea */}
                  <td className="py-3 px-2">
                    <span className="font-medium text-gray-800">L {calculateLineTotal(item)}</span>
                  </td>

                  {/* Eliminar */}
                  <td className="py-3 px-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay items agregados. Haz clic en "Agregar Item" para comenzar.
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 flex justify-end">
          {/* Totales */}
          <div className="bg-gray-100 border border-gray-200 px-6 py-4 rounded-lg">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-gray-700 text-sm">
                {/* Usa la variable SUBTOTAL */}
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(SUBTOTAL)}</span>
              </div>
              {/* Usa la variable DESCUENTO */}
              {DESCUENTO > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Descuento:</span>
                  <span className="font-medium">-{formatCurrency(DESCUENTO)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700 text-sm">
                {/* Usa la variable IMPUESTO */}
                <span>Impuesto (15%):</span>
                <span className="font-medium">{formatCurrency(IMPUESTO)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                {/* Usa la variable TOTAL_FINAL */}
                <span>TOTAL:</span>
                <span>{formatCurrency(TOTAL_FINAL)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-blue-600 pt-1">
                {/* Usa la variable SALDO */}
                <span>Saldo Pendiente: </span>
                <span>{formatCurrency(SALDO)}</span>
              </div>
            </div>
          </div>
        </div>
      )}




      <div className="flex gap-3 mt-6">
        <button
          // Las funciones 'handleCancelRegister' y 'handleSaveNewCustomer' no están definidas aquí,
          // asumo que deben ser props o funciones que existen en el contexto real.
          // Dejo un placeholder simple para que no haya errores de compilación.
          onClick={() => console.log('Cancelar (Implementar handleCancelRegister)')}
          className="flex-1 py-3 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => console.log('Guardar y Continuar (Implementar handleSaveNewCustomer)')}
          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          Guardar y Continuar
        </button>
      </div>
    </div>
  );
};

export default DetallesFactura;