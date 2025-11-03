import React, { useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const KardexTable = ({ kardexData, globalFilter, setGlobalFilter }) => {

  // Template para mostrar el medicamento
  const medicamentoTemplate = (rowData) => {
    return (
      <div>
        <div className="text-sm ">
          {rowData.nombre_producto}
        </div>
      </div>
    );
  };

  // Template para mostrar el código de lote
  const loteTemplate = (rowData) => {
    return (
      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-full">
        {rowData.codigo_lote || "N/A"}
      </span>
    );
  };

  // Template para mostrar la cantidad
  const cantidadTemplate = (rowData) => {
    return (
      <span className="text-sm font-poppins">
        {rowData.cantidad_movimiento}
      </span>
    );
  };

  // Template para mostrar el costo unitario
  const costoTemplate = (rowData) => {
    return (
      <span className="text-sm">
        L. {parseFloat(rowData.costo_unitario || 0).toFixed(2)}
      </span>
    );
  };

  // Template para mostrar la fecha en una línea con plecas
  const fechaTemplate = (rowData) => {
    const fecha = new Date(rowData.fecha_movimiento);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    
    return (
      <span className="text-sm text-gray-600">
        {dia}/{mes}/{año}
      </span>
    );
  };

  // Template para mostrar el tipo de movimiento
  const tipoTemplate = (rowData) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-poppins rounded-full ${
        rowData.tipo_movimiento === "ENTRADA"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}>
        {rowData.tipo_movimiento}
      </span>
    );
  };

  // Template para mostrar el origen
  const origenTemplate = (rowData) => {
    return (
      <span className="inline-flex px-2 py-1 text-xs font-poppins rounded-full bg-blue-100 text-blue-800">
        {rowData.origen_movimiento}
      </span>
    );
  };

  // Template para mostrar el usuario
  const usuarioTemplate = (rowData) => {
    return (
      <span className="text-sm text-gray-600">
        {rowData.nombre_usuario_movimiento}
      </span>
    );
  };

  return (
    <>
      {kardexData.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-poppins text-gray-700 mb-2">No hay movimientos</h3>
          <p className="text-gray-500 mb-6">No se encontraron movimientos de inventario para mostrar.</p>
        </div>
      ) : (
        <DataTable
          value={kardexData}
          loading={false}
          loadingIcon={() => (
            <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              <span>Cargando movimientos...</span>
            </div>
          )}
          globalFilter={globalFilter}
          globalFilterFields={['nombre_producto', 'codigo_lote', 'tipo_movimiento', 'origen_movimiento']}
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
            field="id_movimiento_pk" 
            header="ID" 
            body={(rowData) => kardexData.length - kardexData.indexOf(rowData)}
            sortable 
            className="text-sm"
          />
          
          <Column 
            field="nombre_producto" 
            header="MEDICAMENTO" 
            body={medicamentoTemplate}
            sortable 
            className="text-sm"
          />
          
          <Column 
            field="codigo_lote" 
            header="LOTE" 
            body={loteTemplate}
            sortable 
            className="text-sm"
          />
          
          <Column 
            field="cantidad_movimiento" 
            header="CANT." 
            body={cantidadTemplate}
            sortable 
            className="text-sm text-center"
            bodyClassName="text-center"
          />
          
          <Column 
            field="costo_unitario"
            header="COSTO UNIT." 
            body={costoTemplate}
            sortable 
            className="text-sm text-center"
            bodyClassName="text-center"
          />
          
          <Column 
            field="fecha_movimiento"
            header="FECHA DE MOVIMIENTO" 
            body={fechaTemplate}
            sortable 
            className="text-sm"
            bodyClassName="text"
          />
          
          <Column 
            field="tipo_movimiento"
            header="TIPO" 
            body={tipoTemplate}
            sortable 
            className="text-sm text-center"
            bodyClassName="text-center"
          />
          
          <Column 
            field="origen_movimiento"
            header="ORIGEN" 
            body={origenTemplate}
            sortable 
            className="text-sm text-center"
            bodyClassName="text-center"
          />
          
          <Column 
            field="nombre_usuario_movimiento"
            header="USUARIO" 
            body={usuarioTemplate}
            sortable 
            className="text-sm"
          />
          
        </DataTable>
      )}
    </>
  );
};

export default KardexTable;