import React, { useState, useEffect } from 'react';
import { SparklesIcon, ScissorsIcon, PlusIcon, PencilIcon, TrashIcon, CurrencyDollarIcon, CalendarDaysIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import axios from 'axios';
import './peluqueria-canina.css';

const API_URL = "http://localhost:4000/api/servicios-peluqueria";

const PeluqueriaCanina = () => {
  const [promociones, setPromociones] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalPromocionAbierto, setModalPromocionAbierto] = useState(false);
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);
  const [servicioEditando, setServicioEditando] = useState(null);

  // Form data para promociones
  const [formPromocion, setFormPromocion] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: ''
  });

  // Form data para servicios
  const [formServicio, setFormServicio] = useState({
    nombre_servicio_peluqueria: '',
    descripcion_servicio: '',
    precio_servicio: '',
    duracion_estimada: '',
    requisitos: ''
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resPromociones, resServicios] = await Promise.all([
        axios.get(`${API_URL}/ver`, { params: { tipo_servicio: 'PROMOCIONES' } }),
        axios.get(`${API_URL}/ver`, { params: { tipo_servicio: 'PELUQUERIA' } })
      ]);
      
      console.log('Promociones:', resPromociones.data);
      console.log('Servicios:', resServicios.data);
      
      setPromociones(resPromociones.data.servicios || []);
      setServicios(resServicios.data.servicios || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: 'No se pudieron cargar los datos',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================== PROMOCIONES ====================
  
  const abrirModalPromocion = (promocion = null) => {
    if (promocion) {
      setFormPromocion({
        nombre_promocion: promocion.nombre_promocion,
        descripcion_promocion: promocion.descripcion_promocion,
        precio_promocion: promocion.precio_promocion,
        dias_promocion: promocion.dias_promocion
      });
      setPromocionEditando(promocion);
    } else {
      setFormPromocion({
        nombre_promocion: '',
        descripcion_promocion: '',
        precio_promocion: '',
        dias_promocion: ''
      });
      setPromocionEditando(null);
    }
    setModalPromocionAbierto(true);
  };

  const handleSubmitPromocion = async (e) => {
    e.preventDefault();
    
    try {
      if (promocionEditando) {
        // Actualizar
        await axios.put(`${API_URL}/actualizar`, {
          id: promocionEditando.id_promocion_pk,
          ...formPromocion,
          tipo_servicio: 'PROMOCIONES'
        });
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'La promoción se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Crear
        await axios.post(`${API_URL}/insertar`, {
          ...formPromocion,
          tipo_servicio: 'PROMOCIONES'
        });
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'La promoción se creó correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setModalPromocionAbierto(false);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la promoción',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleEliminarPromocion = async (promocion) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar promoción?',
      text: `Se eliminará: ${promocion.nombre_promocion}`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/eliminar`, {
          data: { id: promocion.id_promocion_pk, tipo_servicio: 'PROMOCIONES' }
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'La promoción fue eliminada',
          timer: 2000,
          showConfirmButton: false
        });
        
        cargarDatos();
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la promoción',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // ==================== SERVICIOS ====================
  
  const abrirModalServicio = (servicio = null) => {
    if (servicio) {
      setFormServicio({
        nombre_servicio_peluqueria: servicio.nombre_servicio_peluqueria,
        descripcion_servicio: servicio.descripcion_servicio,
        precio_servicio: servicio.precio_servicio,
        duracion_estimada: servicio.duracion_estimada,
        requisitos: servicio.requisitos || ''
      });
      setServicioEditando(servicio);
    } else {
      setFormServicio({
        nombre_servicio_peluqueria: '',
        descripcion_servicio: '',
        precio_servicio: '',
        duracion_estimada: '',
        requisitos: ''
      });
      setServicioEditando(null);
    }
    setModalServicioAbierto(true);
  };

  const handleSubmitServicio = async (e) => {
    e.preventDefault();
    
    try {
      if (servicioEditando) {
        // Actualizar
        await axios.put(`${API_URL}/actualizar`, {
          id: servicioEditando.id_servicio_peluqueria_pk,
          ...formServicio,
          tipo_servicio: 'PELUQUERIA'
        });
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El servicio se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Crear
        await axios.post(`${API_URL}/insertar`, {
          ...formServicio,
          tipo_servicio: 'PELUQUERIA'
        });
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El servicio se creó correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setModalServicioAbierto(false);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el servicio',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleEliminarServicio = async (servicio) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar servicio?',
      text: `Se eliminará: ${servicio.nombre_servicio_peluqueria}`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/eliminar`, {
          data: { id: servicio.id_servicio_peluqueria_pk, tipo_servicio: 'PELUQUERIA' }
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El servicio fue eliminado',
          timer: 2000,
          showConfirmButton: false
        });
        
        cargarDatos();
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el servicio',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  return (
    <div className="peluqueria-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="peluqueria-header">
          <div className="icon-container">
            <div className="icon-box">
              <SparklesIcon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
              <ScissorsIcon style={{ width: '24px', height: '24px', color: '#10b981' }} />
            </div>
          </div>
          <h1 className="peluqueria-title">Peluquería Canina</h1>
          <p className="peluqueria-subtitle">Gestiona promociones y servicios de peluquería para mascotas</p>
        </div>

        {loading ? (
          <div className="section">
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando datos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* PROMOCIONES */}
            <div className="section">
              <div className="section-header">
                <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
                  <SparklesIcon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                </div>
                <h2 className="section-title">Promociones</h2>
                <button onClick={() => abrirModalPromocion()} className="btn btn-primary btn-lg" style={{ marginLeft: 'auto' }}>
                  <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Nueva Promoción
                </button>
              </div>

              {promociones.length === 0 ? (
                <div className="empty-state">
                  <SparklesIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
                  <h3 className="empty-state-title">No hay promociones</h3>
                  <p className="empty-state-description">Crea tu primera promoción</p>
                  <button onClick={() => abrirModalPromocion()} className="btn btn-primary">
                    <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Nueva Promoción
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {promociones.map((promo) => (
                    <div key={promo.id_promocion_pk} className="card promocion-card">
                      <div className="card-header">
                        <h3 className="card-title">{promo.nombre_promocion}</h3>
                      </div>
                      <p className="card-description">{promo.descripcion_promocion}</p>
                      <div className="card-details">
                        <div className="detail-row">
                          <span className="detail-label"><CurrencyDollarIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />Precio:</span>
                          <span className="detail-value detail-price">L. {parseFloat(promo.precio_promocion || 0).toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label"><CalendarDaysIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />Duración:</span>
                          <span className="detail-value detail-duration">{promo.dias_promocion.join(', ')}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => abrirModalPromocion(promo)} className="btn btn-primary">
                          <PencilIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />Editar
                        </button>
                        <button onClick={() => handleEliminarPromocion(promo)} className="btn btn-danger">
                          <TrashIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SERVICIOS */}
            <div className="section">
              <div className="section-header">
                <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
                  <ScissorsIcon style={{ width: '24px', height: '24px', color: '#10b981' }} />
                </div>
                <h2 className="section-title">Servicios</h2>
                <button onClick={() => abrirModalServicio()} className="btn btn-success btn-lg" style={{ marginLeft: 'auto' }}>
                  <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Nuevo Servicio
                </button>
              </div>

              {servicios.length === 0 ? (
                <div className="empty-state">
                  <ScissorsIcon style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
                  <h3 className="empty-state-title">No hay servicios</h3>
                  <p className="empty-state-description">Crea tu primer servicio</p>
                  <button onClick={() => abrirModalServicio()} className="btn btn-success">
                    <PlusIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Nuevo Servicio
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {servicios.map((serv) => (
                    <div key={serv.id_servicio_peluqueria_pk} className="card servicio-card">
                      <div className="card-header">
                        <h3 className="card-title">{serv.nombre_servicio_peluqueria}</h3>
                      </div>
                      <p className="card-description">{serv.descripcion_servicio}</p>
                      <div className="card-details">
                        <div className="detail-row">
                          <span className="detail-label"><CurrencyDollarIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />Precio:</span>
                          <span className="detail-value detail-price">L. {parseFloat(serv.precio_servicio || 0).toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label"><ClockIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />Duración:</span>
                          <span className="detail-value detail-duration">{serv.duracion_estimada} min</span>
                        </div>
                        {serv.requisitos && (
                          <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span className="detail-label"><ShieldCheckIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />Requisitos:</span>
                            <span className="detail-value" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{serv.requisitos}</span>
                          </div>
                        )}
                      </div>
                      <div className="card-actions">
                        <button onClick={() => abrirModalServicio(serv)} className="btn btn-success">
                          <PencilIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />Editar
                        </button>
                        <button onClick={() => handleEliminarServicio(serv)} className="btn btn-danger">
                          <TrashIcon style={{ width: '14px', height: '14px', marginRight: '4px' }} />Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL PROMOCION */}
      {modalPromocionAbierto && (
        <div className="modal-overlay" onClick={() => setModalPromocionAbierto(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{promocionEditando ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
              <button onClick={() => setModalPromocionAbierto(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitPromocion}>
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input type="text" className="form-input" value={formPromocion.nombre_promocion} 
                    onChange={(e) => setFormPromocion({...formPromocion, nombre_promocion: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción *</label>
                  <textarea className="form-input form-textarea" value={formPromocion.descripcion_promocion}
                    onChange={(e) => setFormPromocion({...formPromocion, descripcion_promocion: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio (L) *</label>
                  <input type="number" step="0.01" className="form-input" value={formPromocion.precio_promocion}
                    onChange={(e) => setFormPromocion({...formPromocion, precio_promocion: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Días *</label>
                  <input type="number" className="form-input" value={formPromocion.dias_promocion}
                    onChange={(e) => setFormPromocion({...formPromocion, dias_promocion: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" onClick={() => setModalPromocionAbierto(false)} className="btn btn-secondary">Cancelar</button>
                  <button type="submit" className="btn btn-primary">{promocionEditando ? 'Actualizar' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SERVICIO */}
      {modalServicioAbierto && (
        <div className="modal-overlay" onClick={() => setModalServicioAbierto(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
              <button onClick={() => setModalServicioAbierto(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitServicio}>
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input type="text" className="form-input" value={formServicio.nombre_servicio_peluqueria}
                    onChange={(e) => setFormServicio({...formServicio, nombre_servicio_peluqueria: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción *</label>
                  <textarea className="form-input form-textarea" value={formServicio.descripcion_servicio}
                    onChange={(e) => setFormServicio({...formServicio, descripcion_servicio: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio (L) *</label>
                  <input type="number" step="0.01" className="form-input" value={formServicio.precio_servicio}
                    onChange={(e) => setFormServicio({...formServicio, precio_servicio: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Duración (min) *</label>
                  <input type="number" className="form-input" value={formServicio.duracion_estimada}
                    onChange={(e) => setFormServicio({...formServicio, duracion_estimada: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Requisitos</label>
                  <textarea className="form-input form-textarea" value={formServicio.requisitos}
                    onChange={(e) => setFormServicio({...formServicio, requisitos: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" onClick={() => setModalServicioAbierto(false)} className="btn btn-secondary">Cancelar</button>
                  <button type="submit" className="btn btn-success">{servicioEditando ? 'Actualizar' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeluqueriaCanina;