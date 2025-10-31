import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPenToSquare, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { BotonEliminar } from './modal-eliminar';

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

  const estadoTemplate = (rowData) => {
    const getEstadoInfo = (idEstado) => {
      const estados = {
        1: { nombre: 'Pendiente', clase: 'bg-yellow-100 text-yellow-800' },
        2: { nombre: 'Enviando', clase: 'bg-blue-100 text-blue-800' },
        3: { nombre: 'Enviado', clase: 'bg-green-100 text-green-800' },
        4: { nombre: 'Fallido', clase: 'bg-red-100 text-red-800' },
        5: { nombre: 'Parcial', clase: 'bg-orange-100 text-orange-800' }
      };
      return estados[idEstado] || estados[1];
    };

    const estadoInfo = getEstadoInfo(rowData.id_estado_programacion_fk);
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.clase}`}>
        {estadoInfo.nombre}
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
    const tipoItem = tiposItems.find(
      t => t.id_tipo_item_pk === rowData.id_tipo_item_fk
    );
    return (
      <span className="text-sm text-gray-700">
        {tipoItem?.nombre_tipo_item || '—'}
      </span>
    );
  };

  const frecuenciaTemplate = (rowData) => {
    const frecuencia = frecuencias.find(
      f => f.id_frecuencia_record_pk === rowData.id_frecuencia_fk
    );
    return (
      <span className="text-sm text-gray-700">
        {frecuencia?.frecuencia_recordatorio || '—'}
      </span>
    );
  };

  // 🔹 NUEVA: Template para próximo envío
  const proximoEnvioTemplate = (rowData) => {
    if (!rowData.proximo_envio) {
      return <span className="text-sm text-gray-400">—</span>;
    }
    
    const fechaProximo = new Date(rowData.proximo_envio);
    const hoy = new Date();
    const esHoy = fechaProximo.toDateString() === hoy.toDateString();
    const esPasado = fechaProximo < hoy;
    
    return (
      <div className="flex items-center gap-2">
        <FontAwesomeIcon 
          icon={faCalendarAlt} 
          className={`text-sm ${
            esHoy ? 'text-orange-500' : 
            esPasado ? 'text-red-500' : 'text-green-500'
          }`} 
        />
        <span className={`text-sm ${
          esHoy ? 'text-orange-600 font-semibold' : 
          esPasado ? 'text-red-600' : 'text-gray-700'
        }`}>
          {fechaProximo.toLocaleDateString('es-ES')}
          {esHoy && <span className="text-xs ml-1">(Hoy)</span>}
          {esPasado && <span className="text-xs ml-1">(Vencido)</span>}
        </span>
      </div>
    );
  };

  const fechaTemplate = (rowData) => (
    <span className="text-sm text-gray-700">
      {rowData.ultimo_envio
        ? new Date(rowData.ultimo_envio).toLocaleDateString('es-ES')
        : '—'}
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
        <FontAwesomeIcon
          icon={faBell}
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
        />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No hay recordatorios
        </h3>
        <p className="text-gray-500 mb-6">
          Crea tu primer recordatorio para mantener a tus clientes informados.
        </p>
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
      globalFilter={globalFilter}
      globalFilterFields={['mensaje_recordatorio']}
      showGridlines
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 20, 25]}
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      tableStyle={{ minWidth: '60rem' }} // 🔹 Aumentado para nueva columna
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
      {/* 🔹 NUEVA COLUMNA: Próximo Envío */}
      <Column field="proximo_envio" header="Próximo Envío" body={proximoEnvioTemplate} />
      <Column field="ultimo_envio" header="Último Envío" body={fechaTemplate} />
      <Column field="acciones" header="Acciones" body={accionesTemplate} />
    </DataTable>
  );
};

export default TablaRecordatorios;