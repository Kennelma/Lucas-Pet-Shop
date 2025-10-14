import React, { useEffect, useState } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CFormSelect, CFormTextarea, CFormInput, CSpinner
} from '@coreui/react';
import axios from 'axios';

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
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [catalogoTipos, setCatalogoTipos] = useState([]);
  const [catalogoFrecuencias, setCatalogoFrecuencias] = useState([]);
  const [catalogoEstados, setCatalogoEstados] = useState([]);

  const API_URL = "http://localhost:4000/api/recordatorios/verCatalogo";
  const token = sessionStorage.getItem("token");

  // Cargar los catálogos (tipo, frecuencia, estado) desde el backend
  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogo(true);
      const headers = { Authorization: token ? `Bearer ${token}` : "" };

      const [tiposRes, frecRes, estadosRes] = await Promise.all([
        axios.get(`${API_URL}?tipo_catalogo=TIPO_SERVICIO`, { headers }),
        axios.get(`${API_URL}?tipo_catalogo=FRECUENCIA`, { headers }),
        axios.get(`${API_URL}?tipo_catalogo=ESTADO`, { headers }),
      ]);

      setCatalogoTipos(tiposRes.data.servicios || []);
      setCatalogoFrecuencias(frecRes.data.servicios || []);
      setCatalogoEstados(estadosRes.data.servicios || []);
    } catch (err) {
      console.error("Error al cargar catálogo:", err);
    } finally {
      setLoadingCatalogo(false);
    }
  };

  useEffect(() => {
    if (visible) {
      cargarCatalogos();
    }
  }, [visible]);

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
        {loadingCatalogo ? (
          <div className="text-center py-4"><CSpinner /></div>
        ) : (
          <>
            <CFormSelect
              name="id_tipo_item_fk"
              value={formData.id_tipo_item_fk}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar servicio...</option>
              {catalogoTipos.map(t => (
                <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                  {t.nombre_tipo_item}
                </option>
              ))}
            </CFormSelect>

            <CFormSelect
              name="id_frecuencia_fk"
              value={formData.id_frecuencia_fk}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar frecuencia...</option>
              {catalogoFrecuencias.map(f => (
                <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                  {f.frecuencia_recordatorio}
                </option>
              ))}
            </CFormSelect>

            <CFormSelect
              name="id_estado_programacion_fk"
              value={formData.id_estado_programacion_fk}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar estado...</option>
              {catalogoEstados.map(e => (
                <option key={e.id_estado_pk} value={e.id_estado_pk}>
                  {e.nombre_estado}
                </option>
              ))}
            </CFormSelect>

            <CFormTextarea
              name="mensaje_recordatorio"
              value={formData.mensaje_recordatorio}
              onChange={manejarCambio}
              placeholder="Escribe el mensaje..."
              required
            />

            <CFormInput
              type="date"
              name="programada_para"
              value={formData.programada_para}
              onChange={manejarCambio}
              required
            />
          </>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
        <CButton color="primary" onClick={guardarRecordatorio} disabled={loadingCatalogo}>
          {editando ? 'Actualizar' : 'Guardar'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalRecordatorio;
