import React, { useState, useEffect } from 'react';
import { PlusIcon, SparklesIcon, ScissorsIcon } from '@heroicons/react/24/outline';

// Importar services reales
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../services/apiService.js';

// Importar modales simplificados
import ModalPromocion from './modal_promocion';
import ModalServicio from './modal_servicio';

// Importar CSS personalizado
import './peluqueria-canina.css';

const PeluqueriaCanina = () => {
  // Estados básicos
  const [promociones, setPromociones] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de modales
  const [modalPromocionAbierto, setModalPromocionAbierto] = useState(false);
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);
  const [servicioEditando, setServicioEditando] = useState(null);

  // Cargar datos al montar componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [promocionesData, serviciosData] = await Promise.all([
        verRegistro("tbl_promociones"),
        verRegistro("tbl_servicios_peluqueria_canina")
      ]);
      
      setPromociones(promocionesData || []);
      setServicios(serviciosData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para promociones
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
      } else {
        // Crear nuevo
        await insertarRegistro("tbl_promociones", formData);
      }
      
      await cargarDatos(); // Recargar datos
      cerrarModalPromocion();
      alert(promocionEditando ? 'Promoción actualizada' : 'Promoción creada');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar promoción');
    }
  };

  const eliminarPromocion = async (promocion) => {
    if (window.confirm(`¿Eliminar "${promocion.nombre_promocion}"?`)) {
      try {
        await borrarRegistro("tbl_promociones", promocion.id_promocion_pk);
        await cargarDatos();
        alert('Promoción eliminada');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar promoción');
      }
    }
  };

  // Handlers para servicios
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
      } else {
        // Crear nuevo
        await insertarRegistro("tbl_servicios_peluqueria_canina", formData);
      }
      
      await cargarDatos(); // Recargar datos
      cerrarModalServicio();
      alert(servicioEditando ? 'Servicio actualizado' : 'Servicio creado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar servicio');
    }
  };

  const eliminarServicio = async (servicio) => {
    if (window.confirm(`¿Eliminar "${servicio.nombre_servicio_peluqueria}"?`)) {
      try {
        await borrarRegistro("tbl_servicios_peluqueria_canina", servicio.id_servicio_peluqueria_pk);
        await cargarDatos();
        alert('Servicio eliminado');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar servicio');
      }
    }
  };

  return (
    <div className="peluqueria-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Principal */}
        <div className="peluqueria-header">
          <div className="icon-container">
            <div className="icon-box">
              <SparklesIcon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
              <ScissorsIcon style={{ width: '24px', height: '24px', color: '#10b981' }} />
            </div>
            <h1 className="peluqueria-title">Peluquería Canina</h1>
          </div>
          <p className="peluqueria-subtitle">Gestiona promociones y servicios de peluquería para mascotas</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="section">
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando datos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Sección Promociones */}
            <div className="section">
              <div className="section-header">
                <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
                  <SparklesIcon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                </div>
                <h2 className="section-title">Promociones</h2>
                <button
                  onClick={() => abrirModalPromocion()}
                  className="btn btn-primary btn-lg"
                  style={{ marginLeft: 'auto' }}
                >
                  <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Nueva Promoción
                </button>
              </div>

              {promociones.length === 0 ? (
                <div className="empty-state">
                  <SparklesIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
                  <h3 className="empty-state-title">No hay promociones</h3>
                  <p className="empty-state-description">Crea tu primera promoción para atraer clientes.</p>
                  <button onClick={() => abrirModalPromocion()} className="btn btn-primary">
                    Nueva Promoción
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {promociones.map((promocion) => (
                    <div key={promocion.id_promocion_pk} className="card promocion-card">
                      <div className="card-header">
                        <h3 className="card-title">{promocion.nombre_promocion}</h3>
                        <div className="badge badge-blue">
                          <SparklesIcon style={{ width: '12px', height: '12px' }} />
                          Promoción
                        </div>
                      </div>
                      
                      <p className="card-description">{promocion.descripcion_promocion}</p>
                      
                      <div className="card-details">
                        <div className="detail-row">
                          <span className="detail-label">Precio:</span>
                          <span className="detail-value detail-price">${parseFloat(promocion.precio_promocion).toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Duración:</span>
                          <span className="detail-value detail-duration">{promocion.dias_promocion} días</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button
                          onClick={() => abrirModalPromocion(promocion)}
                          className="btn btn-primary"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarPromocion(promocion)}
                          className="btn btn-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sección Servicios */}
            <div className="section">
              <div className="section-header">
                <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
                  <ScissorsIcon style={{ width: '24px', height: '24px', color: '#10b981' }} />
                </div>
                <h2 className="section-title">Servicios</h2>
                <button
                  onClick={() => abrirModalServicio()}
                  className="btn btn-success btn-lg"
                  style={{ marginLeft: 'auto' }}
                >
                  <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Nuevo Servicio
                </button>
              </div>

              {servicios.length === 0 ? (
                <div className="empty-state">
                  <ScissorsIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
                  <h3 className="empty-state-title">No hay servicios</h3>
                  <p className="empty-state-description">Crea tu primer servicio de peluquería canina.</p>
                  <button onClick={() => abrirModalServicio()} className="btn btn-success">
                    Nuevo Servicio
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {servicios.map((servicio) => (
                    <div key={servicio.id_servicio_peluqueria_pk} className="card servicio-card">
                      <div className="card-header">
                        <h3 className="card-title">{servicio.nombre_servicio_peluqueria}</h3>
                        <div className="badge badge-green">
                          <ScissorsIcon style={{ width: '12px', height: '12px' }} />
                          Servicio
                        </div>
                      </div>
                      
                      <p className="card-description">{servicio.descripcion_servicio}</p>
                      
                      <div className="card-actions">
                        <button
                          onClick={() => abrirModalServicio(servicio)}
                          className="btn btn-success"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarServicio(servicio)}
                          className="btn btn-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <ModalPromocion
        isOpen={modalPromocionAbierto}
        onClose={cerrarModalPromocion}
        onSubmit={handleSubmitPromocion}
        promocion={promocionEditando}
      />

      <ModalServicio
        isOpen={modalServicioAbierto}
        onClose={cerrarModalServicio}
        onSubmit={handleSubmitServicio}
        servicio={servicioEditando}
      />
    </div>
  );
};

export default PeluqueriaCanina;