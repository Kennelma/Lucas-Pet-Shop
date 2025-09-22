import React, { useState, useEffect } from 'react';
import ModalNuevoAlimento from './modal_nuevo_alimento';
import ModalActualizarAlimento from './modal_actualizar_alimento';
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../../services/apiService';

const Alimentos = () => {
  const [alimentos, setAlimentos] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  const imagenStorage = {
    guardar: (id, url) => {
      const imgs = JSON.parse(localStorage.getItem('imagenesAlimentos') || '{}');
      imgs[id] = url;
      localStorage.setItem('imagenesAlimentos', JSON.stringify(imgs));
    },
    obtener: (id) => JSON.parse(localStorage.getItem('imagenesAlimentos') || '{}')[id] || '',
    eliminar: (id) => {
      const imgs = JSON.parse(localStorage.getItem('imagenesAlimentos') || '{}');
      delete imgs[id];
      localStorage.setItem('imagenesAlimentos', JSON.stringify(imgs));
    }
  };

  const mostrarMensaje = (txt) => { setMensaje(txt); setTimeout(() => setMensaje(''), 3000); };

  const cargarAlimentos = async () => {
    setLoading(true);
    try {
      const datos = await verRegistro('tbl_alimentos');
      setAlimentos(Array.isArray(datos) ? datos.map(item => ({
        id: item.id_alimento_pk,
        nombre: item.nombre_alimento,
        precio: parseFloat(item.precio_alimento),
        cantidad: item.stock_alimento,
        destino: item.alimento_destinado,
        peso: item.peso_alimento,
        imagenUrl: imagenStorage.obtener(item.id_alimento_pk)
      })) : []);
    } catch { mostrarMensaje('Error al cargar alimentos'); setAlimentos([]); }
    setLoading(false);
  };

  const guardarAlimento = async ({ nombre, precio, cantidad, destino, peso, imagenUrl }) => {
    const datosDB = {
      nombre_alimento: nombre,
      precio_alimento: parseFloat(precio),
      stock_alimento: parseInt(cantidad),
      alimento_destinado: destino,
      peso_alimento: parseFloat(peso)
    };
    try {
      let resultado;
      if (editIndex >= 0) {
        const alimento = alimentos[editIndex];
        resultado = await actualizarRegistro('tbl_alimentos', alimento.id, datosDB);
        if (resultado) imagenUrl ? imagenStorage.guardar(alimento.id, imagenUrl) : imagenStorage.eliminar(alimento.id);
      } else {
        resultado = await insertarRegistro('tbl_alimentos', datosDB);
        if (resultado && imagenUrl) {
          setTimeout(async () => {
            const datosAct = await verRegistro('tbl_alimentos');
            const nuevo = datosAct
              .filter(a => 
                a.nombre_alimento===nombre &&
                parseFloat(a.precio_alimento)===parseFloat(precio) &&
                a.stock_alimento===parseInt(cantidad) &&
                a.alimento_destinado===destino &&
                parseFloat(a.peso_alimento)===parseFloat(peso)
              )
              .sort((a,b)=>b.id_alimento_pk-a.id_alimento_pk)[0];
            if (nuevo) imagenStorage.guardar(nuevo.id_alimento_pk, imagenUrl);
            cargarAlimentos();
          },1500);
        }
      }
      if (resultado) { mostrarMensaje(`${nombre} ${editIndex>=0?'actualizado':'agregado'} correctamente`); await cargarAlimentos(); setModalVisible(false); setEditIndex(-1); return true; }
    } catch { mostrarMensaje('Error al guardar'); }
    return false;
  };

  const borrarAlimento = async (index) => {
    const alimento = alimentos[index];
    if (!window.confirm(`¿Eliminar "${alimento.nombre}"?`)) return;
    try {
      if (await borrarRegistro('tbl_alimentos', alimento.id)) {
        imagenStorage.eliminar(alimento.id);
        mostrarMensaje('Eliminado correctamente');
        cargarAlimentos();
      }
    } catch { mostrarMensaje('Error al eliminar'); }
  };

  const alimentosFiltrados = alimentos.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  useEffect(()=>cargarAlimentos(), []);

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
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">INVENTARIO DE ALIMENTOS</h1>
        <button onClick={()=>setModalVisible(true)} className="px-4 py-2 bg-purple-600 text-white rounded">+ NUEVO</button>
      </div>

      <div className="mb-6 relative w-80">
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-2 border rounded-full"/>
        {busqueda && <button onClick={()=>setBusqueda('')} className="absolute right-3 top-2">×</button>}
      </div>

      {alimentosFiltrados.length===0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-6xl mb-4">🍲</div>
          <h3 className="text-xl font-bold mb-2">Sin alimentos</h3>
          <p>{busqueda ? 'Sin resultados' : 'Agrega el primero'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {alimentosFiltrados.map(a => {
            const index = alimentos.findIndex(i=>i.id===a.id);
            return (
              <div key={a.id} className="bg-gray-100 rounded-lg p-4 relative">
                <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                  {a.imagenUrl ? <img src={a.imagenUrl} alt={a.nombre} className="w-full h-full object-contain"/> : <div className="w-full h-full bg-gray-50"></div>}
                </div>
                <div className="text-center mb-8">
                  <div className="font-bold text-sm mb-1">{a.nombre}</div>
                  <div className="text-sm text-gray-600 mb-1">{a.destino}</div>
                  <div className="text-sm text-gray-600 mb-1">Peso: {a.peso} kg</div>
                  <div className="text-lg font-bold">L.{a.precio.toFixed(0)}</div>
                  <div className={a.cantidad<5?'text-red-600':'text-gray-600'}>Stock: {a.cantidad}</div>
                </div>
                <button onClick={()=>borrarAlimento(index)} className="absolute bottom-2 left-2 p-1">🗑️</button>
                <button onClick={()=>{setEditIndex(index); setModalVisible(true)}} className="absolute bottom-2 right-2 p-1">⚙️</button>
              </div>
            );
          })}
        </div>
      )}

      {modalVisible && (editIndex>=0 ? 
        <ModalActualizarAlimento isOpen={modalVisible} onClose={()=>{setModalVisible(false); setEditIndex(-1)}} onSave={guardarAlimento} editData={alimentos[editIndex]}/> :
        <ModalNuevoAlimento isOpen={modalVisible} onClose={()=>{setModalVisible(false); setEditIndex(-1)}} onSave={guardarAlimento}/>
      )}

      {mensaje && <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold">{mensaje}</div>}
    </div>
  );
};

export default Alimentos;
