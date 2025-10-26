import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

const TablaEstilistas = ({ estilistas, loading, globalFilter, onEdit, onDelete }) => {
  
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const accionesTemplate = (rowData) => {
    return (
      <div className="flex items-center space-x-2 w-full">
        <button 
          className="text-blue-500 hover:text-blue-700 p-2 rounded"
          onClick={(e) => {
            e.stopPropagation(); 
            onEdit(rowData);
          }}
        >
          <FontAwesomeIcon icon={faPenToSquare} size="lg" />
        </button>
        <button 
          className="text-red-500 hover:text-red-700 p-2 rounded"
          onClick={(e) => {
            e.stopPropagation(); 
            onDelete(rowData.id_estilista_pk);
          }}
        >
          <FontAwesomeIcon icon={faTrash} size="lg" />
        </button>
      </div>
    );
  };

  const fechaTemplate = (rowData) => {
    return formatearFecha(rowData.fecha_ingreso);
  };

  const nombreCompletoTemplate = (rowData) => {
    return `${rowData.nombre_estilista} ${rowData.apellido_estilista}`;
  };

  return (
    <DataTable
      value={estilistas}
      loading={loading}
      dataKey="id_estilista_pk"
      globalFilter={globalFilter}
      globalFilterFields={['nombre_estilista', 'apellido_estilista', 'identidad_estilista']}
      emptyMessage="No se encontraron estilistas"
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
      stripedRows
      responsiveLayout="scroll"
    >
      <Column
        field="id_estilista_pk"
        header="ID"
        body={(rowData) => estilistas.indexOf(rowData) + 1}
        sortable
        className="text-sm"
      />
      <Column
        body={nombreCompletoTemplate}
        header="Nombre Completo"
        sortable
        field="nombre_estilista"
        className="text-sm"
      />
      <Column
        field="identidad_estilista"
        header="Identidad"
        sortable
        className="text-sm"
      />
      <Column
        body={fechaTemplate}
        header="Fecha de Ingreso"
        sortable
        field="fecha_ingreso"
        className="text-sm"
      />
      <Column
        body={accionesTemplate}
        header="Acciones"
        className="py-2 pr-9 pl-1 border-b text-sm"
      />
    </DataTable>
  );
};

export default TablaEstilistas;