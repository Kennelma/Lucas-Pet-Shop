import { useState, useEffect } from "react";
import { 
  verServicios, 
  insertarServicio, 
  actualizarServicio, 
  eliminarServicio 
} from "../../AXIOS.SERVICES/services-axios.js";
import Swal from 'sweetalert2';

import PromocionesSeccion from "./PromocionesSeccion";
import ModalPromocion from "./modal_promocion";

const Promociones = () => {
  const [promociones, setPromociones] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [promocionSeleccionada, setPromocionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await verServicios("PROMOCIONES");
      // Normalizar datos numéricos para ordenamiento correcto
      const promocionesNormalizadas = (data || []).map(promocion => ({
        ...promocion,
        precio_promocion: parseFloat(promocion.precio_promocion || 0),
        activo: promocion.activo !== undefined ? Boolean(promocion.activo) : true
      }));
      setPromociones(promocionesNormalizadas);
    } catch (error) {
      console.error("Error al cargar promociones:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las promociones'
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalPromocion = (promocion = null) => {
    setPromocionSeleccionada(promocion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPromocionSeleccionada(null);
  };

  const manejarSubmit = async (datosPromocion) => {
    try {
      let resultado;
      
      if (promocionSeleccionada) {
        // Actualizar promoción existente
        resultado = await actualizarServicio({
          ...datosPromocion,
          id: promocionSeleccionada.id_promocion_pk || promocionSeleccionada.id,
          tipo_servicio: "PROMOCIONES"
        });
      } else {
        // Crear nueva promoción
        resultado = await insertarServicio({
          ...datosPromocion,
          tipo_servicio: "PROMOCIONES"
        });
      }

      if (resultado.Consulta) {
        Swal.fire({
          icon: 'success',
          title: promocionSeleccionada ? 'Promoción actualizada' : 'Promoción creada',
          text: resultado.message || 'Operación completada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        cerrarModal();
        cargarDatos(); // Recargar datos
      } else {
        throw new Error(resultado.error || 'Error en la operación');
      }
    } catch (error) {
      console.error("Error al guardar promoción:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la promoción'
      });
    }
  };

  const actualizarEstadoPromocion = async (promocion) => {
    try {
      const nuevoEstado = !promocion.activo;
      
      // Actualizar en el backend
      const resultado = await actualizarServicio({
        id: promocion.id_promocion_pk,
        nombre_promocion: promocion.nombre_promocion,
        descripcion_promocion: promocion.descripcion_promocion,
        precio_promocion: promocion.precio_promocion,
        dias_promocion: promocion.dias_promocion,
        activo: nuevoEstado,
        tipo_servicio: "PROMOCIONES"
      });

      if (resultado.Consulta) {
        // Actualizar estado local
        setPromociones(prev => 
          prev.map(p => 
            p.id_promocion_pk === promocion.id_promocion_pk 
              ? { ...p, activo: nuevoEstado }
              : p
          )
        );

        Swal.fire({
          icon: 'success',
          title: nuevoEstado ? '¡Promoción Activada!' : '¡Promoción Desactivada!',
          text: 'Estado actualizado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(resultado.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el estado de la promoción'
      });
    }
  };

  const eliminarPromocion = async (promocion) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar promoción?',
        html: `
          <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
            <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${promocion.nombre_promocion}</p>
            <p class="mb-1 text-sm"><span class="font-bold">Precio:</span> L. ${parseFloat(promocion.precio_promocion || 0).toFixed(2)}</p>
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
        const resultado = await eliminarServicio(
          promocion.id_promocion_pk || promocion.id, 
          "PROMOCIONES"
        );

        if (resultado.Consulta) {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'La promoción ha sido eliminada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          cargarDatos(); // Recargar datos
        } else {
          throw new Error(resultado.error || 'Error al eliminar');
        }
      }
    } catch (error) {
      console.error("Error al eliminar promoción:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar la promoción'
      });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Cargando promociones...</span>
        </div>
      ) : (
        <PromocionesSeccion
          promociones={promociones}
          abrirModalPromocion={abrirModalPromocion}
          eliminarPromocion={eliminarPromocion}
          actualizarEstadoPromocion={actualizarEstadoPromocion}
        />
      )}

      <ModalPromocion
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onSubmit={manejarSubmit}
        promocion={promocionSeleccionada}
      />
    </div>
  );
};

export default Promociones;