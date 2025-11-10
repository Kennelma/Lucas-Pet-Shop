
import React, { useState, useRef, useEffect } from 'react';
import {
  ScissorsIcon,
} from '@heroicons/react/24/outline';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { faPlus, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ActionMenu = ({ rowData, onEditar, onEliminar, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowAbove, setShouldShowAbove] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const checkPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = 80; // Altura aproximada del menú
      
      // Si no hay espacio suficiente abajo, mostrar arriba
      const showAbove = rect.bottom + menuHeight > viewportHeight - 50;
      setShouldShowAbove(showAbove);
    } else {
      // Fallback a la lógica anterior si no hay referencia
      const showAbove = rowIndex >= 2 || rowIndex >= (totalRows - 3);
      setShouldShowAbove(showAbove);
    }
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
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px]"
          style={{
            zIndex: 99999,
            position: 'fixed',
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 140 : 'auto',
            top: shouldShowAbove ? 
              (buttonRef.current ? buttonRef.current.getBoundingClientRect().top - 80 : 'auto') : 
              (buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 5 : 'auto')
          }}
        >
          <div
            className="px-2 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center gap-1 transition-colors"
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
            className="px-2 py-1.5 text-xs text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEliminar(rowData);
            }}
          >
            <i className="pi pi-trash text-xs"></i>
            <span>Eliminar</span>
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Botones de acciones con ActionMenu
  const actionBotones = (servicio, options) => {
    return (
      <ActionMenu
        rowData={servicio}
        onEditar={(data) => abrirModalServicio(data)}
        onEliminar={(data) => handleEliminar(data)}
        rowIndex={options.rowIndex}
        totalRows={servicios.length}
      />
    );
  };



  return (
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #FF9A9840, 0 0 0 1px #FF9A9833'}}>
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
          className="bg-rose-300 text-black px-6 py-2 rounded hover:bg-rose-600 transition-colors flex items-center gap-2"
          onClick={() => abrirModalServicio(null)}
        >
          <FontAwesomeIcon icon={faPlus} />
          NUEVO SERVICIO
        </button>
      </div>

      {servicios.length === 0 ? (
        <div className="text-center py-12">
          <ScissorsIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2 uppercase">No hay servicios</h3>
          <p className="text-gray-500 mb-6">Crea tu primer servicio de peluquería para mascotas.</p>
          <button
            className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
            onClick={() => abrirModalServicio(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
            NUEVO SERVICIO
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
            tableStyle={{ 
              width: '970px',
              tableLayout: 'fixed'
            }}
            className="mt-4"
            size="small"
            selectionMode="single"
            rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
            style={{ width: '100%' }}
          >
            <Column
              field="id_servicio_peluqueria_pk"
              header="ID"
              body={(rowData) => servicios.length - servicios.indexOf(rowData)}
              sortable
              className="text-sm"
              style={{ width: '50px' }}
            />
            <Column 
              field="nombre_servicio_peluqueria" 
              header="SERVICIO" 
              sortable 
              className="text-sm"
              style={{ width: '150px' }}
              bodyStyle={{ 
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                overflow: 'hidden',
                textOverflow: 'clip',
                lineHeight: '1.4',
                padding: '8px 10px'
              }}
            />
            <Column 
              field="descripcion_servicio" 
              header="DESCRIPCIÓN" 
              className="text-sm"
              style={{ width: '210px' }}
              headerStyle={{ padding: '8px 12px' }}
              bodyStyle={{ 
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                overflow: 'hidden',
                textOverflow: 'clip',
                lineHeight: '1.4',
                padding: '8px 12px'
              }}
            />
            <Column
              field="precio_servicio"
              header="PRECIO"
              body={(rowData) => `L. ${parseFloat(rowData.precio_servicio || 0).toFixed(2)}`}
              sortable
              sortField="precio_servicio"
              dataType="numeric"
              className="text-sm"
              style={{ width: '90px' }}
              bodyStyle={{ 
                padding: '8px 8px'
              }}
            />
            <Column
              field="duracion_estimada"
              header="DURACIÓN"
              body={(rowData) => `${rowData.duracion_estimada} Min`}
              sortable
              sortField="duracion_estimada"
              dataType="numeric"
              className="text-sm"
              style={{ width: '110px' }}
              headerStyle={{ padding: '8px 16px' }}
              bodyStyle={{ 
                padding: '8px 16px'
              }}
            />
            <Column 
              field="requisitos" 
              header="REQUISITOS" 
              body={(rowData) => rowData.requisitos && rowData.requisitos.trim() !== '' ? rowData.requisitos : 'N/A'}
              className="text-sm"
              style={{ width: '160px' }}
              headerStyle={{ padding: '8px 18px' }}
              bodyStyle={{ 
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                overflow: 'hidden',
                textOverflow: 'clip',
                lineHeight: '1.4',
                padding: '8px 18px'
              }}
            />
            <Column
              field="activo"
              header="ESTADO"
              body={estadoTemplate}
              sortable
              sortField="activo"
              className="text-sm"
              style={{ width: '120px' }}
              bodyStyle={{ 
                padding: '8px 8px'
              }}
            />
            <Column 
              header="ACCIONES" 
              body={actionBotones} 
              bodyStyle={{ 
                textAlign: 'center', 
                padding: '8px'
              }}
              className="text-sm"
              style={{ width: '80px' }}
            />
          </DataTable>
        </>
      )}
    </div>
  );
};

export default ServiciosSeccion;