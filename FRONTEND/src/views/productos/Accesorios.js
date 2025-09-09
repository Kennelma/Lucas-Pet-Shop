import React, { useState, useEffect } from 'react';

const InventarioAccesorios = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Accesorio',
    cantidad: 0,
    precio: 0
  });

  const iconosCategoria = {
    'Accesorio': '🎾'
  };

  const prefijosCodigo = {
    'Accesorio': 'AC'
  };

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
      // Asegurar que todos los productos sean de categoría Accesorio
      producto.categoria = 'Accesorio';
      return producto;
    });
    
    if (necesitaMigracion) {
      localStorage.setItem('inventario-accesorios', JSON.stringify(inventarioMigrado));
    }
    setInventario(inventarioMigrado);
  };

  const generarCodigo = (categoria, inventarioData = inventario) => {
    const prefijo = prefijosCodigo[categoria] || 'AC';
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
      codigo: generarCodigo('Accesorio'),
      nombre: '',
      categoria: 'Accesorio',
      cantidad: 0,
      precio: 0
    });
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData({
      codigo: '',
      nombre: '',
      categoria: 'Accesorio',
      cantidad: 0,
      precio: 0
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
    const { codigo, nombre, categoria, cantidad, precio } = formData;
    
    if (!nombre.trim()) {
      mostrarMensaje('Por favor ingresa el nombre del accesorio.', 'error');
      return;
    }
    
    if (!codigo.trim()) {
      mostrarMensaje('Error generando el código del accesorio.', 'error');
      return;
    }
    
    if (cantidad < 0 || precio < 0) {
      mostrarMensaje('La cantidad y el precio deben ser valores positivos.', 'error');
      return;
    }

    // Verificar código único (solo para productos nuevos)
    if (editIndex === -1 && inventario.some(p => p.codigo === codigo)) {
      mostrarMensaje('Ya existe un accesorio con este código.', 'error');
      return;
    }

    let nuevoInventario;
    if (editIndex >= 0) {
      nuevoInventario = [...inventario];
      nuevoInventario[editIndex] = {
        ...nuevoInventario[editIndex],
        nombre,
        categoria: 'Accesorio',
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio)
      };
      mostrarMensaje(`${nombre} (${codigo}) actualizado correctamente.`);
    } else {
      nuevoInventario = [...inventario, {
        codigo,
        nombre,
        categoria: 'Accesorio',
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio)
      }];
      mostrarMensaje(`${nombre} (${codigo}) agregado al inventario.`);
    }

    setInventario(nuevoInventario);
    localStorage.setItem('inventario-accesorios', JSON.stringify(nuevoInventario));
    cerrarModal();
  };

  const editarInventario = (index) => {
    const producto = inventario[index];
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: 'Accesorio',
      cantidad: producto.cantidad,
      precio: producto.precio
    });
    setEditIndex(index);
    setModalVisible(true);
  };

  const borrarInventario = (index) => {
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
      producto.codigo.toLowerCase().includes(busquedaActual.toLowerCase());
    
    return cumpleBusqueda;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-5 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-gray-800 m-0">INVENTARIO DE ACCESORIOS</h1>
        <button
          onClick={abrirModal}
          className="px-4 py-2 bg-purple-600 text-white border-none rounded cursor-pointer hover:bg-purple-700 transition-colors"
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
          placeholder="Buscar accesorio por nombre o código..."
          className="px-3 py-2 w-64 mr-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={limpiarBusqueda}
          className="px-3 py-2 bg-gray-500 text-white border-none rounded cursor-pointer hover:bg-gray-600 transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Grid de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center mt-12 text-gray-600">
          <div className="text-5xl mb-4">🎾</div>
          <h3 className="text-xl font-semibold mb-2">No hay accesorios en el inventario</h3>
          <p className="text-gray-500">Agrega tu primer accesorio usando el botón "Nuevo Accesorio"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {productosFiltrados.map((producto, index) => {
            const originalIndex = inventario.findIndex(item => item.codigo === producto.codigo);
            const stockBajo = producto.cantidad < 10;
            
            return (
              <div
                key={producto.codigo}
                className="border border-gray-200 p-3 rounded-lg text-center bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-2">🎾</div>
                
                <div className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 mb-2">
                  {producto.codigo}
                </div>
                
                <div className="font-bold text-sm mb-1 text-gray-800">
                  {producto.nombre}
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  Accesorio
                </div>
                
                <div className="text-sm mb-3">
                  <div className={`${stockBajo ? 'text-red-500 font-semibold' : 'text-gray-700'}`}>
                    Stock: {producto.cantidad}
                  </div>
                  <div className="text-gray-700 font-medium">
                    L. {parseFloat(producto.precio).toFixed(2)}
                  </div>
                </div>
                
                <div className="space-x-1">
                  <button
                    onClick={() => editarInventario(originalIndex)}
                    className="px-2 py-1 bg-orange-500 text-white border-none rounded text-xs cursor-pointer hover:bg-orange-600 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => borrarInventario(originalIndex)}
                    className="px-2 py-1 bg-red-500 text-white border-none rounded text-xs cursor-pointer hover:bg-red-600 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold m-0 text-gray-800">
                {editIndex >= 0 ? 'EDITAR ACCESORIO' : 'NUEVO ACCESORIO'}
              </h2>
              <span
                onClick={cerrarModal}
                className="cursor-pointer text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                &times;
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  CÓDIGO ACCESORIO:
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded cursor-not-allowed"
                />
                <div className="text-xs text-gray-500 mt-1">
                  El código se genera automáticamente
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  NOMBRE ACCESORIO:
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Collar, Correa, Juguete, Cama, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  CANTIDAD:
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  PRECIO:
                </label>
                <input type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={registrarInventario}
                className="w-full px-4 py-3 bg-purple-600 text-white border-none rounded cursor-pointer hover:bg-purple-700 transition-colors font-medium"
              >
                {editIndex >= 0 ? 'ACTUALIZAR ACCESORIO' : 'AGREGAR ACCESORIO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje */}
      {mensaje.texto && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 text-white rounded font-bold z-50 ${
          mensaje.tipo === 'error' ? 'bg-red-500' : 'bg-purple-600'
        }`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default InventarioAccesorios;