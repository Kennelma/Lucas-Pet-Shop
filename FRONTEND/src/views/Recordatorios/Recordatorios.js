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


// A JAMES NO LE CARGA LA RAMA AJJAJAJAJJAJAJJAJA
// Importación de servicios
import { 
  verRecordatorios, 
  insertarRecordatorio,
  actualizarRecordatorio, 
  verCatalogo 
} from '../../AXIOS.SERVICES/reminder'; 

const Recordatorios = () => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const INITIAL_FORM_DATA = {
    id_recordatorio_pk: null, 
    mensaje_recordatorio: '',
    id_tipo_item_fk: '',
    id_frecuencia_fk: ''
  };

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordatorios, setRecordatorios] = useState([]);

  const [tiposItems, setTiposItems] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [estadosProgramacion, setEstadosProgramacion] = useState([]);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carga de datos...');

      // 1. Cargar recordatorios
      const recordatoriosData = await verRecordatorios(); 
      console.log('📋 Recordatorios recibidos:', recordatoriosData);
      setRecordatorios(recordatoriosData || []);

      // 2. Cargar catálogos UNO POR UNO para ver cuál falla
      console.log('🔍 Cargando TIPO_SERVICIO...');
      const resTipos = await verCatalogo('TIPO_SERVICIO');
      console.log('✅ TIPO_SERVICIO respuesta completa:', resTipos);
      console.log('📦 TIPO_SERVICIO.servicios:', resTipos?.servicios);

      console.log('🔍 Cargando FRECUENCIA...');
      const resFrecuencias = await verCatalogo('FRECUENCIA');
      console.log('✅ FRECUENCIA respuesta completa:', resFrecuencias);
      console.log('📦 FRECUENCIA.servicios:', resFrecuencias?.servicios);

      console.log('🔍 Cargando ESTADO...');
      const resEstados = await verCatalogo('ESTADO');
      console.log('✅ ESTADO respuesta completa:', resEstados);
      console.log('📦 ESTADO.servicios:', resEstados?.servicios);

      // Verificar estructura de respuesta
      if (!resTipos || !resTipos.servicios) {
        console.error('❌ TIPO_SERVICIO no tiene la estructura esperada');
      }
      if (!resFrecuencias || !resFrecuencias.servicios) {
        console.error('❌ FRECUENCIA no tiene la estructura esperada');
      }
      if (!resEstados || !resEstados.servicios) {
        console.error('❌ ESTADO no tiene la estructura esperada');
      }

      setTiposItems(resTipos?.servicios || []);
      setFrecuencias(resFrecuencias?.servicios || []);
      setEstadosProgramacion(resEstados?.servicios || []);

      console.log('✅ Estados finales:', {
        tiposItems: resTipos?.servicios?.length || 0,
        frecuencias: resFrecuencias?.servicios?.length || 0,
        estados: resEstados?.servicios?.length || 0
      });

    } catch (err) {
      console.error('💥 Error cargando datos:', err);
      alert('Error al cargar datos: ' + (err.message || 'Ver consola para detalles.'));
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (recordatorio = null) => {
    console.log('🔓 Abriendo modal. Catálogos disponibles:', {
      tiposItems: tiposItems.length,
      frecuencias: frecuencias.length
    });

    if (recordatorio) {
      setFormData({
        id_recordatorio_pk: recordatorio.id_recordatorio_pk,
        mensaje_recordatorio: recordatorio.mensaje_recordatorio,
        id_tipo_item_fk: String(recordatorio.id_tipo_item_fk),
        id_frecuencia_fk: String(recordatorio.id_frecuencia_fk)
      });
      setEditando(true);
    } else {
      setFormData(INITIAL_FORM_DATA);
      setEditando(false);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData(INITIAL_FORM_DATA); 
    setEditando(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarRecordatorio = async () => {
    if (!formData.mensaje_recordatorio || !formData.id_tipo_item_fk || !formData.id_frecuencia_fk) {
      alert('Por favor completa todos los campos obligatorios (*)');
      return;
    }
    
    setLoading(true);

    const datosEnviar = {
      mensaje_recordatorio: formData.mensaje_recordatorio,       
      id_tipo_item_fk: parseInt(formData.id_tipo_item_fk),
      id_frecuencia_fk: parseInt(formData.id_frecuencia_fk)
    };

    try {
      let resultado;
      
      if (editando) {
        datosEnviar.id_recordatorio_pk = formData.id_recordatorio_pk;
        resultado = await actualizarRecordatorio(datosEnviar); 
      } else {
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
      console.error('Error en la solicitud:', error);
      alert('Error al guardar: ' + (error.message || 'Ver consola para detalles.')); 
    } finally {
      setLoading(false);
    }
  };

  const renderTablaRecordatorios = () => {
    if (recordatorios.length === 0 && !loading) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="6" className="text-center text-muted py-4">
            📭 No hay recordatorios registrados.
          </CTableDataCell>
        </CTableRow>
      );
    }

    return recordatorios.map((r) => {
      const estado = estadosProgramacion.find(e => e.id_estado_pk === r.id_estado_programacion_fk)?.nombre_estado || '—';
      const colorEstado = r.id_estado_programacion_fk === 1 ? 'success' : 'secondary';
      const frecuencia = frecuencias.find(f => f.id_frecuencia_record_pk === r.id_frecuencia_fk)?.frecuencia_recordatorio || '—';
      const tipoItem = tiposItems.find(t => t.id_tipo_item_pk === r.id_tipo_item_fk)?.nombre_tipo_item || '—';
      
      const fechaProgramada = r.programada_para 
        ? new Date(r.programada_para).toLocaleDateString('es-ES') 
        : '—';
      
      return (
        <CTableRow key={r.id_recordatorio_pk}>
          <CTableDataCell>
            <CBadge color={colorEstado}>{estado}</CBadge>
          </CTableDataCell>
          <CTableDataCell>
            {r.mensaje_recordatorio.substring(0, 50)}
            {r.mensaje_recordatorio.length > 50 ? '...' : ''}
          </CTableDataCell>
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
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> 
                  Nuevo Recordatorio
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-3 text-muted">Cargando datos...</p>
                </div>
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

      <CModal visible={modalVisible} onClose={cerrarModal} size="lg">
        <CModalHeader onClose={cerrarModal}>
          <CModalTitle>
            {editando ? '✏️ Editar Recordatorio' : '➕ Nuevo Recordatorio'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>
              Destinado a clientes que compraron: <span className="text-danger">*</span>
            </CFormLabel>
            <CFormSelect
              name="id_tipo_item_fk"
              value={formData.id_tipo_item_fk || ''}
              onChange={manejarCambio}
              required
            >
              <option value="">-- Seleccionar servicio --</option>
              {tiposItems.map(t => (
                <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                  {t.nombre_tipo_item}
                </option>
              ))}
            </CFormSelect>
            {tiposItems.length === 0 && (
              <small className="text-danger d-block mt-1">
                ⚠️ No se encontraron servicios disponibles. Revisa la consola.
              </small>
            )}
          </div>

          <div className="mb-3">
            <CFormLabel>
              Frecuencia <span className="text-danger">*</span>
            </CFormLabel>
            <CFormSelect
              name="id_frecuencia_fk"
              value={formData.id_frecuencia_fk || ''}
              onChange={manejarCambio}
              required
            >
              <option value="">-- Seleccionar frecuencia --</option>
              {frecuencias.map(f => (
                <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                  {f.frecuencia_recordatorio}
                </option>
              ))}
            </CFormSelect>
            {frecuencias.length === 0 && (
              <small className="text-danger d-block mt-1">
                ⚠️ No se encontraron frecuencias disponibles. Revisa la consola.
              </small>
            )}
          </div>
          
          <div className="mb-3">
            <CFormLabel>
              Mensaje del Recordatorio <span className="text-danger">*</span>
            </CFormLabel>
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