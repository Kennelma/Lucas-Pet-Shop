import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPenToSquare, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';


// Función para eliminar recordatorio
const eliminarRecordatorio = async (recordatorio, cargarDatos) => {
  try {
    const result = await Swal.fire({
      title: '¿Eliminar recordatorio?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Mensaje:</span> ${recordatorio.mensaje_recordatorio}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px'
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El recordatorio ha sido eliminado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      await cargarDatos();
    }
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar el recordatorio'
    });
  }
};

const ActionMenu = ({ rowData, onEditar, onEliminar, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowAbove, setShouldShowAbove] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const checkPosition = () => {
    const showAbove = rowIndex >= 2 || rowIndex >= (totalRows - 3);
    setShouldShowAbove(showAbove);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      setIsOpen(false);
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      checkPosition();
      requestAnimationFrame(() => {
        checkPosition();
      });
    }
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative flex justify-center" ref={menuRef}>
      <button
        ref={buttonRef}
        className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
        onClick={handleToggleMenu}
        title="Más opciones"
      >
        <i className="pi pi-ellipsis-h text-white text-xs"></i>
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 ${shouldShowAbove ? 'bottom-16' : 'top-12'} bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-[140px]`}>
          <div 
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEditar(rowData);
            }}
          >
            <i className="pi pi-pencil text-xs"></i>
            <span>Editar</span>
          </div>
          
          <hr className="my-0 border-gray-200" />
          
          <div 
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={async (e) => {
              e.stopPropagation();
              setIsOpen(false);
              await eliminarRecordatorio(rowData, onEliminar);
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
            <span>Eliminar</span>
          </div>
        </div>
      )}
    </div>
  );
};

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