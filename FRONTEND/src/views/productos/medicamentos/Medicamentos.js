import React, { useState } from "react";
import { useMedicamentos } from "./useMedicamentos";
import MedicamentosBajoStock from "./MedicamentosBajoStock";
import MedicamentoCard from "./MedicamentoCard";
import KardexTable from "./KardexTable";
import ModalMedicamento from "./ModalMedicamento";
import ModalLote from "./ModalLote";
import ModalMovimiento from "./ModalMovimiento";
import ModalLotesMedicamento from "./ModalLotesMedicamento";

const Medicamentos = () => {
  const {
    medicamentos,
    lotes,
    kardexData,
    loading,
    mensaje,
    calcularStockTotal,
    guardarMedicamento,
    guardarLote,
    guardarMovimiento
  } = useMedicamentos();

  const [vistaActual, setVistaActual] = useState("medicamentos");
  const [busqueda, setBusqueda] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoteVisible, setModalLoteVisible] = useState(false);
  const [modalMovVisible, setModalMovVisible] = useState(false);
  const [modalLotesVisible, setModalLotesVisible] = useState(false);
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);

  const medicamentosFiltrados = medicamentos.filter((m) =>
    m.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.presentacion_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.tipo_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación para medicamentos
  const pages = Math.ceil(medicamentosFiltrados.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const medicamentosPaginados = medicamentosFiltrados.slice(start, start + rowsPerPage);

  const kardexFiltrado = kardexData.filter(mov => {
    const searchLower = busqueda.toLowerCase();
    return mov.nombre_producto.toLowerCase().includes(searchLower) ||
           (mov.codigo_lote && mov.codigo_lote.toLowerCase().includes(searchLower)) ||
           mov.tipo_movimiento.toLowerCase().includes(searchLower) ||
           mov.origen_movimiento.toLowerCase().includes(searchLower);
  });

  const handleGuardarMedicamento = async (formData) => {
    const success = await guardarMedicamento(formData, medicamentoEditando);
    if (success) {
      setModalVisible(false);
      setMedicamentoEditando(null);
    }
  };

  const handleGuardarLote = async (formData) => {
    const success = await guardarLote(formData);
    if (success) {
      setModalLoteVisible(false);
      setMedicamentoSeleccionado(null);
    }
  };

  const handleGuardarMovimiento = (formData) => {
    const success = guardarMovimiento(formData);
    if (success) {
      setModalMovVisible(false);
      setLoteSeleccionado(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-3" 
           style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <h2 className="text-2xl font-black text-center uppercase text-gray-800">
          GESTIÓN DE MEDICAMENTOS
        </h2>
        <p className="text-center text-gray-600 italic">
          Administra medicamentos veterinarios, lotes y control de inventario
        </p>
      </div>

      {/* Alertas de Stock Bajo */}
      <MedicamentosBajoStock medicamentos={medicamentos} />

      {/* Tabs de navegación*/}
      <div className="flex flex-wrap rounded-lg bg-gray-200 p-1 w-80 text-sm shadow-sm mb-6">
        <label className="flex-1 text-center">
          <input
            type="radio"
            name="vista"
            checked={vistaActual === "medicamentos"}
            onChange={() => setVistaActual("medicamentos")}
            className="hidden"
          />
          <span
            className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 ${
              vistaActual === "medicamentos"
                ? "bg-white font-semibold text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
             Medicamentos
          </span>
        </label>
        
        <label className="flex-1 text-center">
          <input
            type="radio"
            name="vista"
            checked={vistaActual === "kardex"}
            onChange={() => setVistaActual("kardex")}
            className="hidden"
          />
          <span
            className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 ${
              vistaActual === "kardex"
                ? "bg-white font-semibold text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
             Kardex
          </span>
        </label>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-xl p-6 mb-6" 
           style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        {vistaActual === "kardex" ? (
          <KardexTable kardexData={kardexFiltrado} />
        ) : (
          <>
            {/* Barra de búsqueda y controles - SOLO PARA MEDICAMENTOS */}
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-80">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar medicamento..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Filas por página: 
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="ml-2 border-0 bg-transparent text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="12">12</option>
                    <option value="16">16</option>
                  </select>
                </span>

                <button
                  onClick={() => setModalVisible(true)}
                  className="px-6 py-2 text-white text-xs font-bold bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-[3rem] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_25px_rgba(74,222,128,0.8)] shadow-md"
                >
                  + MEDICAMENTO
                </button>
              </div>
            </div>

            {medicamentosFiltrados.length === 0 ? (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-lg"> No se encontraron medicamentos</p>
                <p className="text-sm text-gray-500 mt-2">Haz clic en "+ NUEVO MEDICAMENTO" </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {medicamentosPaginados.map((med) => (
                    <MedicamentoCard
                      key={med.id_producto_pk}
                      medicamento={med}
                      stockTotal={calcularStockTotal(med.id_producto_pk)}
                      lotesCount={lotes.filter(l => l.id_producto_fk === med.id_producto_pk).length}
                      onEditar={() => {
                        setMedicamentoEditando(med);
                        setModalVisible(true);
                      }}
                      onAgregarLote={() => {
                        setMedicamentoSeleccionado(med);
                        setModalLoteVisible(true);
                      }}
                      onVerLotes={() => {
                        setMedicamentoSeleccionado(med);
                        setModalLotesVisible(true);
                      }}
                    />
                  ))}
                </div>

                {/* Paginación */}
                <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === i + 1
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modales */}
<ModalMedicamento 
  isOpen={modalVisible} 
  onClose={() => {
    setModalVisible(false);
    setMedicamentoEditando(null);
  }}
  onSave={handleGuardarMedicamento}
  medicamentoEditando={medicamentoEditando}
  medicamentosExistentes={medicamentos}  // ← AGREGA ESTA LÍNEA
/>
      
      <ModalLote 
  isOpen={modalLoteVisible}
  onClose={() => {
    setModalLoteVisible(false);
    setMedicamentoSeleccionado(null);
  }}
  onSave={handleGuardarLote}
  medicamentoSeleccionado={medicamentoSeleccionado}
  lotesExistentes={lotes} // ← AGREGA ESTA LÍNEA
/>
      
      <ModalMovimiento 
        isOpen={modalMovVisible}
        onClose={() => {
          setModalMovVisible(false);
          setLoteSeleccionado(null);
        }}
        onSave={handleGuardarMovimiento}
        loteSeleccionado={loteSeleccionado}
      />
      
      <ModalLotesMedicamento
        isOpen={modalLotesVisible}
        onClose={() => {
          setModalLotesVisible(false);
          setMedicamentoSeleccionado(null);
        }}
        medicamentoSeleccionado={medicamentoSeleccionado}
        lotes={lotes}
      />

      {/* Notificación de mensajes */}
      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold shadow-lg animate-pulse z-50">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Medicamentos;