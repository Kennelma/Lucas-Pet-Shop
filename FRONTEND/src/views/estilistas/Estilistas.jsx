// src/modules/estilistas/Estilistas.jsx
import React from 'react'
import {
  CCard, CCardBody, CCardHeader,
  CButton, CCol, CRow, CSpinner
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGift, faUserPlus, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import { useEstilistas } from './hooks/useEstilistas'
import EstilistasTable from './components/EstilistasTable'
import EstilistaModal from './components/EstilistaModal'

const Estilistas = () => {
  const {
    estilistas, loading, error,
    modalVisible, setModalVisible,
    modoEdicion, setModoEdicion,
    formData, setFormData,
    cargarEstilistas, guardarEstilista, eliminarRegistro
  } = useEstilistas()

  const abrirModalNuevo = () => {
    setModoEdicion(false)
    setFormData({
      id_estilista_pk: null,
      nombre_estilista: '',
      apellido_estilista: '',
      identidad_estilista: ''
    })
    setModalVisible(true)
  }

  const abrirModalEditar = (estilista) => {
    setModoEdicion(true)
    setFormData(estilista)
    setModalVisible(true)
  }

  return (
    <CRow className="mt-4">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faGift} className="me-2" />
              Módulo de Bonificaciones (Estilistas)
            </h5>
            <div>
              <CButton color="light" size="sm" className="me-2" onClick={cargarEstilistas}>
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Recargar
              </CButton>
              <CButton color="success" size="sm" onClick={abrirModalNuevo}>
                <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                Nuevo Estilista
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            {loading ? (
              <div className="text-center p-4">
                <CSpinner color="primary" />
                <p className="text-muted mt-2 mb-0">Cargando estilistas...</p>
              </div>
            ) : error ? (
              <p className="text-danger text-center">{error}</p>
            ) : (
              <EstilistasTable
                estilistas={estilistas}
                onEdit={abrirModalEditar}
                onDelete={eliminarRegistro}
              />
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <EstilistaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        modoEdicion={modoEdicion}
        formData={formData}
        setFormData={setFormData}
        onSave={guardarEstilista}
      />
    </CRow>
  )
}

export default Estilistas
