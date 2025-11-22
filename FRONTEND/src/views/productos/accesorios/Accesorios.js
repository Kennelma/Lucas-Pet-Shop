import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import ModalAgregar from "./ModalAgregar";
import ModalEditar from "./ModalEditar";
import AccesoriosMasVendidos from "./AccesoriosMasVendidos";

import {
  verProductos,
  eliminarProducto,
  actualizarProducto,
} from "../../../AXIOS.SERVICES/products-axios";

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

const Accesorios = () => {
  const [accesorios, setAccesorios] = useState([]);
  const [filtroGlobal, setFiltroGlobal] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accesorioEditando, setAccesorioEditando] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    cargarDatos();
    document.body.style.fontFamily = 'Poppins';
  }, []);  useEffect(() => {
    if (modalAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
            onChange={() => actualizarEstadoAccesorio(rowData, !rowData.activo)}
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
// Función para cargar los datos de accesorios
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const productos = await verProductos("ACCESORIOS");
      const normalizados = (productos || []).map((item) => ({
        id_producto: item.id_producto_pk,
        nombre: item.nombre_producto,
        precio: parseFloat(item.precio_producto || 0),
        stock: parseInt(item.stock || 0),
        stock_minimo: parseInt(item.stock_minimo || 0),
        activo: item.activo === 1 || item.activo === "1" ? 1 : 0,
        categoria: item.tipo_accesorio || "No especificada",
        sku: item.sku || "",
        // 💡 AGREGANDO CAMPOS DE IMPUESTO
        tiene_impuesto: item.tiene_impuesto || 0,
        tasa_impuesto: item.tasa_impuesto
      }));
      setAccesorios(normalizados);
    } catch (error) {
      console.error("Error cargando accesorios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los accesorios",
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (accesorio = null) => {
    //VALIDAR ROL DEL USUARIO ACTUAL
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    //SI NO ES ADMINISTRADOR U OPERADOR DE INVENTARIO, MOSTRAR MENSAJE
    if (rolActual !== 'administrador' && rolActual !== 'operador de inventario') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para modificar accesorios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    setAccesorioEditando(accesorio);
    setModalAbierto(true);
  };  const cerrarModal = () => {
    setModalAbierto(false);
    setAccesorioEditando(null);
  };

  const handleGuardar = async () => {
    await cargarDatos();
    cerrarModal();
  };

  const handleEliminar = async (accesorio) => {
    //VALIDAR ROL DEL USUARIO ACTUAL
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    //SI NO ES ADMINISTRADOR U OPERADOR DE INVENTARIO, MOSTRAR MENSAJE
    if (rolActual !== 'administrador' && rolActual !== 'operador de inventario') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar accesorios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar accesorio?",
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${accesorio.nombre}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Precio:</span> L. ${accesorio.precio.toFixed(2)}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      width: 380,
      padding: "16px",
      customClass: {
        confirmButton: "bg-green-800 hover:bg-green-900 text-white p-button p-component",
        cancelButton: "p-button-text p-button p-component"
      }
    });    if (result.isConfirmed) {
      try {
        const resp = await eliminarProducto({ id_producto: accesorio.id_producto });
        if (resp.Consulta) {
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El accesorio fue eliminado correctamente",
            timer: 1800,
            showConfirmButton: false,
          });
          await cargarDatos();
        } else throw new Error(resp.error || "Error al eliminar");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo eliminar el accesorio",
        });
      }
    }
  };

  const actualizarEstadoAccesorio = async (accesorio, nuevoEstado) => {
    //VALIDAR ROL DEL USUARIO ACTUAL
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    //SI NO ES ADMINISTRADOR U OPERADOR DE INVENTARIO, MOSTRAR MENSAJE
    if (rolActual !== 'administrador' && rolActual !== 'operador de inventario') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para cambiar el estado de accesorios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    try {
      const payload = {
        id_producto: accesorio.id_producto,
        tipo_producto: "ACCESORIOS",
        activo: nuevoEstado ? 1 : 0,
        // Incluir la data existente
        nombre_producto: accesorio.nombre,
        tipo_accesorio: accesorio.categoria,
        stock: accesorio.stock,
        precio_producto: accesorio.precio,
        tiene_impuesto: accesorio.tiene_impuesto ? 1 : 0,
        tasa_impuesto: accesorio.tasa_impuesto
      };      const resultado = await actualizarProducto(payload);

      if (resultado.Consulta) {
        setAccesorios((prev) =>
          prev.map((a) =>
            a.id_producto === accesorio.id_producto
              ? { ...a, activo: nuevoEstado ? 1 : 0 }
              : a
          )
        );

        Swal.fire({
          icon: 'success',
          title: nuevoEstado ? '¡Accesorio Activado!' : '¡Accesorio Desactivado!',
          text: 'Estado actualizado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      } else throw new Error(resultado.error || 'Error al actualizar estado');
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el estado del accesorio",
      });
    }
  };

  const filtroAccesorios = accesorios.filter(
    (a) =>
      a.nombre.toLowerCase().includes(filtroGlobal.toLowerCase()) ||
      a.sku.toLowerCase().includes(filtroGlobal.toLowerCase()) ||
      a.categoria.toLowerCase().includes(filtroGlobal.toLowerCase())
  );

  const onPageChange = (e) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  return (
      <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
      <div className="min-h-screen p-6 bg-gray-50">
  {/* Título */}
      <div className="rounded-xl p-6 mb-3"
        style={{
          backgroundImage: 'url("/H5.jpg")',
          backgroundColor: '#C4D3AB',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          boxShadow: '0 0 8px #C4D3AB40, 0 0 0 1px #C4D3AB33'
        }}
      >
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-black">
            GESTIÓN DE ACCESORIOS
          </h2>
        </div>
        <p className="text-center text-black italic mt-2">
          Administra accesorios para mascotas disponibles
        </p>
      </div>
      {/* Componente de Accesorios Más Vendidos */}
      <AccesoriosMasVendidos accesorios={accesorios} />


      <div className="bg-white rounded-xl p-6 mb-6" style={{boxShadow: '0 0 8px #9aeb1040, 0 0 0 1px #9ae91133'}}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <input
              value={filtroGlobal}
              onChange={(e) => setFiltroGlobal(e.target.value)}
              placeholder="Buscar accesorios..."
              className="w-full px-4 py-2 border rounded-full"
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
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-800 transition-colors flex items-center gap-2 uppercase"
            onClick={() => abrirModal()}
          >
            <FontAwesomeIcon icon={faPlus} />
            NUEVO ACCESORIO
          </button>
        </div>

        {/* Tabla */}
          <DataTable
            value={filtroAccesorios}
            loading={loading}
            loadingIcon={() => (
              <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Cargando datos...</span>
              </div>
            )}
            globalFilter={filtroGlobal}
            globalFilterFields={['nombre', 'sku', 'categoria']}
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
          >
            <Column
              field="id_producto"
              header="ID"
              body={(rowData) => filtroAccesorios.length - filtroAccesorios.indexOf(rowData)}
              sortable
              className="text-sm"
            />
            <Column field="nombre" header="NOMBRE" sortable className="text-sm" />
            <Column field="sku" header="SKU" sortable className="text-sm" />
            <Column field="categoria" header="CATEGORIA" sortable className="text-sm" />
            <Column
              field="precio"
              header="PRECIO"
              body={(rowData) => `L. ${rowData.precio.toFixed(2)}`}
              sortable
              className="text-sm"
            />
            <Column
              field="stock"
              header="STOCK"
              body={(rowData) => (
                <span className={rowData.stock <= rowData.stock_minimo ? "text-red-500 font-semibold" : ""}>
            {rowData.stock}
                </span>
              )}
              sortable
              className="text-sm text-center"
              bodyClassName="text-center"
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
              body={(rowData, column) => {
                const rowIndex = accesorios.indexOf(rowData);
                return (
                  <ActionMenu
                    rowData={rowData}
                    rowIndex={rowIndex}
                    totalRows={accesorios.length}
                    onEditar={abrirModal}
                    onEliminar={handleEliminar}
                  />
                );
              }}
              className="py-2 pr-9 pl-1 border-b text-sm"
            />
        </DataTable>
      </div>



{/* Modal */}
{modalAbierto &&
  (accesorioEditando ? (
    <ModalEditar
      isOpen={modalAbierto}
      onClose={cerrarModal}
      onSave={handleGuardar}
      editData={accesorioEditando}
      accesoriosExistentes={accesorios} // ✅ AGREGAR ESTA PROP
    />
  ) : (
    <ModalAgregar
      isOpen={modalAbierto}
      onClose={cerrarModal}
      onSave={handleGuardar}
      accesoriosExistentes={accesorios} // ✅ AGREGAR ESTA PROP
    />
  ))}
      </div>
      </div>
  );
};

export default Accesorios;