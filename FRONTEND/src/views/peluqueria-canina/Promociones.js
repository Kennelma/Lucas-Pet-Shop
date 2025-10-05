import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

// Importar services reales
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../services/apiService.js';

// Importar modales
import ModalPromocion from './modal_promocion';

// Importar secciones
import PromocionesSeccion from './PromocionesSeccion';

// Importar CSS personalizado
import './peluqueria-canina.css';

const Promociones = () => {
  // Estados básicos
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de modales
  const [modalPromocionAbierto, setModalPromocionAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);

  // Cargar datos al montar componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const promocionesData = await verRegistro("tbl_promociones");
      setPromociones(promocionesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: 'No se pudieron cargar las promociones. Intenta nuevamente.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS PARA PROMOCIONES ====================
  
  const abrirModalPromocion = (promocion = null) => {
    setPromocionEditando(promocion);
    setModalPromocionAbierto(true);
  };

  const cerrarModalPromocion = () => {
    setModalPromocionAbierto(false);
    setPromocionEditando(null);
  };

  const handleSubmitPromocion = async (formData) => {
    try {
      if (promocionEditando) {
        // Actualizar
        await actualizarRegistro("tbl_promociones", promocionEditando.id_promocion_pk, formData);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'La promoción se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#3b82f6'
        });
      } else {
        // Crear nuevo
        await insertarRegistro("tbl_promociones", formData);
        await Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'La promoción se creó correctamente',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#3b82f6'
        });
      }
      
      await cargarDatos();
      cerrarModalPromocion();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la promoción. Intenta nuevamente.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const eliminarPromocion = async (promocion) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar promoción?',
      html: `
        <div style="text-align: left; margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <p style="margin-bottom: 8px;"><strong>📝 Nombre:</strong> ${promocion.nombre_promocion}</p>
          <p style="margin-bottom: 8px;"><strong>💰 Precio:</strong> L. ${parseFloat(promocion.precio_promocion || 0).toFixed(2)}</p>
          <p style="margin-bottom: 8px;"><strong>⏱️ Duración:</strong> ${promocion.dias_promocion} días</p>
          <p style="margin-bottom: 0;"><strong>📋 Descripción:</strong> ${promocion.descripcion_promocion.substring(0, 60)}...</p>
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
        await borrarRegistro("tbl_promociones", promocion.id_promocion_pk);
        await cargarDatos();
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'La promoción fue eliminada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la promoción',
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
              <SparklesIcon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            </div>
          </div>
          <h1 className="peluqueria-title">Promociones</h1>
          <p className="peluqueria-subtitle">Gestiona las promociones especiales para tus clientes</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="section">
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando promociones...</p>
            </div>
          </div>
        ) : (
          <PromocionesSeccion
            promociones={promociones}
            abrirModalPromocion={abrirModalPromocion}
            eliminarPromocion={eliminarPromocion}
          />
        )}
      </div>

      {/* Modal de Promoción */}
      <ModalPromocion
        isOpen={modalPromocionAbierto}
        onClose={cerrarModalPromocion}
        onSubmit={handleSubmitPromocion}
        promocion={promocionEditando}
      />
    </div>
  );
};

export default Promociones;