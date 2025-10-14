import React from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormLabel, CFormInput, CFormSelect, CFormTextarea,
  CButton, CRow, CCol
} from '@coreui/react';

const ModalRecordatorio = ({ visible, onClose, formData, setFormData, tiposItems, frecuencias, estadosProgramacion, guardarRecordatorio, editando }) => {

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader onClose={onClose}>
        <CModalTitle>{editando ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={(e) => { e.preventDefault(); guardarRecordatorio(); }}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Tipo de Servicio *</CFormLabel>
              <CFormSelect name="id_tipo_item_fk" value={formData.id_tipo_item_fk} onChange={manejarCambio} required>
                <option value="">Seleccionar servicio...</option>
                {tiposItems.map(tipo => (
                  <option key={tipo.id_tipo_item_pk} value={tipo.id_tipo_item_pk}>{tipo.nombre_tipo_item}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Frecuencia *</CFormLabel>
              <CFormSelect name="id_frecuencia_fk" value={formData.id_frecuencia_fk} onChange={manejarCambio} required>
                <option value="">Seleccionar frecuencia...</option>
                {frecuencias.map(f => (
                  <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>{f.frecuencia_recordatorio}</option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Programada Para *</CFormLabel>
              <CFormInput type="date" name="programada_para" value={formData.programada_para} onChange={manejarCambio} required />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Estado *</CFormLabel>
              <CFormSelect name="id_estado_programacion_fk" value={formData.id_estado_programacion_fk} onChange={manejarCambio} required>
                {estadosProgramacion.map(e => (
                  <option key={e.id_estado_pk} value={e.id_estado_pk}>{e.nombre_estado}</option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Mensaje *</CFormLabel>
              <CFormTextarea rows="4" name="mensaje_recordatorio" value={formData.mensaje_recordatorio} onChange={manejarCambio} placeholder="Escribe el mensaje..." required />
            </CCol>
          </CRow>

          {editando && (
            <CRow className="mb-3">
              <CCol md={4}><CFormLabel>Último Envío</CFormLabel><CFormInput type="text" value={formData.ultimo_envio || 'Sin envíos'} readOnly disabled /></CCol>
              <CCol md={4}><CFormLabel>Intentos</CFormLabel><CFormInput type="text" value={formData.intentos} readOnly disabled /></CCol>
              <CCol md={4}><CFormLabel>Último Error</CFormLabel><CFormInput type="text" value={formData.ultimo_error || 'Sin errores'} readOnly disabled /></CCol>
            </CRow>
          )}
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
        <CButton color="primary" onClick={guardarRecordatorio}>{editando ? 'Actualizar' : 'Guardar'}</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalRecordatorio;
