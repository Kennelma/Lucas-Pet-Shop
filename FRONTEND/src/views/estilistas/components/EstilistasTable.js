// src/modules/estilistas/components/EstilistasTable.jsx
import React, { useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CPagination, CPaginationItem
} from '@coreui/react'
import ActionButtons from '../ActionButtons'

const EstilistasTable = ({ estilistas, onEdit, onDelete }) => {
  const [pagina, setPagina] = useState(1)
  const porPagina = 5
  const totalPaginas = Math.ceil(estilistas.length / porPagina)

  const inicio = (pagina - 1) * porPagina
  const estilistasPaginados = estilistas.slice(inicio, inicio + porPagina)

  return (
    <>
      <CTable striped hover responsive>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Apellido</CTableHeaderCell>
            <CTableHeaderCell>Identidad</CTableHeaderCell>
            <CTableHeaderCell>Fecha de Ingreso</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {estilistasPaginados.map((estilista) => (
            <CTableRow key={estilista.id_estilista_pk}>
              <CTableDataCell>{estilista.id_estilista_pk}</CTableDataCell>
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

      <div className="d-flex justify-content-center mt-3">
        <CPagination align="center">
          {[...Array(totalPaginas)].map((_, i) => (
            <CPaginationItem
              key={i}
              active={i + 1 === pagina}
              onClick={() => setPagina(i + 1)}
              style={{ cursor: 'pointer' }}
            >
              {i + 1}
            </CPaginationItem>
          ))}
        </CPagination>
      </div>
    </>
  )
}

export default EstilistasTable
