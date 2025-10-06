
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { faPlus, faPenToSquare, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from 'react';

const ServiciosSeccion = ({ servicios, abrirModalServicio, eliminarServicio, actualizarEstadoServicio }) => {
  
  const [globalFilter, setGlobalFilter] = useState('');

  const handleEliminar = (servicio) => {
    eliminarServicio(servicio);
  };

  // Botones de acciones para cada fila
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

  // Formatear precio
  const precioTemplate = (rowData) => {
    return `L. ${parseFloat(rowData.precio_servicio || 0).toFixed(2)}`;
  };

  // Formatear duración
  const duracionTemplate = (rowData) => {
    return `${rowData.duracion_estimada} min`;
  };

  // Formatear estado con toggle
  const estadoTemplate = (rowData) => {
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
            checked={rowData.activo}
            onChange={() => actualizarEstadoServicio({ ...rowData, activo: !rowData.activo })}
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
            backgroundColor: rowData.activo ? '#10b981' : '#ccc',
            transition: '0.4s',
            borderRadius: '20px'
          }}>
            <span style={{
              position: 'absolute',
              height: '16px',
              width: '16px',
              left: rowData.activo ? '26px' : '2px',
              bottom: '2px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></span>
          </span>
        </label>
        <span style={{ marginLeft: '8px', fontWeight: 500, color: rowData.activo ? '#10b981' : '#6b7280' }}>
          {rowData.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-xl p-6 max-w-7xl mx-auto font-poppins mt-6">
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex-grow text-center text-lg font-medium text-gray-700 font-poppins">
        
          </div>
          <button 
            className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
            onClick={() => abrirModalServicio(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar servicios..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
          <DataTable
            value={servicios}
            loading={false}
            loadingIcon={() => (
              <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Cargando datos...</span>
              </div>
            )}
            globalFilter={globalFilter}
            showGridlines
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 25]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            tableStyle={{ minWidth: '80rem', width: '100%' }}
            className="font-poppins datatable-gridlines"
            size="normal"
            rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}        
          >
          <Column 
            field="id_servicio_peluqueria_pk" 
            header="ID" 
            sortable 
            className="text-sm py-3" 
            style={{ minWidth: '80px', width: '80px' }}
          ></Column>
          <Column 
            field="nombre_servicio_peluqueria" 
            header="Servicio" 
            sortable 
            className="text-sm py-3 font-medium" 
            style={{ minWidth: '200px', width: '200px' }}
          ></Column>
          <Column 
            field="descripcion_servicio" 
            header="Descripción" 
            className="text-sm py-3" 
            style={{ minWidth: '350px', width: '350px' }}
          ></Column>
          <Column 
            header="Precio" 
            body={precioTemplate} 
            sortable 
            className="text-sm py-3 font-semibold text-green-600" 
            style={{ minWidth: '120px', width: '120px', textAlign: 'right' }}
          ></Column>
          <Column 
            header="Duración" 
            body={duracionTemplate} 
            className="text-sm py-3" 
            style={{ minWidth: '100px', width: '100px', textAlign: 'center' }}
          ></Column>
          <Column 
            field="requisitos" 
            header="Requisitos" 
            className="text-sm py-3" 
            style={{ minWidth: '200px', width: '200px' }}
          ></Column>
          <Column 
            header="Estado" 
            body={estadoTemplate} 
            className="text-sm py-3" 
            style={{ minWidth: '140px', width: '140px', textAlign: 'center' }}
          ></Column>
          <Column 
            header="Acciones" 
            body={actionBotones} 
            className="py-3 text-sm" 
            style={{ minWidth: '120px', width: '120px', textAlign: 'center' }}
          ></Column>
          </DataTable>
        </div>          
      </div>  
    </>
  );
};

export default ServiciosSeccion;