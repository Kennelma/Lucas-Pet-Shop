import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CButtonGroup, CSpinner, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormSelect, CFormTextarea, CFormInput, CFormLabel
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHistory, faPlus, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Recordatorios = () => {
  // ═══════════════════════════════════════════════
  // ESTADOS PRINCIPALES
  // ═══════════════════════════════════════════════
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEnvioVisible, setModalEnvioVisible] = useState(false);
  const [formData, setFormData] = useState({
    mensaje_recordatorio: '',
    programada_para: '',
    ultimo_envio: new Date().toISOString().slice(0, 19).replace('T', ' '), // fecha actual,
    intentos: 0,
    ultimo_error: null,
    id_estado_programacion_fk: '',
    id_cliente_fk: null,
    id_tipo_item_fk: '',
    id_frecuencia_fk: ''
  });
  const [editando, setEditando] = useState(false);
  const [activeTab, setActiveTab] = useState('recordatorios');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(false);

  // Estados para catálogos
  const [tiposItems, setTiposItems] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [estadosProgramacion, setEstadosProgramacion] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);

  // Estados para modal de envío
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState('');
  const [recordatoriosActivos, setRecordatoriosActivos] = useState(0);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [frecuenciaSeleccionada, setFrecuenciaSeleccionada] = useState('');

  // ═══════════════════════════════════════════════
  // API HELPERS
  // ═══════════════════════════════════════════════
  const API_URL = "http://localhost:4000/api/recordatorios";
  
  const getHeaders = () => {
    const token = sessionStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    };
  };

  // ═══════════════════════════════════════════════
  // CARGAR DATOS AL INICIAR
  // ═══════════════════════════════════════════════
  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);

      // Cargar recordatorios
      const resRecordatorios = await axios.get(`${API_URL}/ver`, {
        headers: getHeaders(),
      });
      setRecordatorios(resRecordatorios.data.recordatorios || []);

      // Cargar catálogos
      const [resTipos, resFrecuencias, resEstados] = await Promise.all([
        axios.get(`${API_URL}/verCatalogo?tipo_catalogo=TIPO_SERVICIO`, { headers: getHeaders() }),
        axios.get(`${API_URL}/verCatalogo?tipo_catalogo=FRECUENCIA`, { headers: getHeaders() }),
        axios.get(`${API_URL}/verCatalogo?tipo_catalogo=ESTADO`, { headers: getHeaders() })
      ]);

      setTiposItems(resTipos.data.servicios || []);
      setFrecuencias(resFrecuencias.data.servicios || []);
      setEstadosProgramacion(resEstados.data.servicios || []);

    } catch (err) {
      console.error('Error cargando datos:', err);
      alert('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  // FUNCIONES PARA MODAL DE RECORDATORIO
  // ═══════════════════════════════════════════════
  const abrirModal = (recordatorio = null) => {
    if (recordatorio) {
      setFormData({
        id_recordatorio_pk: recordatorio.id_recordatorio_pk,
        mensaje_recordatorio: recordatorio.mensaje_recordatorio,
        programada_para: recordatorio.programada_para?.split('T')[0] || '',
        ultimo_envio: recordatorio.ultimo_envio,
        intentos: recordatorio.intentos || 0,
        ultimo_error: recordatorio.ultimo_error,
        id_estado_programacion_fk: recordatorio.id_estado_programacion_fk,
        id_cliente_fk: recordatorio.id_cliente_fk,
        id_tipo_item_fk: recordatorio.id_tipo_item_fk,
        id_frecuencia_fk: recordatorio.id_frecuencia_fk
      });
      setEditando(true);
    } else {
      setFormData({
        mensaje_recordatorio: '',
        programada_para: '',
        ultimo_envio: new Date().toISOString().slice(0, 19).replace('T', ' '), // fecha actual,
        intentos: 0,
        ultimo_error: null,
        id_estado_programacion_fk: '',
        id_cliente_fk: null,
        id_tipo_item_fk: '',
        id_frecuencia_fk: ''
      });
      setEditando(false);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData({
      mensaje_recordatorio: '',
      programada_para: '',
      ultimo_envio: new Date().toISOString().slice(0, 19).replace('T', ' '), // fecha actual,
      intentos: 0,
      ultimo_error: null,
      id_estado_programacion_fk: '',
      id_cliente_fk: null,
      id_tipo_item_fk: '',
      id_frecuencia_fk: ''
    });
    setEditando(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarRecordatorio = async () => {
    try {
      // Validar campos obligatorios
      if (!formData.mensaje_recordatorio || !formData.programada_para || 
          !formData.id_tipo_item_fk || !formData.id_frecuencia_fk || 
          !formData.id_estado_programacion_fk) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      setLoading(true);

      // Preparar datos EXACTAMENTE como el backend espera
      const datosEnviar = {
        mensaje_recordatorio: formData.mensaje_recordatorio,
        programada_para: formData.programada_para,
        ultimo_envio: formData.ultimo_envio ||  new Date().toISOString().slice(0, 19).replace('T', ' '), // fecha actual,
        intentos: parseInt(formData.intentos) || 0,
        ultimo_error: formData.ultimo_error || null,
        id_estado_programacion_fk: parseInt(formData.id_estado_programacion_fk),
        id_cliente_fk: formData.id_cliente_fk || null,
        id_tipo_item_fk: parseInt(formData.id_tipo_item_fk),
        id_frecuencia_fk: parseInt(formData.id_frecuencia_fk)
      };

      console.log('📤 Datos a enviar:', datosEnviar);

      let resultado;
      if (editando) {
        // ACTUALIZAR
        datosEnviar.id_recordatorio = formData.id_recordatorio_pk;
        const res = await axios.put(`${API_URL}/actualizar`, datosEnviar, {
          headers: getHeaders(),
        });
        resultado = res.data;
      } else {
        // INSERTAR
        const res = await axios.post(`${API_URL}/insertar`, datosEnviar, {
          headers: getHeaders(),
        });
        resultado = res.data;
      }

      console.log('📥 Respuesta del servidor:', resultado);

      if (resultado.Consulta) {
        alert(resultado.mensaje || 'Operación exitosa ✅');
        await cargarTodo();
        cerrarModal();
      } else {
        alert('❌ Error: ' + (resultado.error || 'No se pudo guardar'));
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      alert('Error al guardar: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  // FUNCIONES PARA MODAL DE ENVÍO
  // ═══════════════════════════════════════════════
  const abrirModalEnvio = () => {
    setMensajeEnvio('');
    setTipoSeleccionado('');
    setFrecuenciaSeleccionada('');
    calcularRecordatoriosActivos();
    setModalEnvioVisible(true);
  };

  const calcularRecordatoriosActivos = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const activosHoy = recordatorios.filter(r =>
      r.id_estado_programacion_fk === 1 &&
      r.programada_para?.split('T')[0] === hoy &&
      (tipoSeleccionado ? r.id_tipo_item_fk == tipoSeleccionado : true) &&
      (frecuenciaSeleccionada ? r.id_frecuencia_fk == frecuenciaSeleccionada : true)
    ).length;
    setRecordatoriosActivos(activosHoy);
  };

  useEffect(() => {
    if (modalEnvioVisible) {
      calcularRecordatoriosActivos();
    }
  }, [tipoSeleccionado, frecuenciaSeleccionada, modalEnvioVisible]);

  const enviarRecordatorios = async () => {
    setLoadingEnvio(true);
    setMensajeEnvio('');
    try {
      const res = await axios.post(
        "http://localhost:4000/api/whatsapp/enviar",
        {
          tipo: tipoSeleccionado || null,
          frecuencia: frecuenciaSeleccionada || null
        },
        {
          headers: getHeaders()
        }
      );
      if (res.data.Consulta) {
        setMensajeEnvio('✅ ' + res.data.mensaje);
        await cargarTodo();
      } else {
        setMensajeEnvio('❌ Error: ' + (res.data.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
      setMensajeEnvio('❌ Error al conectar con el servidor: ' + err.message);
    } finally {
      setLoadingEnvio(false);
    }
  };

  // ═══════════════════════════════════════════════
  // FILTROS Y SEPARACIÓN DE DATOS
  // ═══════════════════════════════════════════════
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const recordatoriosPendientes = recordatorios.filter(r => {
    const fechaProgramada = new Date(r.programada_para);
    fechaProgramada.setHours(0, 0, 0, 0);
    return fechaProgramada >= hoy;
  });

  const recordatoriosPasados = recordatorios.filter(r => {
    const fechaProgramada = new Date(r.programada_para);
    fechaProgramada.setHours(0, 0, 0, 0);
    return fechaProgramada < hoy;
  });

  const recordatoriosFiltrados = recordatoriosPendientes.filter(r => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'activos') return r.id_estado_programacion_fk === 1;
    if (filtroEstado === 'inactivos') return r.id_estado_programacion_fk === 2;
    return true;
  });

  // ═══════════════════════════════════════════════
  // RENDERIZAR TABLA
  // ═══════════════════════════════════════════════
  const renderTablaRecordatorios = (listaRecordatorios, esHistorial = false) => {
    if (listaRecordatorios.length === 0) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="8" className="text-center text-muted py-4">
            {esHistorial ? 'No hay recordatorios pasados' : 'No hay recordatorios pendientes'}
          </CTableDataCell>
        </CTableRow>
      );
    }

    return listaRecordatorios.map((r) => {
      const estado = estadosProgramacion.find(e => e.id_estado_pk === r.id_estado_programacion_fk)?.nombre_estado || '—';
      const colorEstado = r.id_estado_programacion_fk === 1 ? 'success' : 'secondary';
      const frecuencia = frecuencias.find(f => f.id_frecuencia_record_pk === r.id_frecuencia_fk)?.frecuencia_recordatorio || '—';
      const tipoItem = tiposItems.find(t => t.id_tipo_item_pk === r.id_tipo_item_fk)?.nombre_tipo_item || '—';
      
      const fechaProgramada = r.programada_para ? new Date(r.programada_para).toLocaleDateString('es-ES') : '—';
      const fechaUltimoEnvio = r.ultimo_envio ? new Date(r.ultimo_envio).toLocaleDateString('es-ES') : 'Sin envíos';
      
      return (
        <CTableRow key={r.id_recordatorio_pk}>
          <CTableDataCell><CBadge color={colorEstado}>{estado}</CBadge></CTableDataCell>
          <CTableDataCell>{r.mensaje_recordatorio.substring(0, 50)}{r.mensaje_recordatorio.length > 50 ? '...' : ''}</CTableDataCell>
          <CTableDataCell>{tipoItem}</CTableDataCell>
          <CTableDataCell>{frecuencia}</CTableDataCell>
          <CTableDataCell>{fechaProgramada}</CTableDataCell>
          <CTableDataCell>{fechaUltimoEnvio}</CTableDataCell>
          <CTableDataCell>
            <CBadge color="info">{r.intentos || 0}</CBadge>
            {r.ultimo_error && <small className="text-danger d-block mt-1">{r.ultimo_error.substring(0, 30)}...</small>}
          </CTableDataCell>
          <CTableDataCell>
            {!esHistorial && (
              <CButton size="sm" color="info" onClick={() => abrirModal(r)}>
                Editar
              </CButton>
            )}
            {esHistorial && <span className="text-muted">Finalizado</span>}
          </CTableDataCell>
        </CTableRow>
      );
    });
  };

  // ═══════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════
  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <FontAwesomeIcon icon={faBell} className="me-2" />
                <strong>Gestión de Recordatorios Automáticos</strong>
              </div>
              <div>
                <CButton color="success" className="me-2" onClick={abrirModalEnvio}>
                  <FontAwesomeIcon icon={faPaperPlane} className="me-1" /> Enviar Recordatorios
                </CButton>
                <CButton color="primary" onClick={() => abrirModal()}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Recordatorio
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>
              <CNav variant="tabs" className="mb-3">
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'recordatorios'}
                    onClick={() => setActiveTab('recordatorios')}
                  >
                    <FontAwesomeIcon icon={faBell} className="me-1" /> 
                    Recordatorios Pendientes ({recordatoriosPendientes.length})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'historial'}
                    onClick={() => setActiveTab('historial')}
                  >
                    <FontAwesomeIcon icon={faHistory} className="me-1" /> 
                    Historial ({recordatoriosPasados.length})
                  </CNavLink>
                </CNavItem>
              </CNav>

              {activeTab === 'recordatorios' && (
                <CButtonGroup className="mb-3">
                  <CButton 
                    color={filtroEstado === 'todos' ? 'primary' : 'outline-primary'} 
                    size="sm" 
                    onClick={() => setFiltroEstado('todos')}
                  >
                    Todos ({recordatoriosPendientes.length})
                  </CButton>
                  <CButton 
                    color={filtroEstado === 'activos' ? 'success' : 'outline-success'} 
                    size="sm" 
                    onClick={() => setFiltroEstado('activos')}
                  >
                    Activos ({recordatoriosPendientes.filter(r => r.id_estado_programacion_fk === 1).length})
                  </CButton>
                  <CButton 
                    color={filtroEstado === 'inactivos' ? 'secondary' : 'outline-secondary'} 
                    size="sm" 
                    onClick={() => setFiltroEstado('inactivos')}
                  >
                    Inactivos ({recordatoriosPendientes.filter(r => r.id_estado_programacion_fk === 2).length})
                  </CButton>
                </CButtonGroup>
              )}

              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
              ) : (
                <CTabContent>
                  <CTabPane visible={activeTab === 'recordatorios'}>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableHeaderCell>Mensaje</CTableHeaderCell>
                          <CTableHeaderCell>Tipo Servicio</CTableHeaderCell>
                          <CTableHeaderCell>Frecuencia</CTableHeaderCell>
                          <CTableHeaderCell>Programada Para</CTableHeaderCell>
                          <CTableHeaderCell>Último Envío</CTableHeaderCell>
                          <CTableHeaderCell>Intentos</CTableHeaderCell>
                          <CTableHeaderCell>Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {renderTablaRecordatorios(recordatoriosFiltrados, false)}
                      </CTableBody>
                    </CTable>
                  </CTabPane>

                  <CTabPane visible={activeTab === 'historial'}>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableHeaderCell>Mensaje</CTableHeaderCell>
                          <CTableHeaderCell>Tipo Servicio</CTableHeaderCell>
                          <CTableHeaderCell>Frecuencia</CTableHeaderCell>
                          <CTableHeaderCell>Programada Para</CTableHeaderCell>
                          <CTableHeaderCell>Último Envío</CTableHeaderCell>
                          <CTableHeaderCell>Intentos</CTableHeaderCell>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {renderTablaRecordatorios(recordatoriosPasados, true)}
                      </CTableBody>
                    </CTable>
                  </CTabPane>
                </CTabContent>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ═══════════════════════════════════════════════ */}
      {/* MODAL PARA CREAR/EDITAR RECORDATORIO */}
      {/* ═══════════════════════════════════════════════ */}
      <CModal visible={modalVisible} onClose={cerrarModal} size="lg">
        <CModalHeader onClose={cerrarModal}>
          <CModalTitle>{editando ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Destinado a clientes que compraron: *</CFormLabel>
            <CFormSelect
              name="id_tipo_item_fk"
              value={formData.id_tipo_item_fk}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar servicio...</option>
              {tiposItems.map(t => (
                <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                  {t.nombre_tipo_item}
                </option>
              ))}
            </CFormSelect>
          </div>

          <div className="mb-3">
            <CFormLabel>Frecuencia *</CFormLabel>
            <CFormSelect
              name="id_frecuencia_fk"
              value={formData.id_frecuencia_fk}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar frecuencia...</option>
              {frecuencias.map(f => (
                <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                  {f.frecuencia_recordatorio}
                </option>
              ))}
            </CFormSelect>
          </div>

          
          
          <div className="mb-3">
            <CFormLabel>Mensaje del Recordatorio *</CFormLabel>
            <CFormTextarea
              name="mensaje_recordatorio"
              value={formData.mensaje_recordatorio}
              onChange={manejarCambio}
              placeholder="Escribe el mensaje que se enviará a todos los clientes..."
              rows={4}
              required
            />
          </div>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cerrarModal} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={guardarRecordatorio} disabled={loading}>
            {loading ? <CSpinner size="sm" className="me-1" /> : null}
            {editando ? 'Actualizar' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ═══════════════════════════════════════════════ */}
      {/* MODAL PARA ENVÍO MANUAL */}
      {/* ═══════════════════════════════════════════════ */}
      <CModal visible={modalEnvioVisible} onClose={() => setModalEnvioVisible(false)}>
        <CModalHeader onClose={() => setModalEnvioVisible(false)}>
          <CModalTitle>Envío Manual de Recordatorios</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Selecciona filtros opcionales antes de enviar recordatorios a todos los clientes:</p>

          <div className="mb-3">
            <CFormLabel>Destinado</CFormLabel>
            <CFormSelect
              value={tipoSeleccionado}
              onChange={e => setTipoSeleccionado(e.target.value)}
            >
              <option value="">Todos los tipos de servicio</option>
              {tiposItems.map(t => (
                <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                  {t.nombre_tipo_item}
                </option>
              ))}
            </CFormSelect>
          </div>

          <div className="mb-3">
            <CFormLabel>Frecuencia</CFormLabel>
            <CFormSelect
              value={frecuenciaSeleccionada}
              onChange={e => setFrecuenciaSeleccionada(e.target.value)}
            >
              <option value="">Todas las frecuencias</option>
              {frecuencias.map(f => (
                <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                  {f.frecuencia_recordatorio}
                </option>
              ))}
            </CFormSelect>
          </div>

          <div className="alert alert-info mt-3">
            <FontAwesomeIcon icon={faBell} className="me-2" />
            <strong>Recordatorios activos hoy que coinciden:</strong> {recordatoriosActivos}
          </div>

          {loadingEnvio && <div className="text-center mt-3"><CSpinner color="primary" /></div>}
          {mensajeEnvio && (
            <div className={`alert ${mensajeEnvio.includes('✅') ? 'alert-success' : 'alert-danger'} mt-3`}>
              {mensajeEnvio}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalEnvioVisible(false)} disabled={loadingEnvio}>
            Cancelar
          </CButton>
          <CButton
            color="success"
            onClick={enviarRecordatorios}
            disabled={loadingEnvio || recordatoriosActivos === 0}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
            Enviar a Todos ({recordatoriosActivos})
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Recordatorios;