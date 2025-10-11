
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

const PromocionesSeccion = ({ promociones, abrirModalPromocion, eliminarPromocion }) => {
  
  const [globalFilter, setGlobalFilter] = useState('');

  const handleEliminar = (promocion) => {
    eliminarPromocion(promocion);
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
    <div className="section">
      <div className="section-header">
        <button 
          className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
          onClick={() => abrirModalPromocion(null)}
          style={{ marginLeft: 'auto' }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {promociones.length === 0 ? (
        <div className="empty-state">
          <SparklesIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
          <h3 className="empty-state-title">No hay promociones</h3>
          <p className="empty-state-description">Crea tu primera promoción para atraer clientes.</p>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => abrirModalPromocion(null)}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="font-poppins datatable-gridlines"
          size="small"
          selectionMode="single"
          rowClassName={() => 'hover:bg-gray-100 cursor-pointer'}        
        >
          <Column field="id_promocion_pk" header="ID" sortable className="text-sm"></Column>
          <Column field="nombre_promocion" header="Nombre" sortable className="text-sm"></Column>
          <Column field="descripcion_promocion" header="Descripción" className="text-sm"></Column>
          <Column 
            header="Precio" 
            body={(rowData) => `L. ${parseFloat(rowData.precio_promocion || 0).toFixed(2)}`}
            sortable 
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
          <Column header="Acciones" body={actionBotones} className="py-2 pr-9 pl-1 border-b text-sm"></Column>
        </DataTable>
        </>
      )}
    </div>
  );
};

export default PromocionesSeccion;