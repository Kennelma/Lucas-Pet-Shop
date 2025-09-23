import React from 'react';
import { ScissorsIcon } from '@heroicons/react/24/outline';

const ServiciosSeccion = ({ servicios, abrirModalServicio, eliminarServicio }) => {
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
          Nuevo Servicio
        </button>
      </div>

      {servicios.length === 0 ? (
        <div className="empty-state">
          <ScissorsIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
          <h3 className="empty-state-title">No hay servicios</h3>
          <p className="empty-state-description">Crea tu primer servicio de peluquería canina.</p>
          <button onClick={() => abrirModalServicio(null)} className="btn btn-success">
            Nuevo Servicio
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {servicios.map((servicio) => (
            <div key={servicio.id_servicio_peluqueria_pk} className="card servicio-card">
              <div className="card-header">
                <h3 className="card-title">{servicio.nombre_servicio_peluqueria}</h3>
              </div>
              <p className="card-description">{servicio.descripcion_servicio}</p>
              <div className="card-actions">
                <button onClick={() => abrirModalServicio(servicio)} className="btn btn-success">
                  Editar
                </button>
                <button onClick={() => eliminarServicio(servicio.id_servicio_peluqueria_pk)} className="btn btn-danger">
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