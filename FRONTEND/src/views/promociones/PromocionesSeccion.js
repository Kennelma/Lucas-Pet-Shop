
import * as outline from '@heroicons/react/24/outline';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
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
    <>
      {/* Título */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-3" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            GESTIÓN DE PROMOCIONES
          </h2>
        </div>
        <p className="text-center text-gray-600 italic">Administra ofertas, descuentos y promociones especiales</p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
      {/* Barra de búsqueda + botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar promociones..."
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
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
          style={{ borderRadius: '12px' }}
          onClick={() => abrirModalPromocion(null)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Promoción
        </button>
      </div>

      {promociones.length === 0 ? (
        <div className="text-center py-12">
          <outline.SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay promociones</h3>
          <p className="text-gray-500 mb-6">Crea tu primera promoción para atraer clientes.</p>
          <button 
            className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors inline-flex items-center gap-2"
            style={{ borderRadius: '12px' }}
            onClick={() => abrirModalPromocion(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva Promoción
          </button>
        </div>
      ) : (
        <>
          
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
          globalFilterFields={['id_promocion_pk', 'nombre_promocion', 'descripcion_promocion', 'precio_promocion', 'dias_promocion']}
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
        
          <Column field="id_promocion_pk" header="ID" body={(rowData) => promociones.length - promociones.indexOf(rowData)}  sortable className="text-sm"/>
          <Column field="nombre_promocion" header="NOMBRE" sortable className="text-sm"></Column>
          <Column field="descripcion_promocion" header="DESCRIPCIÓN" className="text-sm"></Column>
          <Column 
            field="precio_promocion"
            header="PRECIO" 
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
            header="DÍAS DE PROMOCIÓN" 
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
    </>
  );
};

export default PromocionesSeccion;