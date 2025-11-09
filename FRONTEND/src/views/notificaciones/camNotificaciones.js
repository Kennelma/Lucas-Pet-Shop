import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilBell, cilCheckAlt, cilSettings } from '@coreui/icons'
import { obtenerNotificaciones, marcarNotificacionLeida } from '../../AXIOS.SERVICES/notifications-axios'
import ModalNotificaciones from './ModalNotificaciones'

const CamNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [animarCampana, setAnimarCampana] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const audioRef = useRef(null)
  const prevNotificacionesRef = useRef([])
  const navigate = useNavigate()

  const getTituloNotificacion = (tipo, mensaje) => {
    if (tipo === 'STOCK_BAJOS') {
      if (mensaje.includes('30 DÍAS') || mensaje.includes('30 días')) {
        return 'Stock crítico'
      }
      return 'STOCK BAJO'
    }
    
    if (tipo === 'LOTE_VENCIDO') {
      return 'Lote vencido'
    }
    
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      if (mensaje.includes('30 DÍAS') || mensaje.includes('30 días')) {
        return 'Lote por vencer pronto'
      }
      if (mensaje.includes('60 DÍAS') || mensaje.includes('60 días')) {
        return 'Lote próximo a vencer'
      }
      if (mensaje.includes('90 DÍAS') || mensaje.includes('90 días')) {
        return 'Recordatorio de vencimiento'
      }
    }
    
    return 'Notificación'
  }

  const formatearMensajeLimpio = (mensaje, tipo) => {
    if (tipo === 'STOCK_BAJOS') {
      const match = mensaje.match(/EL PRODUCTO (.+?) TIENE UN STOCK = (\d+)/i)
      if (match) {
        const producto = match[1].trim()
        const stock = match[2]
        return (
          <span>
            El producto <strong>{producto}</strong> tiene un stock de {stock} unidades. Es necesario reabastecer.
          </span>
        )
      }
    } else if (tipo === 'LOTE_VENCIDO') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?), TIENE EL (.+?) VENCIDO/i)
      if (match) {
        const medicamento = match[1].trim()
        const lote = match[2].trim()
        return (
          <span>
            El medicamento <strong>{medicamento}</strong> tiene el lote {lote} vencido. Es necesario tomar acción inmediata.
          </span>
        )
      }
    } else if (tipo === 'LOTE_PROXIMO_VENCER') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?) CON EL (.+?), SE VENCE EN (\d+) DÍAS/i)
      if (match) {
        const medicamento = match[1].trim()
        const lote = match[2].trim()
        const dias = match[3]
        return (
          <span>
            El medicamento <strong>{medicamento}</strong> con el lote {lote} se vence en {dias} días. Planifique en consecuencia.
          </span>
        )
      }
    }
    
    return mensaje
  }

  // Función para obtener el icono SVG (igual que en el modal)
  const getIconoSVG = (tipo) => {
    if (tipo === 'STOCK_BAJOS') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 20h20L12 2z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5"/>
          <path d="M12 9v5M12 17h.01" stroke="#78350F" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    }
    
    if (tipo === 'LOTE_VENCIDO') {
      return (
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="42" width="24" height="8" rx="2" fill="#9CA3AF"/>
          <rect x="18" y="48" width="28" height="4" rx="1" fill="#6B7280"/>
          <path d="M32 12 Q22 12 22 24 L22 38 Q22 42 26 42 L38 42 Q42 42 42 38 L42 24 Q42 12 32 12 Z" fill="#DC2626"/>
          <rect x="30" y="20" width="4" height="12" rx="2" fill="white"/>
          <circle cx="32" cy="36" r="2.5" fill="white"/>
          <line x1="14" y1="18" x2="18" y2="22" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="12" y1="26" x2="18" y2="26" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="14" y1="34" x2="18" y2="30" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="18" x2="46" y2="22" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="26" x2="46" y2="26" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="34" x2="46" y2="30" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )
    }
    
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      return (
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="42" width="24" height="8" rx="2" fill="#9CA3AF"/>
          <rect x="18" y="48" width="28" height="4" rx="1" fill="#6B7280"/>
          <path d="M32 12 Q22 12 22 24 L22 38 Q22 42 26 42 L38 42 Q42 42 42 38 L42 24 Q42 12 32 12 Z" fill="#F59E0B"/>
          <rect x="30" y="20" width="4" height="12" rx="2" fill="white"/>
          <circle cx="32" cy="36" r="2.5" fill="white"/>
          <line x1="14" y1="18" x2="18" y2="22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="12" y1="26" x2="18" y2="26" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="14" y1="34" x2="18" y2="30" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="18" x2="46" y2="22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="26" x2="46" y2="26" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="34" x2="46" y2="30" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )
    }
    
    return null
  }

  // Ahora usamos el emoji de triángulo para stock bajo
  const getIconoAvatar = (tipo) => {
    if (tipo === 'STOCK_BAJOS') return '⚠️'
    if (tipo === 'LOTE_VENCIDO') return '🚨'
    if (tipo === 'LOTE_PROXIMO_VENCER') return '⏰'
    return '🔔'
  }

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

  const reproducirSonido = () => {
    try {
      // Crear contexto de audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Crear oscilador y nodo de ganancia
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Configurar sonido más audible
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      // Fade in/out para evitar clicks
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3)
      
      // Reproducir
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      // Limpiar
      setTimeout(() => {
        audioContext.close()
      }, 400)
      
      console.log('🔊 Sonido de notificación reproducido')
    } catch (error) {
      console.error('Error al reproducir sonido:', error)
    }
  }

  useEffect(() => {
    // Cargar notificaciones inmediatamente al montar
    cargarNotificaciones()
    
    // Configurar intervalo de 10 segundos
    const interval = setInterval(() => {
      console.log('🔍 Verificando nuevas notificaciones...', new Date().toLocaleTimeString())
      cargarNotificaciones()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const prevCount = parseInt(localStorage.getItem('notif_count') || '0')
    
    console.log('📊 Cambio detectado - Anterior:', prevCount, 'Actual:', noLeidas)
    
    if (noLeidas > prevCount && prevCount >= 0) {
      console.log('🆕 ¡Nueva notificación detectada!')
      setAnimarCampana(true)
      setTimeout(() => setAnimarCampana(false), 500)
      
      // Reproducir sonido de notificación
      reproducirSonido()
    }
    
    localStorage.setItem('notif_count', noLeidas.toString())
  }, [noLeidas])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const cargarNotificaciones = async () => {
    try {
      console.log('📡 Llamando API de notificaciones...')
      const response = await obtenerNotificaciones()
      
      console.log('📦 Respuesta recibida:', response)
      
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
      
      // Ordenar por ID en orden descendente
      notificacionesAdaptadas.sort((a, b) => {
        return b.id_notificacion_pk - a.id_notificacion_pk
      })
      
      console.log('✅ Notificaciones procesadas:', notificacionesAdaptadas.length)
      
      // Detectar nuevas notificaciones comparando IDs
      const prevIds = prevNotificacionesRef.current.map(n => n.id_notificacion_pk)
      const currentIds = notificacionesAdaptadas.map(n => n.id_notificacion_pk)
      const nuevasNotificaciones = currentIds.filter(id => !prevIds.includes(id))
      
      if (nuevasNotificaciones.length > 0) {
        console.log('🎉 ¡Notificaciones nuevas detectadas!:', nuevasNotificaciones)
      }
      
      // Guardar referencia para próxima comparación
      prevNotificacionesRef.current = notificacionesAdaptadas
      
      setNotificaciones(notificacionesAdaptadas)
      setNoLeidas(notificacionesAdaptadas.length)
      setError(null)
      setLoading(false)
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error)
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
    setDropdownOpen(false)
    navigate('/configuracion/notificaciones')
  }

  const abrirModalNotificaciones = () => {
    setDropdownOpen(false)
    setModalVisible(true)
  }

  return (
    <div className="nav-item" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => {
          setDropdownOpen(!dropdownOpen)
          // Activar contexto de audio al hacer clic
          if (!dropdownOpen) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            ctx.resume().then(() => {
              console.log('🔓 Audio activado por interacción del usuario')
              ctx.close()
            })
          }
        }}
        className="nav-link border-0 bg-transparent p-2"
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <div className={animarCampana ? 'animate-shake' : ''}>
          <CIcon icon={cilBell} size="lg" />
        </div>
        {noLeidas > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.50rem',       
           padding: '0.2rem 0.20rem', minWidth: '10px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div
          className="dropdown-menu shadow border show"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '360px',
            maxWidth: '80vw',
            zIndex: 1050
          }}
        >
          <div className="bg-light border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
            <div>
              <span className="fw-semibold" style={{ color: '#000' }}>
                Tienes {noLeidas} {noLeidas === 1 ? 'notificación' : 'notificaciones'}
              </span>
            </div>
            <div className="d-flex gap-2">
              {noLeidas > 0 && (
                <CIcon 
                  icon={cilCheckAlt} 
                  size="lg" 
                  className="cursor-pointer" 
                  style={{ cursor: 'pointer', color: '#000' }}
                  onClick={marcarTodasComoLeidas}
                  title="Marcar todas como leídas"
                />
              )}
              <CIcon 
                icon={cilSettings} 
                size="lg" 
                style={{ cursor: 'pointer', color: '#000' }}
                onClick={abrirConfiguracion}
                title="Configuración"
              />
            </div>
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-4" style={{ color: '#000' }}>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                Cargando notificaciones...
              </div>
            ) : error ? (
              <div className="text-center py-5" style={{ color: '#000' }}>
                <div className="mb-2 fs-1">⚠️</div>
                <div className="fw-semibold">{error}</div>
                <button 
                  className="btn btn-sm btn-primary mt-2"
                  onClick={cargarNotificaciones}
                >
                  Reintentar
                </button>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="text-center py-5" style={{ color: '#000' }}>
                <div className="mb-2" style={{ fontSize: '3rem' }}>🔔</div>
                <div className="fw-semibold">No hay notificaciones</div>
                <small className="text-muted d-block mt-1">
                  Cuando haya lotes por vencer o stock bajo, aparecerán aquí
                </small>
              </div>
            ) : (
              notificaciones.slice(0, 4).map((notif) => (
                <div
                  key={notif.id_notificacion_pk}
                  className="px-3 py-3 border-bottom"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: !notif.leida ? '#eff6ff' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => manejarClickNotificacion(notif)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.leida ? '#eff6ff' : 'white'}
                >
                  <div className="d-flex gap-3">
                    <div style={{ flexShrink: 0, fontSize: '1rem', marginTop: '2px' }}>
                      {getIconoAvatar(notif.nombre_tipo_notificacion)}
                    </div>

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="fw-bold" style={{ fontSize: '0.875rem', color: '#000' }}>
                          {getTituloNotificacion(notif.nombre_tipo_notificacion, notif.nombre_notificacion)}
                        </div>
                        {!notif.leida && (
                          <span 
                            className="bg-primary rounded-circle ms-2"
                            style={{ width: '8px', height: '8px', flexShrink: 0 }}
                          ></span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.7rem', lineHeight: '1.4', color: '#000' }}>
                        {formatearMensajeLimpio(notif.nombre_notificacion, notif.nombre_tipo_notificacion)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="border-top text-center">
              <button
                onClick={abrirModalNotificaciones}
                className="btn btn-link w-100 text-decoration-none py-2 fw-bold"
                style={{ fontSize: '0.875rem', color: '#000' }}
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}

      <ModalNotificaciones
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        notificaciones={notificaciones}
        onMarcarLeida={marcarComoLeida}
      />
    </div>
  )
}

export default CamNotificaciones