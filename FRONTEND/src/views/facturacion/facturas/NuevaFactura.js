// NuevaFactura.jsx
import React, { useState, useEffect } from "react";
import EncabezadoFactura from "./EncabezadoFactura";
import DetallesFactura from "./DetallesFactura";
import { obtenerDetallesFactura } from "../../../AXIOS.SERVICES/factura-axios";

const NuevaFactura = () => {
  // ⭐ Estado del cliente controlado por el PADRE
  const [identidad, setIdentidad] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [RTN, setRTN] = useState("");

  // (Opcional) vendedor/sucursal desde sesión/usuario
  const [vendedor] = useState("Vendedor Demo");
  const [sucursal] = useState("Sucursal Central");

  // DETALLES DE FACTURA
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

  // CATÁLOGOS
  const [disponiblesItems, setDisponiblesItems] = useState({
    PRODUCTOS: [],
    SERVICIOS: [],
    PROMOCIONES: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Estilistas de ejemplo
  const [estilistas] = useState([
    { id: 1, nombre: "María González" },
    { id: 2, nombre: "Juan Pérez" },
    { id: 3, nombre: "Ana Rodríguez" },
  ]);

  // Cargar catálogos por tipo
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

  useEffect(() => {
    buscarItemTipo("PRODUCTOS");
    buscarItemTipo("SERVICIOS");
    buscarItemTipo("PROMOCIONES");
  }, []);

  // Cálculos
  const calculateLineTotal = (item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const precio = parseFloat(item.precio) || 0;
    const ajuste = parseFloat(item.ajuste) || 0;
    return (cantidad * precio + ajuste).toFixed(2);
  };

  const calculateTotal = () => {
    return items
      .reduce((sum, it) => sum + parseFloat(calculateLineTotal(it)), 0)
      .toFixed(2);
  };

  // Filas
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

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

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

  // Cancelar
  const handleCancel = () => {
    if (
      window.confirm(
        "¿Estás seguro de cancelar esta factura? Se perderán todos los datos."
      )
    ) {
      // Reiniciar detalles
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

      // Reiniciar encabezado
      setIdentidad("");
      setNombreCliente("");
      setRTN("");
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto bg-white shadow-xl rounded-lg">
      {/* ENCABEZADO */}
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
          // fecha/onFechaChange: opcionales; el hijo ya maneja su reloj interno
        />
      </div>

      {/* DETALLES */}
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
        {isLoading && (
          <div className="mt-2 text-xs text-gray-500">Cargando catálogos…</div>
        )}
      </div>
    </div>
  );
};

export default NuevaFactura;
