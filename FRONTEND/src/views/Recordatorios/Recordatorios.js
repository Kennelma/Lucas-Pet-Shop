import React, { useState } from 'react';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CButtonGroup, CSpinner
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHistory, faPlus } from '@fortawesome/free-solid-svg-icons';
import ModalRecordatorio from './ModalRecordatorio';
import ModalEnvio from './ModalEnvio';

const Recordatorios = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    id_tipo_item_fk: '',
    id_frecuencia_fk: '',
    programada_para: '',
    id_estado_programacion_fk: 1,
    mensaje_recordatorio: '',
    ultimo_envio: '',
    intentos: 0,
    ultimo_error: ''
  });
  const [editando, setEditando] = useState(false);
  const [activeTab, setActiveTab] = useState('recordatorios');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(false);

  const abrirModal = () => setModalVisible(true);
  const cerrarModal = () => setModalVisible(false);

  // Datos de ejemplo
  const tiposItems = [{ id_tipo_item_pk: 1, nombre_tipo: 'Promocion' }];
  const frecuencias = [{ id_frecuencia_pk: 1, nombre_frecuencia: 'Mensual', dias: 30 }];
  const estadosProgramacion = [{ id_estado_pk: 1, nombre_estado: 'Activo' }, { id_estado_pk: 2, nombre_estado: 'Inactivo' }];
  const recordatoriosFiltrados = [];
  const historialEnvios = [];

  const guardarRecordatorio = () => {
    console.log('Guardando recordatorio:', formData);
    cerrarModal();
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div><FontAwesomeIcon icon={faBell} className="me-2"/> <strong>Gestión de Recordatorios Automáticos</strong></div>
              <CButton color="primary" onClick={() => { abrirModal(); setEditando(false); }}>
                <FontAwesomeIcon icon={faPlus} className="me-1"/> Nuevo Recordatorio
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CNav variant="tabs" className="mb-3">
                <CNavItem>
                  <CNavLink href="#" active={activeTab==='recordatorios'} onClick={()=>setActiveTab('recordatorios')}>
                    <FontAwesomeIcon icon={faBell} className="me-1"/> Recordatorios
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink href="#" active={activeTab==='historial'} onClick={()=>setActiveTab('historial')}>
                    <FontAwesomeIcon icon={faHistory} className="me-1"/> Historial
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CButtonGroup className="mb-3">
                <CButton color={filtroEstado==='todos'?'primary':'outline-primary'} size="sm" onClick={()=>setFiltroEstado('todos')}>Todos</CButton>
                <CButton color={filtroEstado==='activos'?'success':'outline-success'} size="sm" onClick={()=>setFiltroEstado('activos')}>Activos</CButton>
                <CButton color={filtroEstado==='inactivos'?'secondary':'outline-secondary'} size="sm" onClick={()=>setFiltroEstado('inactivos')}>Inactivos</CButton>
              </CButtonGroup>

              {loading ? <div className="text-center"><CSpinner color="primary"/></div> :
                <CTabContent>
                  <CTabPane visible={activeTab==='recordatorios'}>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableHeaderCell>Mensaje</CTableHeaderCell>
                          <CTableHeaderCell>Frecuencia</CTableHeaderCell>
                          <CTableHeaderCell>Programada Para</CTableHeaderCell>
                          <CTableHeaderCell>Último Envío</CTableHeaderCell>
                          <CTableHeaderCell>Intentos / Error</CTableHeaderCell>
                          <CTableHeaderCell>Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {recordatoriosFiltrados.length===0 ? (
                          <CTableRow><CTableDataCell colSpan="7" className="text-center text-muted">No hay recordatorios</CTableDataCell></CTableRow>
                        ) : recordatoriosFiltrados.map(r=>(
                          <CTableRow key={r.id_recordatorio_pk}>
                            <CTableDataCell>{r.estado}</CTableDataCell>
                            <CTableDataCell>{r.mensaje_recordatorio}</CTableDataCell>
                            <CTableDataCell>{r.frecuencia_nombre} ({r.frecuencia_dias}d)</CTableDataCell>
                            <CTableDataCell>{r.programada_para}</CTableDataCell>
                            <CTableDataCell>{r.ultimo_envio || 'Sin envíos'}</CTableDataCell>
                            <CTableDataCell>{r.intentos} {r.ultimo_error && ` / ${r.ultimo_error}`}</CTableDataCell>
                            <CTableDataCell>{/* Botones editar/eliminar */}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CTabPane>

                  <CTabPane visible={activeTab==='historial'}>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableHeaderCell>Fecha/Hora</CTableHeaderCell>
                          <CTableHeaderCell>Cliente</CTableHeaderCell>
                          <CTableHeaderCell>Teléfono</CTableHeaderCell>
                          <CTableHeaderCell>Mensaje</CTableHeaderCell>
                          <CTableHeaderCell>Intentos</CTableHeaderCell>
                          <CTableHeaderCell>Error</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {historialEnvios.length===0 ? (
                          <CTableRow><CTableDataCell colSpan="7" className="text-center text-muted">No hay envíos registrados</CTableDataCell></CTableRow>
                        ) : historialEnvios.map(e=>(
                          <CTableRow key={e.id_envio}>
                            <CTableDataCell>{e.exitoso?'Exitoso':'Fallido'}</CTableDataCell>
                            <CTableDataCell>{e.fecha_envio}</CTableDataCell>
                            <CTableDataCell>{e.nombre_cliente}</CTableDataCell>
                            <CTableDataCell>{e.telefono_cliente}</CTableDataCell>
                            <CTableDataCell>{e.mensaje_recordatorio}</CTableDataCell>
                            <CTableDataCell>{e.intentos}</CTableDataCell>
                            <CTableDataCell>{e.error||'-'}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CTabPane>
                </CTabContent>
              }
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modales */}
      <ModalRecordatorio
        visible={modalVisible}
        onClose={cerrarModal}
        formData={formData}
        setFormData={setFormData}
        tiposItems={tiposItems}
        frecuencias={frecuencias}
        estadosProgramacion={estadosProgramacion}
        guardarRecordatorio={guardarRecordatorio}
        editando={editando}
      />
      <ModalEnvio visible={false} setVisible={()=>{}} recordatorios={[]} />
    </>
  );
};

export default Recordatorios;
