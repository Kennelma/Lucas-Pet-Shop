import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import ModalNuevoAnimal from './modal_nuevo_animal';
import ModalActualizarAnimal from './modal_actualizar_animal';
import { verProductos, eliminarProducto } from '../../../AXIOS.SERVICES/products-axios';

const Animales = () => {
  const [animales, setAnimales] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  const mostrarMensaje = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(''), 3000);
  };

  const cargarAnimales = async () => {
    setLoading(true);
    try {
      const productos = await verProductos('ANIMALES');
      setAnimales(
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
              especie: item.especie || 'No especificada',
              sexo: item.sexo || 'N/A',
              sku: item.sku || ''
            }))
          : []
      );
    } catch (error) {
      console.error('Error al cargar animales:', error);
      mostrarMensaje('Error al cargar animales');
      setAnimales([]);
    }
    setLoading(false);
  };

  useEffect(() => { cargarAnimales(); }, []);

  const animalesFiltrados = animales.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.especie.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
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
      <h1 className="text-2xl font-bold mb-5">INVENTARIO DE ANIMALES</h1>

      {/* Barra de búsqueda + botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <input 
            value={busqueda} 
            onChange={(e)=>setBusqueda(e.target.value)} 
            placeholder="Buscar..." 
            className="w-full px-4 py-2 border rounded-full"
          />
          {busqueda && (
            <button 
              onClick={()=>setBusqueda('')} 
              className="absolute right-3 top-2 text-gray-500"
            >
              ×
            </button>
          )}
        </div>

        <Button 
          label="Nuevo" 
          icon="pi pi-plus" 
          severity="success" 
          className="p-button-rounded" 
          style={{ borderRadius: '12px' }}
          onClick={()=>setModalVisible(true)}
        />
      </div>

      {/* Lista */}
      {animalesFiltrados.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-bold mb-2">Sin animales registrados</h3>
          <p>{busqueda ? 'No hay coincidencias' : 'Agrega el primero'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {animalesFiltrados.map((a, index)=>(
            <div key={a.id_producto} className="bg-gray-100 rounded-xl shadow-sm p-4 relative hover:shadow-md transition">
              
              <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                {a.imagenUrl ? (
                  <img src={a.imagenUrl} alt={a.nombre} className="w-full h-full object-contain"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                )}
              </div>

              {/* Información del animal */}
              <div className="text-center mb-8">
                <div className="text-sm font-bold mb-1">{a.nombre}</div>

                {/* SKU debajo del nombre */}
                <div className="text-xs text-gray-500 mb-2">SKU: {a.sku}</div>

                <div className="text-sm text-gray-600 mb-1">Especie: {a.especie}</div>
                <div className="text-sm text-gray-600 mb-1">Sexo: {a.sexo}</div>
                <div className="text-sm font-bold mb-1">L.{a.precio.toFixed(2)}</div>

                {/* Stock en azul o rojo */}
                <div className={`text-sm font-semibold ${a.stock <= a.stock_minimo ? 'text-red-600' : 'text-blue-600'}`}>
                  Stock: {a.stock}
                </div>

                {/* Estado en mayúsculas */}
                <div className={`text-xs font-semibold mt-1 ${a.activo ? 'text-green-600' : 'text-red-600'}`}>
                  {a.activo ? 'ACTIVO' : 'INACTIVO'}
                </div>
              </div>

              {/* Botones circulares */}
              <div className="flex justify-between absolute bottom-2 left-2 right-2 px-2">
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  rounded
                  size="small"
                  style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', margin: '0 4px' }}
                  onClick={async () => {
                    const confirmar = window.confirm(`¿Deseas eliminar ${a.nombre}?`);
                    if (!confirmar) return;
                    try {
                      const resultado = await eliminarProducto(a.id_producto);
                      if (resultado.Consulta) {
                        mostrarMensaje('Animal eliminado con éxito');
                        setAnimales(prev => prev.filter(animal => animal.id_producto !== a.id_producto));
                      } else {
                        mostrarMensaje(`Error: ${resultado.error}`);
                      }
                    } catch (err) {
                      mostrarMensaje(`Error: ${err.message}`);
                    }
                  }} 
                />
                <Button 
                  icon="pi pi-cog" 
                  severity="info" 
                  rounded
                  size="small"
                  style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', margin: '0 4px' }}
                  onClick={()=>{setEditIndex(index); setModalVisible(true)}} 
                />
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {modalVisible && (editIndex >= 0 ? (
        <ModalActualizarAnimal 
          isOpen={modalVisible} 
          onClose={()=>{setModalVisible(false); setEditIndex(-1)}} 
          onSave={cargarAnimales} 
          editData={animales[editIndex]} 
        />
      ) : (
        <ModalNuevoAnimal 
          isOpen={modalVisible} 
          onClose={()=>{setModalVisible(false); setEditIndex(-1)}} 
          onSave={cargarAnimales} 
        />
      ))}

      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold shadow-md">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Animales;
