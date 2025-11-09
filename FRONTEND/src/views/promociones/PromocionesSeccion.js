
import React, { useState, useRef, useEffect } from 'react';
import * as outline from '@heroicons/react/24/outline';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ResumenPromocionesDelDia from "./ResumenPromocionesDelDia";

const ActionMenu = ({ rowData, onEditar, onEliminar, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

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
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 140
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex justify-center" ref={menuRef}>
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
          className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]"
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 999999
          }}
        >
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
              onEliminar(rowData);
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

const PromocionesSeccion = ({ promociones, abrirModalPromocion, eliminarPromocion, actualizarEstadoPromocion }) => {

  const [globalFilter, setGlobalFilter] = useState('');

  const handleEliminar = (promocion) => {
    eliminarPromocion(promocion);
  };

  // Switch para el estado activo de promociones
  const estadoTemplate = (rowData) => {
    return (
      <div className="flex items-center justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rowData.activo}
            onChange={() => actualizarEstadoPromocion(rowData)}
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
  const actionBotones = (promocion, options) => {
    return (
      <ActionMenu
        rowData={promocion}
        onEditar={(data) => abrirModalPromocion(data)}
        onEliminar={(data) => handleEliminar(data)}
        rowIndex={options.rowIndex}
        totalRows={promociones.length}
      />
    );
  };

  return (
    <>
      <style jsx>{`
        :global(.p-datatable .p-datatable-wrapper),
        :global(.p-datatable .p-datatable-table),
        :global(.p-datatable tbody),
        :global(.p-datatable tr),
        :global(.p-datatable td) {
          overflow: visible !important;
        }
        :global(.p-datatable) {
          overflow: visible !important;
        }
        :global(.p-datatable .p-datatable-tbody > tr > td) {
          overflow: visible !important;
          position: relative !important;
        }
      `}</style>
      {/* Título */}
      <div className="rounded-xl p-6 mb-3"
        style={{
          backgroundImage: 'url("/descarga (1).jpg")',
          backgroundColor: '#365DA0',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          boxShadow: '0 0 8px #365DA040, 0 0 0 1px #365DA033'
        }}
      >
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-white">
            GESTIÓN DE PROMOCIONES
          </h2>
        </div>
        <p className="text-center text-white italic mt-2">
          Administra ofertas, descuentos y promociones especiales
        </p>
      </div>

      {/* Resumen de promociones del día en tiempo real */}
      <ResumenPromocionesDelDia />


      <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #365DA040, 0 0 0 1px #365DA033'}}>
      {/* Barra de búsqueda + botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar promociones..."
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
          className="bg-blue-400 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2"
          style={{ borderRadius: '12px' }}
          onClick={() => abrirModalPromocion(null)}
        >
          <FontAwesomeIcon icon={faPlus} />
          NUEVA PROMOCIÓN
        </button>
      </div>

      {promociones.length === 0 ? (
        <div className="text-center py-12">
          <outline.SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay promociones</h3>
          <p className="text-gray-500 mb-6">Crea tu primera promoción para atraer clientes.</p>
          <button
            className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
            style={{ borderRadius: '12px' }}
            onClick={() => abrirModalPromocion(null)}
          >
            <FontAwesomeIcon icon={faPlus} />
            NUEVA PROMOCIÓN
          </button>
        </div>
      ) : (
        <>
          <div style={{ overflow: 'visible' }}>
            <DataTable
                value={promociones}
                loading={false}
                loadingIcon={() => (
                  <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    <span>Cargando datos...</span>
                  </div>
                )}
                globalFilter={globalFilter}
                globalFilterFields={['id_promocion_pk', 'nombre_promocion', 'descripcion_promocion', 'precio_promocion', 'dias_promocion']}
                showGridlines
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 20, 25]}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                tableStyle={{ width: '950px', tableLayout: 'fixed' }}
                className="mt-4"
                size="small"
                selectionMode="single"
                rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
              >

          <Column 
            field="id_promocion_pk" 
            header="ID" 
            body={(rowData) => promociones.length - promociones.indexOf(rowData)}  
            sortable 
            className="text-sm"
            style={{ width: '60px', padding: '8px 8px' }}
            headerStyle={{ width: '60px', padding: '8px 8px' }}
          />
          <Column 
            field="nombre_promocion" 
            header="NOMBRE" 
            sortable 
            className="text-sm"
            style={{ width: '200px', padding: '8px 12px' }}
            headerStyle={{ width: '200px', padding: '8px 12px' }}
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
            field="descripcion_promocion" 
            header="DESCRIPCIÓN" 
            className="text-sm"
            style={{ width: '220px', padding: '8px 10px' }}
            headerStyle={{ width: '220px', padding: '8px 10px' }}
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
            field="precio_promocion"
            header="PRECIO"
            body={(rowData) => `L. ${parseFloat(rowData.precio_promocion || 0).toFixed(2)}`}
            sortable
            sortField="precio_promocion"
            dataType="numeric"
            sortFunction={(e) => {
              const value1 = parseFloat(e.data1.precio_promocion || 0);
              const value2 = parseFloat(e.data2.precio_promocion || 0);
              return e.order * (value1 - value2);
            }}
            className="text-sm"
            style={{ width: '110px', padding: '8px 8px' }}
            headerStyle={{ width: '110px', padding: '8px 8px' }}
          />
          <Column
            header="DÍAS DE PROMOCIÓN"
            body={(rowData) => {
              let duracion = rowData.dias_promocion;
              if (Array.isArray(duracion)) {
                return duracion.join(', ');
              }
              if (typeof duracion === 'string') {
                duracion = duracion.replace(/[\[\]"]/g, '');
              }
              return duracion;
            }}
            className="text-sm"
            style={{ width: '140px', padding: '8px 8px' }}
            headerStyle={{ width: '140px', padding: '8px 8px' }}
            bodyStyle={{ 
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflow: 'hidden',
              textOverflow: 'clip',
              lineHeight: '1.4',
              padding: '8px 8px'
            }}
          />
          <Column
            field="activo"
            header="ESTADO"
            body={estadoTemplate}
            sortable
            sortField="activo"
            className="text-sm"
            style={{ width: '120px', padding: '8px 8px' }}
            headerStyle={{ width: '120px', padding: '8px 8px' }}
          />
          <Column 
            header="ACCIONES" 
            body={actionBotones} 
            className="py-2 pr-9 pl-1 border-b text-sm"
            style={{ width: '120px', padding: '8px 8px' }}
            headerStyle={{ width: '120px', padding: '8px 8px' }}
          />
              </DataTable>
          </div>
        </>
      )}
      </div>
    </>
  );
};

export default PromocionesSeccion;