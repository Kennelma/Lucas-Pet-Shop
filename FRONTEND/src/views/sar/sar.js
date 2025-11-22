import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { verCatalogoCAI } from '../../AXIOS.SERVICES/sar-axios';
import Swal from 'sweetalert2';
import ModalNuevoCAI from './modal_nuevo_cai';

const SAR = () => {
    // Obtener el usuario actual y su rol
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    const rolActual = usuarioActual?.rol?.toLowerCase();
const [registrosSAR, setRegistrosSAR] = useState([]);
const [loading, setLoading] = useState(true);
const [modalCAIOpen, setModalCAIOpen] = useState(false);
const [caiSeleccionado, setCaiSeleccionado] = useState(null);

// Ejecuta al iniciar el componente
useEffect(() => {
    cargarCatalogo();
}, []);

// Función para cargar el catálogo de CAI
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

const handleNuevoCAI = () => {
    // Verificar si ya existe un CAI activo
    const existeActivo = registrosSAR.some(cai => cai.activo);
    if (existeActivo) {
        Swal.fire({
            icon: 'warning',
            title: 'YA EXISTE UN CAI ACTIVO',
            text: 'El registro de CAI solo permite un activo a la vez.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    setCaiSeleccionado(null);
    setModalCAIOpen(true);
};

const handleCerrarModal = () => {
    setModalCAIOpen(false);
    setCaiSeleccionado(null);
    cargarCatalogo(); // Recargar la tabla después de guardar
};

// Template para el estado
const estadoTemplate = (rowData) => {
    return (
        <span className={`px-2 py-1 text-xs font-medium ${
            rowData.activo
                ? 'bg-green-100 text-green-700 border rounded border-green-300'
                : 'bg-red-100 text-red-600 border rounded border-red-300'
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
                    backgroundImage: 'url("/H15.png")',
                    backgroundColor: '#80d6afff',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left center',
                    boxShadow: '0 0 8px #80d6afff, 0 0 0 1px #80d6afff'
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
            <div className="bg-white p-4 rounded-xl" style={{ boxShadow: '0 0 8px #9ee2c4ff, 0 0 0 1px #a6dac3ff' }}>
                <style>
                    {`
                        .p-datatable th:first-child {
                            text-align: center !important;
                        }
                        .p-datatable th:first-child .p-column-header-content {
                            justify-content: center !important;
                        }
                        /* Mensaje centrado sin sobreponerse */
                        .p-datatable-emptymessage {
                            display: flex !important;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            height: 60px;
                            padding: 1rem;
                            box-sizing: border-box;
                            position: relative;
                            left: auto;
                            top: auto;
                            transform: none;
                        }
                    `}
                </style>

                {rolActual === 'administrador' && (
                  <div className="flex justify-end mb-4">
                      <button
                          className="bg-[#80d6afff] hover:bg-[#6bb39d] text-black px-4 py-2 rounded flex items-center"
                          onClick={handleNuevoCAI}
                      >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          AGREGAR CAI
                      </button>
                  </div>
                )}

                <DataTable
                    value={registrosSAR}
                    loading={loading}
                    paginator
                    rows={10}
                    className="p-datatable-striped"
                    emptyMessage="No hay registros de CAI"
                >
                    <Column
                        field="codigo_cai"
                        header="CAI"
                        sortable
                        style={{ width: '190px' }}
                        headerStyle={{ textAlign: 'center' }}
                        bodyStyle={{
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.4',
                            padding: '0.75rem 0.5rem',
                            fontSize: '0.85rem'
                        }}
                    />
                    <Column
                        field="prefijo"
                        header="PREFIJO"
                        sortable
                        style={{ width: '100px', textAlign: 'center' }}
                        headerStyle={{ textAlign: 'center' }}
                    />
                    <Column
                        field="total_facturas"
                        header="TOTAL"
                        sortable
                        style={{ width: '80px', textAlign: 'center' }}
                        headerStyle={{ textAlign: 'center' }}
                    />
                    <Column
                        field="facturas_usadas"
                        header="USADAS"
                        sortable
                        style={{ width: '80px', textAlign: 'center' }}
                        headerStyle={{ textAlign: 'center' }}
                    />
                    <Column
                        field="facturas_disponibles"
                        header="RESTANTES"
                        sortable
                        style={{ width: '100px', textAlign: 'center' }}
                        headerStyle={{ textAlign: 'center' }}
                    />
                    <Column
                        field="fecha_limite"
                        header="FECHA LÍMITE"
                        sortable
                        style={{ width: '125px', textAlign: 'center' }}
                        headerStyle={{ textAlign: 'center' }}
                        body={(rowData) => {
                            if (!rowData.fecha_limite) return '-';
                            const fecha = new Date(rowData.fecha_limite);
                            const day = String(fecha.getDate()).padStart(2, '0');
                            const month = String(fecha.getMonth() + 1).padStart(2, '0');
                            const year = fecha.getFullYear();
                            return `${day}-${month}-${year}`;
                        }}
                    />
                    <Column
                        body={estadoTemplate}
                        header="ESTADO"
                        sortable
                        style={{ width: '120px', textAlign: 'center' }}
                        headerStyle={{ textAlign: 'center' }}
                    />
                </DataTable>
            </div>

            {/* Modal para nuevo/editar CAI */}
                        {rolActual === 'administrador' && (
                            <ModalNuevoCAI
                                    isOpen={modalCAIOpen}
                                    onClose={handleCerrarModal}
                                    caiData={caiSeleccionado}
                            />
                        )}
        </div>
    </div>
);

};

export default SAR;