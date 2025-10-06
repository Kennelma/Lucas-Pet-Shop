import React, { useState, useEffect } from "react";
import ModalAgregar from "./ModalAgregar";
import ModalEditar from "./ModalEditar";
import {verProductos, insertarProducto, actualizarProducto, eliminarProducto} from "../../../AXIOS.SERVICES/products-axios";

const Accesorios = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  const generarSKU = (nombre) => {
    const letras = nombre
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
      .substring(0, 3)
      .toUpperCase();
    
    const prefijo = letras.padEnd(3, 'X');
    
    const skusExistentes = inventario
      .filter(item => item.sku && item.sku.startsWith(prefijo))
      .map(item => {
        const match = item.sku.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
    
    const numeroMaximo = skusExistentes.length > 0 ? Math.max(...skusExistentes) : 0;
    const nuevoNumero = String(numeroMaximo + 1).padStart(3, '0');
    
    return `${prefijo}-${nuevoNumero}`;
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const cargarInventario = async () => {
    setLoading(true);
    try {
      const datos = await verProductos("ACCESORIOS");
      console.log("Datos crudos del backend:", datos);
      
      const lista = Array.isArray(datos) ? datos : (Array.isArray(datos?.productos) ? datos.productos : []);

      const inventarioMapeado = lista.map((item) => {
        const id = item.id_producto || item.id_accesorio_pk || item.id;
        console.log(`Producto: ${item.nombre_producto}, ID extraído: ${id}`, item);
        
        return {
          id: id,
          sku: item.sku ?? "",
          nombre: item.nombre_producto ?? item.nombre_accesorio ?? item.nombre ?? "",
          categoria: item.tipo_accesorio ?? item.categoria ?? "",
          cantidad: Number(item.stock ?? item.stock_accesorio ?? item.cantidad ?? 0) || 0,
          precio: Number(item.precio_producto ?? item.precio_accesorio ?? item.precio ?? 0) || 0,
          imagenUrl: "",
        };
      });

      console.log("Inventario mapeado:", inventarioMapeado);
      setInventario(inventarioMapeado);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      mostrarMensaje("Error al cargar inventario");
      setInventario([]);
    }
    setLoading(false);
  };

  const guardarAccesorio = async ({nombre, categoria, cantidad, precio, imagenUrl}) => {
    const skuGenerado = editIndex >= 0 ? inventario[editIndex].sku : generarSKU(nombre);

    const datosDB = {
      nombre_producto: nombre,
      sku: skuGenerado,
      tipo_accesorio: categoria,
      stock: parseInt(cantidad) || 0,
      precio_producto: parseFloat(precio) || 0,
      tipo_producto: "ACCESORIOS"
    };

    try {
      let resultado;
      
      if (editIndex >= 0) {
        const accesorio = inventario[editIndex];
        
        resultado = await actualizarProducto({
          ...datosDB,
          id_producto: accesorio.id
        });
        
        if (resultado && resultado.Consulta !== false) {
          setInventario(prev => prev.map(item => 
            item.id === accesorio.id 
              ? {...item, nombre, categoria, cantidad: parseInt(cantidad), precio: parseFloat(precio), imagenUrl: imagenUrl || ""}
              : item
          ));
          
          mostrarMensaje(`${nombre} actualizado correctamente`);
          setModalVisible(false);
          setEditIndex(-1);
        }
      } else {
        resultado = await insertarProducto(datosDB);
        
        if (!resultado || resultado.Consulta === false) {
          mostrarMensaje(`Error: ${resultado?.error || "No se pudo insertar"}`);
          return;
        }

        mostrarMensaje(`${nombre} agregado correctamente`);
        setModalVisible(false);
        setEditIndex(-1);

        setTimeout(async () => {
          const datosActualizados = await verProductos("ACCESORIOS");
          const lista = Array.isArray(datosActualizados) 
            ? datosActualizados 
            : (Array.isArray(datosActualizados?.productos) ? datosActualizados.productos : []);
          
          const productoNuevo = lista.find(p => p.sku === skuGenerado);
          
          if (productoNuevo) {
            const nuevoId = productoNuevo.id_producto || productoNuevo.id_accesorio_pk || productoNuevo.id;
            
            setInventario(prev => [
              ...prev,
              {
                id: nuevoId,
                sku: skuGenerado,
                nombre: nombre,
                categoria: categoria,
                cantidad: parseInt(cantidad) || 0,
                precio: parseFloat(precio) || 0,
                imagenUrl: imagenUrl || ""
              }
            ]);
          } else {
            cargarInventario();
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje(`Error: ${error.message}`);
    }
  };

  const eliminarAccesorio = async (productoId) => {
    console.log("ID para eliminar:", productoId);
    
    if (!productoId) {
      mostrarMensaje("Error: ID de producto inválido");
      return;
    }
    
    const producto = inventario.find(p => p.id === productoId);
    console.log("Producto encontrado:", producto);
    
    if (!producto) {
      mostrarMensaje("Error: Producto no encontrado");
      return;
    }
    
    if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    
    try {
      console.log("Enviando ID al backend:", producto.id);
      const resultado = await eliminarProducto(producto.id);
      console.log("Resultado del backend:", resultado);
      
      if (resultado && resultado.Consulta !== false) {
        setInventario(prev => prev.filter(item => item.id !== producto.id));
        mostrarMensaje("Eliminado correctamente");
      } else {
        mostrarMensaje(`Error: ${resultado?.error || "No se pudo eliminar"}`);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      mostrarMensaje("Error al eliminar");
    }
  };

  const productosFiltrados = inventario.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    cargarInventario();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-5 bg-white">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">INVENTARIO DE ACCESORIOS</h1>
        <button
          onClick={() => setModalVisible(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          + NUEVO
        </button>
      </div>

      <div className="mb-6 relative w-80">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="w-full px-4 py-2 border rounded-full"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-2 text-xl"
          >
            ×
          </button>
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-bold mb-2">Sin accesorios</h3>
          <p>{busqueda ? "Sin resultados" : "Agrega el primero"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => {
            const index = inventario.findIndex((i) => i.id === producto.id);
            return (
              <div key={producto.id} className="bg-gray-100 rounded-lg p-4 relative">
                <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                  {producto.imagenUrl ? (
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-300 text-4xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="text-center mb-8">
                  <div className="text-xs text-gray-500 mb-1 font-mono">{producto.sku}</div>
                  <div className="font-bold text-sm mb-1">{producto.nombre}</div>
                  <div className="text-lg font-bold">L.{producto.precio.toFixed(0)}</div>
                  <div className={producto.cantidad < 5 ? "text-red-600" : "text-gray-600"}>
                    Stock: {producto.cantidad}
                  </div>
                </div>
                <button
                  onClick={() => eliminarAccesorio(producto.id)}
                  className="absolute bottom-2 left-2 p-1 hover:scale-110 transition-transform"
                  title="Eliminar"
                >
                  🗑️
                </button>
                <button
                  onClick={() => {
                    setEditIndex(index);
                    setModalVisible(true);
                  }}
                  className="absolute bottom-2 right-2 p-1 hover:scale-110 transition-transform"
                  title="Editar"
                >
                  ⚙️
                </button>
              </div>
            );
          })}
        </div>
      )}

      {modalVisible &&
        (editIndex >= 0 ? (
          <ModalEditar
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setEditIndex(-1);
            }}
            onSave={guardarAccesorio}
            editData={inventario[editIndex]}
          />
        ) : (
          <ModalAgregar
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setEditIndex(-1);
            }}
            onSave={guardarAccesorio}
          />
        ))}

      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold shadow-lg">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Accesorios;