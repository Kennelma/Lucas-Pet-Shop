// src/modules/estilistas/components/EstilistaModal.jsx
import React from 'react'
import {
  CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CButton,
  CFormInput, CFormLabel
} from '@coreui/react'

const EstilistaModal = ({
  visible,
  onClose,
  modoEdicion,
  formData,
  setFormData,
  onSave
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CModalHeader>
        <CModalTitle>{modoEdicion ? 'Editar Estilista' : 'Nuevo Estilista'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormLabel>Nombre</CFormLabel>
        <CFormInput
          name="nombre_estilista"
          value={formData.nombre_estilista}
          onChange={handleChange}
          placeholder="Ingrese nombre"
        />
        <CFormLabel className="mt-2">Apellido</CFormLabel>
        <CFormInput
          name="apellido_estilista"
          value={formData.apellido_estilista}
          onChange={handleChange}
          placeholder="Ingrese apellido"
        />
        <CFormLabel className="mt-2">Identidad (13 dígitos)</CFormLabel>
        <CFormInput
          name="identidad_estilista"
          value={formData.identidad_estilista}
          onChange={handleChange}
          placeholder="Ingrese número de identidad"
          maxLength={13}
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
        <CButton color="primary" onClick={onSave}>
          {modoEdicion ? 'Actualizar' : 'Guardar'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default EstilistaModal
