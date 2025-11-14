import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


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
            <span className="uppercase">Editar</span>
          </div>
          
          <hr className="my-0 border-gray-200" />
          
          <div 
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEliminar(rowData.id_estilista_pk);
            }}
          >
            <i className="pi pi-trash text-xs"></i>
            <span className="uppercase">Eliminar</span>
          </div>
        </div>
      )}
    </div>
  );
};

const TablaEstilistas = ({ estilistas, loading, globalFilter, onEdit, onDelete, onSelectionChange, estilistaSeleccionado }) => {
  
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const accionesTemplate = (rowData, column) => {
    const rowIndex = estilistas.indexOf(rowData);
    return (
      <ActionMenu 
        rowData={rowData}
        rowIndex={rowIndex}
        totalRows={estilistas.length}
        onEditar={onEdit}
        onEliminar={onDelete}
      />
    );
  };

  const fechaTemplate = (rowData) => {
    return formatearFecha(rowData.fecha_ingreso);
  };


  return (
    <>
      {estilistas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-poppins text-gray-700 mb-2">No hay estilistas</h3>
          <p className="text-gray-500 mb-6">Crea tu primer estilista para comenzar.</p>
        </div>
      ) : (
        <DataTable
          value={estilistas}
          loading={loading}
          loadingIcon={() => (
            <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              <span>Cargando datos...</span>
            </div>
          )}
          dataKey="id_estilista_pk"
          globalFilter={globalFilter}
          globalFilterFields={['nombre_estilista', 'apellido_estilista', 'identidad_estilista']}
          showGridlines
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 15, 20]}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          tableStyle={{ minWidth: '60rem' }}
          className="font-poppins datatable-gridlines"
          size="small"
          selectionMode="single"
          selection={estilistaSeleccionado}
          onSelectionChange={(e) => onSelectionChange && onSelectionChange(e.value)}
          rowClassName={(rowData) => {
            const isSelected = estilistaSeleccionado && rowData.id_empleado_pk === estilistaSeleccionado.id_empleado_pk;
            return `hover:bg-blue-50 cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-purple-50 border-purple-200' : ''}`;
          }}
        >
          <Column
            field="id_estilista_pk"
            header="ID"
            body={(rowData, options) => options.rowIndex + 1}
            sortable
            className="text-sm"
          />
          
          <Column
            field="nombre_estilista"
            header="NOMBRE"
            sortable
            className="text-sm"
          />
          
          <Column
            field="apellido_estilista"
            header="APELLIDOS"
            sortable
            className="text-sm"
          />
          
          <Column
            field="identidad_estilista"
            header="IDENTIDAD"
            sortable
            className="text-sm"
          />
          
          <Column
            body={fechaTemplate}
            header="FECHA DE INGRESO"
            sortable
            field="fecha_ingreso"
            className="text-sm text-center"
          />
          
          <Column
            header="ACCIONES"
            body={accionesTemplate}
            className="py-2 pr-9 pl-1 border-b text-sm"
          />
          
        </DataTable>
      )}
    </>
  );
};

export default TablaEstilistas;