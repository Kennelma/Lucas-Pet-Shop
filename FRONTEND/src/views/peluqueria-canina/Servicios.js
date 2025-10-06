import React, { useState, useEffect } from 'react';
import { ScissorsIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

import { 
  verServicios,
  insertarServicio,
  actualizarServicio,
  eliminarServicio
} from '../../AXIOS.SERVICES/services-axios.js';

import ModalServicio from './modal_servicio';
import ServiciosSeccion from './ServiciosSeccion';

import './peluqueria-canina.css';

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
      console.log('🔄 Servicios cargados desde BD:', serviciosData); // Para debug
      
      // Obtener estados guardados en localStorage
      const estadosGuardados = JSON.parse(localStorage.getItem('servicios-estados') || '{}');
      console.log('💾 Estados guardados en localStorage:', estadosGuardados);
      
      // Normalizar servicios con estados guardados o por defecto 1 (activo)
      const serviciosNormalizados = serviciosData?.map(servicio => {
        const estadoGuardado = estadosGuardados[servicio.id_servicio_peluqueria_pk];
        const activo = estadoGuardado !== undefined ? estadoGuardado : 1; // Default 1 (activo) si no existe
        
        return {
          ...servicio,
          activo: activo
        };
      }) || [];
      
      console.log('✅ Servicios normalizados:', serviciosNormalizados?.map(s => ({ 
        id: s.id_servicio_peluqueria_pk,
        nombre: s.nombre_servicio_peluqueria, 
        activo: s.activo, 
        tipo: typeof s.activo 
      })));
      
      setServicios(serviciosNormalizados);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: 'No se pudieron cargar los servicios. Intenta nuevamente.',
        confirmButtonColor: '#ef4444'
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

  const handleSubmitServicio = async (formData) => {
    try {
      if (servicioEditando) {
        await actualizarServicio({ 
          id: servicioEditando.id_servicio_peluqueria_pk, 
          ...formData, 
          tipo_servicio: 'PELUQUERIA' 
        });
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El servicio se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await insertarServicio({ ...formData, tipo_servicio: 'PELUQUERIA' });
        await Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El servicio se creó correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      cerrarModalServicio();
      await cargarDatos(); // Esto ya normaliza los datos
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el servicio. Intenta nuevamente.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const actualizarEstadoServicio = async (servicioActualizado) => {
    const nuevoEstado = servicioActualizado.activo; // Mantener el valor 0/1 que viene del toggle
    
    try {
      // Preparar datos para enviar al backend usando la función existente
      const datosParaActualizar = {
        id: servicioActualizado.id_servicio_peluqueria_pk,
        nombre_servicio_peluqueria: servicioActualizado.nombre_servicio_peluqueria,
        descripcion_servicio: servicioActualizado.descripcion_servicio,
        precio_servicio: servicioActualizado.precio_servicio,
        duracion_estimada: servicioActualizado.duracion_estimada,
        requisitos: servicioActualizado.requisitos,
        activo: nuevoEstado, // Este es el cambio principal
        tipo_servicio: 'PELUQUERIA'
      };

      // Guardar en el backend usando la función existente
      const resultado = await actualizarServicio(datosParaActualizar);
      
      if (resultado.Consulta !== false) {
        // Solo actualizar estado local si el backend respondió exitosamente
        setServicios(prev => 
          prev.map(s => 
            s.id_servicio_peluqueria_pk === servicioActualizado.id_servicio_peluqueria_pk 
              ? { ...servicioActualizado, activo: nuevoEstado }
              : s
          )
        );

        // También mantener en localStorage como respaldo
        const estadosGuardados = JSON.parse(localStorage.getItem('servicios-estados') || '{}');
        estadosGuardados[servicioActualizado.id_servicio_peluqueria_pk] = nuevoEstado;
        localStorage.setItem('servicios-estados', JSON.stringify(estadosGuardados));
        
        await Swal.fire({
          icon: 'success',
          title: nuevoEstado === 1 ? '¡Servicio Activado!' : '¡Servicio Desactivado!',
          text: `Estado actualizado en el servidor`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del servicio',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleEliminarServicio = async (servicio) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar servicio?',
      html: `
        <div style="text-align: left; margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <p style="margin-bottom: 8px;"><strong>Nombre:</strong> ${servicio.nombre_servicio_peluqueria}</p>
          <p style="margin-bottom: 8px;"><strong>Precio:</strong> L. ${parseFloat(servicio.precio_servicio || 0).toFixed(2)}</p>
          <p style="margin-bottom: 8px;"><strong>Duración:</strong> ${servicio.duracion_estimada} minutos</p>
          <p style="margin-bottom: 0;"><strong>Descripción:</strong> ${servicio.descripcion_servicio.substring(0, 60)}...</p>
        </div>
        <p style="margin-top: 16px; color: #ef4444; font-weight: bold;">Esta acción no se puede deshacer</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
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
    <div className="peluqueria-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div className="peluqueria-header">
          <div className="icon-container">
            <div className="icon-box">
              <ScissorsIcon style={{ width: '24px', height: '24px', color: '#10b981' }} />
            </div>
          </div>
          <h1 className="peluqueria-title">Servicios de Peluquería Canina</h1>
          <p className="peluqueria-subtitle">Gestiona los servicios de peluquería para mascotas</p>
        </div>

        {loading ? (
          <div className="section">
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando servicios...</p>
            </div>
          </div>
        ) : (
          <ServiciosSeccion
            servicios={servicios}
            abrirModalServicio={abrirModalServicio}
            eliminarServicio={handleEliminarServicio}
            actualizarEstadoServicio={actualizarEstadoServicio}
          />
        )}
      </div>

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