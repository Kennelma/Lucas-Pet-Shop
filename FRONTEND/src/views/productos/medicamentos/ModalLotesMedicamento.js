import React, { useState } from "react";

const ModalLotesMedicamento = ({ isOpen, onClose, medicamentoSeleccionado, lotes, onEditarLote, onEliminarLote, onRecargarDatos }) => {
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
    
    if (filtroEstado === "DISPONIBLES") { return estado.texto === "DISPONIBLE"; }
    if (filtroEstado === "AGOTADOS") { return estado.texto === "AGOTADO"; }
    if (filtroEstado === "CADUCADOS") { return estado.texto === "CADUCADO"; }
    return true;
  });

  const contarEstados = (tipo) => {
    return lotesDelMedicamento.filter(l => {
      const estado = calcularEstadoLote(l);
      if (tipo === "DISPONIBLES") return estado.texto === "DISPONIBLE";
      if (tipo === "AGOTADOS") return estado.texto === "AGOTADO";
      if (tipo === "CADUCADOS") return estado.texto === "CADUCADO";
      return false;
    }).length;
  };

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', fontFamily: "'Times New Roman', Times, serif"
      }}
    >
      <div className="bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto"
        style={{ width: '90%', maxWidth: '1200px', fontFamily: "'Times New Roman', Times, serif" }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-center text-black"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              LOTES DE {medicamentoSeleccionado.nombre_producto.toUpperCase()}({medicamentoSeleccionado.presentacion_medicamento.toUpperCase()})
            </h2>
          </div>
          <button onClick={onClose} className="text-3xl hover:text-red-600 transition-colors font-bold ml-4" >
            ×
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex rounded-lg bg-gray-200 p-1 shadow-sm" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <label className="text-center">
              <input type="radio" name="filtroEstado" checked={filtroEstado === "TODOS"} onChange={() => setFiltroEstado("TODOS")}
                className="hidden"
              />
              <span className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 text-sm ${
                  filtroEstado === "TODOS"
                    ? "bg-white font-semibold text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                TODOS ({lotesDelMedicamento.length})
              </span>
            </label>
            
            <label className="text-center">
              <input type="radio" name="filtroEstado" checked={filtroEstado === "DISPONIBLES"} onChange={() => setFiltroEstado("DISPONIBLES")}
                className="hidden"
              />
              <span
                className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 text-sm ${
                  filtroEstado === "DISPONIBLES"
                    ? "bg-white font-semibold text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                DISPONIBLES ({contarEstados("DISPONIBLES")})
              </span>
            </label>
            
            <label className="text-center">
              <input type="radio" name="filtroEstado" checked={filtroEstado === "AGOTADOS"} onChange={() => setFiltroEstado("AGOTADOS")} className="hidden" />
              <span
                className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 text-sm ${
                  filtroEstado === "AGOTADOS"
                    ? "bg-white font-semibold text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                AGOTADOS ({contarEstados("AGOTADOS")})
              </span>
            </label>
            
            <label className="text-center">
              <input type="radio" name="filtroEstado" checked={filtroEstado === "CADUCADOS"} onChange={() => setFiltroEstado("CADUCADOS")} className="hidden" />
              <span
                className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 text-sm ${
                  filtroEstado === "CADUCADOS"
                    ? "bg-white font-semibold text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                CADUCADOS ({contarEstados("CADUCADOS")})
              </span>
            </label>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  CÓDIGO LOTE
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  FECHA INGRESO
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  FECHA VENCIMIENTO
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  STOCK
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lotesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
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
                    <tr key={lote.id_lote_medicamentos_pk} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">
                          {lote.codigo_lote}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {new Date(lote.fecha_ingreso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                        {new Date(lote.fecha_vencimiento).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                        {lote.stock_lote}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${estilo.bgBadge}`}>
                          {estilo.texto}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => onEditarLote && onEditarLote(lote)} className="text-blue-500 hover:text-blue-700 p-2 rounded transition-colors"
                            title="Editar lote"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5" fill="currentColor">
                              <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => onEliminarLote && onEliminarLote(lote)}
                            className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
                            title="Eliminar lote"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5" fill="currentColor">
                              <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {lotesFiltrados.length > 0 && (
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right text-sm text-slate-700">
                    TOTAL STOCK {filtroEstado !== "TODOS" ? `(${filtroEstado})` : ""}:
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-lg font-bold text-slate-900">
                      {lotesFiltrados.reduce((sum, l) => sum + parseInt(l.stock_lote || 0), 0)}
                    </span>
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={onClose} className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLotesMedicamento;