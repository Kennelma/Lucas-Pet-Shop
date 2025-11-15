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
    const hoyNormalizado = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate());

   
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
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => handleEditar(rowData)}
        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
        title="Editar"
      >
        <i className="pi pi-pencil text-xs"></i>
      </button>
      <button
        onClick={() => handleEliminar(rowData)}
        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
        title="Eliminar"
      >
        <i className="pi pi-trash text-xs"></i>
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
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillAlt} className="text-yellow-500 text-sm" />
            <span className="font-poppins font-bold uppercase text-sm">Gestión de Gastos</span>
          </div>
        }
        visible={visible}
        onHide={onHide}
        className="w-[70vw] max-w-[900px]"
        breakpoints={{ '960px': '90vw' }}
        modal
        draggable={false}
        style={{ zIndex: 1000 }}
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <div className="text-sm font-bold text-gray-800">
              Total: <span className="text-green-600">L {totalGastos.toFixed(2)}</span>
            </div>
          </div>

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
              rows={8}
              rowsPerPageOptions={[8, 15, 30]}
              paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
              className="w-full text-xs"
              size="small"
              rowClassName={() => 'hover:bg-yellow-50'}
            >
              <Column
                field="id"
                header="ID"
                body={(rowData) => gastos.length - gastos.indexOf(rowData)}
                sortable
                className="w-[50px] text-justify"
              />
              <Column
                field="description"
                header="DESCRIPCIÓN"
                sortable
                className="w-[100px]"
              />
              <Column
                field="amount"
                header="MONTO"
                body={formatoMonto}
                sortable
                className="w-[30px]"
              />
              <Column
                field="date"
                header="FECHA"
                body={formatoFecha}
                sortable
                className="w-[30px]"

              />
              <Column
                header="ACCIONES"
                body={actionBotones}
                className="w-[30px]"
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
          onHide={() => setOpenModalActualizar(false)}
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
