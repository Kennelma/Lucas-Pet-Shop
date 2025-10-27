import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

import ModalAgregar from "./ModalAgregar";
import ModalEditar from "./ModalEditar";

import {
  verProductos,
  eliminarProducto,
  actualizarProducto,
} from "../../../AXIOS.SERVICES/products-axios";

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
  }, []);

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
    setAccesorioEditando(accesorio);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAccesorioEditando(null);
  };

  const handleGuardar = async () => {
    await cargarDatos();
    cerrarModal();
  };

  const handleEliminar = async (accesorio) => {
    const result = await Swal.fire({
      title: "¿Eliminar accesorio?",
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${accesorio.nombre}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Categoría:</span> ${accesorio.categoria}</p>
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
        cancelButton: "p-button-text p-button p-component",
      },
    });

    if (result.isConfirmed) {
      try {
        const resp = await eliminarProducto(accesorio.id_producto);
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
    try {
      const payload = {
        id_producto: accesorio.id_producto,
        tipo_producto: "ACCESORIOS",
        activo: nuevoEstado ? 1 : 0,
      };

      const resultado = await actualizarProducto(payload);

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
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Título */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-3" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            INVENTARIO DE ACCESORIOS
          </h2>
        </div>
        <p className="text-center text-gray-600 italic">Administra accesorios para mascotas disponibles</p>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
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
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
            onClick={() => abrirModal()}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nuevo Accesorio
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
              body={(rowData) => (
                <div className="flex items-center space-x-2 w-full">
            <button
              className="text-blue-500 hover:text-blue-700 p-2 rounded transition-colors"
              onClick={(e) => {
                    e.stopPropagation();
                    abrirModal(rowData);
                  }}
                >
                  <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminar(rowData);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} size="lg" />
                </button>
              </div>
            )}
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
          />
        ) : (
          <ModalAgregar
            isOpen={modalAbierto}
            onClose={cerrarModal}
            onSave={handleGuardar}
          />
        ))}
    </div>
  );
};

export default Accesorios;