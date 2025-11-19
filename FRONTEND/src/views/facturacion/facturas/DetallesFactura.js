import React, { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import Select from "react-select";
import Swal from "sweetalert2";
import ModalPago from "../pagos/ModalPago";
import { crearFacturaConPago, validarDisponibilidad } from "../../../AXIOS.SERVICES/factura-axios";
import { procesarPago } from "../../../AXIOS.SERVICES/payments-axios";

//====================CONFIGURACIÓN_DE_CLAVES====================
//MAPEO DE CLAVES PARA PRODUCTOS SERVICIOS Y PROMOCIONES
const keyMap = {
  PRODUCTOS: {
    id: "id_producto_pk",
    name: "nombre_producto",
    price: "precio_producto",
  },
  SERVICIOS: {
    id: "id_servicio_peluqueria_pk",
    name: "nombre_servicio_peluqueria",
    price: "precio_servicio",
  },
  PROMOCIONES: {
    id: "id_promocion_pk",
    name: "nombre_promocion",
    price: "precio_promocion",
  },
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
  RTN,
  id_cliente,
  setActiveTab,
  setFacturaParaImprimir,
}) => {

  //====================ESTADOS====================
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false); // ⭐ NUEVO
  const [descuentoValor, setDescuentoValor] = useState(0); //ESTADO PARA EL DESCUENTO

  //====================FUNCIONES_AUXILIARES====================

  const safeTipo = (t) => (t && keyMap[t] ? t : "PRODUCTOS");

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `  L. ${num.toLocaleString("es-HN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  //====================GESTIÓN_DE_ESTILISTAS====================

  const addEstilista = (itemId) => {
    const item = items.find((it) => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    updateItem(itemId, "estilistas", [
      ...currentEstilistas,
      { id: Date.now(), estilistaId: "", cantidadMascotas: "" },
    ]);
  };

  const removeEstilista = (itemId, estilistaIndex) => {
    const item = items.find((it) => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    const newEstilistas = currentEstilistas.filter(
      (_, index) => index !== estilistaIndex
    );
    updateItem(itemId, "estilistas", newEstilistas);
  };

  const updateEstilista = (itemId, estilistaIndex, field, value) => {
    const item = items.find((it) => it.id === itemId);
    const currentEstilistas = item.estilistas || [];
    const newEstilistas = currentEstilistas.map((est, index) =>
      index === estilistaIndex ? { ...est, [field]: value } : est
    );

    updateItem(itemId, "estilistas", newEstilistas);
  };

  //====================VALIDACIÓN_DE_CANTIDAD_VS_MASCOTAS====================
  const validarCantidadVsMascotas = () => {
    const itemsConCantidadIncorrecta = items.filter((item) => {
      const tipo = safeTipo(item.tipo);
      const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
      if (!requiereEstilista) return false;

      const estilistas = item.estilistas || [];
      const totalMascotas = estilistas.reduce((sum, est) => {
        const num = Number(est.cantidadMascotas) || 0;
        return sum + num;
      }, 0);

      return parseFloat(item.cantidad) !== totalMascotas;
    });

    if (itemsConCantidadIncorrecta.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Cantidad incorrecta',
        text: 'La cantidad de servicios/promociones debe ser igual al total de mascotas asignadas',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }
    return true;
  };

  //====================FUNCIÓN_PARA_APLICAR_DESCUENTO====================
  const aplicarDescuento = () => {
    const inputDescuento = document.getElementById("input-descuento-manual");
    const valorDescuento = parseFloat(inputDescuento.value) || 0;

    if (valorDescuento < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El descuento no puede ser negativo',
        confirmButtonColor: '#3085d6'
      });
      inputDescuento.value = "";
      return;
    }

    if (valorDescuento > TOTAL_CON_AJUSTE) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El descuento no puede ser mayor al total de la factura',
        confirmButtonColor: '#3085d6'
      });
      inputDescuento.value = "";
      return;
    }

    setDescuentoManual(valorDescuento);
    inputDescuento.value = "";
  };

  //====================CÁLCULOS_DE_TOTALES====================

  //====================CÁLCULOS_DE_TOTALES====================

  const TOTAL_AJUSTE = items.reduce(
    (sum, it) => sum + (parseFloat(it.ajuste) || 0),
    0
  );

  const DESCUENTO = Math.max(0, parseInt(descuentoValor, 10) || 0);

  let subtotal_exento_total = 0;
  let subtotal_gravado_con_isv = 0; // Total de items gravados (precio con ISV incluido)

  items.forEach((it) => {
    const cantidad = parseFloat(it.cantidad) || 0;
    const precio = parseFloat(it.precio) || 0;
    const tiene_impuesto = it.tiene_impuesto || false;

    const total_linea = cantidad * precio;

    if (tiene_impuesto) {
      //EL PRECIO YA INCLUYE EL ISV (ej: 115 ya tiene el 15% incluido)
      subtotal_gravado_con_isv += total_linea;
    } else {
      subtotal_exento_total += total_linea;
    }
  });

  const SUBTOTAL_EXENTO = subtotal_exento_total;
  // Para items gravados: extraer la base sin ISV para mostrar en desglose
  const SUBTOTAL_GRAVADO = subtotal_gravado_con_isv / 1.15; //BASE SIN ISV
  const IMPUESTO = SUBTOTAL_GRAVADO * 0.15; //15% DE LA BASE

  // El TOTAL ya no suma el impuesto porque ya está incluido en subtotal_gravado_con_isv
  const TOTAL_FINAL = Math.max(
    0,
    SUBTOTAL_EXENTO + subtotal_gravado_con_isv + TOTAL_AJUSTE - DESCUENTO
  );

  const SALDO = TOTAL_FINAL;

  //====================FUNCIÓN PARA GUARDAR FACTURA SIN ABRIR PAGOS====================
  const handleGuardarFacturaSinPago = async () => {
    // VALIDACIONES
    if (items.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Factura vacía',
        text: 'Debes agregar al menos un item a la factura',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const itemsInvalidos = items.filter(
      (item) => !item.item || item.item === ""
    );
    if (itemsInvalidos.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Items incompletos',
        text: 'Todos los items deben tener un producto o servicio seleccionado',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const itemsSinEstilista = items.filter((item) => {
      const tipo = safeTipo(item.tipo);
      const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
      const estilistas = item.estilistas || [];
      return requiereEstilista && estilistas.length === 0;
    });

    if (itemsSinEstilista.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Estilistas requeridos',
        text: 'Los servicios y promociones deben tener al menos un estilista asignado',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setLoading(true);

    const datosFactura = {
      RTN: RTN || null,
      id_cliente: id_cliente || null,
      descuento: DESCUENTO,
      items: items.map((item) => ({
        tipo: item.tipo,
        item: item.item,
        cantidad: parseFloat(item.cantidad) || 1,
        ajuste: parseFloat(item.ajuste) || 0,
        estilistas: (item.estilistas || []).map((est) => ({
          estilistaId: est.estilistaId,
          cantidadMascotas: parseInt(est.cantidadMascotas) || 0,
        })),
      })),
    };

    try {
      const response = await crearFacturaConPago(datosFactura);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "¡Factura registrada!",
          text: `${response.data.numero_factura} guardada exitosamente!`,
          confirmButtonColor: "#3085d6",
        }).then(() => {
          onCancel();
        });
      }
    } catch (error) {
      console.error("Error al crear factura:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error?.response?.data?.mensaje || 'Error inesperado al crear la factura',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  //====================FUNCIÓN PARA CREAR FACTURA Y ABRIR MODAL DE PAGOS====================
  //====================FUNCIÓN PARA VALIDAR Y ABRIR MODAL DE PAGOS====================
const handleOpenPaymentModal = async () => {
  // VALIDACIONES
  if (items.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Factura vacía',
      text: 'Debes agregar al menos un item a la factura',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  // Validar que la cantidad coincida con el total de mascotas
  if (!validarCantidadVsMascotas()) {
    return;
  }

  const itemsInvalidos = items.filter(
    (item) => !item.item || item.item === ""
  );
  if (itemsInvalidos.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Items incompletos',
      text: 'Todos los items deben tener un producto o servicio seleccionado',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  const itemsSinEstilista = items.filter((item) => {
    const tipo = safeTipo(item.tipo);
    const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
    const estilistas = item.estilistas || [];
    return requiereEstilista && estilistas.length === 0;
  });

  if (itemsSinEstilista.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Estilistas requeridos',
      text: 'Los servicios y promociones deben tener al menos un estilista asignado',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  // ⭐ NUEVO: VALIDAR DISPONIBILIDAD ANTES DE ABRIR EL MODAL
  setLoading(true);
  try {
    const itemsParaValidar = items.map((item) => ({
      tipo: item.tipo,
      item: item.item,
      cantidad: parseFloat(item.cantidad) || 1,
      estilistas: (item.estilistas || []).map((est) => ({
        estilistaId: est.estilistaId,
        cantidadMascotas: parseInt(est.cantidadMascotas) || 0,
      })),
    }));

    const responseValidacion = await validarDisponibilidad(itemsParaValidar);

    if (!responseValidacion.success) {
      // Mostrar errores de disponibilidad
      const erroresHTML = responseValidacion.errores.join('<br>');
      await Swal.fire({
        icon: 'error',
        title: 'Items no disponibles',
        html: erroresHTML,
        confirmButtonColor: '#d33'
      });
      return;
    }

    // ✅ TODO DISPONIBLE - PREPARAR DATOS PARA EL MODAL
    const datos = {
      numero_factura: null, // Aún no se crea
      subtotal: (SUBTOTAL_EXENTO + SUBTOTAL_GRAVADO).toFixed(2),
      descuento: DESCUENTO.toFixed(2),
      impuesto: IMPUESTO.toFixed(2),
      total: TOTAL_FINAL.toFixed(2),
      saldo: SALDO.toFixed(2),
      // ⭐ GUARDAR LOS ITEMS PARA CREAR LA FACTURA DESPUÉS
      datosFactura: {
        RTN: RTN || null,
        id_cliente: id_cliente || null,
        descuento: DESCUENTO,
        items: items.map((item) => ({
          tipo: item.tipo,
          item: item.item,
          cantidad: parseFloat(item.cantidad) || 1,
          ajuste: parseFloat(item.ajuste) || 0,
          estilistas: (item.estilistas || []).map((est) => ({
            estilistaId: est.estilistaId,
            cantidadMascotas: parseInt(est.cantidadMascotas) || 0,
          })),
        })),
      }
    };

    setPaymentData(datos);
    setShowPaymentModal(true);

  } catch (error) {
    console.error('Error al validar disponibilidad:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error de validación',
      text: error?.response?.data?.mensaje || error.message || 'Error inesperado',
      confirmButtonColor: '#d33'
    });
  } finally {
    setLoading(false);
  }
};

  //====================CIERRE_DEL_MODAL====================
//====================CIERRE_DEL_MODAL====================
const handleClosePaymentModal = async () => {
  const result = await Swal.fire({
    icon: 'warning',
    title: '¿Cerrar sin pagar?',
    text: 'Se perderán los datos de la factura si cierras sin pagar.',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, continuar con el pago',
    heightAuto: false,
    didOpen: () => {
      const swalContainer = document.querySelector('.swal2-container');
      if (swalContainer) {
        swalContainer.style.zIndex = '99999';
      }
    }
  });

  if (result.isConfirmed) {
    // ⭐ CERRAR SIN BORRAR NADA (la factura nunca se creó)
    setShowPaymentModal(false);
    setPaymentData(null);

    await Swal.fire({
      icon: 'info',
      title: 'Facturación cancelada',
      text: 'Puedes continuar editando o cancelar completamente.',
      confirmButtonColor: '#3085d6',
      heightAuto: false
    });
  }
};


const handlePaymentSuccess = async (datosPago) => {
  try {
    console.log("🔷 Creando factura con pago...");
    console.log("📦 Datos de pago recibidos:", datosPago);

    // ⭐ ENVIAR ARRAY COMPLETO DE MÉTODOS DE PAGO
    const datosCompletos = {
      ...paymentData.datosFactura,  // RTN, id_cliente, descuento, items
      metodos_pago: datosPago.metodos,  // Array completo: [{id_metodo_pago_fk, monto}, ...]
      id_tipo_pago: datosPago.id_tipo
    };

    console.log("📤 Enviando datos completos al backend:", JSON.stringify(datosCompletos, null, 2));

    const response = await crearFacturaConPago(datosCompletos);

    if (!response.success) {
      throw new Error(response.mensaje || 'Error al crear la factura');
    }

    const numeroFactura = response.data.numero_factura;
    const saldoPendiente = response.data?.saldo ?? 0;

    console.log(`✅ Factura ${numeroFactura} creada exitosamente`);

    // ⭐ CERRAR MODAL PRIMERO
    setShowPaymentModal(false);
    setPaymentData(null);

    if (saldoPendiente > 0) {
      // PAGO PARCIAL
      await Swal.fire({
        icon: "success",
        title: "Pago procesado",
        text: `Factura ${numeroFactura} creada con pago parcial.\nSaldo pendiente: L ${saldoPendiente.toFixed(2)}`,
        confirmButtonColor: "#3085d6",
        heightAuto: false
      });
    } else {
      // PAGO TOTAL
      if (setFacturaParaImprimir && numeroFactura) {
        setFacturaParaImprimir(numeroFactura);
      }

      await Swal.fire({
        icon: "success",
        title: "Pago completado",
        text: `Factura ${numeroFactura} creada y pagada completamente.`,
        confirmButtonColor: "#3085d6",
        heightAuto: false
      });
    }

    // ⭐ REDIRIGIR AL HISTORIAL DESPUÉS DEL SWAL
    if (setActiveTab) {
      console.log("🔀 Redirigiendo al historial de facturas...");
      setActiveTab("facturas");
    }

  } catch (error) {
    console.error("❌ Error al crear factura con pago:", error);
    setShowPaymentModal(false);
    setPaymentData(null);

    await Swal.fire({
      icon: 'error',
      title: 'Error al procesar',
      text: error?.response?.data?.mensaje || error.message || 'Error inesperado',
      confirmButtonColor: '#d33',
      heightAuto: false
    });
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
    const selectedItemData = currentItems.find(
      (i) => String(i[idKey]) === String(selectedId)
    );
    onItemChange(id, selectedId, selectedItemData, nameKey, priceKey);
  };

  //====================RENDER====================
  return (
    <div>
      <div
        className="space-y-6 p-4 mx-auto bg-white rounded-lg"
        style={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)" }}
      >
        {/*ENCABEZADO CON BOTÓN AGREGAR ITEM*/}
        <div
          className="flex justify-end items-center"
          style={{ marginBottom: "16px" }}
        >
          <div className="flex justify-end items-center mb-4">
            <button
              type="button"
              onClick={() => addItem({ cantidad: 0 })}
              className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition-colors flex items-center gap-2 font-semibold text-sm shadow-lg hover:shadow-xl"
              style={{ borderRadius: "12px" }}
            >
              <Plus size={18} />
              AGREGAR ITEM
            </button>
          </div>
        </div>

        {/*TABLA DE ITEMS*/}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            {/*ENCABEZADO DE LA TABLA*/}
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  className="text-center font-medium text-gray-700"
                  style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    fontSize: "14px",
                    width: "160px",
                  }}
                >
                  TIPO
                </th>
                <th
                  className="text-center font-medium text-gray-700"
                  style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    fontSize: "14px",
                    width: "288px",
                  }}
                >
                  ITEM
                </th>
                <th
                  className="text-center font-medium text-gray-700"
                  style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    fontSize: "14px",
                    width: "96px",
                  }}
                >
                  CANTIDAD
                </th>
                <th
                  className="text-center font-medium text-gray-700"
                  style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    fontSize: "14px",
                    width: "100px",
                  }}
                >
                  PRECIO UNITARIO
                </th>
                <th
                  className="text-center font-medium text-gray-700"
                  style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    fontSize: "14px",
                    width: "100px",
                  }}
                >
                  AJUSTE
                </th>
                <th
                  className="text-left font-medium text-gray-700"
                  style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    fontSize: "14px",
                    width: "112px",
                  }}
                >
                  TOTAL
                </th>
                <th
                  className="text-center"
                  style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    width: "48px",
                  }}
                ></th>
              </tr>
            </thead>
            {/*CUERPO DE LA TABLA*/}
            <tbody style={{ fontSize: "14px" }}>
              {items.map((item) => {
                const tipo = safeTipo(item.tipo);
                const currentItems = disponiblesItems[tipo] || [];
                const {
                  id: idKey,
                  name: nameKey,
                  price: priceKey,
                } = keyMap[tipo];
                const requiereEstilista =
                  tipo === "SERVICIOS" || tipo === "PROMOCIONES";
                const itemEstilistas = item.estilistas || [];

                return (
                  <React.Fragment key={item.id}>
                    {/*FILA PRINCIPAL DEL ITEM*/}
                    <tr className="border-b border-gray-100">
                      {/*COLUMNA TIPO*/}
                      <td style={{ paddingTop: "12px", paddingBottom: "12px" }}>
                        <Select
                          value={{ value: tipo, label: tipo }}
                          onChange={(selectedOption) =>
                            handleTipoChange(item.id, selectedOption.value)
                          }
                          options={Object.keys(disponiblesItems).map((t) => ({
                            value: t,
                            label: t,
                          }))}
                          isSearchable={false}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: "34px",
                              height: "34px",
                              fontSize: "14px",
                              borderColor: "#d1d5db",
                            }),
                            option: (base) => ({ ...base, fontSize: "14px" }),
                            singleValue: (base) => ({
                              ...base,
                              fontSize: "14px",
                            }),
                          }}
                        />
                      </td>
                      {/*COLUMNA ITEM CON BÚSQUEDA*/}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                        }}
                      >
                        <Select
                          value={(() => {
                            // Buscar el item seleccionado y mostrar el stock en el label
                            const selected = currentItems.find((availableItem) => String(availableItem[idKey]) === String(item.item));
                            if (selected) {
                              // Si tiene propiedad stock, mostrarlo
                              const stock = selected.stock !== undefined ? ` (${selected.stock})` : "";
                              return {
                                value: selected[idKey],
                                label: `${selected[nameKey]}${stock}`,
                              };
                            }
                            return null;
                          })()}
                          onChange={(selectedOption) => {
                            if (!selectedOption) {
                              onItemChange(
                                item.id,
                                "",
                                null,
                                nameKey,
                                priceKey
                              );
                              return;
                            }
                            const selectedItemData = currentItems.find(
                              (it) =>
                                String(it[idKey]) ===
                                String(selectedOption.value)
                            );
                            onItemChange(
                              item.id,
                              selectedOption.value,
                              selectedItemData,
                              nameKey,
                              priceKey
                            );
                          }}
                          options={currentItems.map((availableItem) => ({
                            value: availableItem[idKey],
                            label: `${availableItem[nameKey]}${availableItem.stock !== undefined ? ` (${availableItem.stock})` : ""}`,
                          }))}
                          isClearable
                          placeholder="Seleccionar..."
                          noOptionsMessage={() =>
                            "No se encontraron resultados"
                          }
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: "34px",
                              height: "34px",
                              fontSize: "14px",
                              borderColor: "#d1d5db",
                            }),
                            option: (base) => ({ ...base, fontSize: "14px" }),
                            singleValue: (base) => ({
                              ...base,
                              fontSize: "14px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontSize: "14px",
                            }),
                          }}
                        />
                      </td>
                      {/*COLUMNA CANTIDAD*/}
                      <td
                        className="text-center"
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                        }}
                      >
                        <input
                          type="number"
                          value={item.cantidad !== undefined ? item.cantidad : ""}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            // Permitir campo vacío temporalmente
                            if (inputValue === "") {
                              updateItem(item.id, "cantidad", "");
                              return;
                            }

                            const valor = parseFloat(inputValue);
                            if (isNaN(valor)) return;

                            let maxStock = null;
                            if (item.tipo === "PRODUCTOS") {
                              const selected = currentItems.find((availableItem) => String(availableItem[idKey]) === String(item.item));
                              maxStock = selected?.stock ?? null;
                            }

                            if (maxStock !== null && valor > maxStock) {
                              Swal.fire({
                                icon: "error",
                                title: "Stock insuficiente",
                                text: `Solo hay ${maxStock} unidades disponibles en stock.`,
                                confirmButtonColor: "#3085d6",
                              });
                              updateItem(item.id, "cantidad", maxStock);
                            } else {
                              updateItem(item.id, "cantidad", valor);
                            }
                          }}
                          onBlur={(e) => {
                            // Al perder el foco, si está vacío o es menor a 1, establecer 1
                            const valor = parseFloat(e.target.value);
                            if (isNaN(valor) || valor < 1) {
                              updateItem(item.id, "cantidad", 1);
                            }
                          }}
                          min="1"
                          className="w-full border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                          style={{ padding: "4px 8px", fontSize: "14px" }}
                        />

                      </td>
                      {/*COLUMNA PRECIO*/}
                      <td
                        className="text-right"
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                        }}
                      >
                        <input
                          type="number"
                          step="0.01"
                          value={Number(item.precio).toFixed(2)}
                          readOnly
                          className="w-full border border-gray-300 rounded bg-white text-gray-700 cursor-default focus:ring-0 text-right"
                          style={{ padding: "4px 8px", fontSize: "14px" }}
                        />
                      </td>
                      {/*COLUMNA AJUSTE*/}
                      <td
                        className="text-right"
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                        }}
                      >
                        <input
                          type="number"
                          step="0.01"
                          value={item.ajuste ?? 0}
                          onChange={(e) => {
                            const valor = parseFloat(e.target.value) || 0;
                            if (valor >= 0) {
                              updateItem(item.id, "ajuste", e.target.value);
                            } else {
                              updateItem(item.id, "ajuste", "0");
                            }
                          }}
                          min="0"
                          className="w-full border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                          style={{ padding: "4px 8px", fontSize: "14px" }}
                        />
                      </td>
                      {/*COLUMNA TOTAL LÍNEA*/}
                      <td
                        className="text-left"
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                        }}
                      >
                        <span
                          className="font-medium text-gray-800"
                          style={{ fontSize: "14px" }}
                        >
                          L {calculateLineTotal(item)}
                        </span>
                      </td>
                      {/*COLUMNA ELIMINAR*/}
                      <td
                        className="text-center"
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                        }}
                      >
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:bg-red-50 rounded-xl transition-colors inline-flex"
                          style={{ padding: "4px" }}
                          title="Eliminar item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>

                    {/*FILA ESTILISTAS*/}
                    {requiereEstilista && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan="7"
                          style={{
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            paddingLeft: "16px",
                            paddingRight: "16px",
                          }}
                        >
                          <div style={{ marginLeft: "16px" }}>
                            {itemEstilistas.map((est, index) => (
                              <div
                                key={est.id}
                                className="flex items-center"
                                style={{ gap: "16px", marginBottom: "8px" }}
                              >
                                <div
                                  className="flex items-center"
                                  style={{ gap: "8px" }}
                                >
                                  <label
                                    className="font-medium text-gray-600"
                                    style={{ fontSize: "14px" }}
                                  >
                                    Estilista:
                                  </label>
                                  <div style={{ width: "250px" }}>
                                    <Select
                                      value={
                                        estilistas
                                          .map((e) => ({
                                            value: e.id_estilista_pk,
                                            label: `${e.nombre_estilista} ${e.apellido_estilista}`,
                                          }))
                                          .find(
                                            (opt) =>
                                              opt.value === est.estilistaId
                                          ) || null
                                      }
                                      onChange={(selectedOption) =>
                                        updateEstilista(
                                          item.id,
                                          index,
                                          "estilistaId",
                                          selectedOption
                                            ? selectedOption.value
                                            : ""
                                        )
                                      }
                                      options={estilistas.map((e) => ({
                                        value: e.id_estilista_pk,
                                        label: `${e.nombre_estilista} ${e.apellido_estilista}`,
                                      }))}
                                      isClearable
                                      isSearchable={false}
                                      placeholder="Seleccionar..."
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      styles={{
                                        control: (base) => ({
                                          ...base,
                                          minHeight: "34px",
                                          height: "34px",
                                          fontSize: "14px",
                                          borderColor: "#d1d5db",
                                        }),
                                        option: (base) => ({
                                          ...base,
                                          fontSize: "14px",
                                        }),
                                        singleValue: (base) => ({
                                          ...base,
                                          fontSize: "14px",
                                          whiteSpace: "nowrap",
                                          overflow: "visible",
                                          textOverflow: "unset",
                                        }),
                                        placeholder: (base) => ({
                                          ...base,
                                          fontSize: "14px",
                                        }),
                                      }}
                                    />
                                  </div>
                                </div>
                                <div
                                  className="flex items-center"
                                  style={{ gap: "8px" }}
                                >
                                  <label
                                    className="font-medium text-gray-600"
                                    style={{ fontSize: "14px" }}
                                  >
                                    Cantidad Mascotas:
                                  </label>
                                  <input
                                    type="number"
                                    value={est.cantidadMascotas ?? ""}
                                    onChange={(e) => {
                                      const valor = e.target.value;
                                      updateEstilista(
                                        item.id,
                                        index,
                                        "cantidadMascotas",
                                        valor === "" ? "" : parseInt(valor, 10)
                                      );
                                    }}
                                    min="0"
                                    className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                    style={{
                                      width: "80px",
                                      padding: "4px 8px",
                                      fontSize: "14px",
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    removeEstilista(item.id, index)
                                  }
                                  className="text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                  style={{ padding: "4px" }}
                                  title="Eliminar estilista"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addEstilista(item.id)}
                              className="flex items-center text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              style={{
                                gap: "4px",
                                padding: "4px 12px",
                                fontSize: "14px",
                                marginTop: "8px",
                              }}
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
            <div
              className="text-center text-gray-500"
              style={{ paddingTop: "48px", paddingBottom: "48px" }}
            >
              No hay items agregados. Haz clic en "Agregar Item" para comenzar.
            </div>
          )}
        </div>

        {/*TOTALES Y BOTONES*/}
        {items.length > 0 && (
          <div
            className="flex justify-between items-center"
            style={{ gap: "24px", marginTop: "38px" }}
          >
            <div className="flex flex-1 justify-center" style={{ gap: "12px" }}>
              <button
                onClick={handleGuardarFacturaSinPago}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-6 py-2 rounded-full transition-colors font-semibold shadow-lg hover:shadow-xl`}
                style={{ borderRadius: "12px" }}
              >
                {loading ? "Guardando..." : "GUARDAR SIN PAGAR"}
              </button>
              <button
                onClick={handleOpenPaymentModal}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white px-6 py-2 rounded-full transition-colors font-semibold shadow-lg hover:shadow-xl`}
                style={{ borderRadius: "12px" }}
              >
                {loading ? "Guardando..." : "CONTINUAR CON PAGO"}
              </button>
              <button
                onClick={async () => {
                  if (items.length > 0 && items.some(item => item.item)) {
                    const result = await Swal.fire({
                      icon: 'warning',
                      title: '¿Cancelar factura?',
                      text: 'Se perderán todos los datos ingresados',
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                      confirmButtonText: 'Sí, cancelar',
                      cancelButtonText: 'No, continuar'
                    });
                    if (result.isConfirmed) {
                      onCancel();
                    }
                  } else {
                    onCancel();
                  }
                }}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors font-semibold shadow-lg hover:shadow-xl"
                style={{ borderRadius: "12px" }}
              >
                CANCELAR
              </button>
            </div>

            <div
              className="bg-gray-100 border border-gray-200 rounded-lg"
              style={{ padding: "16px 24px" }}
            >
              <div className="mb-3">
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <label
                    className="text-sm text-gray-700 font-medium"
                    style={{ width: 120 }}
                  >
                    Descuento (L):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={descuentoValor}
                    onChange={(e) => {
                      const nuevoDescuento = Number(e.target.value);
                      const subtotalSinDescuento = SUBTOTAL_EXENTO + subtotal_gravado_con_isv + TOTAL_AJUSTE;
                      const maxDescuento = subtotalSinDescuento * 0.5; // 50% del subtotal

                      if (nuevoDescuento < 0) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Valor inválido',
                          text: 'El descuento no puede ser negativo',
                          confirmButtonColor: '#3085d6'
                        });
                        return;
                      }

                      if (nuevoDescuento > maxDescuento) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Descuento excesivo',
                          text: `El descuento máximo permitido es el 50% del subtotal (L ${maxDescuento.toFixed(2)})`,
                          confirmButtonColor: '#3085d6'
                        });
                        return;
                      }

                      setDescuentoValor(nuevoDescuento);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm text-right"
                    style={{ width: 140 }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1" style={{ marginLeft: '128px' }}>
                  Máximo: 50% del subtotal
                </div>
              </div>

              <div className="ml-auto" style={{ maxWidth: "380px" }}>
                {/* Subtotal Exento */}
                {SUBTOTAL_EXENTO > 0 && (
                  <div
                    className="flex justify-between text-gray-700"
                    style={{ fontSize: "14px", marginBottom: "8px" }}
                  >
                    <span>Subtotal Exento:</span>
                    <span className="font-medium">
                      {formatCurrency(SUBTOTAL_EXENTO)}
                    </span>
                  </div>
                )}

                {/* Subtotal Gravado (sin ISV) */}
                {SUBTOTAL_GRAVADO > 0 && (
                  <div
                    className="flex justify-between text-gray-700"
                    style={{ fontSize: "14px", marginBottom: "8px" }}
                  >
                    <span>Subtotal Gravado:</span>
                    <span className="font-medium">
                      {formatCurrency(SUBTOTAL_GRAVADO)}
                    </span>
                  </div>
                )}

                {/* ISV 15% */}
                {IMPUESTO > 0 && (
                  <div
                    className="flex justify-between text-gray-700"
                    style={{ fontSize: "14px", marginBottom: "8px" }}
                  >
                    <span>ISV (15%):</span>
                    <span className="font-medium">
                      {formatCurrency(IMPUESTO)}
                    </span>
                  </div>
                )}

                {/* Descuento */}
                {DESCUENTO > 0 && (
                  <div
                    className="flex justify-between text-green-600"
                    style={{ fontSize: "14px", marginBottom: "8px" }}
                  >
                    <span>Descuento:</span>
                    <span className="font-medium">
                      {formatCurrency(DESCUENTO)}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div
                  className="flex justify-between font-bold text-gray-900 border-t-2 border-gray-300"
                  style={{
                    fontSize: "18px",
                    paddingTop: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span>TOTAL:</span>
                  <span>{formatCurrency(TOTAL_FINAL)}</span>
                </div>

                {/* Saldo Pendiente */}
                <div
                  className="flex justify-between font-semibold text-gray-900"
                  style={{ fontSize: "17px", paddingTop: "8px" }}
                >
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
        total={parseFloat(paymentData?.total) || 0}
        onClose={handleClosePaymentModal}
        onPagoConfirmado={handlePaymentSuccess}
        factura={paymentData}
      />

    </div>
  );
};

export default DetallesFactura;
