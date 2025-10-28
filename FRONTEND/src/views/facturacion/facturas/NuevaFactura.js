// NuevaFactura.jsx
import React, { useState, useEffect } from "react";
import EncabezadoFactura from "./EncabezadoFactura";
import DetallesFactura from "./DetallesFactura";
import { obtenerDetallesFactura } from "../../../AXIOS.SERVICES/factura-axios";

import { buscarClientePorIdentidad } from "../../../AXIOS.SERVICES/factura-axios";

const limpiaIdentidad = (s = "") => s.replace(/[^\d]/g, "");
const identidadEsValida = (s = "") => limpiaIdentidad(s).length === 13;

const NuevaFactura = () => {
  // Encabezado
  const [RTN, setRTN] = useState("");
  const [vendedor] = useState("");
  const [sucursal] = useState("");
  const [identidad, setIdentidad] = useState("");

  const [buscando, setBuscando] = useState(false);
  const [errorBuscar, setErrorBuscar] = useState("");

  //DETALLES DE FACTURA
  const [items, setItems] = useState([
    {
      id: Date.now(),
      tipo: "PRODUCTOS",
      item: "",
      nombre: "",
      cantidad: "1",
      precio: "0.00",
      ajuste: "0.00",
    },
  ]);

  //TODOS LOS ITEMS DE ESE ARRAY
  const [disponiblesItems, setDisponiblesItems] = useState({
    PRODUCTOS: [],
    SERVICIOS: [],
    PROMOCIONES: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  //CATALOGOS DE ESOS ITEMS
  const buscarItemTipo = async (tipo) => {
    setIsLoading(true);
    try {
      const response = await obtenerDetallesFactura(tipo);
      if (response.success && response.data) {
        setDisponiblesItems((prev) => ({ ...prev, [tipo]: response.data }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarItemTipo("PRODUCTOS");
    buscarItemTipo("SERVICIOS");
    buscarItemTipo("PROMOCIONES");
  }, []);

  //BUSQUEDA POR CLIENTE
  const onBuscarCliente = async (identidadInput) => {
    const id13 = limpiaIdentidad(identidadInput);
    if (!identidadEsValida(id13)) {
      setErrorBuscar("Ingrese una identidad válida (13 dígitos).");
      return;
    }

    try {
      setBuscando(true);
      setErrorBuscar("");

      const resp = await buscarClientePorIdentidad(id13);
      // Tu servicio retorna { success, mensaje, data? }
      if (resp?.success && Array.isArray(resp.data) && resp.data.length > 0) {
        const cliente = resp.data[0];

        setRTN(cliente.rtn_cliente || "");
      } else {
        setErrorBuscar(resp?.mensaje || "Cliente no encontrado.");
        const agregar = window.confirm(
          "Cliente no encontrado. ¿Deseas agregarlo?"
        );
        if (agregar) {
          // abrir modal de agregar cliente (impleméntalo a tu gusto)
          // openModalAgregarCliente({ identidad: id13 });
        } else {
          // usar un valor por defecto si quieres
          setRTN("0000-0000-000000");
        }
      }
    } catch {
      setErrorBuscar("Error al buscar cliente. Intente de nuevo.");
    } finally {
      setBuscando(false);
    }
  };

  //CALCULOS MATEMATICOS DE LA FACTURA
  const calculateLineTotal = (item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const precio = parseFloat(item.precio) || 0;
    const ajuste = parseFloat(item.ajuste) || 0;
    return (cantidad * precio + ajuste).toFixed(2);
  };

  //CALCULO TOTAL DE TODAS LAS LINEAS
  const calculateTotal = () => {
    return items
      .reduce((sum, it) => sum + parseFloat(calculateLineTotal(it)), 0)
      .toFixed(2);
  };

  //FILAS
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
      },
    ]);
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleItemTypeChange = (id, nuevoTipo) => {
    if ((disponiblesItems[nuevoTipo] || []).length === 0)
      buscarItemTipo(nuevoTipo);
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
            }
          : it
      )
    );
  };

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

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto bg-white shadow-xl rounded-lg">
      {/* ENCABEZADO */}
      <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg bg-blue-50">
        <p className="text-blue-700 font-semibold mb-2">
          CONTENEDOR DE ENCABEZADO
        </p>
        <EncabezadoFactura
          RTN={RTN}
          setRTN={setRTN}
          vendedor={vendedor}
          identidad={identidad}
          setIdentidad={setIdentidad}
          onBuscarCliente={onBuscarCliente}
          sucursal={sucursal}
          buscando={buscando}
          errorMsg={errorBuscar}
        />
      </div>

      {/* DETALLES */}
      <div className="border-2 border-dashed border-green-300 p-4 rounded-lg bg-green-50">
        <p className="text-green-700 font-semibold mb-2">
          CONTENEDOR DE DETALLES
        </p>
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
        />
        {isLoading && (
          <div className="mt-2 text-xs text-gray-500">Cargando catálogos…</div>
        )}
      </div>
    </div>
  );
};

export default NuevaFactura;
