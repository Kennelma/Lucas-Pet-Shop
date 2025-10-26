// src/modules/estilistas/components/ActionButtons.jsx
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'

const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex items-center space-x-2 w-full">
    <button
      className="text-blue-500 hover:text-blue-700 p-2 rounded transition"
      onClick={(e) => {
        e.stopPropagation()
        onEdit()
      }}
    >
      <FontAwesomeIcon icon={faPenToSquare} size="lg" />
    </button>

    <button
      className="text-red-500 hover:text-red-700 p-2 rounded transition"
      onClick={(e) => {
        e.stopPropagation()
        onDelete()
      }}
    >
      <FontAwesomeIcon icon={faTrash} size="lg" />
    </button>
  </div>
)

export default ActionButtons
