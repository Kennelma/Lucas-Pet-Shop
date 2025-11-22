import React, { useState, useRef } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// Componente separado para el menú de acciones
const ActionMenu = ({ rowData, onEditar, onVerLotes, onAgregarLote, onEliminar, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowAbove, setShouldShowAbove] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);


  const checkPosition = () => {

    const showAbove = rowIndex >= 2 || rowIndex >= (totalRows - 3);
    setShouldShowAbove(showAbove);
  };

  // Cerrar menú cuando se hace clic fuera
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

  // Verificar posición cuando se abre el menú
  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      // Verificar la posición inmediatamente antes de abrir
      checkPosition();
      // También verificar después de que el DOM se actualice
      requestAnimationFrame(() => {
        checkPosition();
      });
    }
    setIsOpen(!isOpen);
  };

  // Calcular posición para fixed positioning
  const getMenuPosition = () => {
    if (!buttonRef.current) return {};

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 200; // Altura aproximada del menú
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const showAbove = spaceBelow < menuHeight && buttonRect.top > menuHeight;

    return {
      position: 'fixed',
      left: `${buttonRect.right - 140}px`, // 140px es el ancho del menú
      top: showAbove ? `${buttonRect.top - menuHeight}px` : `${buttonRect.bottom + 5}px`,
      zIndex: '99999'
    };
  };

  return (
    <div className="relative flex justify-center overflow-visible" ref={menuRef} style={{ overflow: 'visible' }}>
      <button
        ref={buttonRef}
        className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
        onClick={handleToggleMenu}
        title="Más opciones"
      >
        <i className="pi pi-ellipsis-h text-white text-xs"></i>
      </button>

      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px]"
             style={getMenuPosition()}>
          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEditar(rowData);
            }}
          >
            <i className="pi pi-pencil text-xs"></i>
            <span className="uppercase">EDITAR</span>
          </div>

          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onVerLotes(rowData);
            }}
          >
            <i className="pi pi-eye text-xs"></i>
            <span className="uppercase">VER LOTES</span>
          </div>

          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onAgregarLote(rowData);
            }}
          >
            <i className="pi pi-plus text-xs"></i>
            <span className="uppercase">AGREGAR LOTE</span>
          </div>

          <hr className="my-0 border-gray-200" />

          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEliminar(rowData);
            }}
          >
            <i className="pi pi-trash text-xs"></i>
            <span className="uppercase">ELIMINAR</span>
          </div>
        </div>
      )}
    </div>
  );
};

