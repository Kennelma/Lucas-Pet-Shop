// NuevaFactura.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import EncabezadoFactura from "./EncabezadoFactura";
import DetallesFactura from "./DetallesFactura";
import {
  obtenerDetallesFactura,
  obtenerUsuarioFactura,
  obtenerEstilistasFactura,
  validarCAIParaFacturar
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
  const [caiActivo, setCaiActivo] = useState(true); // Nuevo estado para CAI

  const navigate = useNavigate();
  const { setActiveTab, setFacturaParaImprimir } = props;

  //====================CARGA_INICIAL====================
  useEffect(() => {
    // Validar CAI al entrar al módulo
    const checkCAI = async () => {
      const res = await validarCAIParaFacturar();
      if (!res.puedeFacturar) {
        setCaiActivo(false);
        Swal.fire({
          icon: res.tipoAlerta === 'critico' ? 'warning' : 'error',
          title: 'ADVERTENCIA CAI',
          text: res.mensaje,
          confirmButtonColor: '#d33'
        });
      } else {
        setCaiActivo(true);
      }
    };
    checkCAI();
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
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del usuario',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#d33'
      });
    }
  };

  const cargarEstilistas = async () => {
    try {
      const response = await obtenerEstilistasFactura();
      if (response.success) {
        setEstilistas(response.data);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se pudieron cargar los estilistas. Los servicios podrían no estar disponibles.',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      console.error("Error al cargar estilistas:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar la lista de estilistas',
        confirmButtonColor: '#d33'
      });
    }
  };

  const cargarCatalogo = async (tipo) => {
    setIsLoading(true);
    try {
      const response = await obtenerDetallesFactura(tipo);
      if (response.success) {
        setDisponiblesItems((prev) => ({ ...prev, [tipo]: response.data }));
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: `No se pudo cargar el catálogo de ${tipo}`,
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      console.error(`Error al cargar catálogo ${tipo}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al cargar ${tipo}. Inténtalo nuevamente.`,
        confirmButtonColor: '#d33'
      });
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
          // Si es SERVICIOS o PROMOCIONES, agregar automáticamente un estilista vacío
          const esServicioOPromocion = newType === "SERVICIOS" || newType === "PROMOCIONES";
          return {
            ...item,
            tipo: newType,
            item: "",
            precio: 0.0,
            cantidad: 1,
            ajuste: 0,
            estilistas: esServicioOPromocion ? [{ id: Date.now(), estilistaId: "", cantidadMascotas: "" }] : [],
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 w-full bg-white shadow-xl rounded-lg">
      <div className="border-dashed rounded-lg bg-blue-50 p-3 sm:p-4">
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
          nombreCliente={nombreCliente}
          setActiveTab={props.setActiveTab}
          setFacturaParaImprimir={setFacturaParaImprimir}
          caiActivo={caiActivo}
        />

        {isLoading && (
          <div className="mt-2 text-xs text-gray-500">Cargando catálogos…</div>
        )}
      </div>
    </div>
  );
};

export default NuevaFactura;