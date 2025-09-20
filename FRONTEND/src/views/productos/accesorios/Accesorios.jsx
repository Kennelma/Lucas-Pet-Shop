import React, { useState, useEffect } from 'react';
import FormularioAccesorio from './FormularioAccesorio';
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../../services/apiService';

const Accesorios = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(true);

  // Función para guardar imagen en localStorage
  const guardarImagenLocal = (idAccesorio, imagenUrl, tipoImagen) => {
    try {
      const imagenesGuardadas = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
      imagenesGuardadas[idAccesorio] = {url: imagenUrl, tipo: tipoImagen,
        timestamp: Date.now()
      };
      localStorage.setItem('imagenesAccesorios', JSON.stringify(imagenesGuardadas));
      console.log(`🖼️ Imagen guardada para accesorio ${idAccesorio}`);
    } catch (error) {
      console.error('Error guardando imagen en localStorage:', error);
    }
  };

  // Función para obtener imagen desde localStorage
  const obtenerImagenLocal = (idAccesorio) => {
    try {
      const imagenesGuardadas = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
      return imagenesGuardadas[idAccesorio] || null;
    } catch (error) {
      console.error('Error obteniendo imagen de localStorage:', error);
      return null;
    }
  };



  // Cargar accesorios desde la API al iniciar
  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando inventario...');
      
      const datos = await verRegistro('tbl_accesorios');
      console.log('📋 Datos recibidos de la API:', datos);
      
      if (!Array.isArray(datos)) {
        console.warn('⚠️ Los datos no son un array:', datos);
        setInventario([]);
        return;
      }
      
      // Mapear los datos de la base de datos al formato del componente
      const inventarioMapeado = datos.map((item, index) => {
        console.log(`🔍 Mapeando item ${index}:`, item);
        
        // Buscar imagen guardada localmente
        const imagenLocal = obtenerImagenLocal(item.id_accesorio_pk);
        let imagenUrl = '';
        let tipoImagen = 'none';
        
        if (imagenLocal) {
          // Si hay imagen guardada localmente, usarla
          imagenUrl = imagenLocal.url;
          tipoImagen = imagenLocal.tipo;
          console.log(`🖼️ Imagen local encontrada para ${item.nombre_accesorio}`);
        }
        // Si no hay imagen local, dejar en blanco
        return {
          id: item.id_accesorio_pk,
          nombre: item.nombre_accesorio,
          categoria: item.tipo_accesorio,
          cantidad: item.stock_accesorio,
          precio: parseFloat(item.precio_accesorio),
          imagenUrl: imagenUrl,
          tipoImagen: tipoImagen
        };
      });
      
      console.log('✅ Inventario mapeado:', inventarioMapeado);
      setInventario(inventarioMapeado);
    } catch (error) {
      console.error('❌ Error completo al cargar inventario:', error);
      mostrarMensaje('Error al cargar el inventario - Revisa la consola', 'error');
      setInventario([]);
    } finally {
      setLoading(false);
    }
  };



  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const abrirModal = () => {
    setModalVisible(true);
    setEditIndex(-1);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditIndex(-1);
  };

  const guardarAccesorio = async (datosAccesorio) => {
    console.log('📥 Datos recibidos en guardarAccesorio:', datosAccesorio);
    
    const { nombre, categoria, cantidad, precio, imagenUrl, tipoImagen } = datosAccesorio;
    
    try {
      if (editIndex >= 0) {
        // Actualizar accesorio existente
        const accesorioActual = inventario[editIndex];
        
        const datosActualizar = {
          nombre_accesorio: nombre,
          tipo_accesorio: categoria,
          stock_accesorio: parseInt(cantidad),
          precio_accesorio: parseFloat(precio)
        };

        console.log('📝 Actualizando accesorio ID:', accesorioActual.id, 'con datos:', datosActualizar);
        
        const resultado = await actualizarRegistro('tbl_accesorios', accesorioActual.id, datosActualizar);
        
        if (resultado) {
          // Guardar imagen localmente solo si existe
          if (imagenUrl && tipoImagen && tipoImagen !== 'none') {
            guardarImagenLocal(accesorioActual.id, imagenUrl, tipoImagen);
          } else {
            // Si no hay imagen, eliminar cualquier imagen guardada previamente
            try {
              const imagenesGuardadas = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
              delete imagenesGuardadas[accesorioActual.id];
              localStorage.setItem('imagenesAccesorios', JSON.stringify(imagenesGuardadas));
            } catch (error) {
              console.error('Error eliminando imagen del localStorage:', error);
            }
          }
          
          mostrarMensaje(`${nombre} actualizado correctamente.`);
          await cargarInventario();
        } else {
          mostrarMensaje('Error al actualizar el accesorio', 'error');
          return false;
        }
      } else {
        // Crear nuevo accesorio
        const datosInsertar = {
          nombre_accesorio: nombre,
          tipo_accesorio: categoria,
          stock_accesorio: parseInt(cantidad),
          precio_accesorio: parseFloat(precio)
        };

        console.log('➕ Insertando nuevo accesorio con datos:', datosInsertar);
        
        const resultado = await insertarRegistro('tbl_accesorios', datosInsertar);
        
        if (resultado) {
          mostrarMensaje(`${nombre} agregado al inventario.`);
          
          // Recargar inventario para obtener el nuevo ID
          await cargarInventario();
          
          // Encontrar el nuevo accesorio y guardar su imagen solo si existe
          if (imagenUrl && tipoImagen && tipoImagen !== 'none') {
            setTimeout(async () => {
              // Cargar inventario fresco para obtener todos los accesorios actualizados
              const datosActualizados = await verRegistro('tbl_accesorios');
              
              // Buscar el accesorio recién creado (el último con estos datos)
              const accesorioRecienCreado = datosActualizados
                .filter(item => 
                  item.nombre_accesorio === nombre && 
                  item.tipo_accesorio === categoria &&
                  item.stock_accesorio === parseInt(cantidad) &&
                  parseFloat(item.precio_accesorio) === parseFloat(precio)
                )
                .sort((a, b) => b.id_accesorio_pk - a.id_accesorio_pk)[0]; // El más nuevo

              if (accesorioRecienCreado) {
                console.log('🎯 Encontrado accesorio recién creado:', accesorioRecienCreado);
                guardarImagenLocal(accesorioRecienCreado.id_accesorio_pk, imagenUrl, tipoImagen);
                // Recargar inventario para mostrar la imagen
                cargarInventario();
              } else {
                console.log('❌ No se encontró el accesorio recién creado');
              }
            }, 1500);
          }
          
        } else {
          console.error('❌ insertarRegistro retornó null o false');
          mostrarMensaje('Error al agregar el accesorio', 'error');
          return false;
        }
      }

      cerrarModal();
      return true;
    } catch (error) {
      console.error('❌ Error completo al guardar accesorio:', error);
      mostrarMensaje(`Error al guardar: ${error.message}`, 'error');
      return false;
    }
  };

  const editarAccesorio = (index) => {
    console.log('✏️ Editando accesorio en índice:', index, 'Datos:', inventario[index]);
    setEditIndex(index);
    setModalVisible(true);
  };

  const borrarAccesorio = async (index) => {
    const producto = inventario[index];
    console.log('🗑️ Intentando borrar accesorio:', producto);
    
    if (window.confirm(`¿Deseas eliminar "${producto.nombre}" del inventario?`)) {
      try {
        console.log('🗑️ Llamando borrarRegistro con tabla: tbl_accesorios, ID:', producto.id);
        
        const resultado = await borrarRegistro('tbl_accesorios', producto.id);
        console.log('🗑️ Resultado borrado:', resultado);
        
        if (resultado) {
          // También borrar la imagen del localStorage
          try {
            const imagenesGuardadas = JSON.parse(localStorage.getItem('imagenesAccesorios') || '{}');
            delete imagenesGuardadas[producto.id];
            localStorage.setItem('imagenesAccesorios', JSON.stringify(imagenesGuardadas));
          } catch (error) {
            console.error('Error borrando imagen del localStorage:', error);
          }
          
          mostrarMensaje('Accesorio eliminado correctamente.');
          await cargarInventario();
        } else {
          mostrarMensaje('Error al eliminar el accesorio', 'error');
        }
      } catch (error) {
        console.error('❌ Error al borrar accesorio:', error);
        mostrarMensaje('Error al eliminar el accesorio', 'error');
      }
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaActual('');
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = inventario.filter(producto => {
    const cumpleBusqueda = !busquedaActual || 
      producto.nombre.toLowerCase().includes(busquedaActual.toLowerCase());
    
    return cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="min-h-screen p-5 font-sans flex items-center justify-center bg-white text-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 font-sans transition-all duration-300 bg-white text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold m-0 text-gray-800">
          INVENTARIO DE ACCESORIOS
        </h1>
        <button
          onClick={abrirModal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white border-none rounded cursor-pointer transition-all duration-200 flex items-center gap-2"
        >
          + NUEVO ACCESORIO
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative w-96 rounded-full border-2 transition-all duration-200 border-gray-300 bg-white focus-within:border-purple-500">
          {/* Ícono de búsqueda */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg 
              className="w-5 h-5 text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Input de búsqueda */}
          <input
            type="text"
            value={busquedaActual}
            onChange={(e) => setBusquedaActual(e.target.value)}
            placeholder="Buscar accesorio..."
            className="w-full pl-12 pr-12 py-3 rounded-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
          />
          
          {/* Botón limpiar */}
          {busquedaActual && (
            <button
              onClick={limpiarBusqueda}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Grid de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center mt-12 text-gray-600">
          <div className="text-5xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            No hay accesorios en el inventario
          </h3>
          <p className="text-gray-500">
            {busquedaActual ? 'No se encontraron resultados para tu búsqueda' : 'Agrega tu primer accesorio usando el botón "Nuevo Accesorio"'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {productosFiltrados.map((producto, index) => {
            const originalIndex = inventario.findIndex(item => item.id === producto.id);
            const stockBajo = producto.cantidad < 5;
            
            return (
              <div
                key={producto.id}
                className="rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 relative bg-gray-200"
              >
                {/* Contenedor de imagen */}
                <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                  {producto.imagenUrl ? (
                    <img 
                      src={producto.imagenUrl} 
                      alt={producto.nombre}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    /* Espacio completamente en blanco cuando no hay imagen */
                    <div className="w-full h-full"></div>
                  )}
                </div>
                
                {/* Información del producto */}
                <div className="text-center space-y-2 mb-8">
                  <div className="font-semibold text-sm text-gray-800">
                    {producto.nombre}
                  </div>
                  
                  <div className="font-bold text-lg text-gray-800">
                    L. {parseFloat(producto.precio).toFixed(0)}
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    stockBajo ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    Stock: {producto.cantidad}
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="absolute bottom-4 left-4">
                  <button
                    onClick={() => borrarAccesorio(originalIndex)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-gray-600 hover:text-red-600 hover:bg-gray-300"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => editarAccesorio(originalIndex)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-300"
                    title="Editar"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal del Formulario */}
      {modalVisible && (
        <FormularioAccesorio
          isOpen={modalVisible}
          onClose={cerrarModal}
          onSave={guardarAccesorio}
          editData={editIndex >= 0 ? inventario[editIndex] : null}
        />
      )}

      {/* Mensaje */}
      {mensaje.texto && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 text-white rounded font-bold z-50 transition-all duration-300 ${
          mensaje.tipo === 'error' ? 'bg-red-500' : 'bg-purple-600'
        }`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default Accesorios;