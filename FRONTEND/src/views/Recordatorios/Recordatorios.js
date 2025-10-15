import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CButton, CSpinner, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormSelect, CFormTextarea, CFormLabel
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPlus } from '@fortawesome/free-solid-svg-icons';

// ✅ Importación de TUS servicios de Axios
import { 
  verRecordatorios, 
  insertarRecordatorio,
  actualizarRecordatorio, // Necesario para la función Editar
  verCatalogo // Necesario para cargar los SELECTs (catálogos)
} from '../../AXIOS.SERVICES/reminder'; 
// Ajusta la ruta de importación si es necesario.

const Recordatorios = () => {
  // ═══════════════════════════════════════════════
  // ESTADOS
  // ═══════════════════════════════════════════════
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    id_recordatorio_pk: null, 
    mensaje_recordatorio: '',
    id_tipo_item_fk: '',
    id_frecuencia_fk: ''
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordatorios, setRecordatorios] = useState([]);

  // Estados para catálogos (usados en la tabla y el modal)
  const [tiposItems, setTiposItems] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [estadosProgramacion, setEstadosProgramacion] = useState([]);

  // ═══════════════════════════════════════════════
  // CARGAR DATOS AL INICIAR
  // ═══════════════════════════════════════════════
  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);

      // 1. Cargar recordatorios usando el servicio
      const recordatoriosData = await verRecordatorios(); 
      // Tu servicio verRecordatorios devuelve solo el array de recordatorios.
      setRecordatorios(recordatoriosData || []);

      // 2. Cargar catálogos usando el servicio verCatalogo
      const [resTipos, resFrecuencias, resEstados] = await Promise.all([
        verCatalogo('TIPO_SERVICIO'),
        verCatalogo('FRECUENCIA'),
        verCatalogo('ESTADO')
      ]);

      // Nota: Tu backend de verCatalogo devuelve un objeto con la propiedad 'servicios'.
      setTiposItems(resTipos.servicios || []);
      setFrecuencias(resFrecuencias.servicios || []);
      setEstadosProgramacion(resEstados.servicios || []);

    } catch (err) {
      console.error('Error cargando datos:', err);
      alert('Error al cargar datos: ' + (err.message || 'Ver consola para detalles.'));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  // MODAL Y MANEJO DE FORMULARIO
  // ═══════════════════════════════════════════════
  const abrirModal = (recordatorio = null) => {
    if (recordatorio) {
      setFormData({
        id_recordatorio_pk: recordatorio.id_recordatorio_pk,
        mensaje_recordatorio: recordatorio.mensaje_recordatorio,
        // Convertimos a string para que CFormSelect funcione correctamente
        id_tipo_item_fk: String(recordatorio.id_tipo_item_fk),
        id_frecuencia_fk: String(recordatorio.id_frecuencia_fk)
      });
      setEditando(true);
    } else {
      setFormData({
        id_recordatorio_pk: null,
        mensaje_recordatorio: '',
        id_tipo_item_fk: '',
        id_frecuencia_fk: ''
      });
      setEditando(false);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData({ /* Limpiar */ });
    setEditando(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarRecordatorio = async () => {
    if (!formData.mensaje_recordatorio || !formData.id_tipo_item_fk || !formData.id_frecuencia_fk) {
      alert('Por favor completa todos los campos.');
      return;
    }
    
    setLoading(true);

    const datosEnviar = {
      mensaje_recordatorio: formData.mensaje_recordatorio,       
      // Aseguramos que se envíen como número (como espera tu backend)
      id_tipo_item_fk: parseInt(formData.id_tipo_item_fk),
      id_frecuencia_fk: parseInt(formData.id_frecuencia_fk)
    };

    try {
      let resultado;
      
      if (editando) {
        datosEnviar.id_recordatorio_pk = formData.id_recordatorio_pk;
        // ✅ Usando el servicio de actualización de Axios
        resultado = await actualizarRecordatorio(datosEnviar); 
      } else {
        // ✅ Usando el servicio de inserción de Axios
        resultado = await insertarRecordatorio(datosEnviar);
      }

      if (resultado.Consulta) {
        alert(resultado.mensaje || 'Operación exitosa ✅');
        await cargarTodo();
        cerrarModal();
      } else {
        alert('❌ Error: ' + (resultado.error || 'No se pudo guardar/actualizar'));
      }

    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar: ' + (error.message));
    } finally {
      setLoading(false);
    }
  };


  // ═══════════════════════════════════════════════
  // RENDERIZAR TABLA
  // ═══════════════════════════════════════════════
  const renderTablaRecordatorios = () => {
    if (recordatorios.length === 0) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="6" className="text-center text-muted py-4">
            No hay recordatorios registrados.
          </CTableDataCell>
        </CTableRow>
      );
    }

    return recordatorios.map((r) => {
      // Usamos los estados de catálogos cargados por TUS servicios
      const estado = estadosProgramacion.find(e => e.id_estado_pk === r.id_estado_programacion_fk)?.nombre_estado || '—';
      const colorEstado = r.id_estado_programacion_fk === 1 ? 'success' : 'secondary';
      const frecuencia = frecuencias.find(f => f.id_frecuencia_record_pk === r.id_frecuencia_fk)?.frecuencia_recordatorio || '—';
      const tipoItem = tiposItems.find(t => t.id_tipo_item_pk === r.id_tipo_item_fk)?.nombre_tipo_item || '—';
      
      const fechaProgramada = r.programada_para ? new Date(r.programada_para).toLocaleDateString('es-ES') : '—';
      
      return (
        <CTableRow key={r.id_recordatorio_pk}>
          <CTableDataCell><CBadge color={colorEstado}>{estado}</CBadge></CTableDataCell>
          <CTableDataCell>{r.mensaje_recordatorio.substring(0, 50)}{r.mensaje_recordatorio.length > 50 ? '...' : ''}</CTableDataCell>
          <CTableDataCell>{tipoItem}</CTableDataCell>
          <CTableDataCell>{frecuencia}</CTableDataCell>
          <CTableDataCell>{fechaProgramada}</CTableDataCell>
          <CTableDataCell>
            <CButton size="sm" color="info" onClick={() => abrirModal(r)}>
              Editar
            </CButton>
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
                <strong>Gestión de Recordatorios</strong>
              </div>
              <div>
                <CButton color="primary" onClick={() => abrirModal()}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Recordatorio
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>
              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell>Mensaje</CTableHeaderCell>
                      <CTableHeaderCell>Tipo Servicio</CTableHeaderCell>
                      <CTableHeaderCell>Frecuencia</CTableHeaderCell>
                      <CTableHeaderCell>Programada Para</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {renderTablaRecordatorios()}
                  </CTableBody>
                </CTable>
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
              value={formData.id_tipo_item_fk || ''}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar servicio...</option>
              {/* Usando catálogos cargados por tu servicio */}
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
              value={formData.id_frecuencia_fk || ''}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar frecuencia...</option>
              {/* Usando catálogos cargados por tu servicio */}
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
              placeholder="Escribe el mensaje que se enviará a los clientes..."
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
    </>
  );
};

export default Recordatorios;