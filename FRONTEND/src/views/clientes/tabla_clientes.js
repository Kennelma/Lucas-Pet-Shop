
import React, { useState, useEffect } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { faUserPlus, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { verRegistro} from "../../services/apiService.js";

import FormularioCliente from "./modal_agregar.js";

const TablaClientes = ({ setClienteSeleccionado }) => {

    //ESTADOS QUE ME CARGAN LOS DATOS Y EL OTRO PARA GUARDAR TODOS LOS CLIENTES QUE VIENEN DE LA API
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await verRegistro("tbl_clientes");
                setClientes(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAgregarCliente = () => {
      setOpenModal(true);
    };

    //BOTONES PARA LAS ACCIONES
    const actionBotones = (rowData) => {
    return (
            <div className="flex  items-center space-x-2 w-full">
                <button 
                    className="text-blue-500 hover:text-blue-700 p-2 rounded"
                    onClick={(e) => {e.stopPropagation(); }}
                >
                    <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                </button>
                <button 
                    className="text-red-500 hover:text-red-700 p-2 rounded"
                    onClick={(e) => {
                        e.stopPropagation(); 
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} size="lg" />
                </button>
            </div>
        );
    };

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
                    loadingIcon={() => (
                        <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                            <span>Cargando datos...</span>
                        </div>
                    )}
            showGridlines
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 25]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            tableStyle={{ minWidth: '50rem' }}
            className=" font-poppins datatable-gridlines"
            size="small"
            selectionMode="single"
            onRowClick={(e) => setClienteSeleccionado(e.data)}
            rowClassName={() => 'hover:bg-gray-100 cursor-pointer'}        
          >
            <Column field="id_cliente_pk" header="ID" sortable className="text-sm"></Column>
            <Column field="nombre_cliente" header="Nombre" sortable className="text-sm"></Column>
            <Column field="apellido_cliente" header="Apellido" sortable className="text-sm"></Column>
            <Column field="identidad_cliente" header="Identidad" className="text-sm"></Column>
            <Column field="telefono_cliente" header="Teléfono" className="text-sm"></Column>
            <Column header="Acciones" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm"></Column>
        </DataTable>          
      </div>  

      {openModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <FormularioCliente
          onClose={() => setOpenModal(false)}
          onClienteAgregado={async () => {
            const data = await verRegistro("tbl_clientes");
            setClientes(data);
          }}
        />
      </div>
    )}

    </>  
    );
};

export default TablaClientes;