import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faCalendarCheck, 
  faHourglassEnd,
  faSkull,
  faCalendarTimes,
  faLevelDownAlt
} from '@fortawesome/free-solid-svg-icons';

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
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
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
          <span className="block" style={{ lineHeight: '1.5' }}>
            El producto <strong style={{ color: '#dc2626' }}>{producto}</strong> tiene un stock de{' '}
            <strong style={{ color: '#dc2626' }}>{stock}</strong> unidades. Es necesario reabastecer.
          </span>
        );
      }
    } else if (tipo === 'LOTE_VENCIDO') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?), TIENE EL (.+?) VENCIDO/i);
      if (match) {
        const medicamento = match[1].trim();
        const lote = match[2].trim();
        return (
          <span className="block" style={{ lineHeight: '1.5' }}>
            El medicamento <strong style={{ color: '#1f2937' }}>{medicamento}</strong> tiene el lote{' '}
            <strong>{lote}</strong> vencido. Es necesario tomar acción.
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
          <span className="block" style={{ lineHeight: '1.5' }}>
            El medicamento <strong style={{ color }}>{medicamento}</strong> con el lote{' '}
            <strong>{lote}</strong> se vence en <strong style={{ color }}>{dias} días</strong>.
          </span>
        );
      }
    }
    
    return mensaje;
  };

  const getIconoFA = (plantillaId, tipo) => {
    if (tipo === 'STOCK_BAJOS') return faLevelDownAlt;
    if (tipo === 'LOTE_VENCIDO') return faHourglassEnd;
    
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      switch(plantillaId) {
        case 1: return faSkull;
        case 2: return faClock;
        case 3: return faCalendarTimes;
        default: return faCalendarCheck;
      }
    }
    
    return faCalendarCheck;
  };

  const getColorInfo = (plantillaId) => {
    switch(plantillaId) {
      case 1: return { bg: '#fef2f2', text: '#dc2626' };
      case 2: return { bg: '#fefce8', text: '#ca8a04' };
      case 3: return { bg: '#eff6ff', text: '#2563eb' };
      case 4: return { bg: '#f9fafb', text: '#4b5563' };
      default: return { bg: '#f9fafb', text: '#6b7280' };
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>TODAS LAS NOTIFICACIONES</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280' }}>
        {notificaciones.length} {notificaciones.length === 1 ? 'notificación' : 'notificaciones'}
      </span>
    </div>
  );

  return (
    <Dialog
      header={header}
      visible={isOpen}
      style={{ width: '50rem', maxWidth: '90vw', borderRadius: '1rem' }}
      modal
      onHide={onClose}
      position="center"
      draggable={false}
      resizable={false}
      contentStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '0' }}
    >
      {notificaciones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔔</div>
          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>No hay notificaciones</div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Cuando haya lotes por vencer o stock bajo, aparecerán aquí
          </p>
        </div>
      ) : (
        <div>
          {notificaciones.map((notif, index) => {
            const colorInfo = getColorInfo(notif.plantilla_id_fk);
            
            return (
              <div
                key={notif.id_notificacion_pk}
                style={{
                  padding: '1rem',
                  borderBottom: index < notificaciones.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: !notif.leida ? '#eff6ff' : 'white',
                  borderLeft: !notif.leida ? '4px solid #3b82f6' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.leida ? '#eff6ff' : 'white'}
                onClick={() => onMarcarLeida && onMarcarLeida(notif.id_notificacion_pk)}
              >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Icono */}
                  <div style={{ flexShrink: 0 }}>
                    <div 
                      style={{
                        backgroundColor: colorInfo.bg,
                        borderRadius: '50%',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={getIconoFA(notif.plantilla_id_fk, notif.nombre_tipo_notificacion)} 
                        style={{ color: colorInfo.text, fontSize: '1.125rem' }}
                      />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    {/* Mensaje */}
                    <div style={{
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: !notif.leida ? '#111827' : '#6b7280',
                      fontWeight: !notif.leida ? '500' : 'normal'
                    }}>
                      {formatearMensajeHTML(notif.nombre_notificacion, notif.nombre_tipo_notificacion)}
                    </div>
                    
                    {/* Footer: Badge + Fecha */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <span 
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '9999px',
                          backgroundColor: colorInfo.bg,
                          color: colorInfo.text
                        }}
                      >
                        {getTextoPrioridad(notif.plantilla_id_fk)}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {notif.fecha_creacion && (
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {formatearFecha(notif.fecha_creacion)}
                          </span>
                        )}
                        
                        {!notif.leida && (
                          <span 
                            style={{
                              backgroundColor: '#3b82f6',
                              borderRadius: '50%',
                              width: '0.5rem',
                              height: '0.5rem',
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
      
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <Button
          label="Cerrar"
          icon="pi pi-times"
          className="p-button-text p-button-rounded"
          onClick={onClose}
        />
      </div>
    </Dialog>
  );
};

export default ModalNotificaciones;