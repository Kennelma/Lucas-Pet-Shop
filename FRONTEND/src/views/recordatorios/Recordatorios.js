import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CBadge,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormSwitch,
  CButtonGroup
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faBell,
  faCalendar,
  faPaperPlane,
  faUser,
  faPhone,
  faHistory,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faToggleOn,
  faToggleOff,
  faFilter
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://localhost:4000/api';

const Recordatorios = () => {
  // 🎯 ESTADOS DEL COMPONENTE
  const [recordatorios, setRecordatorios] = useState([]);
  const [historialEnvios, setHistorialEnvios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tiposItems, setTiposItems] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [estadosProgramacion, setEstadosProgramacion] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEnvio, setModalEnvio] = useState(false);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // 🔍 FILTROS Y TABS
  const [activeTab, setActiveTab] = useState('recordatorios');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, activos, inactivos

  // 📝 ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState({
    id_recordatorio_pk: '',
    mensaje_recordatorio: '',
    programada_para: '',
    ultimo_envio: '',
    intentos: 0,
    ultimo_error: '',
    id_estado_programacion_fk: 1, // Activo por defecto
    id_cliente_fk: '',
    id_tipo_item_fk: '',
    id_frecuencia_fk: ''
  });

  // 🔄 CARGAR DATOS AL INICIAR COMPONENTE
  useEffect(() => {
    cargarDatos();
  }, []);

  // 📋 FUNCIÓN PARA CARGAR TODOS LOS DATOS
  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarRecordatorios(),
        cargarHistorial(),
        cargarClientes(),
        cargarCatalogos()
      ]);
      setError('');
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // 📋 CARGAR RECORDATORIOS
  const cargarRecordatorios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recordatorios`);
      const data = await response.json();
      
      // DATOS DE EJEMPLO MIENTRAS NO HAY BD
      const datosEjemplo = [
        {
          id_recordatorio_pk: 1,
          mensaje_recordatorio: 'Recordatorio: Es hora de la cita de peluquería para tu mascota. ¡Te esperamos!',
          programada_para: '2025-10-15',
          ultimo_envio: '2025-09-15 10:30:00',
          intentos: 1,
          ultimo_error: null,
          id_estado_programacion_fk: 1,
          estado_nombre: 'Activo',
          id_cliente_fk: 1,
          nombre_cliente: 'Juan Pérez',
          telefono_cliente: '+504 9999-8888',
          id_tipo_item_fk: 1,
          tipo_item_nombre: 'Peluquería',
          id_frecuencia_fk: 1,
          frecuencia_dias: 30,
          frecuencia_nombre: 'Mensual'
        },
        {
          id_recordatorio_pk: 2,
          mensaje_recordatorio: 'Recordatorio: Cita de vacunación programada para tu mascota.',
          programada_para: '2025-10-20',
          ultimo_envio: '2025-09-20 14:00:00',
          intentos: 2,
          ultimo_error: 'Error de conexión',
          id_estado_programacion_fk: 1,
          estado_nombre: 'Activo',
          id_cliente_fk: 2,
          nombre_cliente: 'María González',
          telefono_cliente: '+504 8888-7777',
          id_tipo_item_fk: 2,
          tipo_item_nombre: 'Veterinaria',
          id_frecuencia_fk: 2,
          frecuencia_dias: 60,
          frecuencia_nombre: 'Bimestral'
        },
        {
          id_recordatorio_pk: 3,
          mensaje_recordatorio: 'Recordatorio: Control trimestral de tu mascota.',
          programada_para: '2025-11-10',
          ultimo_envio: null,
          intentos: 0,
          ultimo_error: null,
          id_estado_programacion_fk: 2,
          estado_nombre: 'Inactivo',
          id_cliente_fk: 3,
          nombre_cliente: 'Carlos Martínez',
          telefono_cliente: '+504 7777-6666',
          id_tipo_item_fk: 1,
          tipo_item_nombre: 'Peluquería',
          id_frecuencia_fk: 3,
          frecuencia_dias: 90,
          frecuencia_nombre: 'Trimestral'
        }
      ];
      
      setRecordatorios(datosEjemplo);
    } catch (error) {
      console.error('Error al cargar recordatorios:', error);
      setError('Error al cargar recordatorios');
    }
  };

  // 📜 CARGAR HISTORIAL DE ENVÍOS
  const cargarHistorial = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recordatorios/historial`);
      const data = await response.json();
      
      // DATOS DE EJEMPLO DEL HISTORIAL
      const historialEjemplo = [
        {
          id_envio: 1,
          id_recordatorio_fk: 1,
          nombre_cliente: 'Juan Pérez',
          telefono_cliente: '+504 9999-8888',
          mensaje_recordatorio: 'Recordatorio: Es hora de la cita de peluquería...',
          fecha_envio: '2025-09-15 10:30:00',
          exitoso: true,
          intentos: 1,
          error: null
        },
        {
          id_envio: 2,
          id_recordatorio_fk: 2,
          nombre_cliente: 'María González',
          telefono_cliente: '+504 8888-7777',
          mensaje_recordatorio: 'Recordatorio: Cita de vacunación programada...',
          fecha_envio: '2025-09-20 14:00:00',
          exitoso: false,
          intentos: 2,
          error: 'Error de conexión con servicio SMS'
        },
        {
          id_envio: 3,
          id_recordatorio_fk: 1,
          nombre_cliente: 'Juan Pérez',
          telefono_cliente: '+504 9999-8888',
          mensaje_recordatorio: 'Recordatorio: Es hora de la cita de peluquería...',
          fecha_envio: '2025-08-15 09:15:00',
          exitoso: true,
          intentos: 1,
          error: null
        }
      ];
      
      setHistorialEnvios(historialEjemplo);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  // 👥 CARGAR CLIENTES
  const cargarClientes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/ver`);
      const data = await response.json();
      
      // DATOS DE EJEMPLO
      const clientesEjemplo = [
        { id_cliente_pk: 1, nombre_cliente: 'Juan Pérez', telefono_cliente: '+504 9999-8888' },
        { id_cliente_pk: 2, nombre_cliente: 'María González', telefono_cliente: '+504 8888-7777' },
        { id_cliente_pk: 3, nombre_cliente: 'Carlos Martínez', telefono_cliente: '+504 7777-6666' }
      ];
      
      setClientes(clientesEjemplo);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  // 📚 CARGAR CATÁLOGOS
  const cargarCatalogos = async () => {
    try {
      // Tipos de items
      setTiposItems([
        { id_tipo_item_pk: 1, nombre_tipo: 'Peluquería' },
        { id_tipo_item_pk: 2, nombre_tipo: 'Veterinaria' },
        { id_tipo_item_pk: 3, nombre_tipo: 'Consulta General' }
      ]);
      
      // Frecuencias
      setFrecuencias([
        { id_frecuencia_pk: 1, nombre_frecuencia: 'Mensual', dias: 30 },
        { id_frecuencia_pk: 2, nombre_frecuencia: 'Bimestral', dias: 60 },
        { id_frecuencia_pk: 3, nombre_frecuencia: 'Trimestral', dias: 90 },
        { id_frecuencia_pk: 4, nombre_frecuencia: 'Semestral', dias: 180 }
      ]);
      
      // Estados de programación
      setEstadosProgramacion([
        { id_estado_pk: 1, nombre_estado: 'Activo' },
        { id_estado_pk: 2, nombre_estado: 'Inactivo' }
      ]);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };

  // 💾 GUARDAR RECORDATORIO
  const guardarRecordatorio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMensaje('');

    try {
      const url = editando 
        ? `${API_BASE_URL}/recordatorios/${formData.id_recordatorio_pk}/actualizar`
        : `${API_BASE_URL}/recordatorios/ingresar`;
      
      const method = editando ? 'PUT' : 'POST';

      // Simulación de guardado exitoso
      setMensaje(editando ? 'Recordatorio actualizado exitosamente' : 'Recordatorio creado exitosamente');
      
      setTimeout(() => {
        cerrarModal();
        cargarRecordatorios();
      }, 1500);

    } catch (error) {
      setError('Error al guardar el recordatorio');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ ELIMINAR RECORDATORIO
  const eliminarRecordatorio = async (recordatorio) => {
    if (window.confirm(`¿Estás seguro de eliminar el recordatorio para ${recordatorio.nombre_cliente}?`)) {
      setLoading(true);
      try {
        setMensaje('Recordatorio eliminado exitosamente');
        setTimeout(() => {
          setMensaje('');
          cargarRecordatorios();
        }, 1500);
      } catch (error) {
        setError('Error al eliminar el recordatorio');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 🔄 CAMBIAR ESTADO (ACTIVO/INACTIVO)
  const cambiarEstadoRecordatorio = async (recordatorio) => {
    try {
      const nuevoEstado = recordatorio.id_estado_programacion_fk === 1 ? 2 : 1;
      const nombreEstado = nuevoEstado === 1 ? 'activado' : 'desactivado';
      
      setMensaje(`Recordatorio ${nombreEstado} exitosamente`);
      setTimeout(() => {
        setMensaje('');
        cargarRecordatorios();
      }, 1500);
    } catch (error) {
      setError('Error al cambiar el estado del recordatorio');
      console.error('Error:', error);
    }
  };

  // 📤 ENVÍO MANUAL DE RECORDATORIOS
  const enviarRecordatoriosManual = async () => {
    try {
      setMensaje('Recordatorios enviados exitosamente');
      setModalEnvio(false);
      setTimeout(() => {
        setMensaje('');
        cargarHistorial();
      }, 3000);
    } catch (error) {
      console.error('Error al enviar recordatorios:', error);
      setError('Error al enviar recordatorios');
    }
  };

  // ✏️ EDITAR RECORDATORIO
  const editarRecordatorio = (recordatorio) => {
    setFormData({
      id_recordatorio_pk: recordatorio.id_recordatorio_pk,
      mensaje_recordatorio: recordatorio.mensaje_recordatorio,
      programada_para: recordatorio.programada_para,
      ultimo_envio: recordatorio.ultimo_envio,
      intentos: recordatorio.intentos,
      ultimo_error: recordatorio.ultimo_error,
      id_estado_programacion_fk: recordatorio.id_estado_programacion_fk,
      id_cliente_fk: recordatorio.id_cliente_fk,
      id_tipo_item_fk: recordatorio.id_tipo_item_fk,
      id_frecuencia_fk: recordatorio.id_frecuencia_fk
    });
    setEditando(true);
    setModalVisible(true);
  };

  // 🆕 NUEVO RECORDATORIO
  const nuevoRecordatorio = () => {
    setFormData({
      id_recordatorio_pk: '',
      mensaje_recordatorio: 'Recordatorio: Es hora de la cita de peluquería para tu mascota. ¡Te esperamos!',
      programada_para: '',
      ultimo_envio: '',
      intentos: 0,
      ultimo_error: '',
      id_estado_programacion_fk: 1,
      id_cliente_fk: '',
      id_tipo_item_fk: '',
      id_frecuencia_fk: ''
    });
    setEditando(false);
    setModalVisible(true);
  };

  // ❌ CERRAR MODAL
  const cerrarModal = () => {
    setModalVisible(false);
    setFormData({
      id_recordatorio_pk: '',
      mensaje_recordatorio: '',
      programada_para: '',
      ultimo_envio: '',
      intentos: 0,
      ultimo_error: '',
      id_estado_programacion_fk: 1,
      id_cliente_fk: '',
      id_tipo_item_fk: '',
      id_frecuencia_fk: ''
    });
    setEditando(false);
    setError('');
    setMensaje('');
  };

  // 📝 MANEJAR CAMBIOS EN EL FORMULARIO
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🎨 OBTENER COLOR DE BADGE
  const obtenerColorFrecuencia = (dias) => {
    if (dias <= 30) return 'danger';
    if (dias <= 60) return 'warning';
    return 'success';
  };

  // 🔍 FILTRAR RECORDATORIOS POR ESTADO
  const recordatoriosFiltrados = recordatorios.filter(rec => {
    if (filtroEstado === 'activos') return rec.id_estado_programacion_fk === 1;
    if (filtroEstado === 'inactivos') return rec.id_estado_programacion_fk === 2;
    return true;
  });

  return (
    <>
      {/* 🚨 MENSAJES DE ERROR Y ÉXITO */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {mensaje}
        </div>
      )}

      {/* 📊 TARJETA PRINCIPAL CON TABS */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <FontAwesomeIcon icon={faBell} className="me-2" />
                  <strong>Gestión de Recordatorios Automáticos</strong>
                </div>
                <div>
                  <CButton
                    color="info"
                    className="me-2"
                    onClick={() => setModalEnvio(true)}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
                    Enviar Manual
                  </CButton>
                  <CButton color="primary" onClick={nuevoRecordatorio}>
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Nuevo Recordatorio
                  </CButton>
                </div>
              </div>
              
              {/* 🗂️ NAVEGACIÓN DE TABS */}
              <CNav variant="tabs" className="mt-3">
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'recordatorios'}
                    onClick={() => setActiveTab('recordatorios')}
                  >
                    <FontAwesomeIcon icon={faBell} className="me-1" />
                    Recordatorios
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'historial'}
                    onClick={() => setActiveTab('historial')}
                  >
                    <FontAwesomeIcon icon={faHistory} className="me-1" />
                    Historial de Envíos
                  </CNavLink>
                </CNavItem>
              </CNav>
            </CCardHeader>

            <CCardBody>
              <CTabContent>
                {/* 📋 TAB DE RECORDATORIOS */}
                <CTabPane visible={activeTab === 'recordatorios'}>
                  {/* 🔍 FILTROS */}
                  <div className="mb-3 d-flex align-items-center">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    <span className="me-2">Filtrar por estado:</span>
                    <CButtonGroup role="group">
                      <CButton
                        color={filtroEstado === 'todos' ? 'primary' : 'outline-primary'}
                        onClick={() => setFiltroEstado('todos')}
                        size="sm"
                      >
                        Todos
                      </CButton>
                      <CButton
                        color={filtroEstado === 'activos' ? 'success' : 'outline-success'}
                        onClick={() => setFiltroEstado('activos')}
                        size="sm"
                      >
                        Activos
                      </CButton>
                      <CButton
                        color={filtroEstado === 'inactivos' ? 'secondary' : 'outline-secondary'}
                        onClick={() => setFiltroEstado('inactivos')}
                        size="sm"
                      >
                        Inactivos
                      </CButton>
                    </CButtonGroup>
                  </div>

                  {loading ? (
                    <div className="text-center">
                      <CSpinner color="primary" />
                      <p className="mt-2">Cargando recordatorios...</p>
                    </div>
                  ) : (
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableHeaderCell>
                            <FontAwesomeIcon icon={faUser} className="me-1" />
                            Cliente
                          </CTableHeaderCell>
                          <CTableHeaderCell>
                            <FontAwesomeIcon icon={faPhone} className="me-1" />
                            Teléfono
                          </CTableHeaderCell>
                          <CTableHeaderCell>Mensaje</CTableHeaderCell>
                          <CTableHeaderCell>Frecuencia</CTableHeaderCell>
                          <CTableHeaderCell>
                            <FontAwesomeIcon icon={faCalendar} className="me-1" />
                            Programada Para
                          </CTableHeaderCell>
                          <CTableHeaderCell>Último Envío</CTableHeaderCell>
                          <CTableHeaderCell>Intentos</CTableHeaderCell>
                          <CTableHeaderCell>Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {recordatoriosFiltrados.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan="9" className="text-center text-muted">
                              No hay recordatorios {filtroEstado !== 'todos' ? filtroEstado : ''} configurados
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          recordatoriosFiltrados.map((recordatorio) => (
                            <CTableRow key={recordatorio.id_recordatorio_pk}>
                              <CTableDataCell>
                                <CButton
                                  color={recordatorio.id_estado_programacion_fk === 1 ? 'success' : 'secondary'}
                                  size="sm"
                                  onClick={() => cambiarEstadoRecordatorio(recordatorio)}
                                  title={recordatorio.id_estado_programacion_fk === 1 ? 'Desactivar' : 'Activar'}
                                >
                                  <FontAwesomeIcon 
                                    icon={recordatorio.id_estado_programacion_fk === 1 ? faToggleOn : faToggleOff} 
                                  />
                                </CButton>
                              </CTableDataCell>
                              <CTableDataCell>{recordatorio.nombre_cliente}</CTableDataCell>
                              <CTableDataCell>{recordatorio.telefono_cliente}</CTableDataCell>
                              <CTableDataCell>
                                {recordatorio.mensaje_recordatorio.length > 40
                                  ? `${recordatorio.mensaje_recordatorio.substring(0, 40)}...`
                                  : recordatorio.mensaje_recordatorio}
                              </CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={obtenerColorFrecuencia(recordatorio.frecuencia_dias)}>
                                  {recordatorio.frecuencia_nombre} ({recordatorio.frecuencia_dias}d)
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>{recordatorio.programada_para}</CTableDataCell>
                              <CTableDataCell>
                                {recordatorio.ultimo_envio || 
                                  <span className="text-muted">Sin envíos</span>
                                }
                              </CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={recordatorio.intentos > 1 ? 'warning' : 'info'}>
                                  {recordatorio.intentos}
                                </CBadge>
                                {recordatorio.ultimo_error && (
                                  <FontAwesomeIcon 
                                    icon={faExclamationTriangle} 
                                    className="text-danger ms-1"
                                    title={recordatorio.ultimo_error}
                                  />
                                )}
                              </CTableDataCell>
                              <CTableDataCell>
                                <CButton
                                  color="warning"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => editarRecordatorio(recordatorio)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </CButton>
                                <CButton
                                  color="danger"
                                  size="sm"
                                  onClick={() => eliminarRecordatorio(recordatorio)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        )}
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>

                {/* 📜 TAB DE HISTORIAL */}
                <CTabPane visible={activeTab === 'historial'}>
                  {loading ? (
                    <div className="text-center">
                      <CSpinner color="primary" />
                      <p className="mt-2">Cargando historial...</p>
                    </div>
                  ) : (
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableHeaderCell>Fecha y Hora</CTableHeaderCell>
                          <CTableHeaderCell>Cliente</CTableHeaderCell>
                          <CTableHeaderCell>Teléfono</CTableHeaderCell>
                          <CTableHeaderCell>Mensaje</CTableHeaderCell>
                          <CTableHeaderCell>Intentos</CTableHeaderCell>
                          <CTableHeaderCell>Error</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {historialEnvios.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan="7" className="text-center text-muted">
                              No hay envíos registrados
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          historialEnvios.map((envio) => (
                            <CTableRow key={envio.id_envio}>
                              <CTableDataCell>
                                {envio.exitoso ? (
                                  <CBadge color="success">
                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                    Exitoso
                                  </CBadge>
                                ) : (
                                  <CBadge color="danger">
                                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                    Fallido
                                  </CBadge>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>{envio.fecha_envio}</CTableDataCell>
                              <CTableDataCell>{envio.nombre_cliente}</CTableDataCell>
                              <CTableDataCell>{envio.telefono_cliente}</CTableDataCell>
                              <CTableDataCell>
                                {envio.mensaje_recordatorio.length > 40
                                  ? `${envio.mensaje_recordatorio.substring(0, 40)}...`
                                  : envio.mensaje_recordatorio}
                              </CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={envio.intentos > 1 ? 'warning' : 'info'}>
                                  {envio.intentos}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>
                                {envio.error ? (
                                  <span className="text-danger">{envio.error}</span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        )}
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* 📝 MODAL PARA CREAR/EDITAR RECORDATORIO */}
      <CModal visible={modalVisible} onClose={cerrarModal} size="lg">
        <CModalHeader onClose={cerrarModal}>
          <CModalTitle>
            {editando ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={guardarRecordatorio}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="id_cliente_fk">Cliente *</CFormLabel>
                <CFormSelect
                  id="id_cliente_fk"
                  name="id_cliente_fk"
                  value={formData.id_cliente_fk}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id_cliente_pk} value={cliente.id_cliente_pk}>
                      {cliente.nombre_cliente} - {cliente.telefono_cliente}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="id_tipo_item_fk">Tipo de Servicio *</CFormLabel>
                <CFormSelect
                  id="id_tipo_item_fk"
                  name="id_tipo_item_fk"
                  value={formData.id_tipo_item_fk}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccionar servicio...</option>
                  {tiposItems.map((tipo) => (
                    <option key={tipo.id_tipo_item_pk} value={tipo.id_tipo_item_pk}>
                      {tipo.nombre_tipo}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="id_frecuencia_fk">Frecuencia *</CFormLabel>
                <CFormSelect
                  id="id_frecuencia_fk"
                  name="id_frecuencia_fk"
                  value={formData.id_frecuencia_fk}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccionar frecuencia...</option>
                  {frecuencias.map((frec) => (
                    <option key={frec.id_frecuencia_pk} value={frec.id_frecuencia_pk}>
                      {frec.nombre_frecuencia} ({frec.dias} días)
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="programada_para">Programada Para *</CFormLabel>
                <CFormInput
                  type="date"
                  id="programada_para"
                  name="programada_para"
                  value={formData.programada_para}
                  onChange={manejarCambio}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="id_estado_programacion_fk">Estado *</CFormLabel>
                <CFormSelect
                  id="id_estado_programacion_fk"
                  name="id_estado_programacion_fk"
                  value={formData.id_estado_programacion_fk}
                  onChange={manejarCambio}
                  required
                >
                  {estadosProgramacion.map((estado) => (
                    <option key={estado.id_estado_pk} value={estado.id_estado_pk}>
                      {estado.nombre_estado}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="mensaje_recordatorio">Mensaje del Recordatorio *</CFormLabel>
                <CFormTextarea
                  id="mensaje_recordatorio"
                  name="mensaje_recordatorio"
                  rows="4"
                  value={formData.mensaje_recordatorio}
                  onChange={manejarCambio}
                  placeholder="Escribe el mensaje que se enviará al cliente..."
                  required
                />
                <small className="text-muted">
                  El mensaje se enviará automáticamente según la frecuencia configurada.
                </small>
              </CCol>
            </CRow>

            {/* INFORMACIÓN ADICIONAL EN MODO EDICIÓN */}
            {editando && (
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Último Envío</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.ultimo_envio || 'Sin envíos'}
                    readOnly
                    disabled
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Intentos</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.intentos}
                    readOnly
                    disabled
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Último Error</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.ultimo_error || 'Sin errores'}
                    readOnly
                    disabled
                  />
                </CCol>
              </CRow>
            )}

            {/* MENSAJES DE ERROR Y ÉXITO EN EL MODAL */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4">
                {mensaje}
              </div>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cerrarModal}>
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={guardarRecordatorio}
            disabled={loading}
          >
            {loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Guardar')}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 📤 MODAL PARA ENVÍO MANUAL */}
      <CModal visible={modalEnvio} onClose={() => setModalEnvio(false)}>
        <CModalHeader onClose={() => setModalEnvio(false)}>
          <CModalTitle>Envío Manual de Recordatorios</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas enviar todos los recordatorios programados para hoy?</p>
          <p className="text-muted">
            Esta acción enviará notificaciones a todos los clientes con recordatorios activos programados para la fecha actual.
          </p>
          <div className="alert alert-info mt-3">
            <FontAwesomeIcon icon={faBell} className="me-2" />
            <strong>Recordatorios activos:</strong> {recordatorios.filter(r => r.id_estado_programacion_fk === 1).length}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalEnvio(false)}>
            Cancelar
          </CButton>
          <CButton color="info" onClick={enviarRecordatoriosManual}>
            <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
            Enviar Recordatorios
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Recordatorios;