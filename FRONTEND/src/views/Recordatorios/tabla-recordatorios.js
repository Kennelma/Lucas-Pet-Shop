import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { BotonEliminar } from './modal-eliminar';
import { BotonActualizar } from './modal-actualizar';

const TablaRecordatorios = ({ 
  recordatorios, 
  loading, 
  globalFilter, 
  tiposItems, 
  frecuencias, 
  estadosProgramacion, 
  onEdit, 
  onDelete 
}) => {

  // Plantillas para las columnas de la tabla
  const estadoTemplate = (rowData) => {
    const estado = estadosProgramacion.find(e => e.id_estado_pk === rowData.id_estado_programacion_fk)?.nombre_estado || 'Pendiente';
    const isActivo = rowData.id_estado_programacion_fk === 1;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActivo ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {estado}
      </span>
    );
  };

  const mensajeTemplate = (rowData) => (
    <div className="max-w-xs">
      <p className="text-sm text-gray-900 line-clamp-2">
        {rowData.mensaje_recordatorio}
      </p>
    </div>
  );

  const tipoTemplate = (rowData) => {
    if (tiposItems.length === 0) {
      return <span className="text-xs text-gray-400">Cargando...</span>;
    }
    
    const tipoItem = tiposItems.find(t => t.id_tipo_item_pk === rowData.id_tipo_item_fk);
    return <span className="text-sm text-gray-700">{tipoItem?.nombre_tipo_item || '—'}</span>;
  };

  const frecuenciaTemplate = (rowData) => {
    if (frecuencias.length === 0) {
      return <span className="text-xs text-gray-400">Cargando...</span>;
    }
    
    const frecuencia = frecuencias.find(f => f.id_frecuencia_record_pk === rowData.id_frecuencia_fk);
    return <span className="text-sm text-gray-700">{frecuencia?.frecuencia_recordatorio || '—'}</span>;
  };

  const fechaTemplate = (rowData) => (
    <span className="text-sm text-gray-700">
      {rowData.programada_para 
        ? new Date(rowData.programada_para).toLocaleDateString('es-ES') 
        : '—'
      }
    </span>
  );

  const accionesTemplate = (rowData) => (
    <div className="flex items-center space-x-2">
      <button 
        className="text-green-600 hover:text-green-800 p-2 rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation(); 
          onEdit(rowData);
        }}
        title="Editar"
      >
        <FontAwesomeIcon icon={faPenToSquare} size="lg" />
      </button>
      <BotonEliminar recordatorio={rowData} onReload={onDelete} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        <span>Cargando recordatorios...</span>
      </div>
    );
  }

  if (recordatorios.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faBell} className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay recordatorios</h3>
        <p className="text-gray-500 mb-6">Crea tu primer recordatorio para mantener a tus clientes informados.</p>
        <button 
          className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors inline-flex items-center gap-2"
          style={{ borderRadius: '12px' }}
          onClick={() => onEdit(null)}
        >
          <FontAwesomeIcon icon={faBell} />
          Nuevo Recordatorio
        </button>
      </div>
    );
  }

  return (
    <DataTable
      key={`table-${tiposItems.length}-${frecuencias.length}`}
      value={recordatorios}
      loading={loading}
      loadingIcon={() => (
        <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span>Cargando recordatorios...</span>
        </div>
      )}
      globalFilter={globalFilter}
      globalFilterFields={['mensaje_recordatorio']}
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
      emptyMessage="No se encontraron recordatorios"
    >
      <Column field="estado" header="Estado" body={estadoTemplate} />
      <Column field="mensaje_recordatorio" header="Mensaje" body={mensajeTemplate} />
      <Column field="tipo" header="Tipo Servicio" body={tipoTemplate} />
      <Column field="frecuencia" header="Frecuencia" body={frecuenciaTemplate} />
      <Column field="fecha" header="Programada Para" body={fechaTemplate} />
      <Column field="acciones" header="Acciones" body={accionesTemplate} />
    </DataTable>
  );
};

export default TablaRecordatorios;