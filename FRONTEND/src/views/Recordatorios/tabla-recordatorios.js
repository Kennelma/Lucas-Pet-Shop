
import React, { useState, useRef } from 'react';
import ConexionWhatsApp from './conexionWhatsApp';
import Swal from "sweetalert2";
import ModalRecordatorio from "./modal-agregar-recordatorio";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

const ActionMenu = ({ rowData, onEditar, onEliminar, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowAbove, setShouldShowAbove] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const checkPosition = () => {
    const showAbove = rowIndex >= 2 || rowIndex >= (totalRows - 3);
    setShouldShowAbove(showAbove);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      checkPosition();
      requestAnimationFrame(() => {
        checkPosition();
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      <button
        ref={buttonRef}
        className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
        onClick={handleToggleMenu}
      >
        <i className="pi pi-ellipsis-h text-white text-xs"></i>
      </button>
      {isOpen && (
        <div className={`absolute right-0 ${shouldShowAbove ? 'bottom-16' : 'top-12'} bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-[140px]`}>
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
      )}
    </div>
  );
};

const TablaRecordatorios = ({ recordatorios = [], tipoServicio = [], frecuencias = [], loading = false }) => {

    const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalActualizar, setOpenModalActualizar] = useState(false);
  const [recordatorioAEditar, setRecordatorioAEditar] = useState(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [recordatorioAEliminar, setRecordatorioAEliminar] = useState(null);

  const handleAgregarRecordatorio = () => setOpenModal(true);


  const handleActualizarRecordatorio = (recordatorio, index) => {
    setRecordatorioAEditar({ ...recordatorio, indexVisual: index + 1 });
    setOpenModalActualizar(true);
  };

  const handleEliminar = async () => {
    setConfirmDialogVisible(false);
    await Swal.fire({
      icon: 'success',
      title: 'Recordatorio eliminado correctamente',
      confirmButtonColor: '#3085d6',
    });
  };

  const actionBotones = (rowData, column) => {
    const rowIndex = recordatorios.indexOf(rowData);
    return (
      <ActionMenu
        rowData={rowData}
        rowIndex={rowIndex}
        totalRows={recordatorios.length}
        onEditar={(recordatorio) => handleActualizarRecordatorio(recordatorio, rowIndex)}
        onEliminar={(recordatorio) => {
          setRecordatorioAEliminar(recordatorio);
          setConfirmDialogVisible(true);
        }}
      />
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 max-w-5xl mx-auto font-poppins" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <div className="flex justify-end items-center mb-4 gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded transition-colors flex items-center gap-2"
            onClick={() => setShowWhatsApp(true)}>
            CONECTAR WHATSAPP
          </button>
          <button className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 text-sm rounded transition-colors flex items-center gap-2"
            onClick={handleAgregarRecordatorio}>
            AGREGAR NUEVO RECORDATORIO
          </button>
        </div>

      <ConexionWhatsApp
        isOpen={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
      />
        <ModalRecordatorio
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onGuardar={(data) => {
            // Aquí puedes manejar el guardado del recordatorio
            Swal.fire({
              icon: 'success',
              title: 'Recordatorio guardado',
              text: 'El recordatorio se ha registrado correctamente',
              confirmButtonColor: '#3085d6',
            });

          }}
          tipoServicio={tipoServicio}
          frecuencias={frecuencias}
        />
        {recordatorios.length === 0 && !loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay recordatorios registrados</p>
            <p className="text-gray-400 text-sm mt-2">Haz clic en el botón + para agregar tu primer recordatorio</p>
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
            className="font-poppins datatable-gridlines"
            size="small"
            rowClassName={() => 'hover:bg-gray-100 cursor-pointer'}
            headerClassName="bg-gray-200 text-gray-800 font-bold text-base"
          >
            <Column field="id_recordatorio" header="ID" body={(rowData) => recordatorios.length - recordatorios.indexOf(rowData)} sortable className="text-sm"/>
            <Column field="titulo" header="TÍTULO" sortable className="text-sm" />
            <Column field="descripcion" header="DESCRIPCIÓN" className="text-sm" />
            <Column field="fecha" header="FECHA" className="text-sm" />
            <Column header="ACCIONES" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm" />
          </DataTable>
        )}
      </div>
      <Dialog
        header="Confirmar eliminación"
        visible={confirmDialogVisible}
        style={{ width: '30rem' }}
        onHide={() => setConfirmDialogVisible(false)}
        modal
      >
        <p>¿Estás seguro de eliminar el recordatorio <strong>{recordatorioAEliminar?.titulo}</strong>?</p>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            label="Cancelar"
            className="p-button-text"
            onClick={() => setConfirmDialogVisible(false)}
          />
          <Button
            label="Eliminar"
            className="bg-green-800 hover:bg-green-900 text-white"
            onClick={handleEliminar}
          />
        </div>
      </Dialog>
    </>
  );
};

export default TablaRecordatorios;