import React from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CFormSelect, CFormTextarea, CFormInput, CFormLabel
} from '@coreui/react';

const ModalRecordatorio = ({
  visible,
  onClose,
  formData,
  setFormData,
  tiposItems,
  frecuencias,
  estadosProgramacion,
  guardarRecordatorio,
  editando
}) => {
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader onClose={onClose}>
        <CModalTitle>{editando ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <CFormLabel>Tipo de Servicio</CFormLabel>
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
          <CFormLabel>Frecuencia</CFormLabel>
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
          <CFormLabel>Estado</CFormLabel>
          <CFormSelect
            name="id_estado_programacion_fk"
            value={formData.id_estado_programacion_fk}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccionar estado...</option>
            {estadosProgramacion.map(e => (
              <option key={e.id_estado_pk} value={e.id_estado_pk}>
                {e.nombre_estado}
              </option>
            ))}
          </CFormSelect>
        </div>

        <div className="mb-3">
          <CFormLabel>Mensaje del Recordatorio</CFormLabel>
          <CFormTextarea
            name="mensaje_recordatorio"
            value={formData.mensaje_recordatorio}
            onChange={manejarCambio}
            placeholder="Escribe el mensaje que se enviará..."
            rows={4}
            required
          />
        </div>

        <div className="mb-3">
          <CFormLabel>Programar Para</CFormLabel>
          <CFormInput
            type="date"
            name="programada_para"
            value={formData.programada_para}
            onChange={manejarCambio}
            required
          />
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
        <CButton color="primary" onClick={guardarRecordatorio}>
          {editando ? 'Actualizar' : 'Guardar'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalRecordatorio;