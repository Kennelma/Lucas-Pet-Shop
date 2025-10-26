// src/modules/estilistas/components/EstilistasTable.jsx
import React, { useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CPagination, CPaginationItem
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'
import ActionButtons from './ActionButtons'

const EstilistasTable = ({ estilistas, onEdit, onDelete, onAdd }) => {
  const [pagina, setPagina] = useState(1)
  const porPagina = 5
  const totalPaginas = Math.ceil(estilistas.length / porPagina)
  const inicio = (pagina - 1) * porPagina
  const estilistasPaginados = estilistas.slice(inicio, inicio + porPagina)

  return (
    <div
      className="bg-white rounded-xl p-6 max-w-5xl mx-auto font-poppins"
      style={{
        boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'
      }}
    >
      {/* Botón agregar */}
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-800 transition"
          onClick={onAdd}
        >
          <FontAwesomeIcon icon={faUserPlus} />
        </button>
      </div>

      {/* Tabla estilizada */}
      {estilistas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay estilistas registrados</p>
          <p className="text-gray-400 text-sm mt-2">
            Haz clic en el botón + para agregar tu primer estilista
          </p>
        </div>
      ) : (
        <>
          <CTable
            striped
            hover
            responsive
            className="text-sm align-middle rounded-lg overflow-hidden"
            style={{
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              minWidth: '50rem'
            }}
          >
            <CTableHead color="light">
              <CTableRow className="bg-gray-100">
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Apellido</CTableHeaderCell>
                <CTableHeaderCell>Identidad</CTableHeaderCell>
                <CTableHeaderCell>Fecha de Ingreso</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {estilistasPaginados.map((estilista, index) => (
                <CTableRow
                  key={estilista.id_estilista_pk}
                  className="hover:bg-gray-100 cursor-pointer transition"
                >
                  <CTableDataCell>{inicio + index + 1}</CTableDataCell>
                  <CTableDataCell>{estilista.nombre_estilista}</CTableDataCell>
                  <CTableDataCell>{estilista.apellido_estilista}</CTableDataCell>
                  <CTableDataCell>{estilista.identidad_estilista}</CTableDataCell>
                  <CTableDataCell>
                    {new Date(estilista.fecha_ingreso).toLocaleDateString('es-HN')}
                  </CTableDataCell>
                  <CTableDataCell>
                    <ActionButtons
                      onEdit={() => onEdit(estilista)}
                      onDelete={() => onDelete(estilista.id_estilista_pk)}
                    />
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Paginación */}
          <div className="flex justify-center mt-4">
            <CPagination align="center">
              {[...Array(totalPaginas)].map((_, i) => (
                <CPaginationItem
                  key={i}
                  active={i + 1 === pagina}
                  onClick={() => setPagina(i + 1)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    margin: '0 4px',
                    backgroundColor: i + 1 === pagina ? '#9333ea' : 'transparent',
                    color: i + 1 === pagina ? 'white' : 'black',
                    border: '1px solid #d1d5db'
                  }}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
            </CPagination>
          </div>
        </>
      )}
    </div>
  )
}

export default EstilistasTable
