
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';

const PromocionesSeccion = ({ promociones, abrirModalPromocion, eliminarPromocion, actualizarEstadoPromocion }) => {
  
  const [globalFilter, setGlobalFilter] = useState('');

  const handleEliminar = (promocion) => {
    eliminarPromocion(promocion);
  };

  // Switch para el estado activo de promociones
  const estadoTemplate = (rowData) => {
    return (
      <div className="flex items-center justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rowData.activo}
            onChange={() => actualizarEstadoPromocion(rowData)}
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

  // Botones de acciones igual que tabla clientes
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Gestión de Promociones</h2>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          onClick={() => abrirModalPromocion(null)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Promoción
        </button>
      </div>

      {promociones.length === 0 ? (
        <div className="text-center py-12">
          <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay promociones</h3>
          <p className="text-gray-500 mb-6">Crea tu primera promoción para atraer clientes.</p>
          <button 
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
            onClick={() => abrirModalPromocion(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva Promoción
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar promociones..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <DataTable
          value={promociones}
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
          tableStyle={{ minWidth: '50rem' }}
          className="mt-4"
          size="small"
          selectionMode="single"
          rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}        
        >
        
          <Column field="id_promocion_pk" header="ID" body={(rowData) => promociones.indexOf(rowData) + 1} sortable className="text-sm"/>
          <Column field="nombre_promocion" header="Nombre" sortable className="text-sm"></Column>
          <Column field="descripcion_promocion" header="Descripción" className="text-sm"></Column>
          <Column 
            field="precio_promocion"
            header="Precio" 
            body={(rowData) => `L. ${parseFloat(rowData.precio_promocion || 0).toFixed(2)}`}
            sortable 
            sortField="precio_promocion"
            dataType="numeric"
            sortFunction={(e) => {
              const value1 = parseFloat(e.data1.precio_promocion || 0);
              const value2 = parseFloat(e.data2.precio_promocion || 0);
              return e.order * (value1 - value2);
            }}
            className="text-sm"
          ></Column>
          <Column 
            header="Duración" 
            body={(rowData) => {
              let duracion = rowData.dias_promocion;
              if (Array.isArray(duracion)) {
                return duracion.join(', ');
              }
              if (typeof duracion === 'string') {
                duracion = duracion.replace(/[\[\]"]/g, '');
              }
              return duracion;
            }}
            className="text-sm"
          ></Column>
          <Column 
            field="activo"
            header="Estado" 
            body={estadoTemplate}
            sortable
            sortField="activo"
            className="text-sm"
          ></Column>
          <Column header="Acciones" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm"></Column>
        </DataTable>
        </>
      )}
    </div>
  );
};

export default PromocionesSeccion;