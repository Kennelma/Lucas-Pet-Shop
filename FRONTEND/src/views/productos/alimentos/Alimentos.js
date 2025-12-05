import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPlus } from '@fortawesome/free-solid-svg-icons';

import ModalNuevoAlimento from './modal_nuevo_alimento';
import ModalActualizarAlimento from './modal_actualizar_alimento';
import AlimentosMasVendidos from './AlimentosMasVendidos';

import { verProductos, eliminarProducto, actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

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
          className={`fixed ${shouldShowAbove ? 'bottom-auto' : 'top-auto'} bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]`}
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

const Alimentos = () => {
  const [alimentos, setAlimentos] = useState([]);
  const [filtroGlobal, setFiltroGlobal] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alimentoEditando, setAlimentoEditando] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5);

  useEffect(() => {
    cargarDatos();
    document.body.style.fontFamily = 'Poppins';
  }, []);

  //====================CONTROL_SCROLL_MODAL====================
  useEffect(() => {
    if (modalAbierto) {
      // Obtener el ancho de la scrollbar antes de ocultarla
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      // Compensar el ancho de la scrollbar para evitar saltos
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [modalAbierto]);

  // Switch para el estado activo
  const estadoTemplate = (rowData) => {
    return (
      <div className="flex items-center justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rowData.activo}
            onChange={() => actualizarEstadoAlimento(rowData, !rowData.activo)}
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

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const productos = await verProductos('ALIMENTOS');
      const normalizados = (productos || []).map((item) => ({
        id_producto: item.id_producto_pk,
        nombre: item.nombre_producto,
        precio: parseFloat(item.precio_producto || 0),
        stock: parseInt(item.stock || 0),
        stock_minimo: parseInt(item.stock_minimo || 0),
        activo: item.activo === 1 || item.activo === '1' ? 1 : 0,
        destino: item.alimento_destinado || 'No especificado',
        peso: parseFloat(item.peso_alimento || 0),
        sku: item.sku || '',
        tiene_impuesto: item.tiene_impuesto || 0,
        tasa_impuesto: item.tasa_impuesto
      }));
      setAlimentos(normalizados);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los alimentos',
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (alimento = null) => {
    //VALIDAR ROL DEL USUARIO ACTUAL
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    //SI NO ES ADMINISTRADOR U OPERADOR DE INVENTARIO, MOSTRAR MENSAJE
    if (rolActual !== 'administrador' && rolActual !== 'operador de inventario') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para modificar productos',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    setAlimentoEditando(alimento);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAlimentoEditando(null);
  };

  const handleGuardar = async () => {
    await cargarDatos();
    cerrarModal();
  };

  const handleEliminar = async (alimento) => {
    //VALIDAR ROL DEL USUARIO ACTUAL
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    //SI NO ES ADMINISTRADOR U OPERADOR DE INVENTARIO, MOSTRAR MENSAJE
    if (rolActual !== 'administrador' && rolActual !== 'operador de inventario') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar productos',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar alimento?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${alimento.nombre}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Precio:</span> L. ${alimento.precio.toFixed(2)}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px',
      customClass: {
        confirmButton: 'bg-green-800 hover:bg-green-900 text-white p-button p-component',
        cancelButton: 'p-button-text p-button p-component'
      }
    });

    if (result.isConfirmed) {
      try {
        const resp = await eliminarProducto({ id_producto: alimento.id_producto });
        if (resp.Consulta) {
          Swal.fire({
            icon: 'success',
            title: '¡Alimento eliminado!',
            text: 'El alimento se ha eliminado correctamente',
            timer: 1800,
            showConfirmButton: false,
          });
          await cargarDatos();
        } else throw new Error(resp.error || 'Error al eliminar');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo eliminar el alimento',
        });
      }
    }
  };

  const actualizarEstadoAlimento = async (alimento, nuevoEstado) => {
    //VALIDAR ROL DEL USUARIO ACTUAL
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    //SI NO ES ADMINISTRADOR U OPERADOR DE INVENTARIO, MOSTRAR MENSAJE
    if (rolActual !== 'administrador' && rolActual !== 'operador de inventario') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para cambiar el estado de productos',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    try {
      const payload = {
        id_producto: alimento.id_producto,
        tipo_producto: 'ALIMENTOS',
        activo: nuevoEstado ? 1 : 0,
      };

      const resultado = await actualizarProducto(payload);

      if (resultado.Consulta) {
        setAlimentos((prev) =>
          prev.map((a) =>
            a.id_producto === alimento.id_producto
              ? { ...a, activo: nuevoEstado ? 1 : 0 }
              : a
          )
        );

        Swal.fire({
          icon: 'success',
          title: nuevoEstado ? '¡Alimento Activado!' : '¡Alimento Desactivado!',
          text: 'El estado se ha actualizado correctamente',
          timer: 1500,
          showConfirmButton: false,
        });
      } else throw new Error(resultado.error || 'Error al actualizar estado');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el estado del alimento',
      });
    }
  };

  const filtroAlimentos = alimentos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(filtroGlobal.toLowerCase()) ||
      a.sku.toLowerCase().includes(filtroGlobal.toLowerCase()) ||
      a.destino.toLowerCase().includes(filtroGlobal.toLowerCase())
  );

  const onPageChange = (e) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  return (
    <>
      <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
      <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50">
        {/* Título */}
      <div className="rounded-xl p-4 sm:p-6 mb-3"
        style={{
          backgroundImage: window.innerWidth >= 640 ? 'url("/H4.jpg")' : 'none',
          backgroundColor: '#FFD4DE',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          boxShadow: '0 0 8px #FFD4DE40, 0 0 0 1px #FFD4DE33'
        }}
      >
        <div className="flex justify-center items-center">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-center uppercase text-black">
            GESTIÓN DE ALIMENTOS
          </h2>
        </div>
        <p className="text-center text-black italic mt-2 text-xs sm:text-sm">
          Administra alimentos balanceados, snacks y nutrición para mascotas
        </p>
      </div>

      {/* Componente de Alimentos Más Vendidos */}
      <AlimentosMasVendidos alimentos={alimentos} />

      <div className="bg-white rounded-xl p-4 sm:p-6 mb-6" style={{boxShadow: '0 0 8px #FF9A9840, 0 0 0 1px #FF9A9833'}}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="relative w-full sm:w-80">
            <input
              value={filtroGlobal}
              onChange={(e) => setFiltroGlobal(e.target.value)}
              placeholder="Buscar alimentos..."
              className="w-full px-4 py-2 border rounded-full text-sm"
            />
            {filtroGlobal && (
              <button
                onClick={() => setFiltroGlobal('')}
                className="absolute right-3 top-2 text-gray-500"
              >
                ×
              </button>
            )}
          </div>
          <button
            className="bg-rose-300 text-text px-4 sm:px-6 py-2 rounded hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base font-semibold"
            onClick={() => abrirModal()}
          >
            <FontAwesomeIcon icon={faPlus} size="sm" />
            <span>NUEVO ALIMENTO</span>
          </button>
        </div>

        {/* Tabla - Scroll horizontal en móvil */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <DataTable
            value={filtroAlimentos}
            loading={loading}
            loadingIcon={() => (
              <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span className="text-sm">Cargando datos...</span>
              </div>
            )}
            globalFilter={filtroGlobal}
            globalFilterFields={['nombre', 'sku', 'destino']}
            showGridlines
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 20, 25]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            tableStyle={{ minWidth: '100%', width: '100%' }}
            className="mt-4 text-xs sm:text-sm"
            size="small"
            selectionMode="single"
            rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
          >
            <Column
              field="id_producto"
              header="ID"
              body={(rowData) => filtroAlimentos.length - filtroAlimentos.indexOf(rowData)}
              sortable
              className="text-xs sm:text-sm px-2 sm:px-4 py-2"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50"
            />
            <Column
              field="nombre"
              header="NOMBRE"
              sortable
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 min-w-[120px] sm:min-w-none"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 whitespace-nowrap"
            />
            <Column
              field="sku"
              header="SKU"
              sortable
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 hidden md:table-cell"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 hidden md:table-cell"
            />
            <Column
              field="destino"
              header="DESTINADO"
              sortable
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 text-center hidden sm:table-cell"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 text-center hidden sm:table-cell whitespace-nowrap"
            />
            <Column
              field="peso"
              header="PESO"
              body={(rowData) => `${rowData.peso}kg`}
              sortable
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 text-center hidden lg:table-cell"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 text-center hidden lg:table-cell whitespace-nowrap"
            />
            <Column
              field="precio"
              header="PRECIO"
              body={(rowData) => `L. ${rowData.precio.toFixed(2)}`}
              sortable
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 text-right"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 text-right whitespace-nowrap"
            />
            <Column
              field="stock"
              header="STOCK"
              body={(rowData) => (
                <span className={`${rowData.stock <= rowData.stock_minimo ? 'text-red-500 font-semibold' : ''}`}>
                  {rowData.stock}
                </span>
              )}
              sortable
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 text-center"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 text-center whitespace-nowrap"
              bodyClassName="text-center"
            />
            <Column
              field="activo"
              header="ESTADO"
              body={estadoTemplate}
              sortable
              sortField="activo"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 whitespace-nowrap"
            />
            <Column
              header="ACCIONES"
              body={(rowData, column) => {
                const rowIndex = alimentos.indexOf(rowData);
                return (
                  <ActionMenu
                    rowData={rowData}
                    rowIndex={rowIndex}
                    totalRows={alimentos.length}
                    onEditar={abrirModal}
                    onEliminar={handleEliminar}
                  />
                );
              }}
              className="py-2 px-1 sm:px-3 sm:pr-9 border-b text-xs sm:text-sm"
              headerClassName="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-gray-50 whitespace-nowrap"
              style={{ position: 'relative', overflow: 'visible' }}
            />
          </DataTable>
        </div>
      </div>

      {/* Modal */}
      {modalAbierto &&
        (alimentoEditando ? (
          <ModalActualizarAlimento
            isOpen={modalAbierto}
            onClose={cerrarModal}
            onSave={handleGuardar}
            editData={alimentoEditando}
            alimentosExistentes={alimentos} // ✅ AGREGAR ESTA PROP
          />
        ) : (
          <ModalNuevoAlimento
            isOpen={modalAbierto}
            onClose={cerrarModal}
            onSave={handleGuardar}
            alimentosExistentes={alimentos} // ✅ AGREGAR ESTA PROP
          />
        ))}
      </div>
      </div>
    </>
  );
};

export default Alimentos;