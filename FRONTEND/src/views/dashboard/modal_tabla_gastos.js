import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import Swal from 'sweetalert2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import ModalAgregarGasto from './modal_nuevo_gasto';
import ModalActualizarGasto from './modal_actualizar_gasto';
import { ver, eliminarRegistro } from '../../AXIOS.SERVICES/empresa-axios';

const ModalTablaGastos = ({ visible, onHide, onRefresh }) => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openModalActualizar, setOpenModalActualizar] = useState(false);
  const [gastoAEditar, setGastoAEditar] = useState(null);

  useEffect(() => {
    if (visible) cargarGastos();
  }, [visible]);

  const cargarGastos = async () => {
    setLoading(true);
    try {
      const data = await ver('GASTOS');
      if (Array.isArray(data)) {
        const gastosFormateados = data.map((item) => {
          const normalizedDate = new Date(item.fecha_registro_gasto || Date.now());
          return {
            id: item.id_gasto_pk,
            description: item.detalle_gasto,
            amount: Number(item.monto_gasto),
            date: normalizedDate,
          };
        });
        setGastos(gastosFormateados);
      }
    } catch (err) {
      console.error('Error al cargar gastos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarGasto = () => setOpenModal(true);

  const handleEditar = (gasto) => {
    setGastoAEditar(gasto);
    setOpenModalActualizar(true);
  };

  const handleEliminar = async (gasto) => {
    const fechaGasto = new Date(gasto.date);
    const fechaHoy = new Date();
    const gastoNormalizado = new Date(fechaGasto.getFullYear(), fechaGasto.getMonth(), fechaGasto.getDate());
    const hoyNormalizado = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate());

    if (gastoNormalizado.getTime() !== hoyNormalizado.getTime()) {
      Swal.fire({
        title: 'Acción no permitida',
        text: 'Solo se pueden eliminar gastos del día actual.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Eliminar gasto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await eliminarRegistro(gasto.id, 'GASTOS');
        if (res.Consulta) {
          await cargarGastos();
          onRefresh();
          Swal.fire('Eliminado', 'Gasto eliminado correctamente', 'success');
        } else {
          Swal.fire('Error', 'No se pudo eliminar el gasto', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
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

  const formatoFecha = (rowData) => {
    return rowData.date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatoMonto = (rowData) => {
    return `L ${parseFloat(rowData.amount).toFixed(2)}`;
  };

  const totalGastos = gastos.reduce((total, gasto) => {
    return total + (parseFloat(gasto.amount) || 0);
  }, 0);

  return (
    <>
      <style>
        {`
          .modal-tabla-gastos-dialog .p-dialog {
            z-index: 1500 !important;
          }
          .modal-tabla-gastos-dialog .p-dialog-mask {
            z-index: 1499 !important;
          }
        `}
      </style>
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillAlt} className="text-yellow-500 text-sm" />
            <span className="font-poppins font-bold uppercase text-sm">Gestión de Gastos</span>
          </div>
        }
        visible={visible}
        onHide={onHide}
        className="modal-tabla-gastos-dialog w-[55vw] max-w-[750px]"
        breakpoints={{ '960px': '90vw' }}
        modal
        draggable={false}
        style={{ zIndex: 1000 }}
        baseZIndex={1000}
      >
        <div className="flex flex-col">
          {gastos.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay gastos registrados</p>
              <p className="text-gray-400 text-sm mt-2">Haz clic en el botón para agregar tu primer gasto</p>
            </div>
          ) : (
            <DataTable
              value={gastos}
              loading={loading}
              showGridlines
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 15]}
              paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
              className="w-full text-xs"
              size="small"
              rowClassName={() => 'hover:bg-yellow-50'}
              pt={{ headerCell: { className: 'px-3' }, bodyCell: { className: 'px-3' } }}
            >
              <Column
                field="id"
                header="ID"
                body={(rowData) => gastos.length - gastos.indexOf(rowData)}
                sortable
                style={{ width: '80px' }}
              />
              <Column
                field="description"
                header="DESCRIPCIÓN"
                sortable
                style={{ width: '200px' }}
              />
              <Column
                field="amount"
                header="MONTO"
                body={formatoMonto}
                sortable
                style={{ width: '130px' }}
              />
              <Column
                field="date"
                header="FECHA"
                body={formatoFecha}
                sortable
                style={{ width: '130px' }}
              />
              <Column
                header="ACCIONES"
                body={actionBotones}
                style={{ width: '120px' }}
              />
            </DataTable>
          )}
        </div>
      </Dialog>

      <ModalAgregarGasto
        visible={openModal}
        onHide={() => setOpenModal(false)}
        onRefresh={async () => {
          await cargarGastos();
          onRefresh();
          Swal.fire({
            icon: 'success',
            title: '¡Gasto registrado!',
            text: 'El gasto se ha registrado con éxito',
            confirmButtonColor: '#3085d6',
          });
        }}
      />

      {gastoAEditar && (
        <ModalActualizarGasto
          visible={openModalActualizar}
          onHide={() => {
            setOpenModalActualizar(false);
            setGastoAEditar(null);
          }}
          gastoSeleccionado={gastoAEditar}
          onRefresh={async () => {
            await cargarGastos();
            onRefresh();
            Swal.fire('Actualizado', 'Gasto actualizado correctamente', 'success');
          }}
        />
      )}
    </>
  );
};

export default ModalTablaGastos;