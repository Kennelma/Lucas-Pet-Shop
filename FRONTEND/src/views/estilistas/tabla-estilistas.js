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
      <div className="flex items-center gap-2 w-full justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white p-1.5 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(rowData);
          }}
          title="Editar"
        >
          <FontAwesomeIcon icon={faPenToSquare} size="sm" />
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white p-1.5 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(rowData.id_estilista_pk);
          }}
          title="Eliminar"
        >
          <FontAwesomeIcon icon={faTrash} size="sm" />
        </button>
      </div>
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay estilistas</h3>
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
          tableStyle={{ minWidth: '50rem' }}
          className="mt-4"
          size="small"
          selectionMode="single"
          rowClassName={(rowData) => `hover:bg-gray-50 cursor-pointer`}
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