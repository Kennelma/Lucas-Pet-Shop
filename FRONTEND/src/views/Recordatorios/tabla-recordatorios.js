import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { BotonActualizar } from './modal-actualizar';

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

  const accionesTemplate = (recordatorio, options) => {
    return (
      <ActionMenu
        rowData={recordatorio}
        onEditar={(data) => onEdit && onEdit(data)}
        onEliminar={(data) => onDelete && onDelete()}
        rowIndex={options.rowIndex}
        totalRows={recordatorios.length}
      />
    );
  };

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
          className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
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
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
          <span>Cargando recordatorios...</span>
        </div>
      )}
      globalFilter={globalFilter}
      globalFilterFields={['mensaje_recordatorio']}
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
      emptyMessage="No se encontraron recordatorios"
    >
      <Column 
        field="id_recordatorio_pk" 
        header="ID" 
        body={(rowData) => recordatorios.length - recordatorios.indexOf(rowData)}
        sortable 
        className="text-sm"
      />
      <Column field="estado" header="ESTADO" body={estadoTemplate} sortable className="text-sm" />
      <Column field="mensaje_recordatorio" header="MENSAJE" body={mensajeTemplate} sortable className="text-sm" />
      <Column field="tipo" header="TIPO SERVICIO" body={tipoTemplate} sortable className="text-sm" />
      <Column field="frecuencia" header="FRECUENCIA" body={frecuenciaTemplate} sortable className="text-sm" />
      <Column field="fecha" header="PROGRAMADA PARA" body={fechaTemplate} sortable className="text-sm" />
      <Column header="ACCIONES" body={accionesTemplate} className="py-2 pr-9 pl-1 border-b text-sm" />
    </DataTable>
  );
};

export default TablaRecordatorios;