import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faUserPlus, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { verClientes, eliminarCliente } from "../../AXIOS.SERVICES/clients-axios.js";
import FormularioCliente from "./modal_agregar.js";

const TablaClientes = ({ setClienteSeleccionado }) => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);

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

    //SE EVITA EL SCROLL MIENTRAS HAY MODAL ABIERTO
    useEffect(() => {
        if (openModal) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [openModal]);

    const handleAgregarCliente = () => {
        setOpenModal(true);
    };

    const actionBotones = (rowData) => (
        <div className="flex items-center space-x-2 w-full">
            <button className="text-blue-500 hover:text-blue-700 p-2 rounded" onClick={(e) => e.stopPropagation()}>
                <FontAwesomeIcon icon={faPenToSquare} size="lg" />
            </button>
            <button 
                className="text-red-500 hover:text-red-700 p-2 rounded" 
                onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
                        const resultado = await eliminarCliente(rowData.id_cliente_pk);
                        if (resultado.Consulta) {
                            const data = await verClientes();
                            setClientes(data);
                        }
                    }
                }}
            >
                <FontAwesomeIcon icon={faTrash} size="lg" />
            </button>
        </div>
    );

    return (
        <>
            <div className="bg-white border border-gray-300 rounded-xl p-6 max-w-5xl mx-auto font-poppins">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-grow text-center text-lg font-medium text-gray-700 font-poppins">
                        REGISTRO DE CLIENTES
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
                        onClick={handleAgregarCliente}>
                        <FontAwesomeIcon icon={faUserPlus} />
                    </button>
                </div>

                <DataTable
                    value={clientes}
                    loading={loading}
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    tableStyle={{ minWidth: '50rem' }}
                    className="font-poppins datatable-gridlines"
                    size="small"
                    selectionMode="single"
                    onRowClick={(e) => setClienteSeleccionado(e.data)}
                    rowClassName={() => 'hover:bg-gray-100 cursor-pointer'}
                >
                    <Column field="id_cliente_pk" header="ID" body={(rowData) => clientes.indexOf(rowData) + 1} sortable className="text-sm"/>
                    <Column field="nombre_cliente" header="Nombre" sortable className="text-sm" />
                    <Column field="apellido_cliente" header="Apellido" sortable className="text-sm" />
                    <Column field="identidad_cliente" header="Identidad" className="text-sm" />
                    <Column field="telefono_cliente" header="Teléfono" className="text-sm" />
                    <Column header="Acciones" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm" />
                </DataTable>
            </div>

            {/*MODAL DE INGRESAR NUEVO CLIENTE*/}
            <FormularioCliente
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onClienteAgregado={async () => {
                    const data = await verClientes();
                    setClientes(data);
                }}
            />
        </>
    );
};

export default TablaClientes;
