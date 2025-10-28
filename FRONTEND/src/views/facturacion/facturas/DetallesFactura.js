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
  calculateTotal,
  calculateLineTotal,
  disponiblesItems,
  onItemTypeChange,
  onItemChange,
}) => {
  const safeTipo = (t) => (t && keyMap[t] ? t : "PRODUCTOS");

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
        <h2 className="text-xl font-semibold text-gray-800">Detalles de Factura</h2>
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
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-32">Tipo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-60">Item</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-24">Cantidad</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-28">Precio</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-28">Ajuste</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-32">Total Línea</th>
                <th className="py-3 px-2 w-12"></th>
            </tr>
        </thead>

          <tbody>
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

                  {/* Item */}
                  <td className="py-3 px-2">
                    <select
                      value={item.item || ""}
                      onChange={(e) => handleItemSelect(item.id, e.target.value, tipo)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="bg-gray-50 px-6 py-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-800">L {calculateTotal()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallesFactura;