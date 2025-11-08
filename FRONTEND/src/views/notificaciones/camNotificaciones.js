import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [error, setError] = useState(null)
  const [animarCampana, setAnimarCampana] = useState(false)
  const navigate = useNavigate()

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return ''
    
    const ahora = new Date()
    const fechaNotif = new Date(fecha)
    const diffMs = ahora - fechaNotif
    const diffMins = Math.floor(diffMs / 60000)
    const diffHoras = Math.floor(diffMs / 3600000)
    const diffDias = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHoras < 24) return `Hace ${diffHoras}h`
    if (diffDias === 1) return 'Ayer'
    if (diffDias < 7) return `Hace ${diffDias} días`
    
    return fechaNotif.toLocaleDateString('es-HN', { 
      day: '2-digit', 
      month: 'short' 
    })
  }

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

  // Función para obtener el texto de la prioridad
  const getTextoPrioridad = (plantillaId) => {
    switch(plantillaId) {
      case 1: return 'Urgente - 30 días'
      case 2: return 'Importante - 60 días'
      case 3: return 'Recordatorio - 90 días'
      case 4: return 'Vencido'
      default: return 'Notificación'
    }
  }

  useEffect(() => {
    cargarNotificaciones()
    
    // Recargar notificaciones cada 5 minutos
    const interval = setInterval(cargarNotificaciones, 300000)
    return () => clearInterval(interval)
  }, [])

  // Efecto para animar el ícono cuando hay nuevas notificaciones
  useEffect(() => {
    const prevCount = parseInt(localStorage.getItem('notif_count') || '0')
    
    if (noLeidas > prevCount && prevCount >= 0) {
      setAnimarCampana(true)
      setTimeout(() => setAnimarCampana(false), 500)
    }
    
    localStorage.setItem('notif_count', noLeidas.toString())
  }, [noLeidas])

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
      setError(null)
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      setError('No se pudieron cargar las notificaciones')
      
      // Datos de ejemplo solo para desarrollo
      if (process.env.NODE_ENV === 'development') {
        const notificacionesEjemplo = [
          {
            id_notificacion_pk: 1,
            nombre_notificacion: 'Lote MED-2024-001 vencido',
            plantilla_id_fk: 4,
            leida: false,
            fecha_creacion: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
            id_lote_fk: 101
          },
          {
            id_notificacion_pk: 2,
            nombre_notificacion: 'Lote MED-2024-015 por vencer (30 días)',
            plantilla_id_fk: 1,
            leida: false,
            fecha_creacion: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
            id_lote_fk: 102
          },
          {
            id_notificacion_pk: 3,
            nombre_notificacion: 'Lote MED-2024-032 por vencer (60 días)',
            plantilla_id_fk: 2,
            leida: false,
            fecha_creacion: new Date(Date.now() - 1800000).toISOString(), // 30 min atrás
            id_lote_fk: 103
          },
          {
            id_notificacion_pk: 4,
            nombre_notificacion: 'Lote MED-2024-048 por vencer (90 días)',
            plantilla_id_fk: 3,
            leida: true,
            fecha_creacion: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
            id_lote_fk: 104
          }
        ]
        
        setNotificaciones(notificacionesEjemplo)
        setNoLeidas(notificacionesEjemplo.filter(n => !n.leida).length)
      }
      
      setLoading(false)
    }
  }

  const marcarTodasComoLeidas = async (e) => {
    e.stopPropagation()
    
    // Optimistic update
    const notificacionesAnteriores = [...notificaciones]
    const noLeidasAnterior = noLeidas
    
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)
    
    try {
      const response = await fetch('/api/notificaciones/marcar-todas-leidas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas')
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
      // Revertir cambios
      setNotificaciones(notificacionesAnteriores)
      setNoLeidas(noLeidasAnterior)
    }
  }

  const marcarComoLeida = async (id_notificacion_pk) => {
    const notifAnterior = notificaciones.find(n => n.id_notificacion_pk === id_notificacion_pk)
    
    // Solo actualizar si no estaba leída
    if (notifAnterior && !notifAnterior.leida) {
      // Optimistic update
      setNotificaciones(notificaciones.map(n => 
        n.id_notificacion_pk === id_notificacion_pk ? { ...n, leida: true } : n
      ))
      setNoLeidas(prev => Math.max(0, prev - 1))
      
      try {
        const response = await fetch(`/api/notificaciones/${id_notificacion_pk}/marcar-leida`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Error al marcar como leída')
        }
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error)
        // Revertir en caso de error
        setNotificaciones(notificaciones.map(n => 
          n.id_notificacion_pk === id_notificacion_pk ? { ...n, leida: false } : n
        ))
        setNoLeidas(prev => prev + 1)
      }
    }
  }

  const manejarClickNotificacion = async (notif) => {
    await marcarComoLeida(notif.id_notificacion_pk)
    
    // Navegar al detalle del lote si existe id_lote_fk
    if (notif.id_lote_fk) {
      navigate(`/lotes/${notif.id_lote_fk}`)
    }
  }

  const eliminarNotificacion = async (id_notificacion_pk, e) => {
    e.stopPropagation()
    
    if (!window.confirm('¿Está seguro de eliminar esta notificación?')) {
      return
    }
    
    // Optimistic update
    const notifEliminada = notificaciones.find(n => n.id_notificacion_pk === id_notificacion_pk)
    const notificacionesAnteriores = [...notificaciones]
    const noLeidasAnterior = noLeidas
    
    setNotificaciones(notificaciones.filter(n => n.id_notificacion_pk !== id_notificacion_pk))
    if (notifEliminada && !notifEliminada.leida) {
      setNoLeidas(prev => Math.max(0, prev - 1))
    }
    
    try {
      const response = await fetch(`/api/notificaciones/${id_notificacion_pk}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar notificación')
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      // Revertir cambios
      setNotificaciones(notificacionesAnteriores)
      setNoLeidas(noLeidasAnterior)
    }
  }

  const abrirConfiguracion = (e) => {
    e.stopPropagation()
    navigate('/configuracion/notificaciones')
  }

  return (
    <CNavItem>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-shake { animation: shake 0.5s; }
        .animate-pulse-custom { animation: pulse 2s infinite; }
      `}</style>
      
      <CDropdown variant="nav-item" placement="bottom-end">
        <CDropdownToggle className="py-0" caret={false}>
          <CNavLink href="#" className="position-relative d-inline-block">
            <div className={animarCampana ? 'animate-shake' : ''}>
              <CIcon icon={cilBell} size="lg" />
            </div>
            {noLeidas > 0 && (
              <span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate-pulse-custom"
                style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}
              >
                {noLeidas > 99 ? '99+' : noLeidas}
              </span>
            )}
          </CNavLink>
        </CDropdownToggle>
        
        <CDropdownMenu className="shadow-lg border-0" style={{ width: '420px', maxWidth: '90vw' }}>
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
                onClick={abrirConfiguracion}
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
            ) : error && notificaciones.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div className="mb-2" style={{ fontSize: '2rem' }}>⚠️</div>
                <div className="fw-semibold">{error}</div>
                <button 
                  className="btn btn-sm btn-primary mt-2"
                  onClick={cargarNotificaciones}
                >
                  Reintentar
                </button>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div className="mb-2" style={{ fontSize: '2rem' }}>🔔</div>
                <div>No hay notificaciones</div>
                <small className="text-muted">Cuando haya lotes por vencer, aparecerán aquí</small>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id_notificacion_pk}
                  className={`px-3 py-3 border-bottom ${
                    !notif.leida ? 'bg-light' : ''
                  }`}
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => manejarClickNotificacion(notif)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
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
                      
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span 
                          className={`badge bg-${getColorPorPlantilla(notif.plantilla_id_fk)} bg-opacity-10 text-${getColorPorPlantilla(notif.plantilla_id_fk)}`}
                          style={{ fontSize: '0.7rem', fontWeight: 'normal' }}
                        >
                          {getTextoPrioridad(notif.plantilla_id_fk)}
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

                      {/* Fecha de creación */}
                      {notif.fecha_creacion && (
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {formatearFecha(notif.fecha_creacion)}
                        </div>
                      )}
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