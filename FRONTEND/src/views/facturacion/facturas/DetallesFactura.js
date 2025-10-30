import React, { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import Select from 'react-select';
import ModalPago from "../pagos/ModalPago";

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
  estilistas = [],  // ✅ Esto está bien
  onCancel,
}) => {

  console.log("👥 Estilistas recibidos en DetallesFactura:", estilistas); // ⬅️ AGREGA ESTO PARA DEBUGGEAR

  // Estados para el modal de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const safeTipo = (t) => (t && keyMap[t] ? t : "PRODUCTOS");

  // UTILIDAD PARA FORMATEAR TODO A LEMPIRAS
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `L ${num.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Función para agregar un estilista al item
  const addEstilista = (itemId) => {
    const item = items.find(it => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    updateItem(itemId, "estilistas", [...currentEstilistas, { id: Date.now(), estilistaId: "", cantidadMascotas: 0 }]);
  };

  // Función para eliminar un estilista del item
  const removeEstilista = (itemId, estilistaIndex) => {
    const item = items.find(it => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    const newEstilistas = currentEstilistas.filter((_, index) => index !== estilistaIndex);
    updateItem(itemId, "estilistas", newEstilistas);
  };

  // Función para actualizar un estilista específico
  const updateEstilista = (itemId, estilistaIndex, field, value) => {
    const item = items.find(it => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    const newEstilistas = currentEstilistas.map((est, index) =>
      index === estilistaIndex ? { ...est, [field]: value } : est
    );
    updateItem(itemId, "estilistas", newEstilistas);
  };

  // APARTADO DE CALCULOS
  // 1. SUMA BRUTA (Suma de todas las líneas: Cantidad * Precio)
  const TOTAL_BRUTO = items.reduce((sum, it) => {
    const cantidad = parseFloat(it.cantidad) || 0;
    const precio = parseFloat(it.precio) || 0;
    return sum + cantidad * precio;
  }, 0);

  // 2. TOTAL AJUSTES NETOS (Descuentos y recargos por línea)
  const TOTAL_AJUSTE = items.reduce((sum, it) => sum + (parseFloat(it.ajuste) || 0), 0);

  // 3. TOTAL FINAL NETO (El monto que incluye el ISV)
  const TOTAL_FINAL = TOTAL_BRUTO + TOTAL_AJUSTE;

  // 4. SUBTOTAL / BASE IMPONIBLE (Monto sin ISV)
  const DIVISOR_ISV = 1.15;
  const SUBTOTAL_GRAVABLE = TOTAL_FINAL > 0 ? TOTAL_FINAL / DIVISOR_ISV : 0;
  const SUBTOTAL = SUBTOTAL_GRAVABLE;

  // 5. CÁLCULO DEL IMPUESTO (ISV)
  const IMPUESTO = TOTAL_FINAL - SUBTOTAL;

  // 6. CÁLCULO DEL DESCUENTO
  const DESCUENTO = TOTAL_AJUSTE < 0 ? Math.abs(TOTAL_AJUSTE) : 0;

  // 7. SALDO PENDIENTE
  const SALDO = TOTAL_FINAL;

  // Función para abrir el modal de pago
  const handleOpenPaymentModal = () => {
    // Validar que haya al menos un item
    if (items.length === 0) {
      alert('Debes agregar al menos un item a la factura');
      return;
    }

    // Validar que todos los items tengan un producto/servicio seleccionado
    const itemsInvalidos = items.filter(item => !item.item || item.item === '');
    if (itemsInvalidos.length > 0) {
      alert('Todos los items deben tener un producto o servicio seleccionado');
      return;
    }

    // Validar que los items con servicios/promociones tengan estilistas
    const itemsSinEstilista = items.filter(item => {
      const tipo = safeTipo(item.tipo);
      const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
      const estilistas = item.estilistas || [];
      return requiereEstilista && estilistas.length === 0;
    });

    if (itemsSinEstilista.length > 0) {
      alert('Los servicios y promociones deben tener al menos un estilista asignado');
      return;
    }

    // Abrir modal con los datos
    setPaymentData({
      subtotal: SUBTOTAL,
      descuento: DESCUENTO,
      impuesto: IMPUESTO,
      total: TOTAL_FINAL,
      saldo: SALDO
    });
    setShowPaymentModal(true);
  };

  // Función para cerrar el modal
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
  };

  // Función para manejar el pago exitoso
  const handlePaymentSuccess = (paymentType, saldoPendiente) => {
    console.log('Tipo de pago:', paymentType);
    console.log('Saldo pendiente:', saldoPendiente);
    console.log('Datos de la factura:', {
      items,
      totales: paymentData
    });

    // Aquí puedes agregar la lógica para guardar la factura
    // Por ejemplo: enviar a tu API, mostrar mensaje de éxito, etc.

    alert(`Pago ${paymentType} procesado correctamente!\nSaldo pendiente: L ${saldoPendiente.toFixed(2)}`);

    // Cerrar modal
    setShowPaymentModal(false);
    setPaymentData(null);
  };

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
    <>
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

        <div className="overflow-x-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 w-36">TIPO</th>
                <th className="text-left py-3 px-12 text-sm font-medium text-gray-700 w-90">ITEM</th>
                <th className="text-center py-3 px-3 text-sm font-medium text-gray-700 w-16">CANT.</th>
                <th className="text-right py-3 px-3 text-sm font-medium text-gray-700 w-25">PRECIO</th>
                <th className="text-right py-3 px-3 text-sm font-medium text-gray-700 w-20">AJUSTE</th>
                <th className="text-right py-3 px-3 text-sm font-medium text-gray-700 w-24">TOTAL</th>
                <th className="py-3 px-2 w-12"></th>
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

                const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
                const itemEstilistas = item.estilistas || [];

                return (
                  <React.Fragment key={item.id}>
                    <tr className="border-b border-gray-100">
                      {/* Tipo */}
                      <td className="py-3 px-6">
                        <div className="w-44">
                          <Select
                            value={{ value: tipo, label: tipo }}
                            onChange={(selectedOption) => handleTipoChange(item.id, selectedOption.value)}
                            options={Object.keys(disponiblesItems).map((t) => ({
                              value: t,
                              label: t,
                            }))}
                            isSearchable={false}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            className="text-sm [&_.react-select__control]:min-h-[34px] [&_.react-select__control]:h-[34px] [&_.react-select__control]:text-sm [&_.react-select__control]:border-gray-300 hover:[&_.react-select__control]:border-blue-500 focus:[&_.react-select__control]:border-blue-500 focus:[&_.react-select__control]:ring-2 focus:[&_.react-select__control]:ring-blue-500/50 [&_.react-select__option]:text-sm [&_.react-select__single-value]:text-sm"
                          />
                        </div>
                      </td>

                      {/* COLUMNA SELECCIÓN DE ITEM CON BÚSQUEDA*/}
                      <td className="py-3 px-15">
                        <Select
                          value={
                            currentItems
                              .map((availableItem) => ({
                                value: availableItem[idKey],
                                label: availableItem[nameKey],
                              }))
                              .find((opt) => opt.value === item.item) || null
                          }
                          onChange={(selectedOption) => {
                            if (!selectedOption) {
                              onItemChange(item.id, "", null, nameKey, priceKey);
                              return;
                            }
                            const selectedItemData = currentItems.find(
                              (it) => String(it[idKey]) === String(selectedOption.value)
                            );
                            onItemChange(item.id, selectedOption.value, selectedItemData, nameKey, priceKey);
                          }}
                          options={currentItems.map((availableItem) => ({
                            value: availableItem[idKey],
                            label: availableItem[nameKey],
                          }))}
                          isClearable
                          placeholder="Seleccionar..."
                          noOptionsMessage={() => "No se encontraron resultados"}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          className="text-sm [&_.react-select__control]:min-h-[34px] [&_.react-select__control]:h-[34px] [&_.react-select__control]:text-sm [&_.react-select__control]:border-gray-300 hover:[&_.react-select__control]:border-blue-500 focus:[&_.react-select__control]:border-blue-500 focus:[&_.react-select__control]:ring-2 focus:[&_.react-select__control]:ring-blue-500/50 [&_.react-select__option]:text-sm [&_.react-select__single-value]:text-sm [&_.react-select__placeholder]:text-sm"
                        />
                      </td>

                      {/* Cantidad */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={item.cantidad ?? 0}
                          onChange={(e) => updateItem(item.id, "cantidad", e.target.value)}
                          className="w-12 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </td>

                      {/* Precio */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.precio || "0.00"}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-default focus:ring-0 text-sm"
                        />
                      </td>

                      {/* Ajuste */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.ajuste ?? 0}
                          onChange={(e) => updateItem(item.id, "ajuste", e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </td>

                      {/* Total línea */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-medium text-gray-800 text-sm">L {calculateLineTotal(item)}</span>
                      </td>

                      {/* Eliminar */}
                      <td className="py-3 px-2 w-10 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors inline-flex"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>

                    {/* Fila adicional para servicios/promociones */}
                    {requiereEstilista && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="py-2 px-2">
                          <div className="ml-4 space-y-2">
                            {/* Lista de Estilistas */}
                            {itemEstilistas.map((est, index) => (
                              <div key={est.id} className="flex items-center gap-4">
                                {/* Estilista */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-gray-600">Estilista:</label>
                                  <select
                                    value={est.estilistaId || ""}
                                    onChange={(e) => updateEstilista(item.id, index, "estilistaId", e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                  >
                                    <option value="">Seleccionar...</option>
                                    {estilistas.map((estilista) => (
                                      <option key={estilista.id_estilista_pk} value={estilista.id_estilista_pk}>
                                        {estilista.nombre_estilista} {estilista.apellido_estilista}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Cantidad Mascotas */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-gray-600">Cantidad Mascotas:</label>
                                  <input
                                    type="number"
                                    value={est.cantidadMascotas ?? 0}
                                    onChange={(e) => updateEstilista(item.id, index, "cantidadMascotas", e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                  />
                                </div>

                                {/* Botón Eliminar Estilista */}
                                <button
                                  onClick={() => removeEstilista(item.id, index)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  title="Eliminar estilista"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}

                            {/* Botón Agregar Estilista */}
                            <button
                              onClick={() => addEstilista(item.id)}
                              className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <UserPlus size={16} />
                              Agregar Estilista
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
          <div className="mt-6 flex justify-between items-center gap-6">
            {/* Botones de acción */}
            <div className="flex gap-3 flex-1 justify-center">
              <button
                onClick={handleOpenPaymentModal}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Guardar y Continuar
              </button>
              <button
                onClick={onCancel}
                className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>

            {/* Totales */}
            <div className="bg-gray-100 border border-gray-200 px-6 py-4 rounded-lg">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(SUBTOTAL)}</span>
                </div>
                {DESCUENTO > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Descuento:</span>
                    <span className="font-medium">-{formatCurrency(DESCUENTO)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Impuesto (15%):</span>
                  <span className="font-medium">{formatCurrency(IMPUESTO)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(TOTAL_FINAL)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-blue-600 pt-1">
                  <span>Saldo Pendiente: </span>
                  <span>{formatCurrency(SALDO)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Pago */}
      <ModalPago
        show={showPaymentModal}
        total={paymentData?.total || 0}
        onClose={handleClosePaymentModal}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default DetallesFactura;