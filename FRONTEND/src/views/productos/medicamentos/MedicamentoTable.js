import React, { useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faBox, faEye } from "@fortawesome/free-solid-svg-icons";

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
        console.error('Error al cambiar estado:', error);
      }
    };

    return (
      <div className="flex items-center justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rowData.activo}
            onChange={handleCambiarEstado}
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
      <span className={stockTotal <= 5 ? 'text-red-500 font-semibold' : ''}>
        {stockTotal}
      </span>
    );
  };

  // Template para mostrar los lotes
  const lotesTemplate = (rowData) => {
    const lotesCount = lotesCounts[rowData.id_producto_pk] || 0;
    return `${lotesCount}`;
  };
const actionBotones = (rowData) => {
  return (
    <div className="flex items-center gap-2 w-full justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white p-1.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onEditar(rowData);
        }}
        title="Editar"
      >
        <FontAwesomeIcon icon={faPenToSquare} size="sm" />
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white p-1.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onEliminar(rowData);
        }}
        title="Eliminar"
      >
        <FontAwesomeIcon icon={faTrash} size="sm" />
      </button>
      <button
        className="bg-green-500 hover:bg-green-400 text-white p-1.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onAgregarLote(rowData);
        }}
        title="Agregar Lote"
      >
        <FontAwesomeIcon icon={faBox} size="sm" />
      </button>
      <button
        className="bg-blue-600 hover:bg-blue-800 text-white p-1.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onVerLotes(rowData);
        }}
        title="Ver Lotes"
      >
        <FontAwesomeIcon icon={faEye} size="sm" />
      </button>
    </div>
  );
};

  return (
    <>
      {medicamentos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay medicamentos</h3>
          <p className="text-gray-500 mb-6">Crea tu primer medicamento para comenzar el inventario.</p>
        </div>
      ) : (
        <DataTable
          value={medicamentos}
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
            body={(rowData, options) => options.rowIndex + 1}
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
            header="TIPO" 
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
            className="text-sm text-center"
            bodyClassName="text-center"
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