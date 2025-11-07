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
import { obtenerNotificaciones, marcarNotificacionLeida } from '../../AXIOS.SERVICES/notifications-axios'

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

  // Determinar plantilla_id_fk basado en el tipo de notificación
  const determinarPlantilla = (nombre_tipo_notificacion, mensaje) => {
    // Para LOTE_VENCIDO
    if (nombre_tipo_notificacion === 'LOTE_VENCIDO') {
      return 4 // Vencido
    }
    
    // Para LOTE_PROXIMO_VENCER, extraer los días del mensaje
    if (nombre_tipo_notificacion === 'LOTE_PROXIMO_VENCER') {
      if (mensaje.includes('30 DÍAS') || mensaje.includes('30 días')) return 1
      if (mensaje.includes('60 DÍAS') || mensaje.includes('60 días')) return 2
      if (mensaje.includes('90 DÍAS') || mensaje.includes('90 días')) return 3
    }

    // Para STOCK_BAJOS
    if (nombre_tipo_notificacion === 'STOCK_BAJOS') {
      return 1 // Urgente (rojo)
    }
    
    return 0 // Default
  }

  // Función para obtener el icono según el tipo
  const getIconoPorPlantilla = (plantillaId) => {
    switch(plantillaId) {
      case 1: return '⚠️' // Por vencer 30 días / Stock bajo
      case 2: return '⏰' // Por vencer 60 días
      case 3: return '📅' // Por vencer 90 días
      case 4: return '🚫' // Vencido
      default: return '📄'
    }
  }

  // Función para obtener el color según el tipo
  const getColorPorPlantilla = (plantillaId) => {
    switch(plantillaId) {
      case 1: return 'danger' // Urgente - rojo
      case 2: return 'warning' // Importante - amarillo
      case 3: return 'info' // Recordatorio - azul
      case 4: return 'dark' // Vencido - negro
      default: return 'secondary'
    }
  }

  // Función para obtener el texto de la prioridad
  const getTextoPrioridad = (plantillaId) => {
    switch(plantillaId) {
      case 1: return 'Urgente'
      case 2: return 'Importante'
      case 3: return 'Recordatorio'
      case 4: return 'Vencido'
      default: return 'Notificación'
    }
  }

  useEffect(() => {
    cargarNotificaciones()
    
    // Recargar notificaciones cada 5 minutos (300000 ms)
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
      const response = await obtenerNotificaciones()
      
      if (!response.Consulta) {
        throw new Error(response.mensaje || 'Error al cargar notificaciones')
      }
      
      // Adaptar notificaciones del backend al formato del frontend
      const notificacionesAdaptadas = response.notificaciones.map(notif => {
        // Determinar la plantilla basada en el tipo y mensaje
        const plantilla_id_fk = determinarPlantilla(
          notif.nombre_tipo_notificacion, 
          notif.mensaje_notificacion
        )
        
        return {
          id_notificacion_pk: notif.id_notificacion_pk,
          nombre_notificacion: notif.mensaje_notificacion, // El mensaje es el contenido
          plantilla_id_fk: plantilla_id_fk,
          leida: false, // Backend solo devuelve las no leídas
          fecha_creacion: new Date().toISOString(), // Backend no devuelve fecha, usar actual
          id_lote_fk: null // Backend no devuelve id_lote_fk en este query
        }
      })
      
      setNotificaciones(notificacionesAdaptadas)
      setNoLeidas(notificacionesAdaptadas.length)
      setError(null)
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      setError('No se pudieron cargar las notificaciones')
      setNotificaciones([])
      setNoLeidas(0)
      setLoading(false)
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
        const response = await marcarNotificacionLeida(id_notificacion_pk)
        
        if (!response.Consulta) {
          throw new Error(response.mensaje || 'Error al marcar como leída')
        }
        
        // Después de marcar como leída, remover de la lista
        setTimeout(() => {
          setNotificaciones(prev => prev.filter(n => n.id_notificacion_pk !== id_notificacion_pk))
        }, 500)
        
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
    
    // Por ahora no navegar, ya que el backend no devuelve id_lote_fk
    // Si necesitas navegación, deberás actualizar el query del backend
  }

  const marcarTodasComoLeidas = async (e) => {
    e.stopPropagation()
    
    if (notificaciones.length === 0) return
    
    // Optimistic update
    const notificacionesAnteriores = [...notificaciones]
    const noLeidasAnterior = noLeidas
    
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)
    
    try {
      // Marcar todas una por una
      const promesas = notificaciones.map(n => marcarNotificacionLeida(n.id_notificacion_pk))
      const resultados = await Promise.allSettled(promesas)
      
      // Verificar si hubo errores
      const errores = resultados.filter(r => r.status === 'rejected')
      if (errores.length > 0) {
        console.error('Algunos errores al marcar notificaciones:', errores)
      }
      
      // Después de marcar todas, limpiar la lista
      setTimeout(() => {
        setNotificaciones([])
      }, 500)
      
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
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
            ) : error ? (
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
                        <div className={`fw-semibold ${!notif.leida ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.85rem', lineHeight: '1.3' }}>
                          {notif.nombre_notificacion}
                        </div>
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