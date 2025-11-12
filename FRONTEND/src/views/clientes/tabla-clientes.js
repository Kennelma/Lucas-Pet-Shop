import React, { useState, useEffect, useRef } from 'react';
import Swal from "sweetalert2";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';


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

    //CONSTANTES_PARA_LA_ELIMINACION_DE_CLIENTES
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await verClientes();
                setClientes(data);
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

    //MANEJAR_HOVER_SOBRE_FILA_PARA_MOSTRAR_PERFIL
    const handleRowHover = (e) => {
        setClienteSeleccionado(e.data);
    };

    //ESTADO DE ELIMINACION, AQUI SE MANEJA LOS TOAST DE CONFIRMACION
    const handleEliminar = async () => {
        try {
            const resultado = await eliminarCliente(clienteAEliminar.id_cliente_pk);

            if (resultado.Consulta) {
                const data = await verClientes();
                setClientes(data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Cliente eliminado correctamente',
                    confirmButtonColor: '#3085d6',
                });
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el cliente',
                    confirmButtonColor: '#d33',
                });
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error inesperado',
                confirmButtonColor: '#d33',
            });
        }
        setConfirmDialogVisible(false);
    };

    const actionBotones = (rowData, column) => {
        const rowIndex = clientes.indexOf(rowData);
        return (
            <ActionMenu
                rowData={rowData}
                rowIndex={rowIndex}
                totalRows={clientes.length}
                onEditar={(cliente) => handleActualizarCliente(cliente, rowIndex)}
                onEliminar={(cliente) => {
                    setClienteAEliminar(cliente);
                    setConfirmDialogVisible(true);
                }}
            />
        );
    };

    return (
        <>
            <style>
                {`
                    .datatable-compact .p-datatable-tbody > tr > td {
                        padding: 0.5rem 0.5rem !important;
                    }
                    .datatable-compact .p-datatable-thead > tr > th {
                        padding: 0.5rem 0.5rem !important;
                    }
                `}
            </style>

            <div className="bg-white rounded-xl p-6 max-w-5xl mx-auto font-poppins" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
                <div className="flex justify-end items-center mb-4">
                    <button
                        className="text-black px-3 py-1 text-sm rounded transition-colors flex items-center gap-2 uppercase"
                        style={{ backgroundColor: 'rgb(165, 204, 139)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(145, 184, 119)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(165, 204, 139)'}
                        onClick={handleAgregarCliente}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        AGREGAR NUEVO CLIENTE
                    </button>
                </div>

                {clientes.length === 0 && !loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No hay clientes registrados</p>
                        <p className="text-gray-400 text-sm mt-2">Haz clic en el botón + para agregar tu primer cliente</p>
                    </div>
                ) : (
                    <DataTable
                        value={clientes}
                        loading={loading}
                        showGridlines
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 15]}
                        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                        tableStyle={{ width: '100%' }}
                        className="font-poppins datatable-gridlines datatable-compact"
                        size="small"
                        rowClassName={() => 'hover:bg-blue-50 cursor-pointer'}
                        onRowMouseEnter={handleRowHover}
                    >
                        <Column field="id_cliente_pk" header="ID" body={(rowData) => clientes.length - clientes.indexOf(rowData)} sortable className="text-sm px-2" style={{ width: '60px' }} />
                        <Column field="nombre_cliente" header="NOMBRE" sortable className="text-sm px-2" style={{ width: 'auto' }} />
                        <Column field="apellido_cliente" header="APELLIDO" sortable className="text-sm px-2" style={{ width: 'auto' }} />
                        <Column field="telefono_cliente" header="TELÉFONO" body={(rowData) => `+504 ${rowData.telefono_cliente}`} sortable className="text-sm px-2" style={{ width: 'auto' }} />
                        <Column header="ACCIONES" body={actionBotones} className="text-sm text-center px-2" style={{ width: '80px' }} />
                    </DataTable>
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
                        text: 'Cliente se ha registrado con éxito',
                        confirmButtonColor: '#3085d6',
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
                            title: 'Cliente actualizado correctamente',
                            confirmButtonColor: '#3085d6',
                        });
                    }}
                />
            )}

            {/*DIALOG_PARA_ELIMINAR_CLIENTE*/}
            <Dialog
                header="Confirmar eliminación"
                visible={confirmDialogVisible}
                style={{ width: '30rem' }}
                onHide={() => setConfirmDialogVisible(false)}
                modal
            >
                <p>¿Estás seguro de eliminar al cliente <strong>{clienteAEliminar?.nombre_cliente}</strong>?</p>
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

export default TablaClientes;
