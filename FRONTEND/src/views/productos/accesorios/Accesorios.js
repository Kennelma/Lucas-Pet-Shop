import React, { useState, useEffect } from 'react';
import ModalAgregar from './ModalAgregar';
import ModalEditar from './ModalEditar';
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../../services/apiService';

const Accesorios = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  const imagenStorage = {
    guardar: (id, url) => {
      const imagenes = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
      imagenes[id] = url;
      localStorage.setItem('imagenesAccesorios', JSON.stringify(imagenes));
    },
    obtener: (id) => JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}')[id] || '',
    eliminar: (id) => {
      const imagenes = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
      delete imagenes[id];
      localStorage.setItem('imagenesAccesorios', JSON.stringify(imagenes));
    }
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  const cargarInventario = async () => {
    setLoading(true);
    try {
      const datos = await verRegistro('tbl_accesorios');
      setInventario(Array.isArray(datos) ? datos.map(item => ({
        id: item.id_accesorio_pk,
        nombre: item.nombre_accesorio,
        categoria: item.tipo_accesorio,
        cantidad: item.stock_accesorio,
        precio: parseFloat(item.precio_accesorio),
        imagenUrl: imagenStorage.obtener(item.id_accesorio_pk)
      })) : []);
    } catch (error) {
      mostrarMensaje('Error al cargar inventario');
      setInventario([]);
    }
    setLoading(false);
  };

  const guardarAccesorio = async ({ nombre, categoria, cantidad, precio, imagenUrl }) => {
    const datosDB = {
      nombre_accesorio: nombre,
      tipo_accesorio: categoria,
      stock_accesorio: parseInt(cantidad),
      precio_accesorio: parseFloat(precio)
    };

    try {
      let resultado;
      if (editIndex >= 0) {
        const accesorio = inventario[editIndex];
        resultado = await actualizarRegistro('tbl_accesorios', accesorio.id, datosDB);
        if (resultado) {
          imagenUrl ? imagenStorage.guardar(accesorio.id, imagenUrl) : imagenStorage.eliminar(accesorio.id);
        }
      } else {
        resultado = await insertarRegistro('tbl_accesorios', datosDB);
        if (resultado && imagenUrl) {
          // Para productos nuevos, buscar el ID y guardar imagen
          setTimeout(async () => {
            const datosActualizados = await verRegistro('tbl_accesorios');
            const nuevoAccesorio = datosActualizados
              .filter(item => 
                item.nombre_accesorio === nombre && 
                item.tipo_accesorio === categoria &&
                item.stock_accesorio === parseInt(cantidad) && 
                parseFloat(item.precio_accesorio) === parseFloat(precio)
              )
              .sort((a, b) => b.id_accesorio_pk - a.id_accesorio_pk)[0];

            if (nuevoAccesorio) {
              imagenStorage.guardar(nuevoAccesorio.id_accesorio_pk, imagenUrl);
              cargarInventario();
            }
          }, 1500);
        }
      }

      if (resultado) {
        mostrarMensaje(`${nombre} ${editIndex >= 0 ? 'actualizado' : 'agregado'} correctamente`);
        await cargarInventario();
        setModalVisible(false);
        setEditIndex(-1);
        return true;
      }
    } catch (error) {
      mostrarMensaje('Error al guardar');
    }
    return false;
  };

  const borrarAccesorio = async (index) => {
    const producto = inventario[index];
    if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    
    try {
      if (await borrarRegistro('tbl_accesorios', producto.id)) {
        imagenStorage.eliminar(producto.id);
        mostrarMensaje('Eliminado correctamente');
        cargarInventario();
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar');
    }
  };

  const productosFiltrados = inventario.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => cargarInventario(), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-white">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">INVENTARIO DE ACCESORIOS</h1>
        <button onClick={() => setModalVisible(true)} className="px-4 py-2 bg-purple-600 text-white rounded">
          + NUEVO
        </button>
      </div>

      <div className="mb-6 relative w-80">
        <input 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar..."
          className="w-full px-4 py-2 border rounded-full"
        />
        {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-3 top-2">×</button>}
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-bold mb-2">Sin accesorios</h3>
          <p>{busqueda ? 'Sin resultados' : 'Agrega el primero'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => {
            const index = inventario.findIndex(i => i.id === producto.id);
            return (
              <div key={producto.id} className="bg-gray-100 rounded-lg p-4 relative">
                <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                  {producto.imagenUrl ? 
                    <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-contain"/> :
                    <div className="w-full h-full bg-gray-50"></div>
                  }
                </div>
                
                <div className="text-center mb-8">
                  <div className="font-bold text-sm mb-1">{producto.nombre}</div>
                  <div className="text-lg font-bold">L.{producto.precio.toFixed(0)}</div>
                  <div className={producto.cantidad < 5 ? 'text-red-600' : 'text-gray-600'}>
                    Stock: {producto.cantidad}
                  </div>
                </div>
                
                <button onClick={() => borrarAccesorio(index)} className="absolute bottom-2 left-2 p-1">🗑️</button>
                <button onClick={() => {setEditIndex(index); setModalVisible(true);}} className="absolute bottom-2 right-2 p-1">⚙️</button>
              </div>
            );
          })}
        </div>
      )}

      {modalVisible && (editIndex >= 0 ? 
        <ModalEditar isOpen={modalVisible} onClose={() => {setModalVisible(false); setEditIndex(-1);}} onSave={guardarAccesorio} editData={inventario[editIndex]}/> :
        <ModalAgregar isOpen={modalVisible} onClose={() => {setModalVisible(false); setEditIndex(-1);}} onSave={guardarAccesorio}/>
      )}

      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Accesorios;