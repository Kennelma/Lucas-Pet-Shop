import React, { useState, useEffect } from 'react'
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CNavLink,
  CNavItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilCheckAlt, cilSettings } from '@coreui/icons'

const CamNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(true)

  // Función para obtener el icono según el tipo de plantilla
  const getIconoPorPlantilla = (plantillaId) => {
    switch(plantillaId) {
      case 1: return '⚠️' // Por vencer 30 días
      case 2: return '⏰' // Por vencer 60 días
      case 3: return '📅' // Por vencer 90 días
      case 4: return '🚫' // Vencido
      default: return '📄'
    }
  }

  // Función para obtener el color según el tipo de plantilla
  const getColorPorPlantilla = (plantillaId) => {
    switch(plantillaId) {
      case 1: return 'danger' // Por vencer 30 días - rojo
      case 2: return 'warning' // Por vencer 60 días - amarillo
      case 3: return 'info' // Por vencer 90 días - azul
      case 4: return 'dark' // Vencido - negro
      default: return 'secondary'
    }
  }

  useEffect(() => {
    cargarNotificaciones()
    
    // Recargar notificaciones cada 5 minutos
    const interval = setInterval(cargarNotificaciones, 300000)
    return () => clearInterval(interval)
  }, [])

  const cargarNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones')
      
      if (!response.ok) {
        throw new Error('Error al cargar notificaciones')
      }
      
      const data = await response.json()
      
      // Agregar propiedad leida a cada notificación (puede venir del backend)
      const notificacionesConLeida = data.map(notif => ({
        ...notif,
        leida: notif.leida || false
      }))
      
      setNotificaciones(notificacionesConLeida)
      setNoLeidas(notificacionesConLeida.filter(n => !n.leida).length)
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      
      // Datos de ejemplo basados en el cron job
      const notificacionesEjemplo = [
        {
          id_notificacion_pk: 1,
          nombre_notificacion: 'Lote MED-2024-001 vencido',
          plantilla_id_fk: 4,
          leida: false
        },
        {
          id_notificacion_pk: 2,
          nombre_notificacion: 'Lote MED-2024-015 por vencer (30 días)',
          plantilla_id_fk: 1,
          leida: false
        },
        {
          id_notificacion_pk: 3,
          nombre_notificacion: 'Lote MED-2024-032 por vencer (60 días)',
          plantilla_id_fk: 2,
          leida: false
        },
        {
          id_notificacion_pk: 4,
          nombre_notificacion: 'Lote MED-2024-048 por vencer (90 días)',
          plantilla_id_fk: 3,
          leida: true
        }
      ]
      
      setNotificaciones(notificacionesEjemplo)
      setNoLeidas(notificacionesEjemplo.filter(n => !n.leida).length)
      setLoading(false)
    }
  }

  const marcarTodasComoLeidas = async (e) => {
    e.stopPropagation()
    
    try {
      const response = await fetch('/api/notificaciones/marcar-todas-leidas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })))
        setNoLeidas(0)
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
    }
  }

  const marcarComoLeida = async (id_notificacion_pk) => {
    try {
      const response = await fetch(`/api/notificaciones/${id_notificacion_pk}/marcar-leida`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setNotificaciones(notificaciones.map(n => 
          n.id_notificacion_pk === id_notificacion_pk ? { ...n, leida: true } : n
        ))
        setNoLeidas(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
    }
  }

  const eliminarNotificacion = async (id_notificacion_pk, e) => {
    e.stopPropagation()
    
    if (!window.confirm('¿Está seguro de eliminar esta notificación?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/notificaciones/${id_notificacion_pk}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const notifEliminada = notificaciones.find(n => n.id_notificacion_pk === id_notificacion_pk)
        setNotificaciones(notificaciones.filter(n => n.id_notificacion_pk !== id_notificacion_pk))
        if (!notifEliminada.leida) {
          setNoLeidas(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
    }
  }

  return (
    <CNavItem>
      <CDropdown variant="nav-item" placement="bottom-end">
        <CDropdownToggle className="py-0" caret={false}>
          <CNavLink href="#" className="position-relative d-inline-block">
            <CIcon icon={cilBell} size="lg" />
            {noLeidas > 0 && (
              <span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}
              >
                {noLeidas > 99 ? '99+' : noLeidas}
              </span>
            )}
          </CNavLink>
        </CDropdownToggle>
        
        <CDropdownMenu className="shadow-lg border-0" style={{ width: '400px', maxWidth: '90vw' }}>
          {/* Header */}
          <div className="bg-primary text-white px-3 py-2 d-flex justify-content-between align-items-center">
            <div>
              <span className="fw-semibold">Notificaciones</span>
              {noLeidas > 0 && (
                <span className="ms-2 badge bg-light text-primary">
                  {noLeidas} {noLeidas === 1 ? 'nueva' : 'nuevas'}
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              {noLeidas > 0 && (
                <CIcon 
                  icon={cilCheckAlt} 
                  size="lg" 
                  className="cursor-pointer" 
                  style={{ cursor: 'pointer', opacity: 0.9 }}
                  onClick={marcarTodasComoLeidas}
                  title="Marcar todas como leídas"
                />
              )}
              <CIcon 
                icon={cilSettings} 
                size="lg" 
                style={{ cursor: 'pointer', opacity: 0.9 }}
                title="Configuración"
              />
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center text-muted py-4">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                Cargando notificaciones...
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div className="mb-2" style={{ fontSize: '2rem' }}>🔔</div>
                <div>No hay notificaciones</div>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id_notificacion_pk}
                  className={`px-3 py-3 border-bottom ${
                    !notif.leida ? 'bg-light' : ''
                  }`}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onClick={() => marcarComoLeida(notif.id_notificacion_pk)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = !notif.leida ? '#f8f9fa' : '#fafafa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.leida ? '#f8f9fa' : 'transparent'}
                >
                  <div className="d-flex gap-3 align-items-start">
                    {/* Icono según tipo de plantilla */}
                    <div className="flex-shrink-0">
                      <div 
                        className={`bg-${getColorPorPlantilla(notif.plantilla_id_fk)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                        style={{ width: '45px', height: '45px', fontSize: '1.5rem' }}
                      >
                        {getIconoPorPlantilla(notif.plantilla_id_fk)}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className={`fw-semibold ${!notif.leida ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>
                          {notif.nombre_notificacion}
                        </div>
                        {/* Botón eliminar */}
                        <button
                          className="btn btn-sm btn-link text-danger p-0 ms-2"
                          style={{ fontSize: '1.2rem', lineHeight: 1, textDecoration: 'none' }}
                          onClick={(e) => eliminarNotificacion(notif.id_notificacion_pk, e)}
                          title="Eliminar notificación"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span 
                          className={`badge bg-${getColorPorPlantilla(notif.plantilla_id_fk)} bg-opacity-10 text-${getColorPorPlantilla(notif.plantilla_id_fk)}`}
                          style={{ fontSize: '0.7rem', fontWeight: 'normal' }}
                        >
                          {notif.plantilla_id_fk === 1 && 'Urgente - 30 días'}
                          {notif.plantilla_id_fk === 2 && 'Importante - 60 días'}
                          {notif.plantilla_id_fk === 3 && 'Recordatorio - 90 días'}
                          {notif.plantilla_id_fk === 4 && 'Vencido'}
                        </span>
                        
                        {/* Indicador no leída */}
                        {!notif.leida && (
                          <span 
                            className="bg-primary rounded-circle d-inline-block"
                            style={{ width: '8px', height: '8px' }}
                            title="No leída"
                          ></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Ver todo */}
          {notificaciones.length > 0 && (
            <div className="border-top text-center">
              <CNavLink 
                href="#/notificaciones" 
                className="d-block py-2 text-primary fw-medium text-decoration-none"
                style={{ fontSize: '0.9rem' }}
              >
                Ver todas las notificaciones
              </CNavLink>
            </div>
          )}
        </CDropdownMenu>
      </CDropdown>
    </CNavItem>
  )
}

export default CamNotificaciones