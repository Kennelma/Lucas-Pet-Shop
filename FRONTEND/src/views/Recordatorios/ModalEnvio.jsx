import React, { useState, useEffect } from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormSelect, CSpinner } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ModalEnvio = ({ visible, onClose, refrescarTabla, tiposItems = [], frecuencias = [] }) => {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [recordatoriosActivos, setRecordatoriosActivos] = useState(0);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [frecuenciaSeleccionada, setFrecuenciaSeleccionada] = useState('');

  const cargarRecordatoriosActivos = async () => {
    try {
      const res = await fetch('/api/recordatorios/ver');
      const data = await res.json();
      if (data.Consulta) {
        const hoy = new Date().toISOString().split('T')[0];
        const activosHoy = data.recordatorios.filter(r =>
          r.activo === 1 &&
          r.programada_para === hoy &&
          (tipoSeleccionado ? r.id_tipo_item_fk == tipoSeleccionado : true) &&
          (frecuenciaSeleccionada ? r.id_frecuencia_fk == frecuenciaSeleccionada : true)
        ).length;
        setRecordatoriosActivos(activosHoy);
      }
    } catch (err) {
      console.error(err);
      setRecordatoriosActivos(0);
    }
  };

  useEffect(() => {
    if (visible) {
      setMensaje('');
      setTipoSeleccionado('');
      setFrecuenciaSeleccionada('');
    }
  }, [visible]);

  useEffect(() => {
    if (visible) cargarRecordatoriosActivos();
  }, [visible, tipoSeleccionado, frecuenciaSeleccionada]);

  const enviarRecordatorios = async () => {
    setLoading(true);
    setMensaje('');
    try {
      const res = await fetch('/api/whatsapp/enviar', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ tipo: tipoSeleccionado || null, frecuencia: frecuenciaSeleccionada || null })
      });
      const data = await res.json();
      if (data.Consulta) {
        setMensaje('✅ ' + data.mensaje);
        if (refrescarTabla) refrescarTabla();
        cargarRecordatoriosActivos();
      } else setMensaje('❌ Error: ' + data.error);
    } catch (err) {
      setMensaje('❌ Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader onClose={onClose}>
        <CModalTitle>Envío Manual de Recordatorios</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>Selecciona filtro opcional antes de enviar recordatorios:</p>

        <CFormSelect className="mb-2" value={tipoSeleccionado} onChange={e => setTipoSeleccionado(e.target.value)}>
          <option value="">Todos los tipos de servicio</option>
          {tiposItems.map(t => <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>{t.nombre_tipo_item}</option>)}
        </CFormSelect>

        <CFormSelect className="mb-2" value={frecuenciaSeleccionada} onChange={e => setFrecuenciaSeleccionada(e.target.value)}>
          <option value="">Todas las frecuencias</option>
          {frecuencias.map(f => <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>{f.frecuencia_recordatorio}</option>)}
        </CFormSelect>

        <div className="alert alert-info mt-2">
          <FontAwesomeIcon icon={faBell} className="me-2" />
          <strong>Recordatorios activos hoy:</strong> {recordatoriosActivos}
        </div>

        {loading && <div className="text-center mt-2"><CSpinner /></div>}
        {mensaje && <div className="alert alert-secondary mt-2">{mensaje}</div>}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={loading}>Cancelar</CButton>
        <CButton color="info" onClick={enviarRecordatorios} disabled={loading || recordatoriosActivos === 0}>
          <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
          Enviar Recordatorios ({recordatoriosActivos})
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalEnvio;
