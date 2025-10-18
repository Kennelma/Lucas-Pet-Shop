import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faUserPlus, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { verClientes, eliminarCliente } from "../../AXIOS.SERVICES/clients-axios.js";

import FormularioCliente from "./modal-agregar.js";
import FormularioActualizarCliente from "./modal-actualizar.js"; 

const TablaClientes = ({ setClienteSeleccionado }) => {
    
    //ESTADOS A UTILIZAR
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openModalActualizar, setOpenModalActualizar] = useState(false); 
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

    //CONSTANTES PARA LA ELIMINACION DE CLIENTES
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);

    const toast = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await verClientes();
                setClientes(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    //EVITA EL SCROLL EN LOS MODALES
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
        setClienteAEditar({ ...cliente, indexVisual: index + 1 }); //SE AGREGA EL ID VISUAL
        setOpenModalActualizar(true);
    };

    //ESTADO DE ELIMINACION, AQUI SE MANEJA LOS TOAST DE CONFIRMACION
    const handleEliminar = async () => {
        try {
            const resultado = await eliminarCliente(clienteAEliminar.id_cliente_pk);

            if (resultado.Consulta) {

                const data = await verClientes();
                setClientes(data);
                toast.current.show({ 
                    severity: 'success',
                    summary: 'Cliente eliminado',
                    detail: `${clienteAEliminar.nombre_cliente} fue eliminado`,
                    life: 3000
                });
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar el cliente',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error inesperado',
                life: 3000
            });
        }
        setConfirmDialogVisible(false);
    };

    //CONSTANTE QUE CONTROLAN LAS ACCIONES DE LOS BOTONES DE ACTUALIZAR Y BORRAR
    const actionBotones = (rowData) => (
        <div className="flex items-center space-x-2 w-full">
            <button
                className="text-blue-500 hover:text-blue-700 p-2 rounded"
                onClick={(e) => { e.stopPropagation(); 
                handleActualizarCliente(rowData, clientes.indexOf(rowData)); }}
            >
                <FontAwesomeIcon icon={faPenToSquare} size="lg" />
            </button>

            <button
                className="text-red-500 hover:text-red-700 p-2 rounded"
                onClick={(e) => {
                    e.stopPropagation();
                    setClienteAEliminar(rowData);
                    setConfirmDialogVisible(true);
                }}
            >
                <FontAwesomeIcon icon={faTrash} size="lg" />
            </button>
        </div>
    );

    return (
        <>
            <Toast ref={toast} position="top-center" />

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                {/* Barra de búsqueda + botón Nuevo */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-80">
                        <input
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar clientes..."
                            className="w-full px-4 py-2 border rounded-full"
                        />
                        {globalFilter && (
                            <button
                                onClick={() => setGlobalFilter('')}
                                className="absolute right-3 top-2 text-gray-500"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
                        onClick={handleAgregarCliente}>
                        <FontAwesomeIcon icon={faUserPlus} />
                        Nuevo Cliente
                    </button>
                </div>

                <DataTable
                    value={clientes}
                    loading={loading}
                    loadingIcon={() => (
                        <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            <span>Cargando clientes...</span>
                        </div>
                    )}
                    globalFilter={globalFilter}
                    globalFilterFields={['nombre_cliente', 'apellido_cliente', 'identidad_cliente', 'telefono_cliente']}
                    showGridlines
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 20, 25]}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    tableStyle={{ minWidth: '50rem' }}
                    className="mt-4"
                    size="small"
                    selectionMode="single"
                    onRowClick={(e) => setClienteSeleccionado(e.data)}
                    rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
                    emptyMessage="No se encontraron clientes"
                >
                    <Column field="id_cliente_pk" header="ID" body={(rowData) => clientes.indexOf(rowData) + 1} sortable className="text-sm"/>
                    <Column field="nombre_cliente" header="Nombre" sortable className="text-sm" />
                    <Column field="apellido_cliente" header="Apellido" sortable className="text-sm" />
                    <Column field="identidad_cliente" header="Identidad" className="text-sm" />
                    <Column field="telefono_cliente" header="Teléfono" className="text-sm" />
                    <Column header="Acciones" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm" />
                </DataTable>
            </div>

            {/*MODAL PARA AGREGAR CLIENTES*/}
            <FormularioCliente
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onClienteAgregado={async () => {
                    const data = await verClientes();
                    setClientes(data);
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
                    }}
                />
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
