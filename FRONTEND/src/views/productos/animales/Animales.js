import React, { useState, useEffect } from 'react';
import ModalNuevoAnimal from './modal_nuevo_animal';
import ModalActualizarAnimal from './modal_actualizar_animal';
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../../services/apiService';


const Animales = () => {
  const [animales, setAnimales] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  const imagenStorage = {
    guardar: (id, url) => {
      const imgs = JSON.parse(localStorage.getItem('imagenesAnimales') || '{}');
      imgs[id] = url;
      localStorage.setItem('imagenesAnimales', JSON.stringify(imgs));
    },
    obtener: (id) => JSON.parse(localStorage.getItem('imagenesAnimales') || '{}')[id] || '',
    eliminar: (id) => {
      const imgs = JSON.parse(localStorage.getItem('imagenesAnimales') || '{}');
      delete imgs[id];
      localStorage.setItem('imagenesAnimales', JSON.stringify(imgs));
    }
  };

  const mostrarMensaje = (txt) => { setMensaje(txt); setTimeout(() => setMensaje(''), 3000); };

  const cargarAnimales = async () => {
    setLoading(true);
    try {
      const datos = await verRegistro('tbl_animales');
      setAnimales(Array.isArray(datos) ? datos.map(item => ({
        id: item.id_animal_pk,
        nombre: item.nombre_animal,
        especie: item.especie || '',
        sexo: item.sexo,
        cantidad: item.stock_animal,
        precio: parseFloat(item.precio_animal),
        imagenUrl: imagenStorage.obtener(item.id_animal_pk)
      })) : []);
    } catch { mostrarMensaje('Error al cargar animales'); setAnimales([]); }
    setLoading(false);
  };

  const guardarAnimal = async ({nombre, especie, sexo, cantidad, precio, imagenUrl}) => {
    const datosDB = {
      nombre_animal: nombre,
      especie: especie,   
      sexo,
      stock_animal: parseInt(cantidad),
      precio_animal: parseFloat(precio)
    };

    try {
      let resultado;
      if (editIndex >= 0) {
        const animal = animales[editIndex];
        resultado = await actualizarRegistro('tbl_animales', animal.id, datosDB);
        if (resultado) imagenUrl ? imagenStorage.guardar(animal.id, imagenUrl) : imagenStorage.eliminar(animal.id);
      } else {
        resultado = await insertarRegistro('tbl_animales', datosDB);
        if (resultado && imagenUrl) {
          setTimeout(async () => {
            const datosAct = await verRegistro('tbl_animales');
            const nuevo = datosAct
              .filter(a => a.nombre_animal===nombre && a.especie===especie && a.sexo===sexo && a.stock_animal===parseInt(cantidad) && parseFloat(a.precio_animal)===parseFloat(precio))
              .sort((a,b)=>b.id_animal_pk-a.id_animal_pk)[0];
            if (nuevo) imagenStorage.guardar(nuevo.id_animal_pk, imagenUrl);
            cargarAnimales();
          },1500);
        }
      }

      if (resultado) { 
        mostrarMensaje(`${nombre} ${editIndex>=0?'actualizado':'agregado'} correctamente`); 
        await cargarAnimales(); 
        setModalVisible(false); 
        setEditIndex(-1); 
        return true; 
      }
    } catch { mostrarMensaje('Error al guardar'); }
    return false;
  };

  const borrarAnimal = async (index) => {
    const animal = animales[index];
    if (!window.confirm(`¿Eliminar "${animal.nombre}"?`)) return;
    try {
      if (await borrarRegistro('tbl_animales', animal.id)) {
        imagenStorage.eliminar(animal.id);
        mostrarMensaje('Eliminado correctamente');
        cargarAnimales();
      }
    } catch { mostrarMensaje('Error al eliminar'); }
  };

  const animalesFiltrados = animales.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.especie.toLowerCase().includes(busqueda.toLowerCase()));

  useEffect(()=>cargarAnimales(), []);

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
        <h1 className="text-2xl font-bold">INVENTARIO DE ANIMALES</h1>
        <button onClick={()=>setModalVisible(true)} className="px-4 py-2 bg-purple-600 text-white rounded">+ NUEVO</button>
      </div>

      <div className="mb-6 relative w-80">
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-2 border rounded-full"/>
        {busqueda && <button onClick={()=>setBusqueda('')} className="absolute right-3 top-2">×</button>}
      </div>

      {animalesFiltrados.length===0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-bold mb-2">Sin animales</h3>
          <p>{busqueda ? 'Sin resultados' : 'Agrega el primero'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {animalesFiltrados.map(a => {
            const index = animales.findIndex(i=>i.id===a.id);
            return (
              <div key={a.id} className="bg-gray-100 rounded-lg p-4 relative">
                <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center overflow-hidden">
                  {a.imagenUrl ? <img src={a.imagenUrl} alt={a.nombre} className="w-full h-full object-contain"/> : <div className="w-full h-full bg-gray-50"></div>}
                </div>
                <div className="text-center mb-8">
                  <div className="text-sm font-bold mb-1">{a.nombre}</div>
                  <div className="text-sm text-gray-600 mb-1">{a.especie}</div>
                  <div className="text-sm font-bold mb-1">L.{a.precio.toFixed(0)}</div>
                  <div className={`text-sm ${a.cantidad < 5 ? 'text-red-600' : 'text-gray-600'}`}>Stock: {a.cantidad}</div>
                  <div className="text-sm text-gray-600">{a.sexo}</div>
                </div>
                <button onClick={()=>borrarAnimal(index)} className="absolute bottom-2 left-2 p-1">🗑️</button>
                <button onClick={()=>{setEditIndex(index); setModalVisible(true)}} className="absolute bottom-2 right-2 p-1">⚙️</button>
              </div>
            );
          })}
        </div>
      )}

      {modalVisible && (editIndex>=0 ? 
        <ModalActualizarAnimal isOpen={modalVisible} onClose={()=>{setModalVisible(false); setEditIndex(-1)}} onSave={guardarAnimal} editData={animales[editIndex]}/> :
        <ModalNuevoAnimal isOpen={modalVisible} onClose={()=>{setModalVisible(false); setEditIndex(-1)}} onSave={guardarAnimal}/>
      )}

      {mensaje && <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold">{mensaje}</div>}
    </div>
  );
};

export default Animales;
