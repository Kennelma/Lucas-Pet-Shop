import React, { useEffect, useState } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CFormSelect, CSpinner
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { verRecordatorios } from '../../AXIOS.SERVICES/reminder';
import axios from 'axios';

const ModalEnvio = ({
  visible,
  onClose,
  refrescarTabla,
  tiposItems = [],
  frecuencias = []
}) => {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [recordatoriosActivos, setRecordatoriosActivos] = useState(0);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [frecuenciaSeleccionada, setFrecuenciaSeleccionada] = useState('');

  const cargarRecordatoriosActivos = async () => {
    try {
      const recordatorios = await verRecordatorios();
      const hoy = new Date().toISOString().split('T')[0];
      const activosHoy = recordatorios.filter(r =>
        r.activo === 1 &&
        r.programada_para?.split('T')[0] === hoy &&
        (tipoSeleccionado ? r.id_tipo_item_fk == tipoSeleccionado : true) &&
        (frecuenciaSeleccionada ? r.id_frecuencia_fk == frecuenciaSeleccionada : true)
      ).length;
      setRecordatoriosActivos(activosHoy);
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
      cargarRecordatoriosActivos();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) cargarRecordatoriosActivos();
  }, [tipoSeleccionado, frecuenciaSeleccionada]);

  const enviarRecordatorios = async () => {
    setLoading(true);
    setMensaje('');
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/whatsapp/enviar",
        {
          tipo: tipoSeleccionado || null,
          frecuencia: frecuenciaSeleccionada || null
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        }
      );
      if (res.data.Consulta) {
        setMensaje('✅ ' + res.data.mensaje);
        refrescarTabla();
      } else {
        setMensaje('❌ Error: ' + (res.data.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
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

        <CFormSelect
          className="mb-2"
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

        <CFormSelect
          className="mb-2"
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

        <div className="alert alert-info mt-2">
          <FontAwesomeIcon icon={faBell} className="me-2" />
          <strong>Recordatorios activos hoy:</strong> {recordatoriosActivos}
        </div>

        {loading && <div className="text-center mt-2"><CSpinner /></div>}
        {mensaje && <div className="alert alert-secondary mt-2">{mensaje}</div>}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={loading}>Cancelar</CButton>
        <CButton
          color="info"
          onClick={enviarRecordatorios}
          disabled={loading || recordatoriosActivos === 0}
        >
          <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
          Enviar Recordatorios ({recordatoriosActivos})
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalEnvio;
