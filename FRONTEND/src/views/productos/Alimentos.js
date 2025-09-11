import { useEffect, useState } from "react";
import { insertarProductoAlimento, obtenerProductosAlimentos, actualizarRegistro, borrarRegistro } from "../../services/apiService.js";

const InventarioAlimentos = () => {
  const [alimentos, setAlimentos] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [editandoAlimento, setEditandoAlimento] = useState(null);
  
  // SOLO LOS 5 CAMPOS QUE PEDISTE
  const [formData, setFormData] = useState({
    nombre_producto: '',
    precio_unitario_producto: '',
    cantidad_en_stock: '',
    alimento_destinado: '',
    peso_alimento: ''
  });

  // Detectar tema oscuro
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

  // Cargar alimentos
  useEffect(() => {
    cargarAlimentos();
  }, []);

  const cargarAlimentos = async () => {
    try {
      const response = await obtenerProductosAlimentos();
      console.log('Respuesta completa de la API:', response);
      
      // Verificar si response tiene datos
      if (response && response.datos) {
        setAlimentos(response.datos);
        console.log('Alimentos cargados:', response.datos);
      } else if (Array.isArray(response)) {
        setAlimentos(response);
        console.log('Alimentos cargados (array directo):', response);
      } else {
        console.log('No se encontraron datos de alimentos');
        setAlimentos([]);
      }
    } catch (error) {
      console.error('Error al cargar alimentos:', error);
      mostrarMensaje('Error al cargar los alimentos.', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const abrirModal = () => {
    setModalVisible(true);
    setEditandoAlimento(null);
    setFormData({
      nombre_producto: '',
      precio_unitario_producto: '',
      cantidad_en_stock: '',
      alimento_destinado: '',
      peso_alimento: ''
    });
  };

  const abrirModalEdicion = (alimento) => {
    console.log('Editando alimento:', alimento);
    setModalVisible(true);
    setEditandoAlimento(alimento);
    setFormData({
      nombre_producto: alimento.nombre_producto || '',
      precio_unitario_producto: alimento.precio_unitario_producto ? alimento.precio_unitario_producto.toString() : '',
      cantidad_en_stock: alimento.cantidad_en_stock ? alimento.cantidad_en_stock.toString() : '',
      alimento_destinado: alimento.alimento_destinado || '',
      peso_alimento: alimento.peso_alimento || ''
    });
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoAlimento(null);
    setFormData({
      nombre_producto: '',
      precio_unitario_producto: '',
      cantidad_en_stock: '',
      alimento_destinado: '',
      peso_alimento: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const registrarAlimento = async () => {
    const { nombre_producto, precio_unitario_producto, cantidad_en_stock, alimento_destinado, peso_alimento } = formData;
    
    if (!nombre_producto.trim()) {
      mostrarMensaje('Por favor ingresa el nombre del alimento.', 'error');
      return;
    }
    
    if (!precio_unitario_producto || !cantidad_en_stock) {
      mostrarMensaje('Por favor completa precio y cantidad.', 'error');
      return;
    }

    if (!alimento_destinado.trim()) {
      mostrarMensaje('Por favor ingresa el destino del alimento.', 'error');
      return;
    }

    if (!peso_alimento.trim()) {
      mostrarMensaje('Por favor ingresa el peso del alimento.', 'error');
      return;
    }

    try {
      // SOLO LOS 5 CAMPOS QUE PEDISTE
      const datosParaEnviar = {
        nombre_producto: nombre_producto.trim(),
        precio_unitario_producto: parseFloat(precio_unitario_producto),
        cantidad_en_stock: parseInt(cantidad_en_stock),
        alimento_destinado: alimento_destinado.trim(),
        peso_alimento: peso_alimento.trim()
      };

      let resultado;
      
      if (editandoAlimento) {
        console.log('EDITANDO con ID:', editandoAlimento.id_producto_pk, 'Datos:', datosParaEnviar);
        resultado = await actualizarRegistro("productos-alimentos", editandoAlimento.id_producto_pk, datosParaEnviar);
        
        if (resultado) {
          mostrarMensaje(`${nombre_producto} actualizado correctamente.`);
        } else {
          mostrarMensaje('Error al actualizar el alimento.', 'error');
        }
      } else {
        console.log('CREANDO nuevo alimento:', datosParaEnviar);
        resultado = await insertarProductoAlimento(datosParaEnviar);
        
        if (resultado) {
          mostrarMensaje(`${nombre_producto} agregado correctamente.`);
        } else {
          mostrarMensaje('Error al agregar el alimento.', 'error');
        }
      }
      
      if (resultado) {
        cerrarModal();
        cargarAlimentos();
      }
    } catch (error) {
      console.error('Error al procesar alimento:', error);
      mostrarMensaje('Error al procesar el alimento.', 'error');
    }
  };

  const eliminarAlimento = async (alimento) => {
    if (window.confirm(`¿Estás seguro de eliminar "${alimento.nombre_producto}"?`)) {
      try {
        console.log('ELIMINANDO alimento con ID:', alimento.id_producto_pk);
        const resultado = await borrarRegistro("productos-alimentos", alimento.id_producto_pk);
        
        if (resultado) {
          mostrarMensaje(`${alimento.nombre_producto} eliminado correctamente.`);
          cargarAlimentos();
        } else {
          mostrarMensaje('Error al eliminar el alimento.', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar alimento:', error);
        mostrarMensaje('Error al eliminar el alimento.', 'error');
      }
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaActual('');
  };

  // Filtrar alimentos
  const alimentosFiltrados = alimentos.filter(alimento => {
    const cumpleBusqueda = !busquedaActual || 
      alimento.nombre_producto.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      (alimento.alimento_destinado && alimento.alimento_destinado.toLowerCase().includes(busquedaActual.toLowerCase()));
    
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
          INVENTARIO DE ALIMENTOS
        </h1>
        <button
          onClick={abrirModal}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white border-none rounded cursor-pointer transition-all duration-200"
        >
          + NUEVO ALIMENTO
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          value={busquedaActual}
          onChange={(e) => setBusquedaActual(e.target.value)}
          placeholder="Buscar alimento..."
          className={`px-3 py-2 w-80 mr-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
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

      {/* Debug info */}
      <div className="mb-4 text-sm text-gray-500">
        Total alimentos cargados: {alimentos.length}
      </div>

      {/* Grid de productos */}
      {alimentosFiltrados.length === 0 ? (
        <div className={`text-center mt-12 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="text-5xl mb-4">🥘</div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            No hay alimentos en el inventario
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {alimentos.length === 0 ? 'No hay alimentos registrados' : 'No se encontraron alimentos con ese criterio'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {alimentosFiltrados.map((alimento, index) => {
            const stockBajo = alimento.cantidad_en_stock < 10;
            
            return (
              <div
                key={alimento.id_producto_pk || index}
                className={`p-3 rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300 ${
                  isDark 
                    ? 'border border-gray-700 bg-gray-800 hover:border-gray-600' 
                    : 'border border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🥘</div>
                
                <div className={`font-mono px-2 py-1 rounded text-xs mb-2 ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  AL-{alimento.id_producto_pk || index + 1}
                </div>
                
                {/* NOMBRE PRODUCTO */}
                <div className={`font-bold text-sm mb-2 ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {alimento.nombre_producto}
                </div>
                
                {/* ALIMENTO DESTINADO */}
                {alimento.alimento_destinado && (
                  <div className={`text-xs mb-1 font-medium ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    Para: {alimento.alimento_destinado}
                  </div>
                )}
                
                {/* PESO ALIMENTO */}
                {alimento.peso_alimento && (
                  <div className={`text-xs mb-2 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Peso: {alimento.peso_alimento}
                  </div>
                )}
                
                {/* CANTIDAD EN STOCK Y PRECIO */}
                <div className="text-sm mb-3">
                  <div className={
                    stockBajo 
                      ? (isDark ? 'text-red-400 font-semibold' : 'text-red-500 font-semibold')
                      : (isDark ? 'text-gray-300' : 'text-gray-700')
                  }>
                    Stock: {alimento.cantidad_en_stock}
                  </div>
                  <div className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    L. {parseFloat(alimento.precio_unitario_producto || 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => abrirModalEdicion(alimento)}
                    className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white border-none rounded text-xs cursor-pointer transition-all duration-200"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminarAlimento(alimento)}
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

      {/* Modal - SOLO LOS 5 CAMPOS */}
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
                {editandoAlimento ? 'EDITAR ALIMENTO' : 'NUEVO ALIMENTO'}
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
              {/* 1. NOMBRE PRODUCTO */}
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
                  placeholder="Ej: Croquetas Premium"
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* 2. PRECIO UNITARIO PRODUCTO */}
              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  PRECIO UNITARIO PRODUCTO:
                </label>
                <input
                  type="number"
                  name="precio_unitario_producto"
                  value={formData.precio_unitario_producto}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* 3. CANTIDAD EN STOCK */}
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
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* 4. ALIMENTO DESTINADO */}
              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ALIMENTO DESTINADO:
                </label>
                <input
                  type="text"
                  name="alimento_destinado"
                  value={formData.alimento_destinado}
                  onChange={handleInputChange}
                  placeholder="Ej: Perros, Gatos, Conejos"
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* 5. PESO ALIMENTO */}
              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  PESO ALIMENTO:
                </label>
                <input
                  type="text"
                  name="peso_alimento"
                  value={formData.peso_alimento}
                  onChange={handleInputChange}
                  placeholder="Ej: 1kg, 5kg, 15kg"
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <button
                onClick={registrarAlimento}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded cursor-pointer transition-all duration-200 font-medium"
              >
                {editandoAlimento ? 'ACTUALIZAR ALIMENTO' : 'AGREGAR ALIMENTO'}
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
            : (isDark ? 'bg-green-700' : 'bg-green-600')
        }`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default InventarioAlimentos;