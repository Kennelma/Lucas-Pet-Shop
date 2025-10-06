import React, { useState, useEffect } from 'react';

// Simulación de API
const verRegistro = async (tabla) => {
  if (tabla === 'tbl_medicamentos_info') {
    return [
      {
        id_medicamento_pk: 1,
        presentacion_medicamento: 'Paracetamol 500mg - Caja x 10 tabletas',
        tipo_medicamento: 'Analgésico',
        cantidad_contenido: 10,
        unidad_medida: 'tabletas'
      },
      {
        id_medicamento_pk: 2,
        presentacion_medicamento: 'Ibuprofeno 400mg - Frasco x 20 cápsulas',
        tipo_medicamento: 'Antiinflamatorio',
        cantidad_contenido: 20,
        unidad_medida: 'cápsulas'
      }
    ];
  }
  if (tabla === 'tbl_lotes_medicamentos') {
    return [
      {
        id_lote_medicamentos_pk: 1,
        codigo_lote: 'LOT-2024-001',
        fecha_ingreso: '2024-01-15',
        fecha_vencimiento: '2025-12-31',
        stock_lote: 50,
        estado_lote_fk: 1,
        id_medicamento_fk: 1
      },
      {
        id_lote_medicamentos_pk: 2,
        codigo_lote: 'LOT-2024-002',
        fecha_ingreso: '2024-02-10',
        fecha_vencimiento: '2025-11-15',
        stock_lote: 30,
        estado_lote_fk: 1,
        id_medicamento_fk: 1
      }
    ];
  }
  return [];
};

const insertarRegistro = async (tabla, datos) => {
  console.log('✅ Insertar en', tabla, datos);
  return true;
};

const actualizarRegistro = async (tabla, id, datos) => {
  console.log('✅ Actualizar', tabla, id, datos);
  return true;
};

const borrarRegistro = async (tabla, id) => {
  console.log('✅ Borrar de', tabla, id);
  return true;
};

