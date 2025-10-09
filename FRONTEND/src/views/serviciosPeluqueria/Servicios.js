import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

import { 
  verServicios,
  insertarServicio,
  actualizarServicio,
  eliminarServicio
} from '../../AXIOS.SERVICES/services-axios.js';

import ModalServicio from './modal_servicio';
import ServiciosSeccion from './ServiciosSeccion';
import ServiciosFavoritos from './ServiciosFavoritos';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const serviciosData = await verServicios('PELUQUERIA');
      // Normalizar datos numéricos para ordenamiento correcto
      const serviciosNormalizados = (serviciosData || []).map(servicio => {
        
        return {
          ...servicio,
          precio_servicio: parseFloat(servicio.precio_servicio || 0),
          duracion_estimada: parseInt(servicio.duracion_estimada || 0),
          activo: servicio.activo !== undefined ? Boolean(servicio.activo) : true
        };
      }) || [];
      
      setServicios(serviciosNormalizados);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los servicios'
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalServicio = (servicio = null) => {
    setServicioEditando(servicio);
    setModalServicioAbierto(true);
  };

  const cerrarModalServicio = () => {
    setModalServicioAbierto(false);
    setServicioEditando(null);
  };

  const handleSubmitServicio = async (datosServicio) => {
    try {
      let resultado;
      
      if (servicioEditando) {
        // Actualizar servicio existente
        resultado = await actualizarServicio({
          ...datosServicio,
          id: servicioEditando.id_servicio_peluqueria_pk || servicioEditando.id,
          tipo_servicio: "PELUQUERIA"
        });
      } else {
        // Crear nuevo servicio
        resultado = await insertarServicio({
          ...datosServicio,
          tipo_servicio: "PELUQUERIA"
        });
      }

      if (resultado.Consulta) {
        Swal.fire({
          icon: 'success',
          title: servicioEditando ? 'Servicio actualizado' : 'Servicio creado',
          text: resultado.message || 'Operación completada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        cerrarModalServicio();
        cargarDatos(); // Recargar datos
      } else {
        throw new Error(resultado.error || 'Error en la operación');
      }
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar el servicio'
      });
    }
  };

  const actualizarEstadoServicio = async (servicio) => {
    try {
      const nuevoEstado = !servicio.activo;
      
      // Actualizar en el backend
      const resultado = await actualizarServicio({
        id: servicio.id_servicio_peluqueria_pk,
        nombre_servicio_peluqueria: servicio.nombre_servicio_peluqueria,
        descripcion_servicio: servicio.descripcion_servicio,
        precio_servicio: servicio.precio_servicio,
        duracion_estimada: servicio.duracion_estimada,
        requisitos: servicio.requisitos,
        activo: nuevoEstado,
        tipo_servicio: "PELUQUERIA"
      });

      if (resultado.Consulta) {
        // Actualizar estado local
        setServicios(prev => 
          prev.map(s => 
            s.id_servicio_peluqueria_pk === servicio.id_servicio_peluqueria_pk 
              ? { ...s, activo: nuevoEstado }
              : s
          )
        );

        Swal.fire({
          icon: 'success',
          title: nuevoEstado ? '¡Servicio Activado!' : '¡Servicio Desactivado!',
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
        text: error.message || 'No se pudo actualizar el estado del servicio'
      });
    }
  };

  const handleEliminarServicio = async (servicio) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar servicio?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${servicio.nombre_servicio_peluqueria}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Precio:</span> L. ${parseFloat(servicio.precio_servicio || 0).toFixed(2)}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Duración:</span> ${servicio.duracion_estimada} min</p>
          <p class="mb-0 text-sm"><span class="font-bold">Descripción:</span> ${servicio.descripcion_servicio.substring(0, 40)}...</p>
        </div>
        <p class="mt-2 text-red-500 font-bold text-xs">Esta acción no se puede deshacer</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      width: 380,
      padding: '16px'
    });

    if (result.isConfirmed) {
      try {
        await eliminarServicio(servicio.id_servicio_peluqueria_pk, 'PELUQUERIA');
        await Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El servicio fue eliminado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        await cargarDatos();
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el servicio',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Cargando servicios...</span>
        </div>
      ) : (
        <>
          {/* Dashboard de Servicios Favoritos */}
          <ServiciosFavoritos servicios={servicios} />
          
          {/* Tabla de Servicios */}
          <ServiciosSeccion
            servicios={servicios}
            abrirModalServicio={abrirModalServicio}
            eliminarServicio={handleEliminarServicio}
            actualizarEstadoServicio={actualizarEstadoServicio}
          />
        </>
      )}

      <ModalServicio
        isOpen={modalServicioAbierto}
        onClose={cerrarModalServicio}
        onSubmit={handleSubmitServicio}
        servicio={servicioEditando}
      />
    </div>
  );
};

export default Servicios;