const MedicamentoTable = ({
  medicamentos,
  stockTotals,
  lotesCounts,
  onEditar,
  onAgregarLote,
  onVerLotes,
  onEliminar,
  onCambiarEstado,
  globalFilter,
  setGlobalFilter
}) => {

  // Template para mostrar el estado activo/inactivo
  const estadoTemplate = (rowData) => {
    const handleCambiarEstado = async (e) => {
      e.stopPropagation();
      try {
        // Llamar a la función del componente padre para manejar el cambio de estado
        if (onCambiarEstado) {
          await onCambiarEstado(rowData);
        }
      } catch (error) {
      }
    };

    return (
      <div className="flex items-center justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(rowData.activo)}
            onChange={handleCambiarEstado}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
        <span className={`ml-2 text-xs font-medium ${rowData.activo ? 'text-green-600' : 'text-gray-500'}`}>
          {rowData.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    );
  };

  // Template para mostrar producto y SKU
  const productoTemplate = (rowData) => {
    return (
      <div>
        <div className="text-sm">
          {rowData.nombre_producto}
        </div>
        <div className="text-xs text-gray-500">
          {rowData.cantidad_contenido} {rowData.unidad_medida}
        </div>
      </div>
    );
  };

  // Template para mostrar el contenido
  const contenidoTemplate = (rowData) => {
    return `${rowData.cantidad_contenido} ${rowData.unidad_medida}`;
  };

  // Template para mostrar el precio
  const precioTemplate = (rowData) => {
    return (
      <span className="text-sm">
        L. {parseFloat(rowData.precio_producto || 0).toFixed(2)}
      </span>
    );
  };

  // Template para mostrar el stock
  const stockTemplate = (rowData) => {
    const stockTotal = stockTotals[rowData.id_producto_pk] || 0;
    return (
      <span className={stockTotal <= 5 ? 'text-red-500 font-poppins' : ''}>
        {stockTotal}
      </span>
    );
  };

  // Template para mostrar los lotes
  const lotesTemplate = (rowData) => {
    const lotesCount = lotesCounts[rowData.id_producto_pk] || 0;
    return `${lotesCount}`;
  };

  // Template para mostrar tipo y presentación unidos
  const tipoPresentacionTemplate = (rowData) => {
    return (
      <div>
        <div className="text-sm font-medium">
          {rowData.tipo_medicamento || 'N/A'}
        </div>
        <div className="text-xs text-gray-500">
          {rowData.presentacion_medicamento || rowData.cantidad_contenido + ' ' + rowData.unidad_medida || 'Sin presentación'}
        </div>
      </div>
    );
  };
const actionBotones = (rowData, column) => {
  const rowIndex = medicamentosConStock.indexOf(rowData);
  return (
    <ActionMenu
      rowData={rowData}
      rowIndex={rowIndex}
      totalRows={medicamentosConStock.length}
      onEditar={onEditar}
      onVerLotes={onVerLotes}
      onAgregarLote={onAgregarLote}
      onEliminar={onEliminar}
    />
  );
};

  // Agregar stockTotal a cada medicamento para poder ordenar
  const medicamentosConStock = medicamentos.map(med => ({
    ...med,
    stockTotal: stockTotals[med.id_producto_pk] || 0
  }));

  return (
    <>
      {medicamentos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-poppins text-gray-700 mb-2">No hay medicamentos</h3>
          <p className="text-gray-500 mb-6">Crea tu primer medicamento para comenzar el inventario.</p>
        </div>
      ) : (
        <DataTable
          value={medicamentosConStock}
          loading={false}
          loadingIcon={() => (
            <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              <span>Cargando datos...</span>
            </div>
          )}
          globalFilter={globalFilter}
          globalFilterFields={['nombre_producto', 'sku', 'presentacion_medicamento', 'tipo_medicamento']}
          showGridlines
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 15, 20]}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          tableStyle={{ minWidth: '50rem' }}
          className="mt-4"
          size="small"
          selectionMode="single"
          rowClassName={(rowData) => `hover:bg-gray-50 cursor-pointer`}
        >

          <Column
            field="id_producto_pk"
            header="ID"
            body={(rowData) => medicamentosConStock.length - medicamentosConStock.indexOf(rowData)}
            sortable
            className="text-sm"
          />

          <Column
            field="nombre_producto"
            header="MEDICAMENTO"
            body={productoTemplate}
            sortable
            className="text-sm"
          />
          <Column
            field="tipo_medicamento"
            header="PRESENTACIÓN"
            body={tipoPresentacionTemplate}
            sortable
            className="text-sm"
          />
          <Column
            field="precio_producto"
            header="PRECIO"
            body={precioTemplate}
            sortable
            className="text-sm"
          />

          <Column
            header="STOCK"
            body={stockTemplate}
            sortable
            sortField="stockTotal"
            field="stockTotal"
            className="text-sm text-center"
            bodyClassName="text   "
          />

          <Column
            header="LOTES"
            body={lotesTemplate}
            className="text-sm text-center"
          />
          <Column
            field="activo"
            header="ESTADO"
            body={estadoTemplate}
            sortable
            sortField="activo"
            className="text-sm"
          />

          <Column
            header="ACCIONES"
            body={actionBotones}
            className="py-2 pr-9 pl-1 border-b text-sm"
          />

        </DataTable>
      )}
    </>
  );
};

export default MedicamentoTable;