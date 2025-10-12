import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import ModalNuevoAlimento from './modal_nuevo_alimento';
import ModalActualizarAlimento from './modal_actualizar_alimento';
import { verProductos, eliminarProducto } from '../../../AXIOS.SERVICES/products-axios';

const Alimentos = () => {
  const [alimentos, setAlimentos] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  const mostrarMensaje = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(''), 3000);
  };

  const cargarAlimentos = async () => {
    setLoading(true);
    try {
      const productos = await verProductos('ALIMENTOS');
      setAlimentos(
        Array.isArray(productos)
          ? productos.map((item) => ({
              id_producto: item.id_producto_pk,
              nombre: item.nombre_producto,
              precio: parseFloat(item.precio_producto) || 0,
              stock: item.stock ?? 0,
              stock_minimo: item.stock_minimo ?? 0,
              activo: item.activo === 1 || item.activo === true,
              tipo_producto: item.tipo_producto_fk,
              imagenUrl: item.imagen_url || '',
              destino: item.alimento_destinado || '',
              peso: parseFloat(item.peso_alimento) || 0,
              sku: item.sku || ''
            }))
          : []
      );
    } catch (error) {
      console.error('Error al cargar alimentos:', error);
      mostrarMensaje('Error al cargar alimentos');
      setAlimentos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarAlimentos();
  }, []);

  const alimentosFiltrados = alimentos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminarAlimento = async (id, nombre) => {
    if (!window.confirm(`¿Deseas eliminar "${nombre}"?`)) return;
    try {
      const res = await eliminarProducto(id);
      if (res.Consulta) {
        mostrarMensaje('Alimento eliminado con éxito');
        setAlimentos((prev) => prev.filter((a) => a.id_producto !== id));
      } else {
        mostrarMensaje(`Error: ${res.error}`);
      }
    } catch (err) {
      mostrarMensaje(`Error: ${err.message}`);
    }
  };

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
      {/* Título */}
      <h1 className="text-2xl font-bold mb-5">INVENTARIO DE ALIMENTOS</h1>

      {/* Barra de búsqueda + botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="w-full px-4 py-2 border rounded-full"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-2 text-gray-500"
            >
              ×
            </button>
          )}
        </div>

        {/* Botón NUEVO */}
        <button
          onClick={() => setModalVisible(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition"
        >
          <FontAwesomeIcon icon={faUserPlus} />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Contenido */}
      {alimentosFiltrados.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-6xl mb-4">🥣</div>
          <h3 className="text-xl font-bold mb-2">Sin alimentos registrados</h3>
          <p>{busqueda ? 'No hay coincidencias' : 'Agrega el primero'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {alimentosFiltrados.map((a, index) => (
            <div
              key={a.id_producto}
              className="bg-gray-100 rounded-xl shadow-sm p-4 relative hover:shadow-md transition"
            >
              {/* Imagen */}
              <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                {a.imagenUrl ? (
                  <img
                    src={a.imagenUrl}
                    alt={a.nombre}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="text-center mb-10">
                <div className="text-sm font-bold mb-1">{a.nombre}</div>
                <div className="text-xs text-gray-500 mb-2">SKU: {a.sku}</div>
                <div className="text-sm text-gray-600 mb-1">
                  Destino: {a.destino}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Peso: {a.peso} kg
                </div>
                <div className="text-sm font-bold mb-1">
                  L.{a.precio.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    a.stock <= a.stock_minimo ? 'text-red-600' : 'text-blue-600'
                  }`}
                >
                  Stock: {a.stock}
                </div>
                <div
                  className={`text-xs font-semibold mt-1 ${
                    a.activo ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {a.activo ? 'ACTIVO' : 'INACTIVO'}
                </div>
              </div>

              {/* 🔹 Botones en esquinas opuestas */}
              <button
                className="absolute bottom-3 left-3 text-blue-500 hover:text-blue-700 p-2 rounded transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditIndex(index);
                  setModalVisible(true);
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} size="lg" />
              </button>

              <button
                className="absolute bottom-3 right-3 text-red-500 hover:text-red-700 p-2 rounded transition"
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarAlimento(a.id_producto, a.nombre);
                }}
              >
                <FontAwesomeIcon icon={faTrash} size="lg" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {modalVisible &&
        (editIndex >= 0 ? (
          <ModalActualizarAlimento
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setEditIndex(-1);
            }}
            onSave={cargarAlimentos}
            editData={alimentos[editIndex]}
          />
        ) : (
          <ModalNuevoAlimento
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setEditIndex(-1);
            }}
            onSave={cargarAlimentos}
          />
        ))}

      {/* Mensaje flotante */}
      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold shadow-md">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Alimentos;
