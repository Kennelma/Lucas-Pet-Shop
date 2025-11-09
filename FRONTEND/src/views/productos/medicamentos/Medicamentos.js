import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useMedicamentos } from "./useMedicamentos";
import MedicamentoTable from "./MedicamentoTable";
import KardexTable from "./KardexTable";
import MedicamentosMasVendidos from "./MedicamentosMasVendidos";
import ModalMedicamento from "./ModalMedicamento";
import ModalLote from "./ModalLote";
import ModalMovimiento from "./ModalMovimiento";
import ModalLotesMedicamento from "./ModalLotesMedicamento";
import ModalEditarLote from "./ModalEditarLote"; // ✅ NUEVO IMPORT
import { cambiarEstadoProducto } from "../../../AXIOS.SERVICES/products-axios";

const Medicamentos = () => {
  const { 
    medicamentos, 
    setMedicamentos, 
    lotes, 
    kardexData, 
    loading, 
    mensaje, 
    calcularStockTotal, 
    guardarMedicamento, 
    guardarLote, 
    guardarMovimiento,
    eliminarMedicamento, 
    eliminarLote,
    editarLote, // ✅ NUEVO
    cargarDatos
  } = useMedicamentos();

  const [vistaActual, setVistaActual] = useState("medicamentos");
  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoteVisible, setModalLoteVisible] = useState(false);
  const [modalMovVisible, setModalMovVisible] = useState(false);
  const [modalLotesVisible, setModalLotesVisible] = useState(false);
  const [modalEditarLoteVisible, setModalEditarLoteVisible] = useState(false); // ✅ NUEVO
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [loteEditar, setLoteEditar] = useState(null); // ✅ NUEVO

  //====================CONTROL_SCROLL_MODALES====================
  useEffect(() => {
    const anyModalOpen = modalVisible || modalLoteVisible || modalMovVisible || modalLotesVisible || modalEditarLoteVisible; // ✅ AGREGADO

    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalVisible, modalLoteVisible, modalMovVisible, modalLotesVisible, modalEditarLoteVisible]); // ✅ AGREGADO

  const medicamentosFiltrados = medicamentos.filter((m) =>
    m.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.presentacion_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.tipo_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  const kardexFiltrado = kardexData.filter(mov => {
    const searchLower = busqueda.toLowerCase();
    return mov.nombre_producto.toLowerCase().includes(searchLower) ||
           (mov.codigo_lote && mov.codigo_lote.toLowerCase().includes(searchLower)) ||
           mov.tipo_movimiento.toLowerCase().includes(searchLower) ||
           mov.origen_movimiento.toLowerCase().includes(searchLower);
  });

  // Función para calcular estado del lote
  const calcularEstadoLote = (lote) => {
    const hoy = new Date();
    const vencimiento = new Date(lote.fecha_vencimiento);

    if (vencimiento < hoy) {
      return { bgBadge: "bg-gray-600", texto: "CADUCADO" };
    }

    const stock = parseInt(lote.stock_lote || 0);
    if (stock === 0) {
      return { bgBadge: "bg-red-500", texto: "AGOTADO" };
    }

    return { bgBadge: "bg-green-500", texto: "DISPONIBLE" };
  };

  const handleGuardarMedicamento = async (formData) => {
  try {
    const success = await guardarMedicamento(formData, medicamentoEditando);
    
    if (success) {
      // ✅ MOSTRAR SWAL DESPUÉS DE GUARDAR EXITOSAMENTE
      Swal.fire({
        icon: 'success',
        title: medicamentoEditando ? '¡Actualizado!' : '¡Agregado!',
        text: `${formData.nombre_producto} fue ${medicamentoEditando ? 'actualizado' : 'agregado'} correctamente`,
        timer: 1500,
        showConfirmButton: false
      });
      
      // Cerrar modal y limpiar estado
      setModalVisible(false);
      setMedicamentoEditando(null);
    } else {
      // ❌ MOSTRAR ERROR SI NO SE PUDO GUARDAR
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el medicamento',
        confirmButtonText: 'Entendido'
      });
    }
  } catch (error) {
    console.error('Error al guardar medicamento:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al guardar el medicamento',
      confirmButtonText: 'Entendido'
    });
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

  // ✅ NUEVA FUNCIÓN: Abrir modal de editar lote
  const handleEditarLote = (lote) => {
    setLoteEditar(lote);
    setModalEditarLoteVisible(true);
  };

  // ✅ NUEVA FUNCIÓN: Guardar edición de lote
  const handleGuardarEdicionLote = async (loteEditado) => {
    const exito = await editarLote(loteEditado);
    if (exito) {
      Swal.fire({ 
        icon: 'success', 
        title: '¡Actualizado!', 
        text: 'Lote actualizado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      setModalEditarLoteVisible(false);
      setLoteEditar(null);
    } else {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'No se pudo actualizar el lote',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleEliminarMedicamento = async (medicamento) => {
    const lotesAsociados = lotes.filter(l => l.id_producto_fk === medicamento.id_producto_pk).length;

    const result = await Swal.fire({
      title: "¿Eliminar medicamento?",
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${medicamento.nombre_producto}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Presentación:</span> ${medicamento.presentacion_medicamento}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Tipo:</span> ${medicamento.tipo_medicamento}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Precio:</span> L. ${medicamento.precio_producto.toFixed(2)}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Lotes asociados:</span> ${lotesAsociados}</p>
        </div>
        <div class="mt-3 p-2 bg-red-50 rounded-md border border-red-200">
          <p class="text-xs text-red-600 font-semibold">⚠️ Esta acción eliminará también todos los lotes asociados y no se puede deshacer.</p>
        </div>
      `,
      showCancelButton: true, confirmButtonText: "Eliminar", cancelButtonText: "Cancelar", reverseButtons: true, width: 450, padding: "16px",
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium",
        cancelButton: "bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium mr-2",
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      const success = await eliminarMedicamento(medicamento.id_producto_pk);
      if (success) {
        Swal.fire({ icon: "success", title: "¡Eliminado!", text: "El medicamento fue eliminado correctamente", timer: 1800, showConfirmButton: false, });
      }
    }
  };

  const handleCambiarEstado = async (medicamento) => {
    try {
      const nuevoEstado = !medicamento.activo;

      const response = await cambiarEstadoProducto(medicamento.id_producto_pk, nuevoEstado);

      if (response.Consulta) {
        setMedicamentos(prev =>
          prev.map(med =>
            med.id_producto_pk === medicamento.id_producto_pk
              ? { ...med, activo: nuevoEstado }
              : med
          )
        );

        Swal.fire({
          icon: "success",
          title: nuevoEstado ? "¡Medicamento Activado!" : "¡Medicamento Desactivado!",
          text: "Estado actualizado correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response.error || "Error al cambiar estado");
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cambiar el estado del medicamento",
        confirmButtonText: "Entendido"
      });
    }
  };

  const handleEliminarLote = async (lote) => {
    const estilo = calcularEstadoLote(lote);

    const result = await Swal.fire({
      title: "¿Eliminar lote?",
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Código Lote:</span> ${lote.codigo_lote}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Stock:</span> ${lote.stock_lote} unidades</p>
          <p class="mb-1 text-sm"><span class="font-bold">Estado:</span> ${estilo.texto}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Vencimiento:</span> ${new Date(lote.fecha_vencimiento).toLocaleDateString('es-HN')}</p>
        </div>
        <p class="text-red-600 text-sm mt-2">⚠️ Esta acción no se puede deshacer</p>
      `,
      showCancelButton: true, confirmButtonText: "Eliminar", cancelButtonText: "Cancelar", reverseButtons: true, width: 400, padding: "16px",
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        const swalPopup = document.querySelector('.swal2-popup');
        if (swalContainer) {
          swalContainer.style.setProperty('z-index', '999999', 'important');
        }
        if (swalPopup) {
          swalPopup.style.setProperty('z-index', '999999', 'important');
        }
      },
      customClass: { confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium",
        cancelButton: "bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium mr-2",
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      const success = await eliminarLote(lote.id_lote_medicamentos_pk);
      if (success) {
        await cargarDatos();
        Swal.fire({ icon: "success", title: "¡Eliminado!", text: "El lote fue eliminado correctamente", timer: 1800, showConfirmButton: false,});
      }
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
      {/* Título */}
      <div className="rounded-xl p-6 mb-3"
        style={{
          backgroundImage: 'url("/H3.jpg")',
          backgroundColor: '#FFDE59',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          boxShadow: '0 0 8px #FFDE5940, 0 0 0 1px #FFDE5933'
        }}
      >
        <div className="flex justify-end items-right">
          <h2 className="text-2xl font-black text-right uppercase text-white">
            GESTIÓN DE MEDICAMENTOS
          </h2>
        </div>
        <p className="text-right text-white italic mt-2">
          Administra medicamentos veterinarios, lotes y control de inventario
        </p>
      </div>

      {/* Tabs de navegación*/}
      <div className="flex flex-wrap rounded-lg bg-gray-200 p-1 w-80 text-sm shadow-sm mb-6">
        <label className="flex-1 text-center">
          <input type="radio" name="vista" checked={vistaActual === "medicamentos"} onChange={() => setVistaActual("medicamentos")} className="hidden" />
          <span className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 ${
              vistaActual === "medicamentos"
                ? "bg-white font-semibold text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
             MEDICAMENTOS
          </span>
        </label>

        <label className="flex-1 text-center">
          <input type="radio" name="vista" checked={vistaActual === "kardex"} onChange={() => setVistaActual("kardex")} className="hidden" />
          <span className={`flex items-center justify-center rounded-lg py-2 px-4 cursor-pointer transition-all duration-150 ${
              vistaActual === "kardex"
                ? "bg-white font-semibold text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
             MOVIMIENTOS
          </span>
        </label>
      </div>

      {/* Sección Más Vendidos - SOLO PARA MEDICAMENTOS */}
      {vistaActual === "medicamentos" && (
        <MedicamentosMasVendidos medicamentos={medicamentos} />
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-xl p-6 mb-6"
           style={{boxShadow: '0 0 8px #FFDE5940, 0 0 0 1px #FFDE5933'}}>
        {vistaActual === "kardex" ? (
          <KardexTable kardexData={kardexFiltrado} />
        ) : (
          <>
            {/* Barra de búsqueda y controles - SOLO PARA MEDICAMENTOS */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-80">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar medicamentos..."
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

              <button
                className="bg-yellow-200 text-white px-6 py-2 rounded-full hover:bg-yellow-500 transition-colors flex items-center gap-2 uppercase"
                style={{ borderRadius: '12px' }}
                onClick={() => setModalVisible(true)}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
                </svg>
                NUEVO MEDICAMENTO
              </button>
            </div>

            {medicamentosFiltrados.length === 0 ? (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-lg"> No se encontraron medicamentos</p>
                <p className="text-sm text-gray-500 mt-2">Haz clic en "+ NUEVO MEDICAMENTO" </p>
              </div>
            ) : (
              <MedicamentoTable
                medicamentos={medicamentosFiltrados}
                stockTotals={medicamentos.reduce((acc, med) => {
                  acc[med.id_producto_pk] = calcularStockTotal(med.id_producto_pk);
                  return acc;
                }, {})}
                lotesCounts={medicamentos.reduce((acc, med) => {
                  acc[med.id_producto_pk] = lotes.filter(l => l.id_producto_fk === med.id_producto_pk).length;
                  return acc;
                }, {})}
                globalFilter={busqueda}
                setGlobalFilter={setBusqueda}
                onEditar={(med) => {
                  setMedicamentoEditando(med);
                  setModalVisible(true);
                }}
                onAgregarLote={(med) => {
                  setMedicamentoSeleccionado(med);
                  setModalLoteVisible(true);
                }}
                onVerLotes={(med) => {
                  setMedicamentoSeleccionado(med);
                  setModalLotesVisible(true);
                }}
                onEliminar={handleEliminarMedicamento}
                onCambiarEstado={handleCambiarEstado}
              />
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
        medicamentosExistentes={medicamentos}
      />

      <ModalLote
        isOpen={modalLoteVisible} 
        onClose={() => {
          setModalLoteVisible(false);
          setMedicamentoSeleccionado(null);
        }}
        onSave={handleGuardarLote} 
        medicamentoSeleccionado={medicamentoSeleccionado} 
        lotesExistentes={lotes}
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
        onEliminarLote={handleEliminarLote}
        onEditarLote={handleEditarLote} // ✅ AGREGADO
      />

      {/* ✅ NUEVO MODAL: Modal Editar Lote */}
      <ModalEditarLote
        isOpen={modalEditarLoteVisible}
        onClose={() => {
          setModalEditarLoteVisible(false);
          setLoteEditar(null);
        }}
        onSave={handleGuardarEdicionLote}
        loteEditar={loteEditar}
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