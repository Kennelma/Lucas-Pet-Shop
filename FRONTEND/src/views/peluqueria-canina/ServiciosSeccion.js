import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faPlus, faPenToSquare, faTrash, faScissors } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ServiciosSeccion = ({ servicios, abrirModalServicio, eliminarServicio, actualizarEstadoServicio }) => {
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleEliminar = (servicio) => {
    eliminarServicio(servicio);
  };

  // Función para renderizar los botones de acciones
  const actionBotones = (rowData) => {
    return (
      <div className="flex items-center space-x-2 w-full">
        <button 
          className="text-blue-500 hover:text-blue-700 p-2 rounded"
          onClick={(e) => {
            e.stopPropagation(); 
            abrirModalServicio(rowData);
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

  // Función para renderizar el estado activo/inactivo
  const estadoTemplate = (rowData) => {
    const handleToggle = () => {
      const servicioActualizado = {
        ...rowData,
        activo: rowData.activo === 1 ? 0 : 1
      };
      actualizarEstadoServicio(servicioActualizado);
    };

    return (
      <div className="flex items-center">
        <label style={{
          position: 'relative',
          display: 'inline-block',
          width: '44px',
          height: '20px',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={rowData.activo === 1}
            onChange={handleToggle}
            style={{
              opacity: 0,
              width: 0,
              height: 0
            }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: rowData.activo === 1 ? '#10b981' : '#ccc',
            transition: '0.4s',
            borderRadius: '20px'
          }}>
            <span style={{
              position: 'absolute',
              height: '16px',
              width: '16px',
              left: rowData.activo === 1 ? '26px' : '2px',
              bottom: '2px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></span>
          </span>
        </label>
        <span style={{ marginLeft: '8px', fontWeight: 500, color: rowData.activo === 1 ? '#10b981' : '#6b7280' }}>
          {rowData.activo === 1 ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    );
  };

  // Función para renderizar el precio
  const precioTemplate = (rowData) => {
    return (
      <span className="font-bold text-green-600 text-lg font-poppins">
        L. {parseFloat(rowData.precio_servicio || 0).toFixed(2)}
      </span>
    );
  };

  // Función para renderizar la duración
  const duracionTemplate = (rowData) => {
    return (
      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium font-poppins">
        {rowData.duracion_estimada} min
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
            onClick={() => abrirModalServicio(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full px-6 py-4 pl-12 pr-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 font-poppins"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <DataTable
          value={servicios}
          loading={loading}
          loadingIcon={() => (
            <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              <span>Cargando servicios...</span>
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
              <FontAwesomeIcon icon={faScissors} className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No hay servicios</h3>
              <p className="text-gray-500 mb-4">Crea tu primer servicio de peluquería canina.</p>
              <button 
                onClick={() => abrirModalServicio(null)} 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Nuevo Servicio
              </button>
            </div>
          }
        >
          <Column 
            field="id_servicio_peluqueria_pk" 
            header="ID" 
            sortable 
            className="text-base font-poppins px-4 py-3"
            style={{ width: '80px' }}
          />
          <Column 
            field="nombre_servicio_peluqueria" 
            header="Servicio" 
            sortable 
            className="text-base font-poppins px-4 py-3 font-semibold"
            style={{ minWidth: '200px' }}
          />
          <Column 
            field="descripcion_servicio" 
            header="Descripción" 
            className="text-base font-poppins px-4 py-3"
            style={{ minWidth: '350px', maxWidth: '400px', wordWrap: 'break-word', whiteSpace: 'normal' }}
          />
          <Column 
            field="precio_servicio" 
            header="Precio" 
            body={precioTemplate}
            sortable 
            className="text-base font-poppins px-4 py-3"
            style={{ width: '120px' }}
          />
          <Column 
            field="duracion_estimada" 
            header="Duración" 
            body={duracionTemplate}
            sortable 
            className="text-base font-poppins px-4 py-3"
            style={{ width: '120px' }}
          />
          <Column 
            field="requisitos" 
            header="Requisitos" 
            className="text-base font-poppins px-4 py-3"
            style={{ minWidth: '180px' }}
          />
          <Column 
            field="activo" 
            header="Estado" 
            body={estadoTemplate}
            className="text-base font-poppins px-4 py-3"
            style={{ width: '140px' }}
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

export default ServiciosSeccion;