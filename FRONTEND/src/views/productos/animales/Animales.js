import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { Dialog } from "primereact/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

import ModalNuevoAnimal from "./modal_nuevo_animal";
import ModalActualizarAnimal from "./modal_actualizar_animal";
import AnimalesMasVendidos from "./AnimalesMasVendidos";

import {
  verProductos,
  eliminarProducto,
  actualizarProducto,
  insertarProducto,
} from "../../../AXIOS.SERVICES/products-axios";

const Animales = () => {
  const [animales, setAnimales] = useState([]);
  const [filtroGlobal, setFiltroGlobal] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [animalEditando, setAnimalEditando] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5);

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
            onChange={() => actualizarEstadoAnimal(rowData, !rowData.activo)}
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
      const productos = await verProductos("ANIMALES");
      
      const normalizados = (productos || []).map((item) => ({
        id_producto: item.id_producto_pk,
        nombre: item.nombre_producto,
        precio: parseFloat(item.precio_producto || 0),
        stock: parseInt(item.stock || 0),
        stock_minimo: parseInt(item.stock_minimo || 0),
        activo: item.activo === 1 || item.activo === "1" ? 1 : 0,
        especie: item.especie || "No especificada",
        sexo: item.sexo || "N/A",
        sku: item.sku || "",
      }));
      setAnimales(normalizados);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los animales",
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (animal = null) => {
    setAnimalEditando(animal);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAnimalEditando(null);
  };

  const handleGuardar = async () => {
    await cargarDatos();
    cerrarModal();
  };

  const handleEliminar = async (animal) => {
    const result = await Swal.fire({
      title: "¿Eliminar animal?",
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${animal.nombre}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Especie:</span> ${animal.especie}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Precio:</span> L. ${animal.precio.toFixed(2)}</p>
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
        const resp = await eliminarProducto(animal.id_producto);
        if (resp.Consulta) {
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El animal fue eliminado correctamente",
            timer: 1800,
            showConfirmButton: false,
          });
          await cargarDatos();
        } else throw new Error(resp.error || "Error al eliminar");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo eliminar el animal",
        });
      }
    }
  };

  const actualizarEstadoAnimal = async (animal, nuevoEstado) => {
    try {
      
      const payload = {
        id_producto: animal.id_producto,
        tipo_producto: "ANIMALES",
        activo: nuevoEstado ? 1 : 0,
      };

      const resultado = await actualizarProducto(payload);

      if (resultado.Consulta) {
        setAnimales((prev) =>
          prev.map((a) =>
            a.id_producto === animal.id_producto
              ? { ...a, activo: nuevoEstado ? 1 : 0 }
              : a
          )
        );

        Swal.fire({
          icon: 'success',
          title: nuevoEstado ? '¡Animal Activado!' : '¡Animal Desactivado!',
          text: 'Estado actualizado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      } else throw new Error(resultado.error || 'Error al actualizar estado');
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el estado del animal",
      });
    }
  };

  const filtroAnimales = animales.filter(
    (a) =>
      a.nombre.toLowerCase().includes(filtroGlobal.toLowerCase()) ||
      a.sku.toLowerCase().includes(filtroGlobal.toLowerCase()) ||
      a.especie.toLowerCase().includes(filtroGlobal.toLowerCase())
  );

  const onPageChange = (e) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
     {/* Título */}
      <div className="bg-gradient-to-r from-purple-50 rounded-xl p-6 mb-3" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            INVENTARIO DE ANIMALES
          </h2>
        </div>
        <p className="text-center text-gray-600 italic">Administra el inventario de mascotas disponibles para venta</p>
      </div>

      {/* Componente de Animales Más Vendidos */}
      <AnimalesMasVendidos animales={animales} />

      <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <input
              value={filtroGlobal}
              onChange={(e) => setFiltroGlobal(e.target.value)}
              placeholder="Buscar animales..."
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
            Nuevo Animal
          </button>
        </div>

        {/* Tabla */}
        <DataTable
          value={filtroAnimales}
          loading={loading}
          loadingIcon={() => (
            <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              <span>Cargando datos...</span>
            </div>
          )}
          globalFilter={filtroGlobal}
          globalFilterFields={['nombre', 'sku', 'especie']}
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
            body={(rowData) => filtroAnimales.indexOf(rowData) + 1} 
            sortable 
            className="text-sm"
          />
          <Column field="nombre" header="Nombre" sortable className="text-sm" />
          <Column field="sku" header="SKU" sortable className="text-sm" />
          <Column field="especie" header="Especie" sortable className="text-sm" />
          <Column field="sexo" header="Sexo" sortable className="text-sm" />
          <Column
            field="precio"
            header="Precio"
            body={(rowData) => `L. ${rowData.precio.toFixed(2)}`}
            sortable
            className="text-sm"
          />
          <Column
            field="stock"
            header="Stock"
            body={(rowData) => (
              <span className={rowData.stock <= rowData.stock_minimo ? 'text-red-500 font-semibold' : ''}>
                {rowData.stock}
              </span>
            )}
            sortable
            className="text-sm text-center"
            bodyClassName="text-center"
          />
          <Column
            field="activo"
            header="Estado"
            body={estadoTemplate}
            sortable
            sortField="activo"
            className="text-sm"
          />
          <Column
            header="Acciones"
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

      {/* Modales */}
      {modalAbierto &&
        (animalEditando ? (
          <ModalActualizarAnimal
            isOpen={modalAbierto}
            onClose={cerrarModal}
            onSave={handleGuardar}
            editData={animalEditando}
          />
        ) : (
          <ModalNuevoAnimal
            isOpen={modalAbierto}
            onClose={cerrarModal}
            onSave={handleGuardar}
          />
        ))}
    </div>
  );
};

export default Animales;
