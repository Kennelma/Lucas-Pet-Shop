import React from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ModalEnvio = ({ visible, onClose }) => {
  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader onClose={onClose}>
        <CModalTitle>Envío Manual de Recordatorios</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Deseas enviar todos los recordatorios programados para hoy?</p>
        <p className="text-muted">
          Esta acción enviará notificaciones a todos los clientes con recordatorios activos.
        </p>
        <div className="alert alert-info mt-3">
          <FontAwesomeIcon icon={faBell} className="me-2" />
          <strong>Recordatorios activos:</strong> 5
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
        <CButton color="info">
          <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
          Enviar Recordatorios
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalEnvio;
