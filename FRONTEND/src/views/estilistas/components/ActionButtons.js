// src/modules/estilistas/components/ActionButtons.jsx
import React from 'react'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

const ActionButtons = ({ onEdit, onDelete }) => (
  <>
    <CButton color="warning" size="sm" className="me-2 text-white" onClick={onEdit}>
      <FontAwesomeIcon icon={faPen} className="me-1" />
      Editar
    </CButton>
    <CButton color="danger" size="sm" onClick={onDelete}>
      <FontAwesomeIcon icon={faTrash} className="me-1" />
      Eliminar
    </CButton>
  </>
)

export default ActionButtons
