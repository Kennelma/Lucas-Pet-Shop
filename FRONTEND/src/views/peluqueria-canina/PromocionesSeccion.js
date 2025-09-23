import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const PromocionesSeccion = ({ promociones, abrirModalPromocion, eliminarPromocion }) => {
  return (
    <div className="section">
      <div className="section-header">
        <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
          <SparklesIcon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
        </div>
        <h2 className="section-title">Promociones</h2>
        <button
          onClick={() => abrirModalPromocion(null)}
          className="btn btn-primary btn-lg"
          style={{ marginLeft: 'auto' }}
        >
          Nueva Promoción
        </button>
      </div>

      {promociones.length === 0 ? (
        <div className="empty-state">
          <SparklesIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
          <h3 className="empty-state-title">No hay promociones</h3>
          <p className="empty-state-description">Crea tu primera promoción para atraer clientes.</p>
          <button onClick={() => abrirModalPromocion(null)} className="btn btn-primary">
            Nueva Promoción
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {promociones.map((promocion) => (
            <div key={promocion.id_promocion_pk} className="card promocion-card">
              <div className="card-header">
                <h3 className="card-title">{promocion.nombre_promocion}</h3>
              </div>
              <p className="card-description">{promocion.descripcion_promocion}</p>
              <div className="card-actions">
                <button onClick={() => abrirModalPromocion(promocion)} className="btn btn-primary">
                  Editar
                </button>
                <button onClick={() => eliminarPromocion(promocion.id_promocion_pk)} className="btn btn-danger">
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

export default PromocionesSeccion;