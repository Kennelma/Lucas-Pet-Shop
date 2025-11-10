// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                              IMPORTS                                     ║
// ╚════════════════════════════════════════════════════════════════════════════╝
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ConexionWhatsApp from './conexionWhatsApp.js';
import Swal from 'sweetalert2';
import ModalRecordatorio from './modal-agregar-recordatorio';
import ModalActualizarRecordatorio from './modal-actualizar-recordatorio';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Dialog } from 'primereact/dialog';
import { verRecordatorios, actualizarRecordatorio } from '../../AXIOS.SERVICES/reminders-axios';

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  MENÚ DE ACCIONES POR REGISTRO (COMPONENTE)              ║
// ╚════════════════════════════════════════════════════════════════════════════╝
const ActionMenu = ({ rowData, onEditar, onEliminar, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const portalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideWrapper = menuRef.current && !menuRef.current.contains(event.target);
      const clickedOutsidePortal = portalRef.current && !portalRef.current.contains(event.target);
      if (clickedOutsideWrapper && clickedOutsidePortal) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      <button
        ref={buttonRef}
        className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
        onClick={toggleMenu}
      >
        <i className="pi pi-ellipsis-h text-white text-xs"></i>
      </button>
      {isOpen && ReactDOM.createPortal(
        <div
          ref={portalRef}
          style={{
            position: 'fixed',
            top: (buttonRef.current?.getBoundingClientRect().bottom || 0) + 4,
            left: (buttonRef.current?.getBoundingClientRect().left || 0),
            zIndex: 9999
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]">
            <div
              className="px-2 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEditar(rowData);
              }}
            >
              <i className="pi pi-pencil text-xs"></i>
              <span className="uppercase">Editar</span>
            </div>
            <hr className="my-0 border-gray-200" />
            <div
              className="px-2 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEliminar(rowData);
              }}
            >
              <i className="pi pi-trash text-xs"></i>
              <span>Eliminar</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        TABLA PRINCIPAL COMPONENTE                        ║
// ╚════════════════════════════════════════════════════════════════════════════╝
const TablaRecordatorios = ({ tipoServicio = [], frecuencias = [], loading: loadingProp = false }) => {
  // ──────────────── ESTADOS PRINCIPALES ────────────────
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(loadingProp);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalActualizar, setOpenModalActualizar] = useState(false);
  const [recordatorioAEditar, setRecordatorioAEditar] = useState(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [recordatorioAEliminar, setRecordatorioAEliminar] = useState(null);

  // Para bloquear el switch mientras persiste
  const [savingId, setSavingId] = useState(null);

  // ──────────────── CARGA INICIAL DE DATOS ────────────────
  const recargar = async () => {
    setLoading(true);
    const datos = await verRecordatorios();
    setRecordatorios(datos || []);
    setLoading(false);
  };

  useEffect(() => {
    recargar();
  }, []);

  // ──────────────── UTILIDAD: FORMATO FECHA PARA INPUT ────────────────
  const toDateTimeInputValue = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // ──────────────── ACCIÓN: EDITAR RECORDATORIO ────────────────
  const handleActualizarRecordatorio = (row) => {
    setRecordatorioAEditar({
      id_recordatorio_pk: row.id_recordatorio_pk,
      tipoItem: String(row.id_tipo_item_fk ?? ''),
      frecuencia: String(row.id_frecuencia_fk ?? ''),
      fechaProgramacion: toDateTimeInputValue(row.programada_para),
      mensaje: row.mensaje_recordatorio ?? '',
    });
    setOpenModalActualizar(true);
  };

  // ──────────────── ACCIÓN: ELIMINAR RECORDATORIO ────────────────
  const handleEliminar = async () => {
    setConfirmDialogVisible(false);
    await Swal.fire({
      icon: 'success',
      title: 'Recordatorio eliminado correctamente',
      confirmButtonColor: '#3085d6',
    });
    // Si implementas eliminar, aquí puedes llamar al endpoint y luego:
    // await recargar();
  };

  // ──────────────── ACCIÓN: TOGGLE ACTIVO (OPTIMISTIC + BLOQUEO) ────────────────
  const handleToggleActivo = async (rowData) => {
    const id = rowData.id_recordatorio_pk;
    const nuevoActivo = rowData.activo ? 0 : 1;
    const snapshot = recordatorios.find(r => r.id_recordatorio_pk === id);

    // Optimistic UI
    setRecordatorios(prev =>
      prev.map(r => r.id_recordatorio_pk === id ? { ...r, activo: nuevoActivo } : r)
    );
    setSavingId(id);

    try {
      const payload = { id_recordatorio: id, activo: nuevoActivo };
      const res = await actualizarRecordatorio(payload);
      if (!(res?.Consulta || res?.ok || res?.exito)) throw new Error(res?.error || 'No se pudo actualizar');

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `Recordatorio ${nuevoActivo ? 'activado' : 'desactivado'} correctamente.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
    } catch (e) {
      // revertir
      setRecordatorios(prev => prev.map(r => r.id_recordatorio_pk === id ? snapshot : r));
      Swal.fire({ icon: 'error', title: 'Error', text: e.message || 'Intente de nuevo.' });
    } finally {
      setSavingId(null);
    }
  };

  // ──────────────── ACCIONES DE FILA (MENÚ) ────────────────
  const actionBotones = (rowData) => {
    const rowIndex = recordatorios.indexOf(rowData);
    return (
      <ActionMenu
        rowData={rowData}
        rowIndex={rowIndex}
        totalRows={recordatorios.length}
        onEditar={handleActualizarRecordatorio}
        onEliminar={(recordatorio) => {
          setRecordatorioAEliminar(recordatorio);
          setConfirmDialogVisible(true);
        }}
      />
    );
  };

  // ──────────────── RENDER PRINCIPAL ────────────────
  return (
    <>
      <div
        className="bg-white rounded-xl p-6 max-w-5xl mx-auto font-poppins"
        style={{ boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33' }}
      >
        {/* BOTONES SUPERIORES */}
        <div className="flex justify-end items-center mb-4 gap-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded transition-colors flex items-center gap-2"
            onClick={() => setShowWhatsApp(true)}
          >
            CONECTAR WHATSAPP
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 text-sm rounded transition-colors flex items-center gap-2"
            onClick={() => setOpenModal(true)}
          >
            AGREGAR NUEVO RECORDATORIO
          </button>
        </div>

        {/* MODALES */}
        <ConexionWhatsApp isOpen={showWhatsApp} onClose={() => setShowWhatsApp(false)} />

        <ModalRecordatorio
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onGuardar={async () => {
            Swal.fire({
              icon: 'success',
              title: 'Recordatorio guardado',
              text: 'El recordatorio se ha registrado correctamente',
            });
            setOpenModal(false);
            await recargar(); // 🔁 recarga después de crear
          }}
          tipoServicio={tipoServicio}
          frecuencias={frecuencias}
        />

        <ModalActualizarRecordatorio
          key={recordatorioAEditar?.id_recordatorio_pk || 'new'}
          isOpen={openModalActualizar}
          onClose={() => {
            setOpenModalActualizar(false);
            setRecordatorioAEditar(null);
          }}
          tipos={tipoServicio}
          frecuencias={frecuencias}
          recordatorio={recordatorioAEditar}
          onActualizar={async (payload) => {
            const res = await actualizarRecordatorio(payload);
            if (res?.Consulta || res?.ok || res?.exito) {
              Swal.fire({
                icon: 'success',
                title: 'Recordatorio actualizado',
                text: 'Se actualizó correctamente',
              });
              setOpenModalActualizar(false);
              setRecordatorioAEditar(null);

              // 🔁 recargar para reflejar datos frescos (frecuencia_nombre, dias_intervalo, estado, etc.)
              await recargar();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res?.error || 'No se pudo actualizar',
              });
            }
          }}
        />

        {/* TABLA PRINCIPAL */}
        {recordatorios.length === 0 && !loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay recordatorios registrados</p>
            <p className="text-gray-400 text-sm mt-2">Haz clic en el botón para agregar tu primer recordatorio</p>
          </div>
        ) : (
          <DataTable
            value={recordatorios}
            loading={loading}
            showGridlines
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 15]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            tableStyle={{ minWidth: '50rem' }}
            className="font-poppins datatable-gridlines overflow-visible"
            size="small"
            rowClassName={() => 'hover:bg-gray-100 cursor-pointer'}
          >
            {/* ID DEL RECORDATORIO */}
            <Column field="id_recordatorio_pk" header="ID" sortable className="text-sm" />
            {/* MENSAJE DEL RECORDATORIO */}
            <Column field="mensaje_recordatorio" header="MENSAJE" className="text-sm" />
            {/* FECHA PROGRAMADA PARA ENVIAR */}
            <Column
              header="PROGRAMADA PARA ENVIAR"
              className="text-sm"
              body={(rowData) => {
                if (!rowData.programada_para) return '';
                const d = new Date(rowData.programada_para);
                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
              }}
            />
            {/* INTERVALO Y FRECUENCIA UNIDOS */}
            <Column
              header="INTERVALO Y FRECUENCIA"
              className="text-sm"
              body={(rowData) => `${rowData.dias_intervalo ?? ''} días - ${rowData.frecuencia_nombre ?? ''}`}
            />
            {/* PRÓXIMO ENVÍO (si usas columna calculada en FE) */}
            <Column
              header="PRÓXIMO ENVÍO"
              className="text-sm"
              body={(rowData) => {
                if (!rowData.programada_para || !rowData.dias_intervalo) return '';
                const fecha = new Date(rowData.programada_para);
                fecha.setDate(fecha.getDate() + Number(rowData.dias_intervalo));
                return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
              }}
            />
            {/* NOMBRE DEL ESTADO */}
            <Column field="nombre_estado" header="ESTADO" className="text-sm" />
            {/* ESTADO ACTIVO */}
            <Column
              field="activo"
              header="ACTIVO"
              className="text-sm"
              body={(rowData) => (
                <InputSwitch
                  checked={!!rowData.activo}
                  onChange={() => handleToggleActivo(rowData)}
                  disabled={savingId === rowData.id_recordatorio_pk}
                />
              )}
            />
            {/* ACCIONES */}
            <Column header="ACCIONES" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm" />
          </DataTable>
        )}
      </div>

      {/* DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Dialog
        header="Confirmar eliminación"
        visible={confirmDialogVisible}
        style={{ width: '30rem' }}
        onHide={() => setConfirmDialogVisible(false)}
        modal
      >
        <p>
          ¿Estás seguro de eliminar el recordatorio <strong>{recordatorioAEliminar?.mensaje_recordatorio}</strong>?
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button label="Cancelar" className="p-button-text" onClick={() => setConfirmDialogVisible(false)} />
          <Button label="Eliminar" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleEliminar} />
        </div>
      </Dialog>
    </>
  );
};

export default TablaRecordatorios;
