// NuevaFactura.jsx
import React, { useState, useEffect } from "react";
import EncabezadoFactura from "./EncabezadoFactura";
import DetallesFactura from "./DetallesFactura";
import { obtenerDetallesFactura, obtenerUsuarioFactura, obtenerEstilistasFactura } from "../../../AXIOS.SERVICES/factura-axios";

const NuevaFactura = () => {
  //====================ESTADOS_DEL_CLIENTE====================
  const [identidad, setIdentidad] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [RTN, setRTN] = useState("");

  //====================ESTADOS_VENDEDOR_SUCURSAL====================
  const [vendedor, setVendedor] = useState("");
  const [sucursal, setSucursal] = useState("");

  //====================ESTADOS_DETALLES_FACTURA====================
  const [items, setItems] = useState([
    {
      id: Date.now(),
      tipo: "PRODUCTOS",
      item: "",
      nombre: "",
      cantidad: "1",
      precio: "0.00",
      ajuste: "0.00",
      estilistas: [],
    },
  ]);

  //====================ESTADOS_CATÁLOGOS====================
  const [disponiblesItems, setDisponiblesItems] = useState({
    PRODUCTOS: [],
    SERVICIOS: [],
    PROMOCIONES: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  //====================ESTADOS_ESTILISTAS====================
  const [estilistas, setEstilistas] = useState([]);

  //====================FUNCIONES_AUXILIARES====================

  //CARGA LOS ITEMS DISPONIBLES SEGÚN EL TIPO PRODUCTOS SERVICIOS PROMOCIONES
  const buscarItemTipo = async (tipo) => {
    setIsLoading(true);
    try {
      const response = await obtenerDetallesFactura(tipo);
      if (response?.success && response?.data) {
        setDisponiblesItems((prev) => ({ ...prev, [tipo]: response.data }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  //CARGA LOS ESTILISTAS DISPONIBLES
  const cargarEstilistas = async () => {
    try {
      const response = await obtenerEstilistasFactura();
      if (response?.success && response?.data) {
        setEstilistas(response.data);
      }
    } catch (error) {
      console.error("Error al cargar estilistas:", error);
    }
  };

  //CALCULA EL TOTAL DE UNA LÍNEA CANTIDAD × PRECIO + AJUSTE
  const calculateLineTotal = (item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const precio = parseFloat(item.precio) || 0;
    const ajuste = parseFloat(item.ajuste) || 0;
    return (cantidad * precio + ajuste).toFixed(2);
  };

  //CALCULA EL TOTAL GENERAL DE LA FACTURA
  const calculateTotal = () => {
    return items
      .reduce((sum, it) => sum + parseFloat(calculateLineTotal(it)), 0)
      .toFixed(2);
  };

  //====================MANEJADORES_DE_ITEMS====================

  //AGREGA UN NUEVO ITEM A LA FACTURA
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        tipo: prev.length ? prev[prev.length - 1].tipo : "PRODUCTOS",
        item: "",
        nombre: "",
        cantidad: "1",
        precio: "0.00",
        ajuste: "0.00",
        estilistas: [],
      },
    ]);
  };

  //ELIMINA UN ITEM DE LA FACTURA
  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  //ACTUALIZA UN CAMPO ESPECÍFICO DE UN ITEM
  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  //MANEJA EL CAMBIO DE TIPO DE ITEM PRODUCTOS SERVICIOS PROMOCIONES
  const handleItemTypeChange = (id, nuevoTipo) => {
    if ((disponiblesItems[nuevoTipo] || []).length === 0) {
      buscarItemTipo(nuevoTipo);
    }
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              tipo: nuevoTipo,
              item: "",
              nombre: "",
              precio: "0.00",
              cantidad: "1",
              ajuste: "0.00",
              estilistas: [],
            }
          : it
      )
    );
  };

  //MANEJA LA SELECCIÓN DE UN ITEM ESPECÍFICO
  const handleItemChange = (
    id,
    selectedId,
    selectedItemData,
    nameKey,
    priceKey
  ) => {
    const newName = selectedItemData ? selectedItemData[nameKey] ?? "" : "";
    const newPrice = selectedItemData
      ? String(selectedItemData[priceKey] ?? "0.00")
      : "0.00";
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, item: selectedId, nombre: newName, precio: newPrice }
          : it
      )
    );
  };

  //CANCELA LA FACTURA Y REINICIA TODOS LOS CAMPOS
  const handleCancel = () => {
    if (
      window.confirm(
        "¿Estás seguro de cancelar esta factura? Se perderán todos los datos."
      )
    ) {
      //REINICIAR DETALLES
      setItems([
        {
          id: Date.now(),
          tipo: "PRODUCTOS",
          item: "",
          nombre: "",
          cantidad: "1",
          precio: "0.00",
          ajuste: "0.00",
          estilistas: [],
        },
      ]);

      //REINICIAR ENCABEZADO
      setIdentidad("");
      setNombreCliente("");
      setRTN("");
    }
  };

  //====================EFFECTS====================

  //CARGA DATOS DEL USUARIO SUCURSAL ESTILISTAS Y CATÁLOGOS AL MONTAR EL COMPONENTE
  useEffect(() => {
    const cargarDatosIniciales = async () => {

      //LLAMAR AL SERVICIO AXIOS PARA OBTENER USUARIO Y SUCURSAL
      const responseUsuario = await obtenerUsuarioFactura();

      //SI LA RESPUESTA ES EXITOSA ACTUALIZAR LOS ESTADOS
      if (responseUsuario?.success && responseUsuario?.data) {
        setVendedor(responseUsuario.data.usuario);
        setSucursal(responseUsuario.data.nombre_sucursal);
      }

      //CARGAR ESTILISTAS
      console.log("🔍 Cargando estilistas...");
      const responseEstilistas = await obtenerEstilistasFactura();
      console.log("📦 Respuesta estilistas:", responseEstilistas);

      if (responseEstilistas?.success && responseEstilistas?.data) {
        console.log("✅ Estilistas cargados:", responseEstilistas.data);
        setEstilistas(responseEstilistas.data);
      }

      //CARGAR CATÁLOGOS DE PRODUCTOS SERVICIOS Y PROMOCIONES
      buscarItemTipo("PRODUCTOS");
      buscarItemTipo("SERVICIOS");
      buscarItemTipo("PROMOCIONES");
    };

    cargarDatosIniciales();
  }, []);

  //====================RENDER====================
  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto bg-white shadow-xl rounded-lg">

      {/*SECCIÓN ENCABEZADO*/}
      <div className="border-dashed rounded-lg bg-blue-50">
        <EncabezadoFactura
          identidad={identidad}
          setIdentidad={setIdentidad}
          nombreCliente={nombreCliente}
          setNombreCliente={setNombreCliente}
          RTN={RTN}
          setRTN={setRTN}
          vendedor={vendedor}
          sucursal={sucursal}
        />
      </div>

      {/*SECCIÓN DETALLES*/}
      <div className="border-dashed border-green-300 rounded-lg bg-green-50">
        <DetallesFactura
          items={items}
          addItem={addItem}
          removeItem={removeItem}
          updateItem={updateItem}
          calculateTotal={calculateTotal}
          calculateLineTotal={calculateLineTotal}
          disponiblesItems={disponiblesItems}
          onItemTypeChange={handleItemTypeChange}
          onItemChange={handleItemChange}
          estilistas={estilistas}
          onCancel={handleCancel}
        />

        {/*INDICADOR DE CARGA CATÁLOGOS*/}
        {isLoading && (
          <div className="mt-2 text-xs text-gray-500">Cargando catálogos…</div>
        )}
      </div>
    </div>
  );
};

export default NuevaFactura;
