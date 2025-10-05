import React, { useState, useEffect } from 'react';

// Simulación de API
const verRegistro = async (tabla) => {
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

const borrarRegistro = async (tabla, id) => {
  console.log('Borrar de', tabla, id);
  return true;
};

const ModalLotes = ({ isOpen, onClose, medicamento, onActualizar }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [modalAgregarLote, setModalAgregarLote] = useState(false);
  const [modalEditarLote, setModalEditarLote] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  const cargarLotes = async () => {
    if (!medicamento) return;
    setLoading(true);
    try {
      const datos = await verRegistro('tbl_lotes_medicamentos');
      const lotesFormateados = Array.isArray(datos) 
        ? datos
            .filter(item => item.id_medicamento_fk === medicamento.id)
            .map(item => ({
              id: item.id_lote_medicamentos_pk,
              codigoLote: item.codigo_lote,
              fechaIngreso: item.fecha_ingreso,
              fechaVencimiento: item.fecha_vencimiento,
              stockLote: item.stock_lote,
              estadoLote: item.estado_lote_fk,
              idMedicamento: item.id_medicamento_fk
            }))
        : [];
      setLotes(lotesFormateados);
    } catch (error) {
      mostrarMensaje('Error al cargar lotes');
      setLotes([]);
    }
    setLoading(false);
  };

  const eliminarLote = async (lote) => {
    if (!window.confirm(`¿Eliminar lote "${lote.codigoLote}"?`)) return;
    
    try {
      if (await borrarRegistro('tbl_lotes_medicamentos', lote.id)) {
        mostrarMensaje('Lote eliminado correctamente');
        await cargarLotes();
        if (onActualizar) onActualizar();
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar lote');
    }
  };

  const calcularDiasVencimiento = (fechaVencimiento) => {
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    const diferencia = fechaVenc - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const getEstadoLote = (fechaVencimiento, estadoLote) => {
    if (estadoLote !== 1) return { texto: 'Inactivo', color: 'bg-gray-500' };
    
    const dias = calcularDiasVencimiento(fechaVencimiento);
    
    if (dias < 0) return { texto: 'Vencido', color: 'bg-red-600' };
    if (dias <= 30) return { texto: `Vence en ${dias}d`, color: 'bg-orange-500' };
    if (dias <= 90) return { texto: `Vence en ${dias}d`, color: 'bg-yellow-500' };
    return { texto: 'Vigente', color: 'bg-green-500' };
  };

  const stockTotal = lotes
    .filter(l => l.estadoLote === 1)
    .reduce((total, lote) => total + lote.stockLote, 0);

  useEffect(() => {
    if (isOpen && medicamento) {
      cargarLotes();
    }
  }, [isOpen, medicamento]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50" style={{marginLeft: 'var(--cui-sidebar-occupy-start, 0px)', marginRight: 'var(--cui-sidebar-occupy-end, 0px)'}}>
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <div>
            <h2 className="font-bold text-lg">GESTIÓN DE LOTES</h2>
            <p className="text-sm text-gray-600">{medicamento?.presentacion}</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:text-gray-700">&times;</button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-gray-600">Stock Total: </span>
              <span className="font-bold text-lg text-purple-600">{stockTotal} unidades</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Lotes Activos: </span>
              <span className="font-bold text-lg">{lotes.filter(l => l.estadoLote === 1).length}</span>
            </div>
          </div>
          <button 
            onClick={() => setModalAgregarLote(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            + NUEVO LOTE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Cargando lotes...</p>
            </div>
          ) : lotes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-5xl mb-3">📦</div>
              <h3 className="text-lg font-bold mb-2">Sin lotes registrados</h3>
              <p>Agrega el primer lote de este medicamento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-3 font-semibold text-sm">Código Lote</th>
                    <th className="text-left p-3 font-semibold text-sm">Fecha Ingreso</th>
                    <th className="text-left p-3 font-semibold text-sm">Fecha Vencimiento</th>
                    <th className="text-center p-3 font-semibold text-sm">Stock</th>
                    <th className="text-center p-3 font-semibold text-sm">Estado</th>
                    <th className="text-center p-3 font-semibold text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote) => {
                    const estado = getEstadoLote(lote.fechaVencimiento, lote.estadoLote);
                    return (
                      <tr key={lote.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{lote.codigoLote}</td>
                        <td className="p-3 text-sm">{new Date(lote.fechaIngreso).toLocaleDateString('es-HN')}</td>
                        <td className="p-3 text-sm">{new Date(lote.fechaVencimiento).toLocaleDateString('es-HN')}</td>
                        <td className="p-3 text-center">
                          <span className={`font-bold ${lote.stockLote < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                            {lote.stockLote}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-white text-xs ${estado.color}`}>
                            {estado.texto}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => {
                              setLoteSeleccionado(lote);
                              setModalEditarLote(true);
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 mr-2"
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            onClick={() => eliminarLote(lote)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {mensaje && (
          <div className="m-4 px-4 py-2 bg-purple-600 text-white rounded font-bold text-center">
            {mensaje}
          </div>
        )}
      </div>

      {/* Aquí se deben importar y usar los componentes reales:
      {modalAgregarLote && (
        <ModalAgregarLote 
          isOpen={modalAgregarLote}
          onClose={() => setModalAgregarLote(false)}
          onSave={guardarLote}
          medicamento={medicamento}
        />
      )}

      {modalEditarLote && loteSeleccionado && (
        <ModalEditarLote 
          isOpen={modalEditarLote}
          onClose={() => {
            setModalEditarLote(false);
            setLoteSeleccionado(null);
          }}
          onSave={guardarLote}
          editData={loteSeleccionado}
          medicamento={medicamento}
        />
      )}
      */}
    </div>
  );
};

export default ModalLotes;