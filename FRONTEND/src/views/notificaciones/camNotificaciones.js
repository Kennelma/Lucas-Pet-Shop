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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faClock, 
  faCalendarCheck, 
  faHourglassEnd,
  faSkull,
  faCalendarTimes,
  faLevelDownAlt
} from '@fortawesome/free-solid-svg-icons'
import { obtenerNotificaciones, marcarNotificacionLeida } from '../../AXIOS.SERVICES/notifications-axios'
import ModalNotificaciones from './ModalNotificaciones'

const CamNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [animarCampana, setAnimarCampana] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
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

  // Función para formatear mensaje con HTML bonito
  const formatearMensajeHTML = (mensaje, tipo) => {
    if (tipo === 'STOCK_BAJOS') {
      const match = mensaje.match(/EL PRODUCTO (.+?) TIENE UN STOCK = (\d+)/i)
      if (match) {
        const producto = match[1].trim()
        const stock = match[2]
        return (
          <span className="d-block" style={{ lineHeight: '1.5' }}>
            El producto <strong className="text-danger">{producto}</strong> tiene un stock de{' '}
            <strong className="text-danger">{stock}</strong> unidades. Es necesario reabastecer.
          </span>
        )
      }
    } else if (tipo === 'LOTE_VENCIDO') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?), TIENE EL (.+?) VENCIDO/i)
      if (match) {
        const medicamento = match[1].trim()
        const lote = match[2].trim()
        return (
          <span className="d-block" style={{ lineHeight: '1.5' }}>
            El medicamento <strong className="text-dark">{medicamento}</strong> tiene el lote{' '}
            <strong>{lote}</strong> vencido. Es necesario tomar acción.
          </span>
        )
      }
    } else if (tipo === 'LOTE_PROXIMO_VENCER') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?) CON EL (.+?), SE VENCE EN (\d+) DÍAS/i)
      if (match) {
        const medicamento = match[1].trim()
        const lote = match[2].trim()
        const dias = match[3]
        
        let colorDias = 'danger'
        if (dias === '90') colorDias = 'info'
        else if (dias === '60') colorDias = 'warning'
        
        return (
          <span className="d-block" style={{ lineHeight: '1.5' }}>
            El medicamento <strong className={`text-${colorDias}`}>{medicamento}</strong> con el lote{' '}
            <strong>{lote}</strong> se vence en <strong className={`text-${colorDias}`}>{dias} días</strong>.
          </span>
        )
      }
    }
    
    return mensaje
  }

  // Determinar plantilla_id_fk basado en el tipo de notificación
  const determinarPlantilla = (nombre_tipo_notificacion, mensaje) => {
    if (nombre_tipo_notificacion === 'LOTE_VENCIDO') {
      return 4
    }
    
    if (nombre_tipo_notificacion === 'LOTE_PROXIMO_VENCER') {
      if (mensaje.includes('30 DÍAS') || mensaje.includes('30 días')) return 1
      if (mensaje.includes('60 DÍAS') || mensaje.includes('60 días')) return 2
      if (mensaje.includes('90 DÍAS') || mensaje.includes('90 días')) return 3
    }

    if (nombre_tipo_notificacion === 'STOCK_BAJOS') {
      return 1
    }
    
    return 0
  }

  // Función para obtener icono FontAwesome
  const getIconoFA = (plantillaId, tipo) => {
    // Para BAJO STOCK
    if (tipo === 'STOCK_BAJOS') return faLevelDownAlt
    
    // Para VENCIDO/CADUCADO
    if (tipo === 'LOTE_VENCIDO') return faHourglassEnd
    
    // Para LOTES PRÓXIMOS A VENCER
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      switch(plantillaId) {
        case 1: return faSkull // Crítico/Urgente - 30 días
        case 2: return faClock // Importante - 60 días
        case 3: return faCalendarTimes // Recordatorio - 90 días
        default: return faCalendarCheck
      }
    }
    
    return faCalendarCheck
  }

  // Función para obtener el color según el tipo
  const getColorPorPlantilla = (plantillaId) => {
    switch(plantillaId) {
      case 1: return 'danger'
      case 2: return 'warning'
      case 3: return 'info'
      case 4: return 'dark'
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
    
    const interval = setInterval(cargarNotificaciones, 300000)
    return () => clearInterval(interval)
  }, [])

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
      
      const notificacionesAdaptadas = response.notificaciones.map(notif => {
        const plantilla_id_fk = determinarPlantilla(
          notif.nombre_tipo_notificacion, 
          notif.mensaje_notificacion
        )
        
        return {
          id_notificacion_pk: notif.id_notificacion_pk,
          nombre_notificacion: notif.mensaje_notificacion,
          plantilla_id_fk: plantilla_id_fk,
          leida: false,
          fecha_creacion: notif.fecha_creacion,
          nombre_tipo_notificacion: notif.nombre_tipo_notificacion,
          id_lote_fk: null
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
    
    if (notifAnterior && !notifAnterior.leida) {
      setNotificaciones(notificaciones.map(n => 
        n.id_notificacion_pk === id_notificacion_pk ? { ...n, leida: true } : n
      ))
      setNoLeidas(prev => Math.max(0, prev - 1))
      
      try {
        const response = await marcarNotificacionLeida(id_notificacion_pk)
        
        if (!response.Consulta) {
          throw new Error(response.mensaje || 'Error al marcar como leída')
        }
        
        setTimeout(() => {
          setNotificaciones(prev => prev.filter(n => n.id_notificacion_pk !== id_notificacion_pk))
        }, 500)
        
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error)
        setNotificaciones(notificaciones.map(n => 
          n.id_notificacion_pk === id_notificacion_pk ? { ...n, leida: false } : n
        ))
        setNoLeidas(prev => prev + 1)
      }
    }
  }

  const manejarClickNotificacion = async (notif) => {
    await marcarComoLeida(notif.id_notificacion_pk)
  }

  const marcarTodasComoLeidas = async (e) => {
    e.stopPropagation()
    
    if (notificaciones.length === 0) return
    
    const notificacionesAnteriores = [...notificaciones]
    const noLeidasAnterior = noLeidas
    
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)
    
    try {
      const promesas = notificaciones.map(n => marcarNotificacionLeida(n.id_notificacion_pk))
      const resultados = await Promise.allSettled(promesas)
      
      const errores = resultados.filter(r => r.status === 'rejected')
      if (errores.length > 0) {
        console.error('Algunos errores al marcar notificaciones:', errores)
      }
      
      setTimeout(() => {
        setNotificaciones([])
      }, 500)
      
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
      setNotificaciones(notificacionesAnteriores)
      setNoLeidas(noLeidasAnterior)
    }
  }

  const abrirConfiguracion = (e) => {
    e.stopPropagation()
    navigate('/configuracion/notificaciones')
  }

  const abrirModalNotificaciones = () => {
    console.log('🔔 Abriendo modal, notificaciones:', notificaciones)
    setModalVisible(true)
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
        
        .notif-item-mejorado {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 3px solid transparent;
          position: relative;
        }
        
        .notif-item-mejorado:hover {
          background-color: #f0f4ff !important;
          border-left-color: var(--cui-primary);
          transform: translateX(3px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .notif-icon-circle {
          transition: all 0.2s ease;
        }
        
        .notif-item-mejorado:hover .notif-icon-circle {
          transform: scale(1.15) rotate(5deg);
        }
        
        .badge-prioridad {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          letter-spacing: 0.3px;
        }
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
        
        <CDropdownMenu className="shadow-lg border-0" style={{ width: '460px', maxWidth: '90vw' }}>
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
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
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
                <div className="mb-2" style={{ fontSize: '2.5rem' }}>🔔</div>
                <div className="fw-semibold">No hay notificaciones</div>
                <small className="text-muted d-block mt-1">
                  Cuando haya lotes por vencer o stock bajo, aparecerán aquí
                </small>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id_notificacion_pk}
                  className={`notif-item-mejorado px-3 py-3 border-bottom ${!notif.leida ? 'bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => manejarClickNotificacion(notif)}
                >
                  <div className="d-flex gap-3 align-items-start">
                    {/* Icono */}
                    <div className="flex-shrink-0">
                      <div 
                        className={`notif-icon-circle bg-${getColorPorPlantilla(notif.plantilla_id_fk)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                        style={{ width: '42px', height: '42px', minWidth: '42px' }}
                      >
                        <FontAwesomeIcon 
                          icon={getIconoFA(notif.plantilla_id_fk, notif.nombre_tipo_notificacion)} 
                          className={`text-${getColorPorPlantilla(notif.plantilla_id_fk)}`}
                          style={{ fontSize: '1.1rem' }}
                        />
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      {/* Mensaje */}
                      <div 
                        className={`mb-2 ${!notif.leida ? 'text-dark' : 'text-muted'}`} 
                        style={{ fontSize: '0.875rem' }}
                      >
                        {formatearMensajeHTML(notif.nombre_notificacion, notif.nombre_tipo_notificacion)}
                      </div>
                      
                      {/* Footer: Badge + Fecha */}
                      <div className="d-flex justify-content-between align-items-center">
                        <span 
                          className={`badge badge-prioridad bg-${getColorPorPlantilla(notif.plantilla_id_fk)} bg-opacity-10 text-${getColorPorPlantilla(notif.plantilla_id_fk)}`}
                        >
                          {getTextoPrioridad(notif.plantilla_id_fk)}
                        </span>
                        
                        <div className="d-flex align-items-center gap-2">
                          {notif.fecha_creacion && (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {formatearFecha(notif.fecha_creacion)}
                            </span>
                          )}
                          
                          {!notif.leida && (
                            <span 
                              className="bg-primary rounded-circle"
                              style={{ width: '7px', height: '7px', display: 'inline-block' }}
                            ></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="border-top text-center">
              <button
                onClick={abrirModalNotificaciones}
                className="d-block w-100 py-2 text-primary fw-medium text-decoration-none border-0 bg-transparent"
                style={{ fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </CDropdownMenu>
      </CDropdown>

      {/* Modal de todas las notificaciones */}
      <ModalNotificaciones
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        notificaciones={notificaciones}
        onMarcarLeida={marcarComoLeida}
      />
    </CNavItem>
  )
}

export default CamNotificaciones