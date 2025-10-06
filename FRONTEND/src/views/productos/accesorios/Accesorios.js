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

  // Función para generar SKU al actualizar
  const generarSKU = (nombre, id) => {
    if (!nombre) return '';
    const palabras = nombre.trim().split(' ');
    const primeras = palabras.map(p => p.slice(0,3).toUpperCase());
    return id ? `${primeras.join('-')}-${id}` : primeras.join('-');
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
      const id = item.id_producto_pk || item.id_producto || item.id_accesorio_pk || item.id;
      console.log(`Producto: ${item.nombre_producto}, ID: ${id}, Activo: ${item.activo}`);

      return {
        id: id,
        sku: item.sku ?? "",
        nombre: (item.nombre_producto ?? item.nombre_accesorio ?? item.nombre ?? "").toUpperCase(),
        categoria: (item.tipo_accesorio ?? item.categoria ?? "").toUpperCase(),
        cantidad: Number(item.stock ?? item.stock_accesorio ?? item.cantidad ?? 0) || 0,
        precio: Number(item.precio_producto ?? item.precio_accesorio ?? item.precio ?? 0) || 0,
        // Aquí mapeamos la imagen del backend a nuestro estado
        imagenUrl: item.imagen_url ?? item.imagen ?? "", 
        activo: item.activo !== undefined ? Boolean(item.activo) : true
      };
    });

    console.log("Inventario mapeado con IDs:", inventarioMapeado.map(p => ({nombre: p.nombre, id: p.id, activo: p.activo})));
    setInventario(inventarioMapeado);
  } catch (error) {
    console.error("Error al cargar inventario:", error);
    mostrarMensaje("Error al cargar inventario");
    setInventario([]);
  }
  setLoading(false);
};


  const guardarAccesorio = async ({nombre, categoria, cantidad, precio, imagenUrl, activo}) => {
    // Convertir a mayúsculas antes de enviar
    const nombreMayuscula = nombre.toUpperCase();
    const categoriaMayuscula = categoria.toUpperCase();
    
    const datosDB = {
      nombre_producto: nombreMayuscula,
      tipo_accesorio: categoriaMayuscula,
      stock: parseInt(cantidad) || 0,
      precio_producto: parseFloat(precio) || 0,
      tipo_producto: "ACCESORIOS",
      activo: activo !== undefined ? activo : true
    };

    try {
      let resultado;
      
      if (editIndex >= 0) {
        // ACTUALIZAR - Regenerar SKU con el nuevo nombre
        const accesorio = inventario[editIndex];
        const skuNuevo = generarSKU(nombreMayuscula, accesorio.id);
        
        resultado = await actualizarProducto({
          ...datosDB,
          sku: skuNuevo,
          id_producto: accesorio.id
        });
        
        if (resultado && resultado.Consulta !== false) {
          setInventario(prev => prev.map(item => 
            item.id === accesorio.id 
              ? {
                  ...item, 
                  sku: skuNuevo, 
                  nombre: nombreMayuscula, 
                  categoria: categoriaMayuscula, 
                  cantidad: parseInt(cantidad), 
                  precio: parseFloat(precio), 
                  imagenUrl: imagenUrl || "",
                  activo: activo
                }
              : item
          ));
          
          mostrarMensaje(`${nombreMayuscula} actualizado correctamente`);
          setModalVisible(false);
          setEditIndex(-1);
        }
      } else {
        // INSERTAR - El backend genera el SKU automáticamente
        resultado = await insertarProducto(datosDB);
        
        if (!resultado || resultado.Consulta === false) {
          mostrarMensaje(`Error: ${resultado?.error || "No se pudo insertar"}`);
          return;
        }

        mostrarMensaje(`${nombreMayuscula} agregado correctamente`);
        setModalVisible(false);
        setEditIndex(-1);

        // Recargar inventario para obtener el SKU generado por el backend
        setTimeout(() => {
          cargarInventario();
        }, 500);
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje(`Error: ${error.message}`);
    }
  };

  const eliminarAccesorio = async (productoId) => {
    console.log("=== ELIMINACIÓN ===");
    console.log("ID a eliminar:", productoId);
    
    if (!productoId || productoId === null || productoId === undefined) {
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
      const resultado = await eliminarProducto(productoId);
      console.log("Resultado backend:", resultado);
      
      if (resultado && resultado.Consulta === true) {
        setInventario(prev => prev.filter(item => item.id !== productoId));
        mostrarMensaje("Eliminado correctamente");
      } else {
        mostrarMensaje(`Error: ${resultado?.error || "No se pudo eliminar"}`);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      mostrarMensaje(`Error: ${error.message}`);
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
          <h3 className="text-xl font-bold mb-2">SIN ACCESORIOS</h3>
          <p>{busqueda ? "Sin resultados" : "Agrega el primero"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => {
            const index = inventario.findIndex((i) => i.id === producto.id);
            return (
              <div 
                key={producto.id} 
                className={`rounded-lg p-4 relative ${
                  producto.activo ? 'bg-gray-100' : 'bg-gray-200 opacity-60'
                }`}
              >
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
                  <div className={`text-sm flex items-center justify-center gap-1 mt-1 ${
                    producto.activo ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <span>●</span>
                    <span>{producto.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Click eliminar - ID:", producto.id);
                    eliminarAccesorio(producto.id);
                  }}
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