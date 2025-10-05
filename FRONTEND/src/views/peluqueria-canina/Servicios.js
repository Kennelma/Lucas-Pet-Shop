import React, { useState, useEffect } from 'react';
import { ScissorsIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

// Importar services reales
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../services/apiService.js';

// Importar modales
import ModalServicio from './modal_servicio';

// Importar secciones
import ServiciosSeccion from './ServiciosSeccion';

// Importar CSS personalizado
import './peluqueria-canina.css';

const Servicios = () => {
  // Estados básicos
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de modales
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);

  // Cargar datos al montar componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const serviciosData = await verRegistro("tbl_servicios_peluqueria_canina");
      setServicios(serviciosData || []);
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

  // ==================== HANDLERS PARA SERVICIOS ====================
  
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
        // Actualizar
        await actualizarRegistro("tbl_servicios_peluqueria_canina", servicioEditando.id_servicio_peluqueria_pk, formData);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El servicio se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#10b981'
        });
      } else {
        // Crear nuevo
        await insertarRegistro("tbl_servicios_peluqueria_canina", formData);
        await Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El servicio se creó correctamente',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#10b981'
        });
      }
      
      await cargarDatos();
      cerrarModalServicio();
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

  const eliminarServicio = async (servicio) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar servicio?',
      html: `
        <div style="text-align: left; margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <p style="margin-bottom: 8px;"><strong>📝 Nombre:</strong> ${servicio.nombre_servicio_peluqueria}</p>
          <p style="margin-bottom: 8px;"><strong>💰 Precio:</strong> L. ${parseFloat(servicio.precio_servicio || 0).toFixed(2)}</p>
          <p style="margin-bottom: 8px;"><strong>⏱️ Duración:</strong> ${servicio.duracion_estimada} minutos</p>
          <p style="margin-bottom: 0;"><strong>📋 Descripción:</strong> ${servicio.descripcion_servicio.substring(0, 60)}...</p>
        </div>
        <p style="margin-top: 16px; color: #ef4444; font-weight: bold;">⚠️ Esta acción no se puede deshacer</p>
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
        await borrarRegistro("tbl_servicios_peluqueria_canina", servicio.id_servicio_peluqueria_pk);
        await cargarDatos();
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El servicio fue eliminado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
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

  // ==================== RENDER ====================

  return (
    <div className="peluqueria-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Principal */}
        <div className="peluqueria-header">
          <div className="icon-container">
            <div className="icon-box">
              <ScissorsIcon style={{ width: '24px', height: '24px', color: '#10b981' }} />
            </div>
          </div>
          <h1 className="peluqueria-title">Servicios de Peluquería Canina</h1>
          <p className="peluqueria-subtitle">Gestiona los servicios de peluquería para mascotas</p>
        </div>

        {/* Loading State */}
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
            eliminarServicio={eliminarServicio}
          />
        )}
      </div>

      {/* Modal de Servicio */}
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