import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { verCatalogoCAI } from '../../AXIOS.SERVICES/sar-axios';
import Swal from 'sweetalert2';


const SAR = () => {
    const [registrosSAR, setRegistrosSAR] = useState([]);
    const [loading, setLoading] = useState(true);

    //FUNCION QUE EJECUTA AL INICIAR EL COMPONENTE
    useEffect(() => {
        cargarCatalogo();
    }, []);

    //FUNCION PARA CARGAR EL CATALOGO DE CAI
    const cargarCatalogo = async () => {
        try {
            setLoading(true);
            const response = await verCatalogoCAI();
            setRegistrosSAR(response.Catalogo || []);
        } catch (error) {
            console.error('Error al cargar catálogo:', error);
            Swal.fire('Error', 'No se pudo cargar el catálogo de CAI', 'error');
        } finally {
            setLoading(false);
        }
    };

    //ESTADO DEL CAI EN LA TABLA
    const estadoTemplate = (rowData) => {
        return (
            <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                rowData.activo ? 'bg-green-500' : 'bg-gray-400'
            }`}>
                {rowData.activo ? 'ACTIVO' : 'INACTIVO'}
            </span>
        );
    };

    return (
        <div className="p-6" style={{ fontFamily: 'Poppins', backgroundColor: "#F7F8F2" }}>

            <div className="p-6 pb-12">

                {/* Título */}
                <div className="rounded-xl p-6 mb-3"
                    style={{
                        backgroundColor: '#B5DD7E',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left center',
                        boxShadow: '0 0 8px #A5CC8B40, 0 0 0 1px #A5CC8B33'
                    }}
                >
                    <div className="flex justify-center items-center">
                        <h2 className="text-2xl font-black text-center uppercase text-black">
                            GESTIÓN DE LOS CAI
                        </h2>
                    </div>
                    <p className="text-center text-black italic mt-2">
                        Administra los CAI disponibles en el sistema para su uso en facturación
                    </p>
                </div>

                {/* Tabla de SAR */}
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <div className="flex justify-end mb-4">
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
                            onClick={() => {

                                toast.info('Función de agregar CAI pendiente de implementar');
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Agregar CAI
                        </button>
                    </div>
                    <DataTable
                        value={registrosSAR}
                        loading={loading}
                        paginator
                        rows={10}
                        className="p-datatable-striped"
                        emptyMessage="No hay registros de CAI"
                    >
                        <Column field="codigo_cai" header="CAI" sortable></Column>
                        <Column field="prefijo" header="PREFIJO" sortable></Column>
                        <Column field="total_facturas" header="TOTAL FACTURAS" sortable></Column>
                        <Column field="facturas_usadas" header="FACTURAS USADAS" sortable></Column>
                        <Column field="facturas_disponibles" header="FACTURAS DISPONIBLES" sortable></Column>
                        <Column body={estadoTemplate} header="ESTADO" sortable></Column>
                    </DataTable>
                </div>

            </div>
        </div>
    );
};

export default SAR;