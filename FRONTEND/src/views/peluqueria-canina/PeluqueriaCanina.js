import React, { useState } from 'react';
import { PlusIcon, SparklesIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { usePromociones } from '../../components/hooks/usePromociones';
import { useServicios } from '../../components/hooks/useServicios';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';

// Importar modales
import ModalNuevaPromocion from './modal_nueva_promocion';
import ModalActualizarPromocion from './modal_actualizar_promocion';
import ModalNuevoServicio from './modal_nuevo_servicio';
import ModalActualizarServicio from './modal_actualizar_servicio';

// Importar estilos específicos
import './peluqueria-canina.css';

const PeluqueriaCanina = () => {
  // Estados para promociones
  const {
    promociones,
    loading: loadingPromociones,
    error: errorPromociones,
    mensaje: mensajePromociones,
    crearPromocion,
    actualizarPromocion,
    eliminarPromocion,
    limpiarMensajes: limpiarMensajesPromociones
  } = usePromociones();

  // Estados para servicios
  const {
    servicios,
    loading: loadingServicios,
    error: errorServicios,
    mensaje: mensajeServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    limpiarMensajes: limpiarMensajesServicios
  } = useServicios();

  // Estados de modales
  const [modalPromocionAbierto, setModalPromocionAbierto] = useState(false);
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);
  const [servicioEditando, setServicioEditando] = useState(null);

  // Handlers para promociones
  const abrirModalPromocion = (promocion = null) => {
    setPromocionEditando(promocion);
    setModalPromocionAbierto(true);
    limpiarMensajesPromociones();
  };

  const cerrarModalPromocion = () => {
    setModalPromocionAbierto(false);
    setPromocionEditando(null);
    limpiarMensajesPromociones();
  };

  const handleEliminarPromocion = async (promocion) => {
    if (window.confirm(`¿Eliminar la promoción "${promocion.nombre_promocion}"?`)) {
      await eliminarPromocion(promocion);
    }
  };

  // Handlers para servicios
  const abrirModalServicio = (servicio = null) => {
    setServicioEditando(servicio);
    setModalServicioAbierto(true);
    limpiarMensajesServicios();
  };

  const cerrarModalServicio = () => {
    setModalServicioAbierto(false);
    setServicioEditando(null);
    limpiarMensajesServicios();
  };

  const handleEliminarServicio = async (servicio) => {
    if (window.confirm(`¿Eliminar el servicio "${servicio.nombre_servicio_peluqueria}"?`)) {
      await eliminarServicio(servicio);
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

        {/* Alerts globales */}
        {(errorPromociones || errorServicios) && (
          <div className="alert alert-error">
            {errorPromociones || errorServicios}
          </div>
        )}
        {(mensajePromociones || mensajeServicios) && (
          <div className="alert alert-success">
            {mensajePromociones || mensajeServicios}
          </div>
        )}

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

          {loadingPromociones ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '8px', color: '#6b7280' }}>Cargando promociones...</p>
            </div>
          ) : promociones.length === 0 ? (
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
                      onClick={() => handleEliminarPromocion(promocion)}
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

          {loadingServicios ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div className="loading-spinner" style={{ borderTopColor: '#10b981' }}></div>
              <p style={{ marginTop: '8px', color: '#6b7280' }}>Cargando servicios...</p>
            </div>
          ) : servicios.length === 0 ? (
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
                      onClick={() => handleEliminarServicio(servicio)}
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
      </div>

      {/* Modales */}
      {modalPromocionAbierto && (
        promocionEditando ? (
          <ModalActualizarPromocion
            promocion={promocionEditando}
            onClose={cerrarModalPromocion}
            onUpdate={actualizarPromocion}
          />
        ) : (
          <ModalNuevaPromocion
            onClose={cerrarModalPromocion}
            onCreate={crearPromocion}
          />
        )
      )}

      {modalServicioAbierto && (
        servicioEditando ? (
          <ModalActualizarServicio
            servicio={servicioEditando}
            onClose={cerrarModalServicio}
            onUpdate={actualizarServicio}
          />
        ) : (
          <ModalNuevoServicio
            onClose={cerrarModalServicio}
            onCreate={crearServicio}
          />
        )
      )}
    </div>
  );
};

export default PeluqueriaCanina;