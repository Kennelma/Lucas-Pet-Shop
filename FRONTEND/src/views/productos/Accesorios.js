import { useEffect, useState } from "react";
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from "../../services/apiService.js";

const InventarioAccesorios = () => {
  const [productos, setProductos] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [editandoAccesorio, setEditandoAccesorio] = useState(null);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre_producto: '',
    precio_unitario_producto: '',
    cantidad_en_stock: '',
    categoria: 'accesorios',
    id_categoria_item_fk: 2
  });

  // Detectar tema oscuro de Core UI
  useEffect(() => {
    const detectarTemaCoreUI = () => {
      const htmlElement = document.documentElement;
      const esTemaOscuro = htmlElement.getAttribute('data-coreui-theme') === 'dark';
      setIsDark(esTemaOscuro);
    };

    detectarTemaCoreUI();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-coreui-theme' || mutation.attributeName === 'class')) {
          detectarTemaCoreUI();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme', 'class']
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-coreui-theme', 'class']
    });

    return () => observer.disconnect();
  }, []);

  // Cargar productos desde API y filtrar accesorios
  useEffect(() => {
    cargarAccesorios();
  }, []);

  const cargarAccesorios = async () => {
    try {
      const data = await verRegistro("productos");
      setProductos(data);
      
      const accesoriosFiltrados = data.filter(producto => 
        producto.categoria && producto.categoria.toLowerCase() === 'accesorios'
      );
      setAccesorios(accesoriosFiltrados);
      console.log('Accesorios cargados:', accesoriosFiltrados);
    } catch (error) {
      console.error('Error al cargar accesorios:', error);
      mostrarMensaje('Error al cargar los accesorios.', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const abrirModal = () => {
    setModalVisible(true);
    setEditandoAccesorio(null);
    setFormData({
      nombre_producto: '',
      precio_unitario_producto: '',
      cantidad_en_stock: '',
      categoria: 'accesorios',
      id_categoria_item_fk: 2
    });
  };

  const abrirModalEdicion = (accesorio) => {
    console.log('Abriendo modal para editar:', accesorio);
    setModalVisible(true);
    setEditandoAccesorio(accesorio);
    setFormData({
      nombre_producto: accesorio.nombre_producto || '',
      precio_unitario_producto: accesorio.precio_unitario_producto ? accesorio.precio_unitario_producto.toString() : '',
      cantidad_en_stock: accesorio.cantidad_en_stock ? accesorio.cantidad_en_stock.toString() : '',
      categoria: 'accesorios',
      id_categoria_item_fk: 2
    });
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoAccesorio(null);
    setFormData({
      nombre_producto: '',
      precio_unitario_producto: '',
      cantidad_en_stock: '',
      categoria: 'accesorios',
      id_categoria_item_fk: 2
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const registrarAccesorio = async () => {
    const { nombre_producto, precio_unitario_producto, cantidad_en_stock } = formData;
    
    if (!nombre_producto.trim()) {
      mostrarMensaje('Por favor ingresa el nombre del producto.', 'error');
      return;
    }
    
    if (!precio_unitario_producto || !cantidad_en_stock) {
      mostrarMensaje('Por favor completa todos los campos.', 'error');
      return;
    }

    try {
      const datosParaEnviar = {
        nombre_producto: nombre_producto.trim(),
        precio_unitario_producto: parseFloat(precio_unitario_producto),
        cantidad_en_stock: parseInt(cantidad_en_stock),
        categoria: 'accesorios',
        id_categoria_item_fk: 2
      };

      let resultado;
      
      if (editandoAccesorio) {
        // EDITAR - Usar actualizarRegistro con id_producto_pk
        console.log('Editando accesorio ID:', editandoAccesorio.id_producto_pk, 'Datos:', datosParaEnviar);
        resultado = await actualizarRegistro("productos", editandoAccesorio.id_producto_pk, datosParaEnviar);
        
        if (resultado) {
          mostrarMensaje(`${nombre_producto} actualizado correctamente.`);
        } else {
          mostrarMensaje('Error al actualizar el accesorio.', 'error');
        }
      } else {
        // CREAR NUEVO
        console.log('Creando nuevo accesorio:', datosParaEnviar);
        resultado = await insertarRegistro("productos", datosParaEnviar);
        
        if (resultado) {
          mostrarMensaje(`${nombre_producto} agregado correctamente.`);
        } else {
          mostrarMensaje('Error al agregar el accesorio.', 'error');
        }
      }
      
      if (resultado) {
        cerrarModal();
        cargarAccesorios(); // Recargar lista
      }
    } catch (error) {
      console.error('Error al procesar accesorio:', error);
      mostrarMensaje('Error al procesar el accesorio.', 'error');
    }
  };

  const eliminarAccesorio = async (accesorio) => {
    console.log('Intentando eliminar accesorio:', accesorio);
    
    if (window.confirm(`¿Estás seguro de eliminar "${accesorio.nombre_producto}"?`)) {
      try {
        // BORRAR - Usar borrarRegistro con id_producto_pk
        console.log('Eliminando accesorio con ID:', accesorio.id_producto_pk);
        const resultado = await borrarRegistro("productos", accesorio.id_producto_pk);
        
        console.log('Resultado de eliminación:', resultado);
        
        if (resultado) {
          mostrarMensaje(`${accesorio.nombre_producto} eliminado correctamente.`);
          cargarAccesorios(); // Recargar lista
        } else {
          mostrarMensaje('Error al eliminar el accesorio.', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar accesorio:', error);
        mostrarMensaje('Error al eliminar el accesorio.', 'error');
      }
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaActual('');
  };

  // Filtrar accesorios por búsqueda
  const accesoriosFiltrados = accesorios.filter(accesorio => {
    const cumpleBusqueda = !busquedaActual || 
      accesorio.nombre_producto.toLowerCase().includes(busquedaActual.toLowerCase());
    
    return cumpleBusqueda;
  });

  return (
    <div className={`min-h-screen p-5 font-sans transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className={`text-2xl font-bold m-0 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          INVENTARIO DE ACCESORIOS
        </h1>
        <button
          onClick={abrirModal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white border-none rounded cursor-pointer transition-all duration-200"
        >
          + NUEVO ACCESORIO
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          value={busquedaActual}
          onChange={(e) => setBusquedaActual(e.target.value)}
          placeholder="Buscar accesorio por nombre..."
          className={`px-3 py-2 w-64 mr-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
            isDark 
              ? 'border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
              : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          }`}
        />
        <button
          onClick={limpiarBusqueda}
          className={`px-3 py-2 border-none rounded cursor-pointer transition-all duration-200 ${
            isDark 
              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          Limpiar
        </button>
      </div>

      {/* Grid de productos */}
      {accesoriosFiltrados.length === 0 ? (
        <div className={`text-center mt-12 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="text-5xl mb-4">🎾</div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            No hay accesorios en el inventario
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {busquedaActual ? 'No se encontraron accesorios con ese nombre' : 'No hay accesorios registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {accesoriosFiltrados.map((accesorio, index) => {
            const stockBajo = accesorio.cantidad_en_stock < 10;
            
            return (
              <div
                key={accesorio.id_producto_pk || index}
                className={`p-3 rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300 ${
                  isDark 
                    ? 'border border-gray-700 bg-gray-800 hover:border-gray-600' 
                    : 'border border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🎾</div>
                
                <div className={`font-mono px-2 py-1 rounded text-xs mb-2 ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  AC-{accesorio.id_producto_pk || index + 1}
                </div>
                
                <div className={`font-bold text-sm mb-1 ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {accesorio.nombre_producto}
                </div>
                
                <div className={`text-xs mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Accesorio
                </div>
                
                <div className="text-sm mb-3">
                  <div className={
                    stockBajo 
                      ? (isDark ? 'text-red-400 font-semibold' : 'text-red-500 font-semibold')
                      : (isDark ? 'text-gray-300' : 'text-gray-700')
                  }>
                    Stock: {accesorio.cantidad_en_stock}
                  </div>
                  <div className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    L. {parseFloat(accesorio.precio_unitario_producto || 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => abrirModalEdicion(accesorio)}
                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white border-none rounded text-xs cursor-pointer transition-all duration-200"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminarAccesorio(accesorio)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white border-none rounded text-xs cursor-pointer transition-all duration-200"
                  >
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className={`p-5 rounded-lg w-full max-w-md mx-4 shadow-2xl ${
            isDark 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className={`text-xl font-bold m-0 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {editandoAccesorio ? 'EDITAR ACCESORIO' : 'NUEVO ACCESORIO'}
              </h2>
              <span
                onClick={cerrarModal}
                className={`cursor-pointer text-2xl font-bold transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                &times;
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  NOMBRE PRODUCTO:
                </label>
                <input
                  type="text"
                  name="nombre_producto"
                  value={formData.nombre_producto}
                  onChange={handleInputChange}
                  placeholder="Ej: Collar, Correa, Juguete, etc."
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  PRECIO UNITARIO:
                </label>
                <input
                  type="number"
                  name="precio_unitario_producto"
                  value={formData.precio_unitario_producto}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  CANTIDAD EN STOCK:
                </label>
                <input
                  type="number"
                  name="cantidad_en_stock"
                  value={formData.cantidad_en_stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <button
                onClick={registrarAccesorio}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white border-none rounded cursor-pointer transition-all duration-200 font-medium"
              >
                {editandoAccesorio ? 'ACTUALIZAR ACCESORIO' : 'AGREGAR ACCESORIO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje */}
      {mensaje.texto && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 text-white rounded font-bold z-50 transition-all duration-300 ${
          mensaje.tipo === 'error' 
            ? (isDark ? 'bg-red-600' : 'bg-red-500')
            : (isDark ? 'bg-purple-700' : 'bg-purple-600')
        }`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default InventarioAccesorios;