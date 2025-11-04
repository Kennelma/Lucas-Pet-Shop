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

const ActionMenu = ({ rowData, onEditar, onVerPerfil, onEliminar, rowIndex, totalRows }) => {
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
            <span>Editar</span>
          </div>

          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onVerPerfil(rowData);
            }}
          >
            <i className="pi pi-eye text-xs"></i>
            <span>Ver Perfil</span>
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

const TablaClientes = () => {

    //ESTADOS A UTILIZAR
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openModalActualizar, setOpenModalActualizar] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState(null);

    //ESTADO PARA EL MODAL DE PERFIL
    const [openModalPerfil, setOpenModalPerfil] = useState(false);
    const [clientePerfil, setClientePerfil] = useState(null);

    //CONSTANTES PARA LA ELIMINACION DE CLIENTES
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Obteniendo clientes...');
                const data = await verClientes();
                console.log('Datos obtenidos:', data);
                setClientes(data);
            } catch (error) {
                console.error('Error al obtener clientes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    //EVITA EL SCROLL EN LOS MODALES
    useEffect(() => {
        if (openModal || openModalActualizar || openModalPerfil) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [openModal, openModalActualizar, openModalPerfil]);


    //CONSTANTE PARA ABRIR LOS MODALES DE AGREGAR Y ACTUALIZAR CLIENTES
    const handleAgregarCliente = () => setOpenModal(true);
    const handleActualizarCliente = (cliente, index) => {
        setClienteAEditar({ ...cliente, indexVisual: index + 1 }); //SE AGREGA EL ID VISUAL
        setOpenModalActualizar(true);
    };

    //CONSTANTE PARA ABRIR EL MODAL DE PERFIL DEL CLIENTE
    const handleVerPerfil = (cliente) => {
        setClientePerfil(cliente);
        setOpenModalPerfil(true);
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
                onVerPerfil={handleVerPerfil}
                onEliminar={(cliente) => {
                    setClienteAEliminar(cliente);
                    setConfirmDialogVisible(true);
                }}
            />
        );
    };

    return (
        <>

            <div className="bg-white rounded-xl p-6 max-w-5xl mx-auto font-poppins" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
                <div className="flex justify-end items-center mb-4">
                    <button className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 text-sm rounded transition-colors flex items-center gap-2"
                        onClick={handleAgregarCliente}>
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
                        tableStyle={{ minWidth: '50rem' }}
                        className="font-poppins datatable-gridlines"
                        size="small"
                        rowClassName={() => 'hover:bg-gray-100 cursor-pointer'}
                    >
                        <Column field="id_cliente_pk" header="ID" body={(rowData) => clientes.length - clientes.indexOf(rowData)} sortable className="text-sm"/>
                        <Column field="nombre_cliente" header="NOMBRE" sortable className="text-sm" />
                        <Column field="apellido_cliente" header="APELLIDO" sortable className="text-sm" />
                        <Column field="identidad_cliente" header="IDENTIDAD" className="text-sm" />
                        <Column field="telefono_cliente" header="TELÉFONO" className="text-sm" />
                        <Column
                            field="fecha_registro"
                            header="FECHA DE REGISTRO"
                            className="text-sm"
                            body={(rowData) => {
                                const fecha = new Date(rowData.fecha_registro);
                                return fecha.toLocaleString('es-HN', {
                                timeZone: 'America/Tegucigalpa',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                });
                            }}
                            />
                        <Column header="ACCIONES" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm" />
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

            {/*MODAL PARA VER PERFIL DEL CLIENTE*/}
            {clientePerfil && (
                <Dialog
                    header={<div className="w-full text-center text-lg font-bold">PERFIL DE CLIENTE</div>}
                    visible={openModalPerfil}
                    style={{ width: '28rem', borderRadius: '1.5rem' }}
                    modal
                    closable={false}
                    onHide={() => setOpenModalPerfil(false)}
                    footer={
                        <div className="flex justify-center mt-2">
                            <Button
                                label="Cerrar"
                                icon="pi pi-times"
                                className="p-button-text p-button-rounded"
                                onClick={() => setOpenModalPerfil(false)}
                            />
                        </div>
                    }
                    position="center"
                    dismissableMask={false}
                    draggable={false}
                    resizable={false}
                >
                    <div className="mt-0">

                        {/* Información del cliente */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">NOMBRE COMPLETO</label>
                                <div className="w-full rounded-xl h-9 text-sm bg-gray-100 flex items-center px-3 border">
                                    {clientePerfil.nombre_cliente} {clientePerfil.apellido_cliente}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}

            {/*DIALOG PARA ELIMINAR CLIENTE*/}
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
