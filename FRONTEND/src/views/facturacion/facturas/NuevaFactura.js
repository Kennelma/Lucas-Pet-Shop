// NuevaFactura.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EncabezadoFactura from "./EncabezadoFactura";
import DetallesFactura from "./DetallesFactura";
import {
  obtenerDetallesFactura,
  obtenerUsuarioFactura,
  obtenerEstilistasFactura
} from "../../../AXIOS.SERVICES/factura-axios";

const NuevaFactura = (props) => {
  //====================ESTADOS_DEL_CLIENTE====================
  const [identidad, setIdentidad] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [RTN, setRTN] = useState("");
  const [id_cliente, setIdCliente] = useState(null); 

  //====================ESTADOS_DEL_USUARIO====================
  const [vendedor, setVendedor] = useState("");
  const [sucursal, setSucursal] = useState("");

  //====================ESTADOS_DE_ITEMS====================
  const [items, setItems] = useState([
    {
      id: Date.now(),
      tipo: "PRODUCTOS",
      item: "",
      cantidad: 1,
      precio: 0.0,
      ajuste: 0,
      estilistas: [],
    }
  ]);

  //====================DISPONIBLES_Y_ESTILISTAS====================
  const [disponiblesItems, setDisponiblesItems] = useState({
    PRODUCTOS: [],
    SERVICIOS: [],
    PROMOCIONES: [],
  });

  const [estilistas, setEstilistas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setActiveTab } = props;

  //====================CARGA_INICIAL====================
  useEffect(() => {
    cargarDatosUsuario();
    cargarEstilistas();
    cargarCatalogo("PRODUCTOS");
    cargarCatalogo("SERVICIOS");
    cargarCatalogo("PROMOCIONES");
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const response = await obtenerUsuarioFactura();
      if (response.success) {
        setVendedor(response.data.usuario);
        setSucursal(response.data.nombre_sucursal);
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
    }
  };

  const cargarEstilistas = async () => {
    try {
      const response = await obtenerEstilistasFactura();
      if (response.success) {
        setEstilistas(response.data);
      }
    } catch (error) {
      console.error("Error al cargar estilistas:", error);
    }
  };

  const cargarCatalogo = async (tipo) => {
    setIsLoading(true);
    try {
      const response = await obtenerDetallesFactura(tipo);
      if (response.success) {
        setDisponiblesItems((prev) => ({ ...prev, [tipo]: response.data }));
      }
    } catch (error) {
      console.error(`Error al cargar catálogo ${tipo}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  //====================GESTIÓN_DE_ITEMS====================

  const addItem = () => {
    const newId = Date.now();
    setItems([
      ...items,
      {
        id: newId,
        tipo: "PRODUCTOS",
        item: "",
        cantidad: 1,
        precio: 0.0,
        ajuste: 0,
        estilistas: [],
      },
    ]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleItemTypeChange = (id, newType) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            tipo: newType,
            item: "",
            precio: 0.0,
            cantidad: 1,
            ajuste: 0,
            estilistas: [],
          };
        }
        return item;
      })
    );
  };

  const handleItemChange = (id, selectedId, selectedItemData, nameKey, priceKey) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            item: selectedId,
            precio: selectedItemData ? parseFloat(selectedItemData[priceKey]) : 0.0,
            tiene_impuesto: selectedItemData ? Boolean(selectedItemData.tiene_impuesto) : false,
          };
        }
        return item;
      })
    );
  };

  const calculateLineTotal = (item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const precio = parseFloat(item.precio) || 0;
    const ajuste = parseFloat(item.ajuste) || 0;
    const totalLinea = cantidad * precio + ajuste;
    return totalLinea.toFixed(2);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(calculateLineTotal(item)), 0);
  };

  const handleCancel = () => {
    if (setActiveTab) {
      setActiveTab("facturas");
    } else {
      navigate("/facturas");
    }
  };

  //====================RENDER====================
  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto bg-white shadow-xl rounded-lg">
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
          setIdCliente={setIdCliente}
        />
      </div>

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
          identidad={identidad}
          RTN={RTN}
          id_cliente={id_cliente}
          setActiveTab={props.setActiveTab}
        />

        {isLoading && (
          <div className="mt-2 text-xs text-gray-500">Cargando catálogos…</div>
        )}
      </div>
    </div>
  );
};

export default NuevaFactura;
