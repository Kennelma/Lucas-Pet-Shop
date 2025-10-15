import React, { useEffect, useState } from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CSpinner } from '@coreui/react';
import { verCatalogo } from '../../AXIOS.SERVICES/reminder';

const ModalVerCatalogos = ({ visible, onClose }) => {
  const [tiposItems, setTiposItems] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [telefonos, setTelefonos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (visible) {
      cargarCatalogos();
    }
  }, [visible]);

  const cargarCatalogos = async () => {
    setCargando(true);
    try {
      const tipos = await verCatalogo('TIPO_SERVICIO');
      const freq = await verCatalogo('FRECUENCIA');
      const est = await verCatalogo('ESTADO');
      const tel = await verCatalogo('TELEFONO');

      setTiposItems(tipos);
      setFrecuencias(freq);
      setEstados(est);
      setTelefonos(tel);

      console.log({ tipos, freq, est, tel });
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader onClose={onClose}>
        <CModalTitle>Datos de Catálogos</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {cargando ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <CSpinner color="primary" /> <span className="ms-2">Cargando datos...</span>
          </div>
        ) : (
          <div>
            <h5>Tipos de Servicio:</h5>
            <pre>{JSON.stringify(tiposItems, null, 2)}</pre>

            <h5>Frecuencias:</h5>
            <pre>{JSON.stringify(frecuencias, null, 2)}</pre>

            <h5>Estados:</h5>
            <pre>{JSON.stringify(estados, null, 2)}</pre>

            <h5>Telefonos:</h5>
            <pre>{JSON.stringify(telefonos, null, 2)}</pre>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalVerCatalogos;
