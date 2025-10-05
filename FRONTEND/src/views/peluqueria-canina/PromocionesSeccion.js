import React from 'react';
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const PromocionesSeccion = ({ promociones, abrirModalPromocion, eliminarPromocion }) => {
  
  const handleEliminar = (promocion) => {
    eliminarPromocion(promocion);
  };

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
          <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Nueva Promoción
        </button>
      </div>

      {promociones.length === 0 ? (
        <div className="empty-state">
          <SparklesIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
          <h3 className="empty-state-title">No hay promociones</h3>
          <p className="empty-state-description">Crea tu primera promoción para atraer clientes.</p>
          <button onClick={() => abrirModalPromocion(null)} className="btn btn-primary">
            <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Nueva Promoción
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {promociones.map((promocion) => (
            <div key={promocion.id_promocion_pk} className="card promocion-card">
              <div className="card-header">
                <h3 className="card-title">
                  <SparklesIcon style={{ width: '18px', height: '18px', display: 'inline', marginRight: '6px', color: '#3b82f6' }} />
                  {promocion.nombre_promocion}
                </h3>
                <div className={`badge ${promocion.activo ? 'badge-blue' : 'badge-gray'}`}>
                  <SparklesIcon style={{ width: '12px', height: '12px' }} />
                  {promocion.activo ? 'Activa' : 'Inactiva'}
                </div>
              </div>
              
              <p className="card-description">{promocion.descripcion_promocion}</p>
              
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">
                    <CurrencyDollarIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                    Precio:
                  </span>
                  <span className="detail-value detail-price">
                    L. {parseFloat(promocion.precio_promocion || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">
                    <CalendarDaysIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                    Duración:
                  </span>
                  <span className="detail-value detail-duration">
                    {promocion.dias_promocion} días
                  </span>
                </div>
              </div>
              
              <div className="card-actions">
                <button onClick={() => abrirModalPromocion(promocion)} className="btn btn-primary">
                  <PencilIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                  Editar
                </button>
                <button onClick={() => handleEliminar(promocion)} className="btn btn-danger">
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

export default PromocionesSeccion;