// MODAL AGREGAR MEDICAMENTO
const ModalAgregarMedicamento = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({ presentacion: '', tipo: 'Analgésico', cantidadContenido: 1, unidadMedida: 'tabletas' });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      setData({ presentacion: '', tipo: 'Analgésico', cantidadContenido: 1, unidadMedida: 'tabletas' });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.presentacion?.trim()) newErrors.presentacion = true;
    if (data.cantidadContenido <= 0) newErrors.cantidadContenido = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const resultado = await onSave(data);
      if (resultado !== false) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">AGREGAR MEDICAMENTO</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Tipo</h6>
            <select name="tipo" value={data.tipo} onChange={(e) => setData(prev => ({...prev, tipo: e.target.value}))} className="w-full p-2 border rounded">
              {['Analgésico','Antiinflamatorio','Antibiótico','Antipirético','Otros'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Presentación</h6>
            <input value={data.presentacion} onChange={(e) => setData(prev => ({...prev, presentacion: e.target.value}))} className={`w-full p-2 border rounded ${errors.presentacion ? 'border-red-500' : ''}`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Cantidad</h6>
              <input type="number" value={data.cantidadContenido} onChange={(e) => setData(prev => ({...prev, cantidadContenido: e.target.value}))} className="w-full p-2 border rounded" />
            </div>
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Unidad</h6>
              <select value={data.unidadMedida} onChange={(e) => setData(prev => ({...prev, unidadMedida: e.target.value}))} className="w-full p-2 border rounded">
                {['tabletas','cápsulas','ml','mg','g'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSubmit} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// MODAL EDITAR MEDICAMENTO
const ModalEditarMedicamento = ({ isOpen, onClose, onSave, editData }) => {
  const [data, setData] = useState({ presentacion: '', tipo: 'Analgésico', cantidadContenido: 0, unidadMedida: 'tabletas' });
  const [errors, setErrors] = useState({});

  useEffect(() => { 
    if (isOpen && editData) setData(editData);
  }, [isOpen, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.presentacion?.trim()) newErrors.presentacion = true;
    if (data.cantidadContenido <= 0) newErrors.cantidadContenido = true;
    setErrors(newErrors);
    if (!Object.keys(newErrors).length && await onSave(data) !== false) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">EDITAR MEDICAMENTO</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Tipo</h6>
            <select value={data.tipo} disabled className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed">
              <option>{data.tipo}</option>
            </select>
          </div>
          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Presentación</h6>
            <input value={data.presentacion} onChange={(e) => setData(prev => ({...prev, presentacion: e.target.value}))} className={`w-full p-2 border rounded ${errors.presentacion ? 'border-red-500' : ''}`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Cantidad</h6>
              <input type="number" value={data.cantidadContenido} onChange={(e) => setData(prev => ({...prev, cantidadContenido: e.target.value}))} className="w-full p-2 border rounded" />
            </div>
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Unidad</h6>
              <select value={data.unidadMedida} onChange={(e) => setData(prev => ({...prev, unidadMedida: e.target.value}))} className="w-full p-2 border rounded">
                {['tabletas','cápsulas','ml','mg','g'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSubmit} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// MODAL LOTES
const ModalLotes = ({ isOpen, onClose, medicamento, onActualizar }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAgregarLote, setModalAgregarLote] = useState(false);

  const cargarLotes = async () => {
    if (!medicamento) return;
    setLoading(true);
    const datos = await verRegistro('tbl_lotes_medicamentos');
    const lotesFormateados = Array.isArray(datos) 
      ? datos.filter(item => item.id_medicamento_fk === medicamento.id).map(item => ({
          id: item.id_lote_medicamentos_pk,
          codigoLote: item.codigo_lote,
          fechaIngreso: item.fecha_ingreso,
          fechaVencimiento: item.fecha_vencimiento,
          stockLote: item.stock_lote,
          estadoLote: item.estado_lote_fk
        }))
      : [];
    setLotes(lotesFormateados);
    setLoading(false);
  };

  const guardarLote = async (dataLote) => {
    const datosDB = {
      codigo_lote: dataLote.codigoLote,
      fecha_vencimiento: dataLote.fechaVencimiento,
      stock_lote: parseInt(dataLote.stockLote),
      estado_lote_fk: 1,
      id_medicamento_fk: medicamento.id
    };
    const resultado = await insertarRegistro('tbl_lotes_medicamentos', datosDB);
    if (resultado) {
      await cargarLotes();
      if (onActualizar) onActualizar();
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (isOpen && medicamento) cargarLotes();
  }, [isOpen, medicamento]);

  if (!isOpen) return null;

  const stockTotal = lotes.filter(l => l.estadoLote === 1).reduce((t, l) => t + l.stockLote, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="font-bold text-lg">GESTIÓN DE LOTES</h2>
            <p className="text-sm text-gray-600">{medicamento?.presentacion}</p>
          </div>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-gray-600">Stock Total: </span>
              <span className="font-bold text-lg text-purple-600">{stockTotal}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Lotes: </span>
              <span className="font-bold text-lg">{lotes.filter(l => l.estadoLote === 1).length}</span>
            </div>
          </div>
          <button onClick={() => setModalAgregarLote(true)} className="px-4 py-2 bg-purple-600 text-white rounded">+ NUEVO LOTE</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p>Cargando...</p>
            </div>
          ) : lotes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-5xl mb-3">📦</div>
              <h3 className="text-lg font-bold mb-2">Sin lotes</h3>
              <p>Agrega el primer lote</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-3 text-sm">Código</th>
                  <th className="text-left p-3 text-sm">Ingreso</th>
                  <th className="text-left p-3 text-sm">Vencimiento</th>
                  <th className="text-center p-3 text-sm">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map(lote => (
                  <tr key={lote.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{lote.codigoLote}</td>
                    <td className="p-3 text-sm">{new Date(lote.fechaIngreso).toLocaleDateString('es-HN')}</td>
                    <td className="p-3 text-sm">{new Date(lote.fechaVencimiento).toLocaleDateString('es-HN')}</td>
                    <td className="p-3 text-center font-bold">{lote.stockLote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {modalAgregarLote && (
          <ModalAgregarLote isOpen={modalAgregarLote} onClose={() => setModalAgregarLote(false)} onSave={guardarLote} medicamento={medicamento} />
        )}
      </div>
    </div>
  );
};

// MODAL AGREGAR LOTE
const ModalAgregarLote = ({ isOpen, onClose, onSave, medicamento }) => {
  const [data, setData] = useState({ codigoLote: '', fechaVencimiento: '', stockLote: 1 });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      const hoy = new Date();
      const codigo = `LOT-${hoy.getFullYear()}${String(hoy.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
      setData({ codigoLote: codigo, fechaVencimiento: '', stockLote: 1 });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.codigoLote?.trim()) newErrors.codigoLote = true;
    if (!data.fechaVencimiento) newErrors.fechaVencimiento = true;
    if (data.stockLote <= 0) newErrors.stockLote = true;
    
    if (data.fechaVencimiento && new Date(data.fechaVencimiento) <= new Date()) {
      newErrors.fechaVencimiento = true;
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const resultado = await onSave(data);
      if (resultado !== false) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">AGREGAR LOTE</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h6 className="text-sm font-semibold mb-1">Código</h6>
            <input value={data.codigoLote} onChange={(e) => setData(prev => ({...prev, codigoLote: e.target.value}))} className={`w-full p-2 border rounded font-mono ${errors.codigoLote ? 'border-red-500' : ''}`} />
          </div>
          <div>
            <h6 className="text-sm font-semibold mb-1">Vencimiento</h6>
            <input type="date" value={data.fechaVencimiento} onChange={(e) => setData(prev => ({...prev, fechaVencimiento: e.target.value}))} className={`w-full p-2 border rounded ${errors.fechaVencimiento ? 'border-red-500' : ''}`} />
          </div>
          <div>
            <h6 className="text-sm font-semibold mb-1">Stock</h6>
            <input type="number" value={data.stockLote} onChange={(e) => setData(prev => ({...prev, stockLote: e.target.value}))} className={`w-full p-2 border rounded ${errors.stockLote ? 'border-red-500' : ''}`} />
          </div>
          <button onClick={handleSubmit} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL
const Medicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLotesVisible, setModalLotesVisible] = useState(false);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  const cargarInventario = async () => {
    setLoading(true);
    try {
      const datosMedicamentos = await verRegistro('tbl_medicamentos_info');
      setMedicamentos(Array.isArray(datosMedicamentos) ? datosMedicamentos.map(item => ({
        id: item.id_medicamento_pk,
        presentacion: item.presentacion_medicamento,
        tipo: item.tipo_medicamento,
        cantidadContenido: item.cantidad_contenido,
        unidadMedida: item.unidad_medida
      })) : []);

      const datosLotes = await verRegistro('tbl_lotes_medicamentos');
      setLotes(Array.isArray(datosLotes) ? datosLotes.map(item => ({
        id: item.id_lote_medicamentos_pk,
        codigoLote: item.codigo_lote,
        fechaIngreso: item.fecha_ingreso,
        fechaVencimiento: item.fecha_vencimiento,
        stockLote: item.stock_lote,
        estadoLote: item.estado_lote_fk,
        idMedicamento: item.id_medicamento_fk
      })) : []);
    } catch (error) {
      mostrarMensaje('Error al cargar inventario');
    }
    setLoading(false);
  };

  const guardarMedicamento = async (data) => {
    const datosDB = {
      presentacion_medicamento: data.presentacion,
      tipo_medicamento: data.tipo,
      cantidad_contenido: parseInt(data.cantidadContenido),
      unidad_medida: data.unidadMedida
    };

    try {
      let resultado;
      if (editIndex >= 0) {
        resultado = await actualizarRegistro('tbl_medicamentos_info', medicamentos[editIndex].id, datosDB);
      } else {
        resultado = await insertarRegistro('tbl_medicamentos_info', datosDB);
      }

      if (resultado) {
        mostrarMensaje(`${data.presentacion} ${editIndex >= 0 ? 'actualizado' : 'agregado'}`);
        await cargarInventario();
        return true;
      }
    } catch (error) {
      mostrarMensaje('Error al guardar');
    }
    return false;
  };

  const calcularStockTotal = (idMedicamento) => {
    return lotes.filter(l => l.idMedicamento === idMedicamento && l.estadoLote === 1).reduce((t, l) => t + l.stockLote, 0);
  };

  const medicamentosFiltrados = medicamentos.filter(m => m.presentacion.toLowerCase().includes(busqueda.toLowerCase()));

  useEffect(() => {
    cargarInventario();
  }, []);

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
        <h1 className="text-2xl font-bold">INVENTARIO DE MEDICAMENTOS</h1>
        <button onClick={() => setModalVisible(true)} className="px-4 py-2 bg-purple-600 text-white rounded">+ NUEVO</button>
      </div>

      <div className="mb-6 relative w-80">
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-2 border rounded-full"/>
        {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-3 top-2">×</button>}
      </div>

      {medicamentosFiltrados.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-6xl mb-4">💊</div>
          <h3 className="text-xl font-bold mb-2">Sin medicamentos</h3>
          <p>{busqueda ? 'Sin resultados' : 'Agrega el primero'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {medicamentosFiltrados.map((medicamento) => {
            const index = medicamentos.findIndex(m => m.id === medicamento.id);
            const stockTotal = calcularStockTotal(medicamento.id);
            const cantidadLotes = lotes.filter(l => l.idMedicamento === medicamento.id && l.estadoLote === 1).length;

            return (
              <div key={medicamento.id} className="bg-gray-100 rounded-lg p-4 relative min-h-[280px]">
                <div className="bg-white rounded-lg p-2 mb-4 h-32 flex items-center justify-center">
                  <div className="text-6xl">💊</div>
                </div>
                
                <div className="text-center mb-16">
                  <div className="font-bold text-sm mb-1 line-clamp-2">{medicamento.presentacion}</div>
                  <div className="text-xs text-gray-600 mb-1">{medicamento.tipo}</div>
                  <div className="text-xs text-gray-700 mb-2">{medicamento.cantidadContenido} {medicamento.unidadMedida}</div>
                  <div className={stockTotal < 10 ? 'text-red-600 font-bold' : 'text-gray-600'}>Stock: {stockTotal}</div>
                  <div className="text-xs text-gray-500">({cantidadLotes} lotes)</div>
                </div>

                <button onClick={() => {
                  setMedicamentoSeleccionado(medicamento);
                  setModalLotesVisible(true);
                }} className="absolute bottom-12 left-2 right-2 bg-green-500 text-white text-xs py-2 rounded hover:bg-green-600">
                  📦 Ver Lotes
                </button>
                
                <button onClick={() => {setEditIndex(index); setModalVisible(true);}} className="absolute bottom-2 right-2 p-1">⚙️</button>
              </div>
            );
          })}
        </div>
      )}

      {modalVisible && (editIndex >= 0 ? 
        <ModalEditarMedicamento 
          isOpen={modalVisible} 
          onClose={() => {setModalVisible(false); setEditIndex(-1);}} 
          onSave={guardarMedicamento} 
          editData={medicamentos[editIndex]}
        /> :
        <ModalAgregarMedicamento 
          isOpen={modalVisible} 
          onClose={() => {setModalVisible(false); setEditIndex(-1);}} 
          onSave={guardarMedicamento}
        />
      )}

      {modalLotesVisible && medicamentoSeleccionado && (
        <ModalLotes 
          isOpen={modalLotesVisible}
          onClose={() => {
            setModalLotesVisible(false);
            setMedicamentoSeleccionado(null);
          }}
          medicamento={medicamentoSeleccionado}
          onActualizar={cargarInventario}
        />
      )}

      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold">{mensaje}</div>
      )}
    </div>
  );
};

export default Medicamentos;

