
import { 
  ScissorsIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon, 
  ClockIcon
} from '@heroicons/react/24/outline';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faPlus, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from 'react';

const ServiciosSeccion = ({ servicios, abrirModalServicio, eliminarServicio, actualizarEstadoServicio }) => {
  
  const [globalFilter, setGlobalFilter] = useState('');

  const handleEliminar = (servicio) => {
    eliminarServicio(servicio);
  };

  // Switch para el estado activo
  const estadoTemplate = (rowData) => {
    return (
      <div className="flex items-center justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rowData.activo}
            onChange={() => actualizarEstadoServicio(rowData)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
        <span className={`ml-2 text-xs font-medium ${rowData.activo ? 'text-green-600' : 'text-gray-500'}`}>
          {rowData.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    );
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



  return (
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
      {/* Barra de búsqueda + botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar servicios..."
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

        <button
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
          onClick={() => abrirModalServicio(null)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nuevo Servicio
        </button>
      </div>

      {servicios.length === 0 ? (
        <div className="text-center py-12">
          <ScissorsIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2 uppercase">No hay servicios</h3>
          <p className="text-gray-500 mb-6">Crea tu primer servicio de peluquería para mascotas.</p>
          <button 
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition-colors inline-flex items-center gap-2"
            onClick={() => abrirModalServicio(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nuevo Servicio
          </button>
        </div>
      ) : (
        <>
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
            globalFilterFields={['id_servicio_peluqueria_pk', 'nombre_servicio_peluqueria', 'descripcion_servicio', 'precio_servicio', 'duracion_estimada', 'requisitos']}
            showGridlines
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 20, 25]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            tableStyle={{ minWidth: '50rem' }}
            className="mt-4"
            size="small"
            selectionMode="single"
            rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}        
          >
            <Column 
              field="id_servicio_peluqueria_pk" 
              header="ID" 
              body={(rowData) => servicios.length - servicios.indexOf(rowData)}
              sortable 
              className="text-sm"
            />
            <Column field="nombre_servicio_peluqueria" header="SERVICIO" sortable className="text-sm"></Column>
            <Column field="descripcion_servicio" header="DESCRIPCIÓN" className="text-sm"></Column>
            <Column 
              field="precio_servicio"
              header="PRECIO" 
              body={(rowData) => `L. ${parseFloat(rowData.precio_servicio || 0).toFixed(2)}`}
              sortable 
              sortField="precio_servicio"
              dataType="numeric"
              className="text-sm"
            ></Column>
            <Column 
              field="duracion_estimada"
              header="DURACIÓN" 
              body={(rowData) => `${rowData.duracion_estimada} Min`}
              sortable
              sortField="duracion_estimada"
              dataType="numeric"
              className="text-sm"
            ></Column>
            <Column field="requisitos" header="REQUISITOS" className="text-sm"></Column>
            <Column 
              field="activo"
              header="ESTADO" 
              body={estadoTemplate}
              sortable
              sortField="activo"
              className="text-sm"
            ></Column>
            <Column header="ACCIONES" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm"></Column>
          </DataTable>
        </>
      )}
    </div>
  );
};

export default ServiciosSeccion;