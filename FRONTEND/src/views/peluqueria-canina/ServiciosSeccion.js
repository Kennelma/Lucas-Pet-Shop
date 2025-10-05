import React from 'react';
import { 
  ScissorsIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ServiciosSeccion = ({ servicios, abrirModalServicio, eliminarServicio }) => {
  
  const handleEliminar = (servicio) => {
    eliminarServicio(servicio);
  };

  return (
    <div className="section">
      <div className="section-header">
        <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
          <ScissorsIcon style={{ width: '24px', height: '24px', color: '#10b981' }} />
        </div>
        <h2 className="section-title">Servicios</h2>
        <button
          onClick={() => abrirModalServicio(null)}
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
          <button onClick={() => abrirModalServicio(null)} className="btn btn-success">
            <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Nuevo Servicio
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {servicios.map((servicio) => (
            <div key={servicio.id_servicio_peluqueria_pk} className="card servicio-card">
              <div className="card-header">
                <h3 className="card-title">
                  <WrenchScrewdriverIcon style={{ width: '18px', height: '18px', display: 'inline', marginRight: '6px', color: '#059669' }} />
                  {servicio.nombre_servicio_peluqueria}
                </h3>
                <div className={`badge ${servicio.activo ? 'badge-green' : 'badge-gray'}`}>
                  <ScissorsIcon style={{ width: '12px', height: '12px' }} />
                  {servicio.activo ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              
              <p className="card-description">{servicio.descripcion_servicio}</p>
              
              {/* Detalles ampliados */}
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">
                    <CurrencyDollarIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                    Precio:
                  </span>
                  <span className="detail-value detail-price">
                    L. {parseFloat(servicio.precio_servicio || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">
                    <ClockIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                    Duración:
                  </span>
                  <span className="detail-value detail-duration">
                    {servicio.duracion_estimada} min
                  </span>
                </div>
                {servicio.requisitos && (
                  <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="detail-label">
                      <ShieldCheckIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                      Requisitos:
                    </span>
                    <span className="detail-value" style={{ fontSize: '0.8rem', marginTop: '4px', lineHeight: '1.4' }}>
                      {servicio.requisitos}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="card-actions">
                <button onClick={() => abrirModalServicio(servicio)} className="btn btn-success">
                  <PencilIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                  Editar
                </button>
                <button onClick={() => handleEliminar(servicio)} className="btn btn-danger">
                  <TrashIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiciosSeccion;