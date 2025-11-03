import React, { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import Select from 'react-select';
import ModalPago from "../pagos/ModalPago";
import { crearFactura } from "../../../AXIOS.SERVICES/factura-axios";
import { procesarPago } from "../../../AXIOS.SERVICES/payments-axios";

//====================CONFIGURACIÓN_DE_CLAVES====================
//MAPEO DE CLAVES PARA PRODUCTOS SERVICIOS Y PROMOCIONES
const keyMap = {
  PRODUCTOS: { id: "id_producto_pk", name: "nombre_producto", price: "precio_producto" },
  SERVICIOS: { id: "id_servicio_peluqueria_pk", name: "nombre_servicio_peluqueria", price: "precio_servicio" },
  PROMOCIONES: { id: "id_promocion_pk", name: "nombre_promocion", price: "precio_promocion" },
};

//====================COMPONENTE_PRINCIPAL====================
const DetallesFactura = ({
  items,
  addItem,
  removeItem,
  updateItem,
  calculateLineTotal,
  disponiblesItems,
  onItemTypeChange,
  onItemChange,
  estilistas = [],
  onCancel,
  // ⭐ RECIBIR DATOS DEL ENCABEZADO
  identidad,
  RTN,
  id_cliente, // ⭐ NUEVO: Necesitas pasar esto desde NuevaFactura
}) => {

  //====================ESTADOS====================
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false); // ⭐ NUEVO

  //====================FUNCIONES_AUXILIARES====================

  const safeTipo = (t) => (t && keyMap[t] ? t : "PRODUCTOS");

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `L ${num.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  //====================GESTIÓN_DE_ESTILISTAS====================

  const addEstilista = (itemId) => {
    const item = items.find(it => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    updateItem(itemId, "estilistas", [...currentEstilistas, { id: Date.now(), estilistaId: "", cantidadMascotas: 0 }]);
  };

  const removeEstilista = (itemId, estilistaIndex) => {
    const item = items.find(it => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    const newEstilistas = currentEstilistas.filter((_, index) => index !== estilistaIndex);
    updateItem(itemId, "estilistas", newEstilistas);
  };

  const updateEstilista = (itemId, estilistaIndex, field, value) => {
    const item = items.find(it => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    const newEstilistas = currentEstilistas.map((est, index) =>
      index === estilistaIndex ? { ...est, [field]: value } : est
    );
    updateItem(itemId, "estilistas", newEstilistas);
  };

  //====================CÁLCULOS_DE_TOTALES====================

  const TOTAL_BRUTO = items.reduce((sum, it) => {
    const cantidad = parseFloat(it.cantidad) || 0;
    const precio = parseFloat(it.precio) || 0;
    return sum + cantidad * precio;
  }, 0);

  const TOTAL_AJUSTE = items.reduce((sum, it) => sum + (parseFloat(it.ajuste) || 0), 0);
  const TOTAL_FINAL = TOTAL_BRUTO + TOTAL_AJUSTE;
  const DIVISOR_ISV = 1.15;
  const SUBTOTAL_GRAVABLE = TOTAL_FINAL > 0 ? TOTAL_FINAL / DIVISOR_ISV : 0;
  const SUBTOTAL = SUBTOTAL_GRAVABLE;
  const IMPUESTO = TOTAL_FINAL - SUBTOTAL;
  const DESCUENTO = TOTAL_AJUSTE < 0 ? Math.abs(TOTAL_AJUSTE) : 0;
  const SALDO = TOTAL_FINAL;

  //====================⭐ FUNCIÓN PARA GUARDAR FACTURA SIN ABRIR PAGOS====================
  const handleGuardarFacturaSinPago = async () => {
    // VALIDACIONES
    if (items.length === 0) {
      alert('Debes agregar al menos un item a la factura');
      return;
    }

    const itemsInvalidos = items.filter(item => !item.item || item.item === '');
    if (itemsInvalidos.length > 0) {
      alert('Todos los items deben tener un producto o servicio seleccionado');
      return;
    }

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

    // ⭐ CONSTRUIR PAYLOAD PARA EL BACKEND
    setLoading(true);

    const datosFactura = {
      RTN: RTN || null,
      id_cliente: id_cliente || null,
      items: items.map(item => ({
        tipo: item.tipo,
        item: item.item,
        cantidad: parseFloat(item.cantidad) || 1,
        ajuste: parseFloat(item.ajuste) || 0,
        estilistas: (item.estilistas || []).map(est => ({
          estilistaId: est.estilistaId,
          cantidadMascotas: parseInt(est.cantidadMascotas) || 0
        }))
      }))
    };

    console.log('📤 Guardando factura sin pagos:', datosFactura);

    try {
      const response = await crearFactura(datosFactura); // ← Mismo servicio axios

      console.log('📥 Respuesta:', response);

      if (response.success) {
        alert(`✅ Factura ${response.data.numero_factura} guardada exitosamente!`);
        onCancel(); // ← Redirige a /facturas
      }
    } catch (error) {
      console.error('❌ Error al crear factura:', error);
      alert('Error inesperado al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  //====================⭐ FUNCIÓN PARA CREAR FACTURA Y ABRIR MODAL DE PAGOS====================
  const handleOpenPaymentModal = async () => {
    // VALIDACIONES
    if (items.length === 0) {
      alert('Debes agregar al menos un item a la factura');
      return;
    }

    const itemsInvalidos = items.filter(item => !item.item || item.item === '');
    if (itemsInvalidos.length > 0) {
      alert('Todos los items deben tener un producto o servicio seleccionado');
      return;
    }

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

    // ⭐ CONSTRUIR PAYLOAD PARA EL BACKEND
    setLoading(true);

    const datosFactura = {
      RTN: RTN || null,
      id_cliente: id_cliente || null,
      items: items.map(item => ({
        tipo: item.tipo,
        item: item.item, // ID del producto/servicio/promoción
        cantidad: parseFloat(item.cantidad) || 1,
        ajuste: parseFloat(item.ajuste) || 0,
        estilistas: (item.estilistas || []).map(est => ({
          estilistaId: est.estilistaId,
          cantidadMascotas: parseInt(est.cantidadMascotas) || 0
        }))
      }))
    };

    console.log('📤 Enviando factura con pagos:', datosFactura);

    try {
      const response = await crearFactura(datosFactura);

      console.log('📥 Respuesta:', response);

      if (response.success) {
        alert(`✅ Factura ${response.data.numero_factura} creada exitosamente!\nTotal: L ${response.data.total}\nSaldo: L ${response.data.saldo}`);

        // ⭐ Abrir modal de pago
        const datos = {
          id_factura: response.data.id_factura,
          numero_factura: response.data.numero_factura,
          subtotal: parseFloat(response.data.subtotal),
          descuento: parseFloat(response.data.descuento),
          impuesto: parseFloat(response.data.impuesto),
          total: parseFloat(response.data.total),
          saldo: parseFloat(response.data.saldo)
        };

        console.log('💳 Datos de pago a enviar:', datos);
        setPaymentData(datos);
        setShowPaymentModal(true);

      } else {
        alert(`❌ Error: ${response.mensaje}`);
      }

    } catch (error) {
      console.error('❌ Error al crear factura:', error);
      alert('Error inesperado al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  //====================CIERRE_DEL_MODAL====================
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
  };

  const handlePaymentSuccess = async (datosPago) => {
    try {
      console.log('💳 Procesando pago:', datosPago);

      // LLAMAR AL SERVICIO PARA PROCESAR EL PAGO
      const response = await procesarPago(datosPago);

      if (response.success) {
        alert(response.mensaje || 'Pago procesado exitosamente');
        setShowPaymentModal(false);
        setPaymentData(null);

        // Opcional: Redirigir a la lista de facturas o recargar
        window.location.href = '/facturas'; // O usar navigate si tienes react-router
      } else {
        alert(response.mensaje || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  //====================MANEJADORES_DE_EVENTOS====================

  const handleTipoChange = (id, nuevoTipo) => {
    onItemTypeChange(id, nuevoTipo);
  };

  const handleItemSelect = (id, selectedId, tipoRaw) => {
    const tipo = safeTipo(tipoRaw);
    const currentItems = disponiblesItems[tipo] || [];
    const { id: idKey, name: nameKey, price: priceKey } = keyMap[tipo];
    const selectedItemData = currentItems.find((i) => String(i[idKey]) === String(selectedId));
    onItemChange(id, selectedId, selectedItemData, nameKey, priceKey);
  };

  //====================RENDER====================
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm" style={{ padding: '24px' }}>
        {/*ENCABEZADO CON BOTÓN AGREGAR ITEM*/}
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <h1 className="text-xl font-semibold text-gray-800 mb-3">Detalles de la Factura</h1>
          <button
            onClick={addItem}
            className="flex items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            style={{ gap: '8px', padding: '8px 16px' }}
          >
            <Plus size={20} />
            Agregar Item
          </button>
        </div>
        {/*TABLA DE ITEMS*/}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            {/*ENCABEZADO DE LA TABLA*/}
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center font-medium text-gray-700" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', fontSize: '14px', width: '160px' }}>TIPO</th>
                <th className="text-center font-medium text-gray-700" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', fontSize: '14px', width: '288px' }}>ITEM</th>
                <th className="text-center font-medium text-gray-700" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', fontSize: '14px', width: '96px' }}>CANTIDAD</th>
                <th className="text-center font-medium text-gray-700" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', fontSize: '14px', width: '96px' }}>PRECIO</th>
                <th className="text-center font-medium text-gray-700" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', fontSize: '14px', width: '96px' }}>AJUSTE</th>
                <th className="text-left font-medium text-gray-700" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', fontSize: '14px', width: '112px' }}>TOTAL</th>
                <th className="text-center" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', width: '48px' }}></th>
              </tr>
            </thead>
            {/*CUERPO DE LA TABLA*/}
            <tbody style={{ fontSize: '14px' }}>
              {items.map((item) => {
                const tipo = safeTipo(item.tipo);
                const currentItems = disponiblesItems[tipo] || [];
                const { id: idKey, name: nameKey, price: priceKey } = keyMap[tipo];
                const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
                const itemEstilistas = item.estilistas || [];

                return (
                  <React.Fragment key={item.id}>
                    {/*FILA PRINCIPAL DEL ITEM*/}
                    <tr className="border-b border-gray-100">
                      {/*COLUMNA TIPO*/}
                      <td style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                        <Select
                          value={{ value: tipo, label: tipo }}
                          onChange={(selectedOption) => handleTipoChange(item.id, selectedOption.value)}
                          options={Object.keys(disponiblesItems).map((t) => ({ value: t, label: t }))}
                          isSearchable={false}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            control: (base) => ({ ...base, minHeight: '34px', height: '34px', fontSize: '14px', borderColor: '#d1d5db' }),
                            option: (base) => ({ ...base, fontSize: '14px' }),
                            singleValue: (base) => ({ ...base, fontSize: '14px' })
                          }}
                        />
                      </td>
                      {/*COLUMNA ITEM CON BÚSQUEDA*/}
                      <td style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}>
                        <Select
                          value={currentItems.map((availableItem) => ({ value: availableItem[idKey], label: availableItem[nameKey] })).find((opt) => opt.value === item.item) || null}
                          onChange={(selectedOption) => {
                            if (!selectedOption) {
                              onItemChange(item.id, "", null, nameKey, priceKey);
                              return;
                            }
                            const selectedItemData = currentItems.find((it) => String(it[idKey]) === String(selectedOption.value));
                            onItemChange(item.id, selectedOption.value, selectedItemData, nameKey, priceKey);
                          }}
                          options={currentItems.map((availableItem) => ({ value: availableItem[idKey], label: availableItem[nameKey] }))}
                          isClearable
                          placeholder="Seleccionar..."
                          noOptionsMessage={() => "No se encontraron resultados"}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            control: (base) => ({ ...base, minHeight: '34px', height: '34px', fontSize: '14px', borderColor: '#d1d5db' }),
                            option: (base) => ({ ...base, fontSize: '14px' }),
                            singleValue: (base) => ({ ...base, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
                            placeholder: (base) => ({ ...base, fontSize: '14px' })
                          }}
                        />
                      </td>
                      {/*COLUMNA CANTIDAD*/}
                      <td className="text-center" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '8px', paddingRight: '8px' }}>
                        <input
                          type="number"
                          value={item.cantidad ?? 0}
                          onChange={(e) => updateItem(item.id, "cantidad", e.target.value)}
                          className="w-full border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                          style={{ padding: '4px 8px', fontSize: '14px' }}
                        />
                      </td>
                      {/*COLUMNA PRECIO*/}
                      <td className="text-right" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '8px', paddingRight: '8px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={item.precio || "0.00"}
                          readOnly
                          className="w-full border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-default focus:ring-0 text-right"
                          style={{ padding: '4px 8px', fontSize: '14px' }}
                        />
                      </td>
                      {/*COLUMNA AJUSTE*/}
                      <td className="text-right" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '8px', paddingRight: '8px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={item.ajuste ?? 0}
                          onChange={(e) => updateItem(item.id, "ajuste", e.target.value)}
                          className="w-full border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                          style={{ padding: '4px 8px', fontSize: '14px' }}
                        />
                      </td>
                      {/*COLUMNA TOTAL LÍNEA*/}
                      <td className="text-left" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '8px', paddingRight: '8px' }}>
                        <span className="font-medium text-gray-800" style={{ fontSize: '14px' }}>L {calculateLineTotal(item)}</span>
                      </td>
                      {/*COLUMNA ELIMINAR*/}
                      <td className="text-center" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '8px', paddingRight: '8px' }}>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:bg-red-50 rounded transition-colors inline-flex"
                          style={{ padding: '4px' }}
                          title="Eliminar item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>

                    {/*FILA ESTILISTAS*/}
                    {requiereEstilista && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}>
                          <div style={{ marginLeft: '16px' }}>
                            {itemEstilistas.map((est, index) => (
                              <div key={est.id} className="flex items-center" style={{ gap: '16px', marginBottom: '8px' }}>
                                <div className="flex items-center" style={{ gap: '8px' }}>
                                  <label className="font-medium text-gray-600" style={{ fontSize: '14px' }}>Estilista:</label>
                                  <div style={{ width: '192px' }}>
                                    <Select
                                      value={estilistas.map((e) => ({ value: e.id_estilista_pk, label: `${e.nombre_estilista} ${e.apellido_estilista}` })).find((opt) => opt.value === est.estilistaId) || null}
                                      onChange={(selectedOption) => updateEstilista(item.id, index, "estilistaId", selectedOption ? selectedOption.value : "")}
                                      options={estilistas.map((e) => ({ value: e.id_estilista_pk, label: `${e.nombre_estilista} ${e.apellido_estilista}` }))}
                                      isClearable
                                      isSearchable={false}
                                      placeholder="Seleccionar..."
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      styles={{
                                        control: (base) => ({ ...base, minHeight: '34px', height: '34px', fontSize: '14px', borderColor: '#d1d5db' }),
                                        option: (base) => ({ ...base, fontSize: '14px' }),
                                        singleValue: (base) => ({ ...base, fontSize: '14px' }),
                                        placeholder: (base) => ({ ...base, fontSize: '14px' })
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center" style={{ gap: '8px' }}>
                                  <label className="font-medium text-gray-600" style={{ fontSize: '14px' }}>Cantidad Mascotas:</label>
                                  <input
                                    type="number"
                                    value={est.cantidadMascotas ?? 0}
                                    onChange={(e) => updateEstilista(item.id, index, "cantidadMascotas", e.target.value)}
                                    className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                    style={{ width: '80px', padding: '4px 8px', fontSize: '14px' }}
                                  />
                                </div>
                                <button
                                  onClick={() => removeEstilista(item.id, index)}
                                  className="text-red-600 hover:bg-red-100 rounded transition-colors"
                                  style={{ padding: '4px' }}
                                  title="Eliminar estilista"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addEstilista(item.id)}
                              className="flex items-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              style={{ gap: '4px', padding: '4px 12px', fontSize: '14px', marginTop: '8px' }}
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
            <div className="text-center text-gray-500" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
              No hay items agregados. Haz clic en "Agregar Item" para comenzar.
            </div>
          )}
        </div>

        {/*TOTALES Y BOTONES*/}
        {items.length > 0 && (
          <div className="flex justify-between items-center" style={{ marginTop: '24px', gap: '24px' }}>
            <div className="flex flex-1 justify-center" style={{ gap: '12px' }}>
              <button
                onClick={handleGuardarFacturaSinPago}
                disabled={loading}
                className={`${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold rounded-lg transition-colors`}
                style={{ padding: '12px 32px' }}
              >
                {loading ? 'Guardando...' : 'Guardar Factura'}
              </button>
              <button
                onClick={handleOpenPaymentModal}
                disabled={loading}
                className={`${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold rounded-lg transition-colors`}
                style={{ padding: '12px 32px' }}
              >
                {loading ? 'Guardando...' : 'Guardar y Continuar a Pagos'}
              </button>
              <button
                onClick={onCancel}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                style={{ padding: '12px 32px' }}
              >
                Cancelar
              </button>
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-lg" style={{ padding: '16px 24px' }}>
              <div className="ml-auto" style={{ maxWidth: '320px' }}>
                <div className="flex justify-between text-gray-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(SUBTOTAL)}</span>
                </div>
                {DESCUENTO > 0 && (
                  <div className="flex justify-between text-green-600" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    <span>Descuento:</span>
                    <span className="font-medium">-{formatCurrency(DESCUENTO)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <span>Impuesto (15%):</span>
                  <span className="font-medium">{formatCurrency(IMPUESTO)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t-2 border-gray-300" style={{ fontSize: '18px', paddingTop: '8px', marginBottom: '4px' }}>
                  <span>TOTAL:</span>
                  <span>{formatCurrency(TOTAL_FINAL)}</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-600" style={{ fontSize: '16px', paddingTop: '4px' }}>
                  <span>Saldo Pendiente:</span>
                  <span>{formatCurrency(SALDO)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalPago
        show={showPaymentModal}
        total={paymentData?.total || 0}
        onClose={handleClosePaymentModal}
        onPagoConfirmado={handlePaymentSuccess}
        factura={paymentData}
      />
    </>
  );
};

export default DetallesFactura;