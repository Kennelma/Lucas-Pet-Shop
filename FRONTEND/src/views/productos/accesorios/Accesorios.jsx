import React, { useState, useEffect } from 'react';
import ModalAgregar from './ModalAgregar';
import ModalEditar from './ModalEditar';
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../../services/apiService';

const Accesorios = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(true);

  const imagenStorage = {
    guardar: (id, url) => {
      try {
        const imagenes = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
        imagenes[id] = { url, timestamp: Date.now() };
        localStorage.setItem('imagenesAccesorios', JSON.stringify(imagenes));
      } catch (error) {
        console.error('Error guardando imagen:', error);
      }
    },
    obtener: (id) => {
      try {
        const imagenes = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
        return imagenes[id]?.url || '';
      } catch (error) {
        return '';
      }
    },
    eliminar: (id) => {
      try {
        const imagenes = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
        delete imagenes[id];
        localStorage.setItem('imagenesAccesorios', JSON.stringify(imagenes));
      } catch (error) {
        console.error('Error eliminando imagen:', error);
      }
    }
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const datos = await verRegistro('tbl_accesorios');
      
      const inventarioMapeado = Array.isArray(datos) ? datos.map(item => ({
        id: item.id_accesorio_pk, nombre: item.nombre_accesorio, categoria: item.tipo_accesorio,
        cantidad: item.stock_accesorio, precio: parseFloat(item.precio_accesorio),
        imagenUrl: imagenStorage.obtener(item.id_accesorio_pk)
      })) : [];
      
      setInventario(inventarioMapeado);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      mostrarMensaje('Error al cargar el inventario', 'error');
      setInventario([]);
    } finally {
      setLoading(false);
    }
  };

  const guardarAccesorio = async (datosAccesorio) => {
    const { nombre, categoria, cantidad, precio, imagenUrl } = datosAccesorio;
    
    try {
      const datosDB = {
        nombre_accesorio: nombre, tipo_accesorio: categoria, 
        stock_accesorio: parseInt(cantidad), precio_accesorio: parseFloat(precio)
      };

      let resultado;
      
      if (editIndex >= 0) {
        const accesorioActual = inventario[editIndex];
        resultado = await actualizarRegistro('tbl_accesorios', accesorioActual.id, datosDB);
        
        if (resultado) {
          imagenUrl ? imagenStorage.guardar(accesorioActual.id, imagenUrl) : imagenStorage.eliminar(accesorioActual.id);
          mostrarMensaje(`${nombre} actualizado correctamente.`);
        }
      } else {
        resultado = await insertarRegistro('tbl_accesorios', datosDB);
        
        if (resultado) {
          mostrarMensaje(`${nombre} agregado al inventario.`);
          
          if (imagenUrl) {
            setTimeout(async () => {
              const datosActualizados = await verRegistro('tbl_accesorios');
              const nuevoAccesorio = datosActualizados
                .filter(item => 
                  item.nombre_accesorio === nombre && item.tipo_accesorio === categoria &&
                  item.stock_accesorio === parseInt(cantidad) && parseFloat(item.precio_accesorio) === parseFloat(precio)
                )
                .sort((a, b) => b.id_accesorio_pk - a.id_accesorio_pk)[0];

              if (nuevoAccesorio) {
                imagenStorage.guardar(nuevoAccesorio.id_accesorio_pk, imagenUrl);
                cargarInventario();
              }
            }, 1500);
          }
        }
      }

      if (!resultado) {
        mostrarMensaje('Error al guardar el accesorio', 'error');
        return false;
      }

      await cargarInventario();
      setModalVisible(false);
      setEditIndex(-1);
      return true;
    } catch (error) {
      console.error('Error al guardar accesorio:', error);
      mostrarMensaje(`Error al guardar: ${error.message}`, 'error');
      return false;
    }
  };

  const editarAccesorio = (index) => {
    setEditIndex(index);
    setModalVisible(true);
  };

  const borrarAccesorio = async (index) => {
    const producto = inventario[index];
    
    if (window.confirm(`¿Deseas eliminar "${producto.nombre}" del inventario?`)) {
      try {
        const resultado = await borrarRegistro('tbl_accesorios', producto.id);
        
        if (resultado) {
          imagenStorage.eliminar(producto.id);
          mostrarMensaje('Accesorio eliminado correctamente.');
          await cargarInventario();
        } else {
          mostrarMensaje('Error al eliminar el accesorio', 'error');
        }
      } catch (error) {
        console.error('Error al borrar accesorio:', error);
        mostrarMensaje('Error al eliminar el accesorio', 'error');
      }
    }
  };

  const productosFiltrados = inventario.filter(producto => 
    !busqueda || producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => { cargarInventario(); }, []);

  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: 48, height: 48, border: '3px solid #f3f3f3', borderTop: '3px solid #9333ea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', padding: 20, fontFamily: 'sans-serif', background: 'white'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h1 style={{fontSize: 24, fontWeight: 'bold', margin: 0}}>INVENTARIO DE ACCESORIOS</h1>
        <button onClick={() => setModalVisible(true)} 
          style={{padding: '8px 16px', background: '#9333ea', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>
          + NUEVO ACCESORIO
        </button>
      </div>

      <div style={{marginBottom: 24, position: 'relative', width: 384}}>
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar accesorio..."
          style={{width: '100%', padding: '12px 48px 12px 48px', border: '2px solid #d1d5db', borderRadius: 24, outline: 'none'}} />
        {busqueda && (
          <button onClick={() => setBusqueda('')}
            style={{position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16}}>
            ×
          </button>
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <div style={{textAlign: 'center', marginTop: 48, color: '#6b7280'}}>
          <div style={{fontSize: 48, marginBottom: 16}}>🛍️</div>
          <h3 style={{fontSize: 20, fontWeight: '600', marginBottom: 8}}>
            No hay accesorios en el inventario
          </h3>
          <p>{busqueda ? 'No se encontraron resultados para tu búsqueda' : 'Agrega tu primer accesorio usando el botón "Nuevo Accesorio"'}</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16}}>
          {productosFiltrados.map((producto, index) => {
            const originalIndex = inventario.findIndex(item => item.id === producto.id);
            const stockBajo = producto.cantidad < 5;
            
            return (
              <div key={producto.id} style={{borderRadius: 12, padding: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative', background: '#f3f4f6'}}>
                <div style={{background: 'white', borderRadius: 8, padding: 8, marginBottom: 16, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  {producto.imagenUrl ? (
                    <img src={producto.imagenUrl} alt={producto.nombre} style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
                  ) : (
                    <div style={{width: '100%', height: '100%'}}></div>
                  )}
                </div>
                
                <div style={{textAlign: 'center', marginBottom: 32}}>
                  <div style={{fontWeight: '600', fontSize: 14, marginBottom: 8}}>{producto.nombre}</div>
                  <div style={{fontWeight: 'bold', fontSize: 18, marginBottom: 8}}>L. {parseFloat(producto.precio).toFixed(0)}</div>
                  <div style={{fontSize: 14, fontWeight: '500', color: stockBajo ? '#dc2626' : '#374151'}}>
                    Stock: {producto.cantidad}
                  </div>
                </div>
                
                <div style={{position: 'absolute', bottom: 16, left: 16}}>
                  <button onClick={() => borrarAccesorio(originalIndex)}
                    style={{width: 32, height: 32, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16}}>
                    🗑️
                  </button>
                </div>
                
                <div style={{position: 'absolute', bottom: 16, right: 16}}>
                  <button onClick={() => editarAccesorio(originalIndex)}
                    style={{width: 32, height: 32, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16}}>
                    ⚙️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalVisible && editIndex >= 0 && (
        <ModalEditar isOpen={modalVisible} onClose={() => { setModalVisible(false); setEditIndex(-1); }} onSave={guardarAccesorio}
          editData={inventario[editIndex]}/>
      )}

      {modalVisible && editIndex < 0 && (
        <ModalAgregar isOpen={modalVisible} onClose={() => { setModalVisible(false); setEditIndex(-1); }} onSave={guardarAccesorio}/>
      )}

      {mensaje.texto && (
        <div style={{position: 'fixed', bottom: 20, right: 20, padding: '12px 20px', color: 'white', borderRadius: 4, fontWeight: 'bold', zIndex: 50, background: mensaje.tipo === 'error' ? '#ef4444' : '#9333ea'}}>
          {mensaje.texto}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Accesorios;