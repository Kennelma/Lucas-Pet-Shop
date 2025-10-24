import React, { useState } from "react";

const ModalLotesMedicamento = ({ isOpen, onClose, medicamentoSeleccionado, lotes }) => {
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  if (!isOpen || !medicamentoSeleccionado) return null;

  const lotesDelMedicamento = lotes.filter(l => l.id_producto_fk === medicamentoSeleccionado.id_producto_pk);

  const calcularEstadoLote = (lote) => {
    const hoy = new Date();
    const vencimiento = new Date(lote.fecha_vencimiento);
    
    if (vencimiento < hoy) {
      return { bgBadge: "bg-gray-600", texto: "CADUCADO" };
    }
    
    if (lote.estado_lote_nombre && lote.estado_lote_nombre !== "SIN ESTADO") {
      const estadoUpper = lote.estado_lote_nombre.toUpperCase().trim();
      
      if (estadoUpper === "DISPONIBLE") {
        return { bgBadge: "bg-green-500", texto: "DISPONIBLE" };
      } else if (estadoUpper === "AGOTADO") {
        return { bgBadge: "bg-red-500", texto: "AGOTADO" };
      } else if (estadoUpper === "CADUCADO" || estadoUpper === "VENCIDO") {
        return { bgBadge: "bg-gray-600", texto: "CADUCADO" };
      }
    }
    
    const stock = parseInt(lote.stock_lote || 0);
    
    if (stock === 0) {
      return { bgBadge: "bg-red-500", texto: "AGOTADO" };
    }
    
    return { bgBadge: "bg-green-500", texto: "DISPONIBLE" };
  };

  const lotesFiltrados = lotesDelMedicamento.filter(lote => {
    if (filtroEstado === "TODOS") return true;
    
    const estado = calcularEstadoLote(lote);
    
    if (filtroEstado === "VIGENTES") {
      return estado.texto === "DISPONIBLE";
    }
    if (filtroEstado === "VENCIDOS") {
      return estado.texto === "CADUCADO" || estado.texto === "AGOTADO";
    }
    return true;
  });

  const contarEstados = (tipo) => {
    return lotesDelMedicamento.filter(l => {
      const estado = calcularEstadoLote(l);
      if (tipo === "DISPONIBLES") return estado.texto === "DISPONIBLE";
      if (tipo === "VENCIDOS") return estado.texto === "CADUCADO" || estado.texto === "AGOTADO";
      return false;
    }).length;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto"
        style={{
          width: '90%',
          maxWidth: '1000px'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-700 text-center">
               LOTES DE {medicamentoSeleccionado.nombre_producto}
            </h2>
            <p className="text-sm text-gray-600 mt-1 text-center">{medicamentoSeleccionado.presentacion_medicamento}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-3xl hover:text-red-600 transition-colors font-bold ml-4"
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 mb-4 justify-center flex-wrap">
          <button
            onClick={() => setFiltroEstado("TODOS")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "TODOS"
                ? "bg-purple-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
             TODOS ({lotesDelMedicamento.length})
          </button>
          <button
            onClick={() => setFiltroEstado("VIGENTES")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "VIGENTES"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
             DISPONIBLES ({contarEstados("DISPONIBLES")})
          </button>
          <button
            onClick={() => setFiltroEstado("VENCIDOS")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "VENCIDOS"
                ? "bg-red-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
             AGOTADOS/CADUCADOS ({contarEstados("VENCIDOS")})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-3 text-center">Código Lote</th>
                <th className="p-3 text-center">Fecha Ingreso</th>
                <th className="p-3 text-center">Fecha Vencimiento</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lotesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    {filtroEstado === "TODOS" 
                      ? "📦 No hay lotes registrados para este medicamento"
                      : `📦 No hay lotes ${filtroEstado.toLowerCase()}`
                    }
                  </td>
                </tr>
              ) : (
                lotesFiltrados.map((lote, idx) => {
                  const estilo = calcularEstadoLote(lote);
                  return (
                    <tr key={lote.id_lote_medicamentos_pk} className={`border-b hover:bg-purple-50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="p-3 text-center">
                        <div className="font-mono font-bold text-purple-700">
                          {lote.codigo_lote}
                        </div>
                      </td>
                      <td className="p-3 text-center">{new Date(lote.fecha_ingreso).toLocaleDateString('es-HN')}</td>
                      <td className="p-3 font-semibold text-center">{new Date(lote.fecha_vencimiento).toLocaleDateString('es-HN')}</td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-lg text-purple-700">{lote.stock_lote}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${estilo.bgBadge}`}>
                            {estilo.texto}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {lotesFiltrados.length > 0 && (
              <tfoot className="bg-purple-100 font-bold">
                <tr>
                  <td colSpan="3" className="p-3 text-right text-purple-700">
                    TOTAL STOCK {filtroEstado !== "TODOS" ? `(${filtroEstado})` : ""}:
                  </td>
                  <td className="p-3 text-center bg-purple-200">
                    <span className="text-xl text-purple-800">
                      {lotesFiltrados.reduce((sum, l) => sum + parseInt(l.stock_lote || 0), 0)}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLotesMedicamento;