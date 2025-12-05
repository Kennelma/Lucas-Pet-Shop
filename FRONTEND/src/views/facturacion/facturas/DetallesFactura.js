import React, { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import Select from "react-select";
import Swal from "sweetalert2";
import ModalPago from "../pagos/ModalPago";
import { crearFacturaConPago, crearFacturaSinPago, validarDisponibilidad } from "../../../AXIOS.SERVICES/factura-axios";

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
  nombreCliente,
  setActiveTab,
  setFacturaParaImprimir,
  caiActivo = true,
}) => {

  //====================ESTADOS====================
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [descuentoValor, setDescuentoValor] = useState(0);
  const [intentoFacturar, setIntentoFacturar] = useState(false);
  const [itemsConError, setItemsConError] = useState([]);

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
      const detallesItems = itemsConCantidadIncorrecta.map((item) => {
        const lineaNum = items.indexOf(item) + 1;
        const totalMascotas = (item.estilistas || []).reduce((sum, est) => sum + (Number(est.cantidadMascotas) || 0), 0);
        return `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px;">
          <span style="font-weight: 600;">Línea ${lineaNum}:</span>
          <span>Cantidad: <span style="color: #dc2626; font-weight: 700;">${item.cantidad}</span></span>
          <span>vs</span>
          <span>Mascotas: <span style="color: #16a34a; font-weight: 700;">${totalMascotas}</span></span>
        </div>`;
      }).join('');

      Swal.fire({
        icon: 'error',
        title: 'Cantidad incorrecta',
        html: `
          <p style="margin-bottom: 12px; font-size: 14px;">La cantidad debe coincidir con el total de mascotas:</p>
          <div style="background-color: #f9fafb; padding: 12px; border-radius: 8px;">
            ${detallesItems}
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">Ajusta la cantidad o el número de mascotas por estilista</p>
        `,
        confirmButtonColor: '#3085d6',
        width: '420px'
      });
      return false;
    }
    return true;
  };

  //====================FUNCIÓN_PARA_APLICAR_DESCUENTO====================
  //NOTA: Esta función no se usa actualmente pero se mantiene para futuras implementaciones
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

    if (valorDescuento > TOTAL_FINAL) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El descuento no puede ser mayor al total de la factura',
        confirmButtonColor: '#3085d6'
      });
      inputDescuento.value = "";
      return;
    }

    setDescuentoValor(valorDescuento);
    inputDescuento.value = "";
  };

  //====================CÁLCULOS_DE_TOTALES====================
  //SE CALCULAN SUBTOTALES, IMPUESTOS Y TOTAL FINAL DE LA FACTURA

  //====================CÁLCULOS_DE_TOTALES====================
  //SE CALCULAN SUBTOTALES, IMPUESTOS Y TOTAL FINAL DE LA FACTURA

  //TOTAL DE AJUSTES APLICADOS A LOS ITEMS
  const TOTAL_AJUSTE = items.reduce(
    (sum, it) => sum + (parseFloat(it.ajuste) || 0),
    0
  );

  //DESCUENTO GENERAL DE LA FACTURA
  const DESCUENTO = Math.max(0, parseInt(descuentoValor, 10) || 0);

  //VARIABLES PARA ACUMULAR SUBTOTALES
  let subtotal_exento_total = 0;
  let subtotal_gravado_con_isv = 0;

  //RECORRER CADA ITEM PARA CALCULAR SUBTOTALES SEGÚN TIPO DE IMPUESTO
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
  //EXTRAER BASE GRAVABLE SIN ISV (para desglose en factura)
  const SUBTOTAL_GRAVADO = subtotal_gravado_con_isv / 1.15;
  const IMPUESTO = SUBTOTAL_GRAVADO * 0.15;

  //TOTAL FINAL (el impuesto ya está incluido en subtotal_gravado_con_isv)
  const TOTAL_FINAL = Math.max(
    0,
    SUBTOTAL_EXENTO + subtotal_gravado_con_isv + TOTAL_AJUSTE - DESCUENTO
  );

  const SALDO = TOTAL_FINAL;

  //====================GUARDAR_FACTURA_SIN_PAGO====================
  //CREA UNA FACTURA CON ESTADO PENDIENTE (sin aplicar pago)
  //====================GUARDAR_FACTURA_SIN_PAGO====================
  //CREA UNA FACTURA CON ESTADO PENDIENTE (sin aplicar pago)
  const handleGuardarFacturaSinPago = async () => {
    //MARCAR QUE SE INTENTÓ FACTURAR (activa el marcado en rojo)
    setIntentoFacturar(true);

    //VALIDAR QUE HAYA AL MENOS UN ITEM
    if (items.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Factura vacía',
        text: 'Debes agregar al menos un item a la factura',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    //VALIDAR SILENCIOSAMENTE - SIN ALERTAS (YA ESTÁN EN ROJO)
    const itemsInvalidos = items.filter(
      (item) => !item.item || item.item === ""
    );
    if (itemsInvalidos.length > 0) {
      return; // Simplemente no permitir facturar
    }

    const itemsSinEstilista = items.filter((item) => {
      const tipo = safeTipo(item.tipo);
      const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
      const estilistas = item.estilistas || [];
      return requiereEstilista && estilistas.length === 0;
    });

    if (itemsSinEstilista.length > 0) {
      return; // Simplemente no permitir facturar
    }

    setLoading(true);

    //PREPARAR DATOS PARA ENVIAR AL BACKEND
    const datosFactura = {
      RTN: RTN || null,
      id_cliente: id_cliente || null,
      nombre_cliente_temporal: (!id_cliente && nombreCliente) ? nombreCliente : null,
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
      const response = await crearFacturaSinPago(datosFactura);

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Factura registrada!",
          text: `${response.data.numero_factura} guardada sin pago.`,
          confirmButtonColor: "#3085d6",
        });
        onCancel();
      } else {
        throw new Error(response.mensaje || 'Error al crear la factura');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error?.response?.data?.mensaje || error.message || 'Error inesperado',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };


  //VALIDA DISPONIBILIDAD Y ABRE EL MODAL PARA SELECCIONAR MÉTODOS DE PAGO
  const handleOpenPaymentModal = async () => {
    //MARCAR QUE SE INTENTÓ FACTURAR (activa el marcado en rojo)
    setIntentoFacturar(true);

    //VALIDAR QUE HAYA AL MENOS UN ITEM
    if (items.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Factura vacía',
        text: 'Debes agregar al menos un item a la factura',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    //VALIDAR CANTIDAD DE SERVICIOS/PROMOCIONES VS MASCOTAS ASIGNADAS
    if (!validarCantidadVsMascotas()) {
      return;
    }

    //VALIDAR SILENCIOSAMENTE - SIN ALERTAS (YA ESTÁN EN ROJO)
    const itemsInvalidos = items.filter(
      (item) => !item.item || item.item === ""
    );
    if (itemsInvalidos.length > 0) {
      return; // Simplemente no permitir facturar
    }

    const itemsSinEstilista = items.filter((item) => {
      const tipo = safeTipo(item.tipo);
      const requiereEstilista = tipo === "SERVICIOS" || tipo === "PROMOCIONES";
      const estilistas = item.estilistas || [];
      return requiereEstilista && estilistas.length === 0;
    });

    if (itemsSinEstilista.length > 0) {
      return; // Simplemente no permitir facturar
    }

    //VALIDAR DISPONIBILIDAD DE ITEMS ANTES DE ABRIR MODAL

    //VALIDAR DISPONIBILIDAD DE ITEMS ANTES DE ABRIR MODAL
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
        const erroresHTML = responseValidacion.errores.join('<br>');
        await Swal.fire({
          icon: 'error',
          title: 'Items no disponibles',
          html: erroresHTML,
          confirmButtonColor: '#d33'
        });
        return;
      }

      //PREPARAR DATOS PARA EL MODAL (la factura aún no se crea)
      const datos = {
        numero_factura: null,
        subtotal: (SUBTOTAL_EXENTO + SUBTOTAL_GRAVADO).toFixed(2),
        descuento: DESCUENTO.toFixed(2),
        impuesto: IMPUESTO.toFixed(2),
        total: TOTAL_FINAL.toFixed(2),
        saldo: SALDO.toFixed(2),
        datosFactura: {
          RTN: RTN || null,
          id_cliente: id_cliente || null,
          nombre_cliente_temporal: (!id_cliente && nombreCliente) ? nombreCliente : null,
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

  //====================CERRAR_MODAL_DE_PAGOS====================
  //====================CERRAR_MODAL_DE_PAGOS====================
  //CIERRA EL MODAL SIN CREAR LA FACTURA (aún no se había creado nada)
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

  //====================PROCESAR_PAGO_Y_CREAR_FACTURA====================
  //CREA LA FACTURA CON LOS MÉTODOS DE PAGO SELECCIONADOS (uno o múltiples)
  const handlePaymentSuccess = async (datosPago) => {
    try {
      //COMBINAR DATOS DE FACTURA + MÉTODOS DE PAGO
      const datosCompletos = {
        ...paymentData.datosFactura,
        metodos_pago: datosPago.metodos,
        id_tipo_pago: datosPago.id_tipo
      };

      const response = await crearFacturaConPago(datosCompletos);

      if (!response.success) {
        throw new Error(response.mensaje || 'Error al crear la factura');
      }

      const numeroFactura = response.data.numero_factura;
      let saldoPendiente = response.data?.saldo ?? 0;
      // Asegura que saldoPendiente sea un número válido
      saldoPendiente = Number(saldoPendiente) || 0;

      //CERRAR MODAL
      setShowPaymentModal(false);
      setPaymentData(null);

      if (saldoPendiente > 0) {
        //PAGO PARCIAL
        await Swal.fire({
          icon: "success",
          title: "Pago procesado",
          text: `Factura ${numeroFactura} creada con pago parcial.\nSaldo pendiente: L ${saldoPendiente.toFixed(2)}`,
          confirmButtonColor: "#3085d6",
          heightAuto: false
        });
      } else {
        //PAGO TOTAL - GUARDAR PARA IMPRIMIR
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

      //REDIRIGIR AL HISTORIAL
      if (setActiveTab) {
        setActiveTab("facturas");
      }

    } catch (error) {
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
  };  const handleItemSelect = (id, selectedId, tipoRaw) => {
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
        className="space-y-4 sm:space-y-6 p-3 sm:p-4 w-full bg-white rounded-lg"
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
                            control: (base, state) => ({
                              ...base,
                              minHeight: "34px",
                              height: "34px",
                              fontSize: "14px",
                              borderColor: (intentoFacturar && (!item.item || item.item === "")) ? "#ef4444" : "#d1d5db",
                              borderWidth: (intentoFacturar && (!item.item || item.item === "")) ? "2px" : "1px",
                              backgroundColor: (intentoFacturar && (!item.item || item.item === "")) ? "#fef2f2" : base.backgroundColor,
                              "&:hover": {
                                borderColor: (intentoFacturar && (!item.item || item.item === "")) ? "#ef4444" : "#d1d5db",
                              }
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
                              color: (intentoFacturar && (!item.item || item.item === "")) ? "#ef4444" : base.color,
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
                                          borderColor: (intentoFacturar && !est.estilistaId) ? "#ef4444" : "#d1d5db",
                                          borderWidth: (intentoFacturar && !est.estilistaId) ? "2px" : "1px",
                                          backgroundColor: (intentoFacturar && !est.estilistaId) ? "#fef2f2" : "white",
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
                                          color: (intentoFacturar && !est.estilistaId) ? "#ef4444" : "#9ca3af",
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
                                    className="border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                    style={{
                                      width: "80px",
                                      padding: "4px 8px",
                                      fontSize: "14px",
                                      borderColor: (intentoFacturar && (!est.cantidadMascotas || est.cantidadMascotas === "")) ? "#ef4444" : "#d1d5db",
                                      borderWidth: (intentoFacturar && (!est.cantidadMascotas || est.cantidadMascotas === "")) ? "2px" : "1px",
                                      backgroundColor: (intentoFacturar && (!est.cantidadMascotas || est.cantidadMascotas === "")) ? "#fef2f2" : "white",
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
            className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 lg:gap-6 mt-8 lg:mt-10"
          >
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <button
                onClick={handleGuardarFacturaSinPago}
                disabled={loading || !caiActivo}
                className={`flex-1 px-3 sm:px-6 py-2 rounded-full transition-colors font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl whitespace-nowrap ${(loading || !caiActivo) ? "bg-gray-400 cursor-not-allowed text-white opacity-80" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
              >
                {loading ? "Guardando..." : "GUARDAR SIN PAGO"}
              </button>
              <button
                onClick={handleOpenPaymentModal}
                disabled={loading || !caiActivo}
                className={`flex-1 px-3 sm:px-6 py-2 rounded-full transition-colors font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl whitespace-nowrap ${(loading || !caiActivo) ? "bg-gray-400 cursor-not-allowed text-white opacity-80" : "bg-green-500 hover:bg-green-600 text-white"}`}
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
                disabled={loading || !caiActivo}
                className={`flex-1 px-3 sm:px-6 py-2 rounded-full transition-colors font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl whitespace-nowrap text-white ${loading || !caiActivo ? 'cursor-not-allowed bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
              >
                CANCELAR
              </button>
            </div>

            <div
              className="bg-gray-100 border border-gray-200 rounded-lg p-4 sm:p-6 w-full lg:w-auto"
            >
              <div className="mb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label
                    className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap"
                  >
                    Descuento (L):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={descuentoValor || ""}
                    onChange={(e) => setDescuentoValor(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm text-right w-full sm:w-32"
                  />
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