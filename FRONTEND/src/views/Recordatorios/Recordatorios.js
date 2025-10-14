import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CButtonGroup, CSpinner
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHistory, faPlus, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import ModalRecordatorio from './ModalRecordatorio';
import ModalEnvio from './ModalEnvio';

const Recordatorios = () => {
  const [modalRecordatorioVisible, setModalRecordatorioVisible] = useState(false);
  const [modalEnvioVisible, setModalEnvioVisible] = useState(false);
  const [formData, setFormData] = useState({
    id_tipo_item_fk: '',
    id_frecuencia_fk: '',
    programada_para: '',
    id_estado_programacion_fk: 1,
    mensaje_recordatorio: '',
    ultimo_envio: '',
    intentos: 0,
    ultimo_error: '',
    activo: 1
  });
  const [editando, setEditando] = useState(false);
  const [activeTab, setActiveTab] = useState('recordatorios');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [recordatorios, setRecordatorios] = useState([]);
  const [tiposItems, setTiposItems] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);

  // Cargar recordatorios
  const cargarRecordatorios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recordatorios/ver');
      const data = await res.json();
      console.log('Recordatorios cargados:', data);
      if (data.Consulta) {
        setRecordatorios(data.recordatorios || []);
      } else {
        console.error('Error en respuesta:', data.error);
      }
    } catch (err) {
      console.error('Error al cargar recordatorios:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tipos y frecuencias
  const cargarSelects = async () => {
    try {
      // Cargar tipos de items
      const resTipos = await fetch('/api/recordatorios/tipos-item');
      const dataTipos = await resTipos.json();
      console.log('Tipos de items recibidos:', dataTipos);
      
      if (dataTipos.Consulta && dataTipos.tipos) {
        setTiposItems(dataTipos.tipos);
        console.log('Tipos guardados en estado:', dataTipos.tipos);
      } else {
        console.error('Error cargando tipos:', dataTipos);
        setTiposItems([]);
      }

      // Cargar frecuencias
      const resFrecuencias = await fetch('/api/recordatorios/frecuencias');
      const dataFrecuencias = await resFrecuencias.json();
      console.log('Frecuencias recibidas:', dataFrecuencias);
      
      if (dataFrecuencias.Consulta && dataFrecuencias.frecuencias) {
        setFrecuencias(dataFrecuencias.frecuencias);
        console.log('Frecuencias guardadas en estado:', dataFrecuencias.frecuencias);
      } else {
        console.error('Error cargando frecuencias:', dataFrecuencias);
        setFrecuencias([]);
      }
    } catch (err) {
      console.error('Error al cargar selects:', err);
      setTiposItems([]);
      setFrecuencias([]);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('Componente montado, cargando datos...');
    cargarRecordatorios();
    cargarSelects();
  }, []);

  // Debug: Verificar cuando cambien los estados
  useEffect(() => {
    console.log('Estado actualizado - Tipos Items:', tiposItems);
  }, [tiposItems]);

  useEffect(() => {
    console.log('Estado actualizado - Frecuencias:', frecuencias);
  }, [frecuencias]);

  // Filtrar recordatorios
  const recordatoriosFiltrados = recordatorios.filter(r => {
    if (filtroEstado === 'activos') return r.activo === 1;
    if (filtroEstado === 'inactivos') return r.activo === 0;
    return true;
  });

  // Abrir modal nuevo
  const abrirModalNuevo = () => {
    console.log('Abriendo modal nuevo con tipos:', tiposItems, 'y frecuencias:', frecuencias);
    setFormData({
      id_tipo_item_fk: '',
      id_frecuencia_fk: '',
      programada_para: '',
      id_estado_programacion_fk: 1,
      mensaje_recordatorio: '',
      ultimo_envio: '',
      intentos: 0,
      ultimo_error: '',
      activo: 1
    });
    setEditando(false);
    setModalRecordatorioVisible(true);
  };

  // Guardar recordatorio
  const guardarRecordatorio = async (e) => {
    if (e) e.preventDefault();
    
    console.log('Guardando recordatorio:', formData);
    
    const endpoint = editando ? '/api/recordatorios/actualizar' : '/api/recordatorios/crear';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      console.log('Respuesta del servidor:', data);
      
      if (data.Consulta) {
        alert('Recordatorio guardado exitosamente');
        cargarRecordatorios();
        setModalRecordatorioVisible(false);
      } else {
        alert('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <FontAwesomeIcon icon={faBell} className="me-2"/> 
                <strong>Gestión de Recordatorios Automáticos</strong>
              </div>
              <div>
                <CButton color="primary" className="me-2" onClick={abrirModalNuevo}>
                  <FontAwesomeIcon icon={faPlus} className="me-1"/> Nuevo Recordatorio
                </CButton>
                <CButton color="info" onClick={() => setModalEnvioVisible(true)}>
                  <FontAwesomeIcon icon={faPaperPlane} className="me-1"/> Enviar Hoy
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              <CNav variant="tabs" className="mb-3">
                <CNavItem>
                  <CNavLink 
                    href="#" 
                    active={activeTab==='recordatorios'} 
                    onClick={(e) => {e.preventDefault(); setActiveTab('recordatorios');}}
                  >
                    <FontAwesomeIcon icon={faBell} className="me-1"/> Recordatorios
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink 
                    href="#" 
                    active={activeTab==='historial'} 
                    onClick={(e) => {e.preventDefault(); setActiveTab('historial');}}
                  >
                    <FontAwesomeIcon icon={faHistory} className="me-1"/> Historial
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CButtonGroup className="mb-3">
                <CButton 
                  color={filtroEstado==='todos'?'primary':'outline-primary'} 
                  size="sm" 
                  onClick={()=>setFiltroEstado('todos')}
                >
                  Todos
                </CButton>
                <CButton 
                  color={filtroEstado==='activos'?'success':'outline-success'} 
                  size="sm" 
                  onClick={()=>setFiltroEstado('activos')}
                >
                  Activos
                </CButton>
                <CButton 
                  color={filtroEstado==='inactivos'?'secondary':'outline-secondary'} 
                  size="sm" 
                  onClick={()=>setFiltroEstado('inactivos')}
                >
                  Inactivos
                </CButton>
              </CButtonGroup>

              {loading ? (
                <div className="text-center"><CSpinner color="primary"/></div>
              ) : (
                <CTabContent>
                  <CTabPane visible={activeTab==='recordatorios'}>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableHeaderCell>Mensaje</CTableHeaderCell>
                          <CTableHeaderCell>Tipo</CTableHeaderCell>
                          <CTableHeaderCell>Frecuencia</CTableHeaderCell>
                          <CTableHeaderCell>Programada Para</CTableHeaderCell>
                          <CTableHeaderCell>Último Envío</CTableHeaderCell>
                          <CTableHeaderCell>Intentos</CTableHeaderCell>
                          <CTableHeaderCell>Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {recordatoriosFiltrados.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan="8" className="text-center text-muted">
                              No hay recordatorios registrados
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          recordatoriosFiltrados.map(r => (
                            <CTableRow key={r.id_recordatorio_pk}>
                              <CTableDataCell>
                                {r.activo ? '✅ Activo' : '❌ Inactivo'}
                              </CTableDataCell>
                              <CTableDataCell>{r.mensaje_recordatorio}</CTableDataCell>
                              <CTableDataCell>{r.nombre_tipo_item || '-'}</CTableDataCell>
                              <CTableDataCell>{r.frecuencia_recordatorio || '-'}</CTableDataCell>
                              <CTableDataCell>{r.programada_para}</CTableDataCell>
                              <CTableDataCell>{r.ultimo_envio || 'Sin envíos'}</CTableDataCell>
                              <CTableDataCell>{r.intentos}</CTableDataCell>
                              <CTableDataCell>
                                <CButton 
                                  size="sm" 
                                  color="warning" 
                                  className="me-1" 
                                  onClick={() => { 
                                    setFormData(r); 
                                    setEditando(true); 
                                    setModalRecordatorioVisible(true); 
                                  }}
                                >
                                  Editar
                                </CButton>
                                <CButton 
                                  size="sm" 
                                  color="danger" 
                                  onClick={async () => {
                                    if (window.confirm('¿Eliminar este recordatorio?')) {
                                      try {
                                        const res = await fetch('/api/recordatorios/eliminar', { 
                                          method: 'POST', 
                                          headers: {'Content-Type':'application/json'}, 
                                          body: JSON.stringify({id: r.id_recordatorio_pk}) 
                                        });
                                        const data = await res.json();
                                        if (data.Consulta) {
                                          alert('Recordatorio eliminado');
                                          cargarRecordatorios();
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert('Error al eliminar');
                                      }
                                    }
                                  }}
                                >
                                  Eliminar
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        )}
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
                        {recordatorios.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan="7" className="text-center text-muted">
                              No hay historial de envíos
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          recordatorios.filter(r => r.ultimo_envio).map(e => (
                            <CTableRow key={e.id_recordatorio_pk}>
                              <CTableDataCell>{e.activo ? 'Activo' : 'Inactivo'}</CTableDataCell>
                              <CTableDataCell>{e.ultimo_envio || '-'}</CTableDataCell>
                              <CTableDataCell>{e.nombre_cliente || '-'}</CTableDataCell>
                              <CTableDataCell>{e.telefono_cliente || '-'}</CTableDataCell>
                              <CTableDataCell>{e.mensaje_recordatorio}</CTableDataCell>
                              <CTableDataCell>{e.intentos}</CTableDataCell>
                              <CTableDataCell>{e.ultimo_error || 'Sin errores'}</CTableDataCell>
                            </CTableRow>
                          ))
                        )}
                      </CTableBody>
                    </CTable>
                  </CTabPane>
                </CTabContent>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <ModalRecordatorio
        visible={modalRecordatorioVisible}
        onClose={() => setModalRecordatorioVisible(false)}
        formData={formData}
        setFormData={setFormData}
        tiposItems={tiposItems}
        frecuencias={frecuencias}
        estadosProgramacion={[
          {id_estado_pk: 1, nombre_estado: 'Activo'},
          {id_estado_pk: 2, nombre_estado: 'Inactivo'}
        ]}
        guardarRecordatorio={guardarRecordatorio}
        editando={editando}
      />

      <ModalEnvio
        visible={modalEnvioVisible}
        onClose={() => setModalEnvioVisible(false)}
        refrescarTabla={cargarRecordatorios}
        tiposItems={tiposItems}
        frecuencias={frecuencias}
      />
    </>
  );
};

export default Recordatorios;