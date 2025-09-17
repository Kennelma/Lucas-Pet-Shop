import React, { useState, useEffect } from 'react';

const InventarioAlimentos = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [isDark, setIsDark] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Alimento',
    cantidad: 0,
    precio: 0,
    fechaVencimiento: '',
    marca: ''
  });

  const iconosCategoria = {
    'Alimento': '🥘'
  };

  const prefijosCodigo = {
    'Alimento': 'A'
  };

  // Detectar tema oscuro de Core UI
  useEffect(() => {
    const detectarTemaCoreUI = () => {
      // Core UI usa data-coreui-theme="dark" en el HTML
      const htmlElement = document.documentElement;
      const esTemaOscuro = htmlElement.getAttribute('data-coreui-theme') === 'dark';
      setIsDark(esTemaOscuro);
    };

    // Detectar tema inicial
    detectarTemaCoreUI();

    // Observador para detectar cambios en el atributo data-coreui-theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-coreui-theme' || mutation.attributeName === 'class')) {
          detectarTemaCoreUI();
        }
      });
    });
    
    // Observar cambios en el HTML
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme', 'class']
    });

    // También observar cambios en el body por si acaso
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-coreui-theme', 'class']
    });

    // Limpiar observador al desmontar
    return () => observer.disconnect();
  }, []);

  // Cargar inventario desde localStorage al iniciar
  useEffect(() => {
    const inventarioGuardado = JSON.parse(localStorage.getItem('inventario-alimentos')) || [];
    migrarInventario(inventarioGuardado);
  }, []);

  // Migrar inventario existente sin códigos
  const migrarInventario = (inventarioData) => {
    let necesitaMigracion = false;
    const inventarioMigrado = inventarioData.map(producto => {
      if (!producto.codigo) {
        producto.codigo = generarCodigo(producto.categoria, inventarioData);
        necesitaMigracion = true;
      }
      // Asegurar que todos los productos sean de categoría Alimento
      producto.categoria = 'Alimento';
      return producto;
    });
    
    if (necesitaMigracion) {
      localStorage.setItem('inventario-alimentos', JSON.stringify(inventarioMigrado));
    }
    setInventario(inventarioMigrado);
  };

  const generarCodigo = (categoria, inventarioData = inventario) => {
    const prefijo = prefijosCodigo[categoria] || 'A';
    const existentes = inventarioData.filter(p => p.categoria === categoria).length;
    const numero = String(existentes + 1).padStart(3, '0');
    return `${prefijo}-${numero}`;
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const abrirModal = () => {
    setModalVisible(true);
    setEditIndex(-1);
    setFormData({
      codigo: generarCodigo('Alimento'),
      nombre: '',
      categoria: 'Alimento',
      cantidad: 0,
      precio: 0,
      fechaVencimiento: '',
      marca: ''
    });
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData({
      codigo: '',
      nombre: '',
      categoria: 'Alimento',
      cantidad: 0,
      precio: 0,
      fechaVencimiento: '',
      marca: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const registrarInventario = () => {
    const { codigo, nombre, categoria, cantidad, precio, fechaVencimiento, marca } = formData;
    
    if (!nombre.trim()) {
      mostrarMensaje('Por favor ingresa el nombre del alimento.', 'error');
      return;
    }
    
    if (!codigo.trim()) {
      mostrarMensaje('Error generando el código del alimento.', 'error');
      return;
    }
    
    if (cantidad < 0 || precio < 0) {
      mostrarMensaje('La cantidad y el precio deben ser valores positivos.', 'error');
      return;
    }

    if (!marca.trim()) {
      mostrarMensaje('Por favor ingresa la marca del alimento.', 'error');
      return;
    }

    // Verificar código único (solo para productos nuevos)
    if (editIndex === -1 && inventario.some(p => p.codigo === codigo)) {
      mostrarMensaje('Ya existe un alimento con este código.', 'error');
      return;
    }

    let nuevoInventario;
    if (editIndex >= 0) {
      nuevoInventario = [...inventario];
      nuevoInventario[editIndex] = {
        ...nuevoInventario[editIndex],
        nombre,
        categoria: 'Alimento',
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio),
        fechaVencimiento,
        marca
      };
      mostrarMensaje(`${nombre} (${codigo}) actualizado correctamente.`);
    } else {
      nuevoInventario = [...inventario, {
        codigo,
        nombre,
        categoria: 'Alimento',
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio),
        fechaVencimiento,
        marca
      }];
      mostrarMensaje(`${nombre} (${codigo}) agregado al inventario.`);
    }

    setInventario(nuevoInventario);
    localStorage.setItem('inventario-alimentos', JSON.stringify(nuevoInventario));
    cerrarModal();
  };

  const editarInventario = (index) => {
    const producto = inventario[index];
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: 'Alimento',
      cantidad: producto.cantidad,
      precio: producto.precio,
      fechaVencimiento: producto.fechaVencimiento || '',
      marca: producto.marca || ''
    });
    setEditIndex(index);
    setModalVisible(true);
  };

  const borrarInventario = (index) => {
    const producto = inventario[index];
    if (window.confirm(`¿Deseas eliminar "${producto.nombre}" (${producto.codigo}) del inventario?`)) {
      const nuevoInventario = inventario.filter((_, i) => i !== index);
      setInventario(nuevoInventario);
      localStorage.setItem('inventario-alimentos', JSON.stringify(nuevoInventario));
      mostrarMensaje('Alimento eliminado correctamente.');
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaActual('');
  };

  // Verificar si un producto está próximo a vencer (30 días)
  const estaProximoAVencer = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    const diferenciaDias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
    return diferenciaDias <= 30 && diferenciaDias > 0;
  };

  // Verificar si un producto está vencido
  const estaVencido = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    return fechaVenc < hoy;
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = inventario.filter(producto => {
    const cumpleBusqueda = !busquedaActual || 
      producto.nombre.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      (producto.marca && producto.marca.toLowerCase().includes(busquedaActual.toLowerCase()));
    
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
          placeholder="Buscar alimento por nombre, código o marca..."
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

      {/* Grid de productos */}
      {productosFiltrados.length === 0 ? (
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
            Agrega tu primer alimento usando el botón "Nuevo Alimento"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {productosFiltrados.map((producto, index) => {
            const originalIndex = inventario.findIndex(item => item.codigo === producto.codigo);
            const stockBajo = producto.cantidad < 10;
            const proximoVencer = estaProximoAVencer(producto.fechaVencimiento);
            const vencido = estaVencido(producto.fechaVencimiento);
            
            return (
              <div
                key={producto.codigo}
                className={`p-3 rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300 ${
                  vencido 
                    ? (isDark 
                        ? 'border-2 border-red-500 bg-gray-800 hover:border-red-400' 
                        : 'border-2 border-red-500 bg-red-50 hover:border-red-400')
                    : proximoVencer 
                      ? (isDark 
                          ? 'border-2 border-yellow-500 bg-gray-800 hover:border-yellow-400' 
                          : 'border-2 border-yellow-500 bg-yellow-50 hover:border-yellow-400')
                      : isDark 
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
                  {producto.codigo}
                </div>
                
                <div className={`font-bold text-sm mb-1 ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {producto.nombre}
                </div>
                
                {producto.marca && (
                  <div className={`text-xs mb-1 font-medium ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {producto.marca}
                  </div>
                )}
                
                <div className={`text-xs mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Alimento
                </div>
                
                {producto.fechaVencimiento && (
                  <div className={`text-xs mb-2 ${
                    vencido 
                      ? 'text-red-600 font-bold' 
                      : proximoVencer 
                        ? 'text-yellow-600 font-semibold' 
                        : isDark 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                  }`}>
                    {vencido ? '🚨 VENCIDO' : proximoVencer ? '⚠️ Próximo a vencer' : 'Vence'}: {new Date(producto.fechaVencimiento).toLocaleDateString()}
                  </div>
                )}
                
                <div className="text-sm mb-3">
                  <div className={
                    stockBajo 
                      ? (isDark ? 'text-red-400 font-semibold' : 'text-red-500 font-semibold')
                      : (isDark ? 'text-gray-300' : 'text-gray-700')
                  }>
                    Stock: {producto.cantidad}
                  </div>
                  <div className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    L. {parseFloat(producto.precio).toFixed(2)}
                  </div>
                </div>
                
                <div className="space-x-1">
                  <button
                    onClick={() => editarInventario(originalIndex)}
                    className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white border-none rounded text-xs cursor-pointer transition-all duration-200"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => borrarInventario(originalIndex)}
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
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black bg-opacity-50">
          <div className={`p-5 rounded-lg w-full max-w-md mx-4 shadow-2xl ${
            isDark 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className={`text-xl font-bold m-0 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {editIndex >= 0 ? 'EDITAR ALIMENTO' : 'NUEVO ALIMENTO'}
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
                  CÓDIGO ALIMENTO:
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  readOnly
                  className={`w-full px-3 py-2 rounded cursor-not-allowed ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                />
                <div className={`text-xs mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  El código se genera automáticamente
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  NOMBRE ALIMENTO:
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Croquetas, Comida húmeda, Snacks, etc."
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
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
                  MARCA:
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  placeholder="Ej: Royal Canin, Hills, Purina, etc."
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
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
                  FECHA DE VENCIMIENTO:
                </label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'border border-gray-600 bg-gray-700 text-gray-100' 
                      : 'border border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  CANTIDAD:
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
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

              <div>
                <label className={`block mb-1 font-bold text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  PRECIO:
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
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

              <button
                onClick={registrarInventario}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded cursor-pointer transition-all duration-200 font-medium"
              >
                {editIndex >= 0 ? 'ACTUALIZAR ALIMENTO' : 'AGREGAR ALIMENTO'}
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