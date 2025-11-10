import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ModalNotificaciones = ({ isOpen, onClose, notificaciones, onMarcarLeida }) => {
  
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora - fechaNotif;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    
    return fechaNotif.toLocaleDateString('es-HN', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatearMensajeHTML = (mensaje, tipo) => {
    if (tipo === 'STOCK_BAJOS') {
      const match = mensaje.match(/EL PRODUCTO (.+?) TIENE UN STOCK = (\d+)/i);
      if (match) {
        const producto = match[1].trim();
        const stock = match[2];
        return (
          <span style={{ lineHeight: '1.5' }}>
            El producto <strong style={{ color: '#dc2626' }}>{producto}</strong> tiene un stock de{' '}
            <strong style={{ color: '#dc2626' }}>{stock}</strong> unidades
          </span>
        );
      }
    } else if (tipo === 'LOTE_VENCIDO') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?), TIENE EL (.+?) VENCIDO/i);
      if (match) {
        const medicamento = match[1].trim();
        const lote = match[2].trim();
        return (
          <span style={{ lineHeight: '1.5' }}>
            El medicamento <strong style={{ color: '#dc2626' }}>{medicamento}</strong> tiene el lote{' '}
            <strong>{lote}</strong> vencido
          </span>
        );
      }
    } else if (tipo === 'LOTE_PROXIMO_VENCER') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?) CON EL (.+?), SE VENCE EN (\d+) DÍAS/i);
      if (match) {
        const medicamento = match[1].trim();
        const lote = match[2].trim();
        const dias = match[3];
        
        let color = '#dc2626';
        if (dias === '90') color = '#2563eb';
        else if (dias === '60') color = '#ca8a04';
        
        return (
          <span style={{ lineHeight: '1.5' }}>
            El medicamento <strong style={{ color }}>{medicamento}</strong> con el lote{' '}
            <strong>{lote}</strong> se vence en <strong style={{ color }}>{dias} días</strong>
          </span>
        );
      }
    }
    
    return mensaje;
  };

  const getIconoSVG = (tipo) => {
    // Triángulo de advertencia para STOCK BAJO (más pequeño)
    if (tipo === 'STOCK_BAJOS') {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 20h20L12 2z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5"/>
          <path d="M12 9v5M12 17h.01" stroke="#78350F" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    
    // Alarma ROJA para LOTE VENCIDO (más pequeña)
    if (tipo === 'LOTE_VENCIDO') {
      return (
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base gris */}
          <rect x="20" y="42" width="24" height="8" rx="2" fill="#9CA3AF"/>
          <rect x="18" y="48" width="28" height="4" rx="1" fill="#6B7280"/>
          
          {/* Campana roja */}
          <path d="M32 12 Q22 12 22 24 L22 38 Q22 42 26 42 L38 42 Q42 42 42 38 L42 24 Q42 12 32 12 Z" fill="#DC2626"/>
          
          {/* Signo de exclamación */}
          <rect x="30" y="20" width="4" height="12" rx="2" fill="white"/>
          <circle cx="32" cy="36" r="2.5" fill="white"/>
          
          {/* Líneas de vibración izquierda */}
          <line x1="14" y1="18" x2="18" y2="22" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="12" y1="26" x2="18" y2="26" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="14" y1="34" x2="18" y2="30" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          
          {/* Líneas de vibración derecha */}
          <line x1="50" y1="18" x2="46" y2="22" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="26" x2="46" y2="26" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="34" x2="46" y2="30" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      );
    }
    
    // Alarma NARANJA para LOTE PRÓXIMO A VENCER (más pequeña)
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      return (
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base gris */}
          <rect x="20" y="42" width="24" height="8" rx="2" fill="#9CA3AF"/>
          <rect x="18" y="48" width="28" height="4" rx="1" fill="#6B7280"/>
          
          {/* Campana naranja */}
          <path d="M32 12 Q22 12 22 24 L22 38 Q22 42 26 42 L38 42 Q42 42 42 38 L42 24 Q42 12 32 12 Z" fill="#F59E0B"/>
          
          {/* Signo de exclamación */}
          <rect x="30" y="20" width="4" height="12" rx="2" fill="white"/>
          <circle cx="32" cy="36" r="2.5" fill="white"/>
          
          {/* Líneas de vibración izquierda */}
          <line x1="14" y1="18" x2="18" y2="22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="12" y1="26" x2="18" y2="26" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="14" y1="34" x2="18" y2="30" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          
          {/* Líneas de vibración derecha */}
          <line x1="50" y1="18" x2="46" y2="22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="26" x2="46" y2="26" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="34" x2="46" y2="30" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      );
    }
    
    return null;
  };

  const getColorInfo = (plantillaId) => {
    switch(plantillaId) {
      case 1: return { bg: '#fef2f2', badge: '#dc2626' };
      case 2: return { bg: '#fefce8', badge: '#ca8a04' };
      case 3: return { bg: '#eff6ff', badge: '#2563eb' };
      case 4: return { bg: '#fef2f2', badge: '#dc2626' };
      default: return { bg: '#f9fafb', badge: '#6b7280' };
    }
  };

  const getTextoPrioridad = (plantillaId) => {
    switch(plantillaId) {
      case 1: return 'Urgente';
      case 2: return 'Importante';
      case 3: return 'Recordatorio';
      case 4: return 'Vencido';
      default: return 'Notificación';
    }
  };

  const header = (
    <div className="w-full text-center text-lg font-bold">
      TODAS LAS NOTIFICACIONES
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button 
        label="Cerrar" 
        icon="pi pi-times" 
        className="p-button-text p-button-rounded" 
        onClick={onClose} 
      />
    </div>
  );

  return (
    <Dialog
      header={header}
      visible={isOpen}
      style={{ width: '32rem', maxWidth: '90vw', borderRadius: '1.5rem' }}
      modal
      onHide={onClose}
      footer={footer}
      position="center"
      draggable={false}
      resizable={false}
      contentStyle={{ 
        maxHeight: '70vh', 
        overflowY: 'auto', 
        padding: '0.5rem'
      }}
    >
      {notificaciones.length === 0 ? (
        <div className="text-center" style={{ padding: '2rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
            No hay notificaciones
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Cuando haya lotes por vencer o stock bajo, aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notificaciones.map((notif) => {
            const colorInfo = getColorInfo(notif.plantilla_id_fk);
            
            return (
              <div
                key={notif.id_notificacion_pk}
                className="rounded-xl border border-gray-200"
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => onMarcarLeida && onMarcarLeida(notif.id_notificacion_pk)}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Icono */}
                  <div style={{ flexShrink: 0 }}>
                    {getIconoSVG(notif.nombre_tipo_notificacion)}
                  </div>

                  {/* Contenido */}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    {/* Mensaje */}
                    <div style={{
                      marginBottom: '0.25rem',
                      fontSize: '0.8rem',
                      color: '#111827',
                      fontWeight: '400'
                    }}>
                      {formatearMensajeHTML(notif.nombre_notificacion, notif.nombre_tipo_notificacion)}
                    </div>
                    
                    {/* Footer: Fecha */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {notif.fecha_creacion && (
                          <span className="text-xs" style={{ color: '#6b7280' }}>
                            {formatearFecha(notif.fecha_creacion)}
                          </span>
                        )}
                        
                        {!notif.leida && (
                          <span 
                            style={{
                              backgroundColor: '#3b82f6',
                              borderRadius: '50%',
                              width: '8px',
                              height: '8px',
                              display: 'inline-block'
                            }}
                          ></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Dialog>
  );
};

export default ModalNotificaciones;