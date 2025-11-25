import React, { useState, useEffect, useRef } from 'react';
import Swal from "sweetalert2";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import ModalPerfilCliente from "./ModalPerfilCliente.js";

import { verClientes, eliminarCliente } from "../../AXIOS.SERVICES/clients-axios.js";

import FormularioCliente from "./modal-agregar.js";
import FormularioActualizarCliente from "./modal-actualizar.js";

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

    const handleResize = () => {
      setIsOpen(false);
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
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
        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors text-xs sm:text-sm"
        onClick={handleToggleMenu}
      >
        <i className="pi pi-ellipsis-h text-white text-xs"></i>
      </button>

      {isOpen && (
        <div className={`absolute right-0 ${shouldShowAbove ? 'bottom-16' : 'top-12'} bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-[140px] text-xs sm:text-sm`}>
          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
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
            <span className="uppercase">Eliminar</span>
          </div>
        </div>
      )}
    </div>
  );
};


const TablaClientes = ({ setClienteSeleccionado }) => {

    //ESTADOS_A_UTILIZAR
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openModalActualizar, setOpenModalActualizar] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await verClientes();
                setClientes(data);
                if (data && data.length > 0) {
                    const ultimoCliente = data[data.length - 1];
                    setClienteSeleccionado(ultimoCliente);
                    setSelectedClienteId(ultimoCliente.id_cliente_pk);
                }
            } catch (error) {
                console.error('Error al obtener clientes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    //EVITA_EL_SCROLL_EN_LOS_MODALES
    useEffect(() => {
        if (openModal || openModalActualizar) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [openModal, openModalActualizar]);


    //CONSTANTE PARA ABRIR LOS MODALES DE AGREGAR Y ACTUALIZAR CLIENTES
    const handleAgregarCliente = () => setOpenModal(true);
    const handleActualizarCliente = (cliente, index) => {
        setClienteAEditar({ ...cliente, indexVisual: index + 1 });
        setOpenModalActualizar(true);
    };

    const handleRowClick = (e) => {
        setClienteSeleccionado(e.data);
        setSelectedClienteId(e.data.id_cliente_pk);
    };

    //ESTADO DE ELIMINACION, AQUI SE MANEJA LOS TOAST DE CONFIRMACION
    const handleEliminar = async (cliente) => {
        const result = await Swal.fire({
            title: '¿Eliminar cliente?',
            html: `
                <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
                    <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${cliente?.nombre_cliente}</p>
                    <p class="mb-1 text-sm"><span class="font-bold">Identidad:</span> ${cliente?.identidad_cliente}</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            width: 380,
            padding: '16px',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const resultado = await eliminarCliente(cliente.id_cliente_pk);

            if (resultado.Consulta) {
                const data = await verClientes();
                setClientes(data);
                await Swal.fire({
                    icon: 'success',
                    title: '¡Cliente eliminado!',
                    text: 'El cliente se ha eliminado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el cliente',
                    confirmButtonColor: '#22c55e'
                });
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error inesperado',
                confirmButtonColor: '#22c55e'
            });
        }
    };

    const actionBotones = (rowData, column) => {
        const rowIndex = clientes.indexOf(rowData);
        return (
            <ActionMenu
                rowData={rowData}
                rowIndex={rowIndex}
                totalRows={clientes.length}
                onEditar={(cliente) => handleActualizarCliente(cliente, rowIndex)}
                onEliminar={(cliente) => handleEliminar(cliente)}
            />
        );
    };

    return (
        <>
            <style>
                {`
                    .p-datatable .p-datatable-tbody > tr.bg-\\[\\#DEFFAD\\]\\/30 {
                        background-color: rgb(222 255 173 / 0.3) !important;
                    }
                `}
            </style>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 font-poppins border-2" style={{borderColor: '#B5DD7E'}}>
                <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-2 sm:gap-3 mb-4">
                    <button
                        className="w-full sm:w-auto text-black px-3 py-2 sm:py-1 text-xs sm:text-sm rounded transition-colors flex items-center justify-center sm:justify-start gap-2 uppercase"
                        style={{ backgroundColor: "#B5DD7E" }}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(222, 255, 173, 1)'}
                        onClick={handleAgregarCliente}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        AGREGAR CLIENTE
                    </button>
                </div>

                {clientes.length === 0 && !loading ? (
                    <div className="text-center py-6 sm:py-8">
                        <p className="text-gray-500 text-sm sm:text-lg">No hay clientes registrados</p>
                        <p className="text-gray-400 text-xs sm:text-sm mt-2">Haz clic en el botón + para agregar tu primer cliente</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <DataTable
                        value={clientes}
                        loading={loading}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 15]}
                        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                        tableStyle={{ width: '100%' }}
                        className="font-poppins datatable-gridlines datatable-compact text-xs sm:text-sm"
                        size="small"
                        rowClassName={(rowData) => rowData.id_cliente_pk === selectedClienteId ? 'bg-[#DEFFAD]/30 cursor-pointer' : 'hover:bg-[#DEFFAD]/20 cursor-pointer'}
                        onRowClick={handleRowClick}
                        selectionMode="single"
                    >
                        <Column field="id_cliente_pk" header="ID" body={(rowData) => clientes.length - clientes.indexOf(rowData)} sortable className="text-xs sm:text-sm px-2" style={{ width: '50px', minWidth: '50px' }} />
                        <Column field="nombre_cliente" header="NOMBRE" sortable className="text-xs sm:text-sm px-2" style={{ width: 'auto', minWidth: '100px' }} />
                        <Column field="apellido_cliente" header="APELLIDO" sortable className="text-xs sm:text-sm px-2" style={{ width: 'auto', minWidth: '100px' }} />
                        <Column field="telefono_cliente" header="TELÉFONO" body={(rowData) => `+504 ${rowData.telefono_cliente}`} sortable className="text-xs sm:text-sm px-2" style={{ width: 'auto', minWidth: '120px' }} />
                        <Column header="ACCIONES" body={actionBotones} className="text-xs sm:text-sm text-center px-2" style={{ width: '70px', minWidth: '70px' }} />
                    </DataTable>
                    </div>
                )}
            </div>

            {/*MODAL PARA AGREGAR CLIENTES*/}
            <FormularioCliente
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onClienteAgregado={async () => {
                    const data = await verClientes();
                    setClientes(data);
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Cliente registrado!',
                        text: 'El cliente se ha registrado correctamente',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }}
            />

            {/*MODAL PARA ACTUALIZAR CLIENTE*/}
            {clienteAEditar && (
                <FormularioActualizarCliente
                    isOpen={openModalActualizar}
                    cliente={clienteAEditar}
                    onClose={() => setOpenModalActualizar(false)}
                    onClienteActualizado={async () => {
                        const data = await verClientes();
                        setClientes(data);
                        await Swal.fire({
                            icon: 'success',
                            title: '¡Cliente actualizado!',
                            text: 'El cliente se ha actualizado correctamente',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }}
                />
            )}


        </>
    );
};

export default TablaClientes;
