import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faPlus, faPenToSquare, faTrash, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const newLocal = (rowData) => {
  let duracion = rowData.dias_promocion;
  if (Array.isArray(duracion)) {
    return duracion.join(', ');
  }
  if (typeof duracion === 'string') {
    duracion = duracion.replace(/[\[\]"]/g, '');
  }
  return duracion;
};
const PromocionesSeccion = ({ promociones, abrirModalPromocion, eliminarPromocion }) => {
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleEliminar = (promocion) => {
    eliminarPromocion(promocion);
  };

  // Función para renderizar los botones de acciones
  const actionBotones = (rowData) => {
    return (
      <div className="flex items-center space-x-2 w-full">
        <button 
          className="text-blue-500 hover:text-blue-700 p-2 rounded"
          onClick={(e) => {
            e.stopPropagation(); 
            abrirModalPromocion(rowData);
          }}
        >
          <FontAwesomeIcon icon={faPenToSquare} size="lg" />
        </button>
        <button 
          className="text-red-500 hover:text-red-700 p-2 rounded"
          onClick={(e) => {
            e.stopPropagation(); 
            handleEliminar(rowData);
          }}
        >
          <FontAwesomeIcon icon={faTrash} size="lg" />
        </button>
      </div>
    );
  };

  // Función para renderizar el precio
  const precioTemplate = (rowData) => {
    return (
      <span className="font-bold text-purple-600 text-lg font-poppins">
        L. {parseFloat(rowData.precio_promocion || 0).toFixed(2)}
      </span>
    );
  };

  // Función para renderizar la duración
  const duracionTemplate = (rowData) => {
    let duracion = rowData.dias_promocion;
    if (Array.isArray(duracion)) {
      duracion = duracion.join(', ');
    }
    if (typeof duracion === 'string') {
      duracion = duracion.replace(/[\[\]"]/g, '');
    }
    return (
      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium font-poppins">
        {duracion}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-7xl mx-auto shadow-sm font-poppins">
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
           
          </div>
          <button 
            className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
            onClick={() => abrirModalPromocion(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar promociones..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full px-6 py-4 pl-12 pr-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 font-poppins"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <DataTable
          value={promociones}
          loading={loading}
          loadingIcon={() => (
            <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            </div>
          )}
          globalFilter={globalFilter}
          showGridlines
          paginator
          rows={10}
          rowsPerPageOptions={[10, 20, 25]}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          tableStyle={{ minWidth: '50rem' }}
          className="font-poppins datatable-gridlines"
          size="normal"
          rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
          emptyMessage={
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faStar} className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No hay promociones</h3>
              <p className="text-gray-500 mb-4 font-poppins">Crea tu primera promoción para atraer clientes.</p>
              <button 
                onClick={() => abrirModalPromocion(null)} 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-poppins"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Nueva Promoción
              </button>
            </div>
          }
        >
          <Column 
            field="id_promocion_pk" 
            header="ID" 
            sortable 
            className="text-base font-poppins px-4 py-3"
            style={{ width: '80px' }}
          />
          <Column 
            field="nombre_promocion" 
            header="Nombre" 
            sortable 
            className="text-base font-poppins px-4 py-3 font-semibold"
            style={{ minWidth: '200px' }}
          />
          <Column 
            field="descripcion_promocion" 
            header="Descripción" 
            className="text-base font-poppins px-4 py-3"
            style={{ minWidth: '300px' }}
          />
          <Column 
            field="precio_promocion" 
            header="Precio" 
            body={precioTemplate}
            sortable 
            className="text-base font-poppins px-4 py-3"
            style={{ width: '130px' }}
          />
          <Column 
            field="dias_promocion" 
            header="Duración" 
            body={duracionTemplate}
            className="text-base font-poppins px-4 py-3"
            style={{ minWidth: '180px' }}
          />
          <Column 
            header="Acciones" 
            body={actionBotones} 
            className="text-base font-poppins px-4 py-3"
            style={{ width: '160px' }}
          />
        </DataTable>          
      </div>  
    </>  
  );
};

export default PromocionesSeccion;