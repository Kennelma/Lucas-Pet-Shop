import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { verEstilistas } from '../../AXIOS.SERVICES/employees-axios';
import { Scissors } from 'lucide-react';
import Swal from 'sweetalert2';
import ModalAgregarEstilista from './modal-agregar';
import ModalActualizarEstilista from './modal-actualizar';

const ModalTablaEstilistas = ({ visible, onHide, onRefresh, onDelete }) => {
  const [estilistas, setEstilistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModalAgregar, setOpenModalAgregar] = useState(false);
  const [openModalActualizar, setOpenModalActualizar] = useState(false);
  const [estilistaAEditar, setEstilistaAEditar] = useState(null);

  useEffect(() => {
    if (visible) cargarEstilistas();
  }, [visible]);

  const cargarEstilistas = async () => {
    setLoading(true);
    try {
      const data = await verEstilistas();
      setEstilistas(data || []);
    } catch (err) {
      // Error al cargar estilistas
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarEstilista = () => setOpenModalAgregar(true);

  const handleEditar = (estilista) => {
    setEstilistaAEditar(estilista);
    setOpenModalActualizar(true);
  };

  const handleEliminar = async (estilista) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar estilista?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${estilista.nombre_estilista} ${estilista.apellido_estilista}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Identidad:</span> ${estilista.identidad_estilista}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px',
      customClass: {
        confirmButton: 'bg-green-800 hover:bg-green-900 text-white p-button p-component',
        cancelButton: 'p-button-text p-button p-component'
      }
    });

    if (confirm.isConfirmed) {
      if (onDelete) {
        await onDelete(estilista.id_estilista_pk);
        await cargarEstilistas();
        onRefresh && onRefresh();
      }
    }
  };

  const actionBotones = (rowData) => (
    <div className="flex items-center gap-2 w-full justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white p-1.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          handleEditar(rowData);
        }}
        title="Editar"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>

      <button
        className="bg-red-500 hover:bg-red-700 text-white p-1.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          handleEliminar(rowData);
        }}
        title="Eliminar"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );

  const estadoTemplate = (rowData) => {
    return (
      <div className="flex items-center justify-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          rowData.activo
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {rowData.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .modal-tabla-estilistas-dialog .p-dialog {
            z-index: 10000 !important;
          }
          .modal-tabla-estilistas-dialog .p-dialog-mask {
            z-index: 9999 !important;
          }
          .swal2-container {
            z-index: 99999 !important;
          }
        `}
      </style>
      <Dialog
        header={
          <div className="flex items-center gap-2">

            <span className="font-poppins font-bold uppercase text-sm text-center w-full">Gestión de Estilistas</span>
          </div>
        }
        visible={visible}
        onHide={onHide}
        className="modal-tabla-estilistas-dialog w-[75vw] max-w-[900px]"
        breakpoints={{ '960px': '90vw' }}
        modal
        draggable={false}
        style={{ zIndex: 9999 }}
        baseZIndex={9998}
      >
        <div className="flex flex-col">
          {estilistas.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay estilistas registrados</p>
              <p className="text-gray-400 text-sm mt-2">Haz clic en el botón para agregar tu primer estilista</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                value={estilistas}
                loading={loading}
                showGridlines
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 15]}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                className="w-full text-xs"
                size="small"
                rowClassName={() => 'hover:bg-yellow-50'}
                sortField="id_estilista_pk"
                sortOrder={-1}
                style={{ width: '100%' }}
                tableStyle={{ tableLayout: 'auto' }}
              >
                <Column
                  field="id_estilista_pk"
                  header="ID"
                  body={(rowData, options) => estilistas.length - options.rowIndex}
                  sortable
                  style={{ width: '5%' }}
                />
                <Column
                  field="nombre_estilista"
                  header="NOMBRE"
                  sortable
                  style={{ width: '15%' }}
                />
                <Column
                  field="apellido_estilista"
                  header="APELLIDO"
                  sortable
                  style={{ width: '15%' }}
                />
               <Column
  field="identidad_estilista"
  header="IDENTIDAD"
  sortable
  style={{ width: '18%', textAlign: 'center' }}
  headerStyle={{ textAlign: 'center' }}
/>

                <Column
                  field="fecha_ingreso"
                  header="FECHA DE INGRESO"
                  body={(rowData) => {
                    if (!rowData.fecha_ingreso) return 'N/A';
                    const fecha = new Date(rowData.fecha_ingreso);
                    return fecha.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                  }}
                  sortable
                  style={{ width: '22%', textAlign: 'center' }}
                />
                <Column
                  header="ACCIONES"
                  body={actionBotones}
                  style={{ width: '15%' }}
                />
              </DataTable>
            </div>
          )}
        </div>
      </Dialog>

      <ModalAgregarEstilista
        isOpen={openModalAgregar}
        onClose={() => setOpenModalAgregar(false)}
        onSave={async () => {
          await cargarEstilistas();
          onRefresh && onRefresh();
        }}
        estilistas={estilistas}
      />

      {estilistaAEditar && (
        <ModalActualizarEstilista
          isOpen={openModalActualizar}
          onClose={() => {
            setOpenModalActualizar(false);
            setEstilistaAEditar(null);
          }}
          estilista={estilistaAEditar}
          onSave={async () => {
            await cargarEstilistas();
            onRefresh && onRefresh();
          }}
          estilistas={estilistas}
        />
      )}
    </>
  );
};

export default ModalTablaEstilistas;