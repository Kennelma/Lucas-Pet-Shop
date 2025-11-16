import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilBell, cilCheckAlt, cilSettings } from '@coreui/icons'
import { TfiAlert } from "react-icons/tfi"
import { AiFillAlert } from "react-icons/ai"
import { obtenerNotificaciones, marcarNotificacionLeida } from '../../AXIOS.SERVICES/notifications-axios'
import ModalNotificaciones from './ModalNotificaciones'
import { Toast } from 'primereact/toast'

const CamNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [animarCampana, setAnimarCampana] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const prevNotificacionesRef = useRef([])
  const toast = useRef(null)
  const navigate = useNavigate()

  // ============== UTILIDADES ==============
  const getTituloNotificacion = (tipo, mensaje) => {
    if (tipo === 'STOCK_BAJOS') {
      return 'STOCK BAJO'
    }
    
    if (tipo === 'LOTE_VENCIDO') {
      return 'LOTE VENCIDO'
    }
    
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      if (mensaje.includes('30 DÍAS')) return 'Vence en 30 días'
      if (mensaje.includes('60 DÍAS')) return 'Vence en 60 días'
      if (mensaje.includes('90 DÍAS')) return 'Vence en 90 días'
      return 'LOTE AGOTADO'
    }
    
    return 'Notificación'
  }

  const formatearMensaje = (mensaje, tipo) => {
    if (tipo === 'STOCK_BAJOS') {
      const match = mensaje.match(/EL PRODUCTO (.+?) TIENE UN STOCK = (\d+)/i)
      if (match) {
        const [, producto, stock] = match
        return `El producto ${producto.trim()} tiene ${stock} unidades.`
      }
    }
    
    if (tipo === 'LOTE_VENCIDO') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?), TIENE EL (.+?) VENCIDO/i)
      if (match) {
        const [, medicamento, lote] = match
        return `El medicamento ${medicamento.trim()} tiene el lote ${lote.trim()} vencido.`
      }
    }
    
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      const match = mensaje.match(/EL MEDICAMENTO (.+?) CON EL (.+?), SE VENCE EN (\d+) DÍAS/i)
      if (match) {
        const [, medicamento, lote, dias] = match
        return `El medicamento ${medicamento.trim()} con el lote ${lote.trim()} se vence en ${dias} días.`
      }
    }
    
    return mensaje
  }

  const getIconoReact = (tipo) => {
    if (tipo === 'STOCK_BAJOS') {
      return <TfiAlert style={{ fontSize: '20px', color: '#F59E0B' }} />
    }
    if (tipo === 'LOTE_VENCIDO') {
      return <AiFillAlert style={{ fontSize: '24px', color: '#DC2626' }} />
    }
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      return <AiFillAlert style={{ fontSize: '24px', color: '#2563e9ff' }} />
    }
    return '🔔'
  }

  const determinarPlantilla = (tipo, mensaje) => {
    if (tipo === 'LOTE_VENCIDO') return 4
    
    if (tipo === 'LOTE_PROXIMO_VENCER') {
      if (mensaje.includes('30 DÍAS')) return 1
      if (mensaje.includes('60 DÍAS')) return 2
      if (mensaje.includes('90 DÍAS')) return 3
    }

    if (tipo === 'STOCK_BAJOS') return 1
    
    return 0
  }

  const reproducirSonido = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      setTimeout(() => audioContext.close(), 400)
    } catch (error) {
      console.error('Error al reproducir sonido:', error)
    }
  }

  // ============== EFECTOS ==============
  useEffect(() => {
    cargarNotificaciones()
    
    const interval = setInterval(() => {
      cargarNotificaciones()
    }, 10000) // Cada 10 segundos
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const prevCount = parseInt(localStorage.getItem('notif_count') || '0')
    
    if (noLeidas > prevCount && prevCount >= 0) {
      setAnimarCampana(true)
      setTimeout(() => setAnimarCampana(false), 500)
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

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  // ============== FUNCIONES PRINCIPALES ==============
  const cargarNotificaciones = async () => {
    try {
      const response = await obtenerNotificaciones()

       // 🔍 DEBUGGING - BORRA ESTO DESPUÉS
    console.log('===== DEBUG NOTIFICACIONES =====')
    console.log('Consulta exitosa:', response.Consulta)
    console.log('Total notificaciones:', response.notificaciones?.length)
    console.log('Notificaciones completas:', JSON.stringify(response.notificaciones, null, 2))
    console.log('================================')
      
      if (!response.Consulta) {
        throw new Error(response.mensaje || 'Error al cargar notificaciones')
      }
      
      // Adaptamos las notificaciones del backend
      const notificacionesAdaptadas = (response.notificaciones || []).map(notif => ({
        id_notificacion_pk: notif.id_notificacion_pk,
        nombre_notificacion: notif.mensaje_notificacion,
        nombre_tipo_notificacion: notif.nombre_tipo_notificacion,
        fecha_creacion: notif.fecha_creacion || new Date().toISOString(),
        plantilla_id_fk: determinarPlantilla(
          notif.nombre_tipo_notificacion, 
          notif.mensaje_notificacion
        ),
        leida: false
      }))
      
      // Ordenar por ID descendente (más recientes primero)
      notificacionesAdaptadas.sort((a, b) => b.id_notificacion_pk - a.id_notificacion_pk)
      
      // Detectar notificaciones nuevas
      const prevIds = prevNotificacionesRef.current.map(n => n.id_notificacion_pk)
      const notificacionesNuevas = notificacionesAdaptadas.filter(n => !prevIds.includes(n.id_notificacion_pk))
      
      if (notificacionesNuevas.length > 0) {
        mostrarToastNotificacion(notificacionesNuevas[0])
      }
      
      prevNotificacionesRef.current = notificacionesAdaptadas
      
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

  const mostrarToastNotificacion = (notificacion) => {
    toast.current?.show({
      severity: 'warn',
      summary: 'NUEVAS NOTIFICACIONES',
      detail: '',
      sticky: true,
      closable: true
    })
  }

  const marcarComoLeida = async (id_notificacion_pk) => {
    const notifAnterior = notificaciones.find(n => n.id_notificacion_pk === id_notificacion_pk)
    
    if (!notifAnterior || notifAnterior.leida) return
    
    // Actualización optimista
    setNotificaciones(prev => prev.map(n => 
      n.id_notificacion_pk === id_notificacion_pk ? { ...n, leida: true } : n
    ))
    setNoLeidas(prev => Math.max(0, prev - 1))
    
    try {
      const response = await marcarNotificacionLeida(id_notificacion_pk)
      
      if (!response.Consulta) {
        throw new Error(response.mensaje || 'Error al marcar como leída')
      }
      
      // Remover de la lista después de 500ms
      setTimeout(() => {
        setNotificaciones(prev => prev.filter(n => n.id_notificacion_pk !== id_notificacion_pk))
      }, 500)
      
    } catch (error) {
      console.error('Error al marcar notificación:', error)
      // Revertir en caso de error
      setNotificaciones(prev => prev.map(n => 
        n.id_notificacion_pk === id_notificacion_pk ? { ...n, leida: false } : n
      ))
      setNoLeidas(prev => prev + 1)
    }
  }

  const marcarTodasComoLeidas = async (e) => {
    e.stopPropagation()
    
    if (notificaciones.length === 0) return
    
    const notificacionesAnteriores = [...notificaciones]
    const noLeidasAnterior = noLeidas
    
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)
    
    try {
      const promesas = notificaciones.map(n => marcarNotificacionLeida(n.id_notificacion_pk))
      await Promise.allSettled(promesas)
      
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

  // ============== RENDER ==============
  return (
    <>
      <style>
  {`
    .p-toast .p-toast-message {
      width: 280px !important;
      min-width: 280px !important;
    }
    .p-toast .p-toast-message-content {
      padding: 0.75rem !important;
    }
    .p-toast .p-toast-summary {
      font-size: 0.7rem !important;
      font-weight: 600 !important;
    }
    .p-toast-bottom-right {
      bottom: 20px !important;
      right: 5px !important;
    }
    /* O prueba con esto si lo anterior no funciona */
    .p-toast.p-toast-bottom-right {
      bottom: 20px !important;
      margin-right: 0 !important;
    }
    .p-toast .p-toast-message-warn {
      background-color: #dc3545 !important;
      border-color: #dc3545 !important;
    }
    .p-toast .p-toast-message-warn .p-toast-message-icon,
    .p-toast .p-toast-message-warn .p-toast-icon-close {
      color: #fff !important;
    }
    .p-toast .p-toast-message-warn .p-toast-summary,
    .p-toast .p-toast-message-warn .p-toast-detail {
      color: #fff !important;
    }
  `}
</style>
      <Toast ref={toast} position="bottom-right" />
      
      <div className="nav-item" ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setDropdownOpen(!dropdownOpen)
            if (!dropdownOpen) {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              ctx.resume().then(() => ctx.close())
            }
          }}
          className="nav-link border-0 bg-transparent"
          style={{ cursor: 'pointer', position: 'relative', padding: '0.3rem 1rem' }}
        >
          <div className={animarCampana ? 'animate-shake' : ''} style={{ display: 'inline-block', position: 'relative' }}>
            <CIcon icon={cilBell} size="lg" />
            {noLeidas > 0 && (
              <span 
                className="position-absolute badge rounded-pill bg-danger" 
                style={{ 
                  fontSize: '0.5rem',
                  padding: '0.25rem 0.35rem', 
                  minWidth: '16px', 
                  height: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  top: '-6px',
                  right: '-8px'
                }} 
              >
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </div>
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
            {/* Header */}
            <div className="bg-light border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
              <span className="fw-semibold" style={{ color: '#000' }}>
                {noLeidas} {noLeidas === 1 ? 'notificación' : 'notificaciones'}
              </span>
              <div className="d-flex gap-2">
                {noLeidas > 0 && (
                  <CIcon 
                    icon={cilCheckAlt} 
                    size="lg" 
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

            {/* Contenido */}
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
                    Las notificaciones de stock bajo y lotes por vencer aparecerán aquí
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
                      transition: 'all 0.2s',
                      opacity: notif.leida ? 0.5 : 1 
                    }}
                    onClick={() => marcarComoLeida(notif.id_notificacion_pk)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.leida ? '#eff6ff' : 'white'}
                  >
                    <div className="d-flex gap-3">
                      <div style={{ flexShrink: 0, marginTop: '2px' }}>
                        {getIconoReact(notif.nombre_tipo_notificacion)}
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
                            />
                          )}
                        </div>
                        
                        <div style={{ fontSize: '0.7rem', lineHeight: '1.4', color: '#000' }}>
                          {formatearMensaje(notif.nombre_notificacion, notif.nombre_tipo_notificacion)}
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
    </>
  )
}

export default CamNotificaciones