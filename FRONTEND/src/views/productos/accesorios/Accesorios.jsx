import React, { useState, useEffect } from 'react';
import FormularioAccesorio from './FormularioAccesorio';

const InventarioAccesorios = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [isDark, setIsDark] = useState(false);

  const iconosCategoria = {
    'Collar': '🦮',
    'Correa': '🔗',
    'Juguete': '🧸',
    'Cama': '🛏️',
    'Comedero': '🥣',
    'Transportadora': '🧳',
    'Higiene': '🧼',
    'Ropa': '👕'
  };

  const prefijosCodigo = {
    'Collar': 'COL',
    'Correa': 'COR',
    'Juguete': 'JUG',
    'Cama': 'CAM',
    'Comedero': 'COM',
    'Transportadora': 'TRA',
    'Higiene': 'HIG',
    'Ropa': 'ROP'
  };

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

  // Cargar inventario desde localStorage al iniciar
  useEffect(() => {
    const inventarioGuardado = JSON.parse(localStorage.getItem('inventario-accesorios')) || [];
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
      return producto;
    });
    
    if (necesitaMigracion) {
      localStorage.setItem('inventario-accesorios', JSON.stringify(inventarioMigrado));
    }
    setInventario(inventarioMigrado);
  };

  const generarCodigo = (categoria, inventarioData = inventario) => {
    const prefijo = prefijosCodigo[categoria] || 'ACC';
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
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditIndex(-1);
  };

  const guardarAccesorio = (datosAccesorio) => {
    const { codigo, nombre, categoria, cantidad, precio, imagenUrl } = datosAccesorio;
    
    // Verificar código único (solo para productos nuevos)
    if (editIndex === -1 && inventario.some(p => p.codigo === codigo)) {
      mostrarMensaje('Ya existe un accesorio con este código.', 'error');
      return false;
    }

    let nuevoInventario;
    if (editIndex >= 0) {
      nuevoInventario = [...inventario];
      nuevoInventario[editIndex] = {
      ...nuevoInventario[editIndex],
      nombre,
      categoria,
      cantidad: parseInt(cantidad),
      precio: parseFloat(precio),
      imagenUrl: imagenUrl || nuevoInventario[editIndex].imagenUrl
    };
      mostrarMensaje(`${nombre} (${codigo}) actualizado correctamente.`);
    } else {
      nuevoInventario = [...inventario, {
    codigo,
    nombre,
    categoria,
    cantidad: parseInt(cantidad),
    precio: parseFloat(precio),
    imagenUrl: imagenUrl || ''
      }];
      mostrarMensaje(`${nombre} (${codigo}) agregado al inventario.`);
    }

    setInventario(nuevoInventario);
    localStorage.setItem('inventario-accesorios', JSON.stringify(nuevoInventario));
    cerrarModal();
    return true;
  };

  const editarAccesorio = (index) => {
    setEditIndex(index);
    setModalVisible(true);
  };

  const borrarAccesorio = (index) => {
    const producto = inventario[index];
    if (window.confirm(`¿Deseas eliminar "${producto.nombre}" (${producto.codigo}) del inventario?`)) {
      const nuevoInventario = inventario.filter((_, i) => i !== index);
      setInventario(nuevoInventario);
      localStorage.setItem('inventario-accesorios', JSON.stringify(nuevoInventario));
      mostrarMensaje('Accesorio eliminado correctamente.');
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaActual('');
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = inventario.filter(producto => {
    const cumpleBusqueda = !busquedaActual || 
      producto.nombre.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      (producto.marca && producto.marca.toLowerCase().includes(busquedaActual.toLowerCase())) ||
      (producto.color && producto.color.toLowerCase().includes(busquedaActual.toLowerCase()));
    
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
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white border-none rounded cursor-pointer transition-all duration-200 flex items-center gap-2"
        >
          + NUEVO ACCESORIO
        </button>
      </div>

      {/* Búsqueda */}
      {/* Búsqueda */}
<div className="mb-6">
  <div className={`relative w-96 rounded-full border-2 transition-all duration-200 ${
    isDark 
      ? 'border-gray-600 bg-gray-800 focus-within:border-purple-500' 
      : 'border-gray-300 bg-white focus-within:border-purple-500'
  }`}>
    {/* Ícono de búsqueda */}
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
      <svg 
        className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} 
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
      className={`w-full pl-12 pr-12 py-3 rounded-full bg-transparent focus:outline-none ${
        isDark 
          ? 'text-gray-100 placeholder-gray-400' 
          : 'text-gray-900 placeholder-gray-500'
      }`}
    />
    
    {/* Botón limpiar (solo se muestra si hay texto) */}
    {busquedaActual && (
      <button
        onClick={limpiarBusqueda}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
          isDark 
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
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
        <div className={`text-center mt-12 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="text-5xl mb-4">🛍️</div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            No hay accesorios en el inventario
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Agrega tu primer accesorio usando el botón "Nuevo Accesorio"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {productosFiltrados.map((producto, index) => {
            const originalIndex = inventario.findIndex(item => item.codigo === producto.codigo);
            const stockBajo = producto.cantidad < 5;
            
            return (
              <div
                key={producto.codigo}
                className={`rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 relative ${
                  isDark 
                    ? 'bg-gray-700' 
                    : 'bg-gray-200'
                }`}
              >
                {/* Contenedor de imagen con marco blanco */}
                <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                  {producto.imagenUrl ? (
                    <img 
                      src={producto.imagenUrl} 
                      alt={producto.nombre}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {/* Área vacía - sin contenido */}
                    </div>
                  )}
                </div>
                
                {/* Información del producto centrada */}
                <div className="text-center space-y-2 mb-8">
                  <div className={`font-semibold text-sm ${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {producto.nombre}
                  </div>
                  
                  <div className={`font-bold text-lg ${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    L. {parseFloat(producto.precio).toFixed(0)}
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    stockBajo ? 'text-red-600' : (isDark ? 'text-gray-200' : 'text-gray-700')
                  }`}>
                    Stock: {producto.cantidad}
                  </div>
                </div>
                
                {/* Iconos en las esquinas inferiores */}
                <div className="absolute bottom-4 left-4">
                  <button
                    onClick={() => borrarAccesorio(originalIndex)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isDark 
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-300'
                    }`}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => editarAccesorio(originalIndex)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isDark 
                        ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-300'
                    }`}
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
          isDark={isDark}
          generarCodigo={generarCodigo}
        />
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