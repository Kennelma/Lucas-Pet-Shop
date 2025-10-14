import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

import ModalNuevoAnimal from "./modal_nuevo_animal";
import ModalActualizarAnimal from "./modal_actualizar_animal";

import {
  verProductos,
  eliminarProducto,
  actualizarProducto,
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
    <div className="p-6 text-sm">
      {/* Contenedor título separado */}
      <div className="mb-6">
        <h1 className="text-center text-xl font-bold uppercase">INVENTARIO DE ANIMALES</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <InputText
            value={filtroGlobal}
            onChange={(e) => setFiltroGlobal(e.target.value)}
            placeholder="Buscar animales..."
            className="w-80 text-sm"
          />
          <Button
            label="+ Nuevo Animal"
            className="bg-green-500 hover:bg-green-600 text-white border-none px-4 py-2"
            onClick={() => abrirModal()}
          />
        </div>

        {/* Tabla */}
        <DataTable 
          value={filtroAnimales} 
          loading={loading}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[5, 10, 20]}
          totalRecords={filtroAnimales.length}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="({currentPage} of {totalPages})"
          className="text-sm"
        >
          {/* ID oculto */}
          {/* <Column field="id_producto" header="ID" style={{ display: 'none' }} /> */}
          <Column field="nombre" header="Nombre" sortable />
          <Column field="sku" header="SKU" sortable />
          <Column field="especie" header="Especie" sortable />
          <Column
            field="precio"
            header="Precio"
            body={(rowData) => `L. ${rowData.precio.toFixed(2)}`}
            sortable
            style={{ width: '100px' }}
          />
          <Column
            field="stock"
            header="Stock"
            body={(rowData) => (
              <span className={rowData.stock <= rowData.stock_minimo ? "text-red-500 font-semibold" : ""}>
                {rowData.stock}
              </span>
            )}
            sortable
            style={{ width: '80px' }}
          />
          <Column
            field="activo"
            header="Estado"
            body={(rowData) => (
              <div className="flex items-center gap-2">
                <InputSwitch
                  checked={rowData.activo === 1}
                  onChange={(e) => actualizarEstadoAnimal(rowData, e.value)}
                  className="p-inputswitch-checked:bg-green-500"
                />
                <span>{rowData.activo === 1 ? "Activo" : "Inactivo"}</span>
              </div>
            )}
            style={{ width: '120px' }}
          />
          <Column
            header="Acciones"
            body={(rowData) => (
              <div className="flex gap-1">
                <button
                  className="text-blue-500 hover:text-blue-700 p-2 rounded"
                  onClick={() => abrirModal(rowData)}
                >
                  <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 p-2 rounded"
                  onClick={() => handleEliminar(rowData)}
                >
                  <FontAwesomeIcon icon={faTrash} size="lg" />
                </button>
              </div>
            )}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      {/* Modal */}
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
