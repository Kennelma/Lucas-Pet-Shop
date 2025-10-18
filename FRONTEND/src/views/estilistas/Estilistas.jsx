import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader,
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CRow, CCol,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGift, faUser, faSyncAlt } from '@fortawesome/free-solid-svg-icons'

const Estilistas = () => {

  // ------------------------------------------------------------------
  // 🔹 1. ESTADOS
  // ------------------------------------------------------------------
  const [estilistas, setEstilistas] = useState([]) // Datos de la tabla
  const [loading, setLoading] = useState(true)     // Estado de carga
  const [error, setError] = useState(null)         // Manejo de errores

  // ------------------------------------------------------------------
  // 🔹 2. EFECTO INICIAL (simulación)
  // ------------------------------------------------------------------
  useEffect(() => {
    // Aquí luego se reemplazará por llamada axios al endpoint real
    const fakeData = [
      {
        id_estilista_pk: 1,
        nombre_estilista: 'Laura',
        apellido_estilista: 'Hernández',
        identidad_estilista: '0801-1999-00123',
        fecha_ingreso: '2024-04-12 09:23:00'
      },
      {
        id_estilista_pk: 2,
        nombre_estilista: 'Carlos',
        apellido_estilista: 'Mejía',
        identidad_estilista: '0801-1998-00087',
        fecha_ingreso: '2023-09-08 14:15:00'
      }
    ]

    // Simula carga
    setTimeout(() => {
      setEstilistas(fakeData)
      setLoading(false)
    }, 1000)
  }, [])

  // ------------------------------------------------------------------
  // 🔹 3. FUNCIONES AUXILIARES (futuras)
  // ------------------------------------------------------------------
  const handleRefresh = () => {
    // Aquí luego se agregará lógica para recargar datos con axios
    console.log('Recargando datos de estilistas...')
  }

  const calcularBonificacion = (id) => {
    // Aquí luego se agregará el cálculo de bonificaciones mensuales
    console.log(`Calcular bonificación para estilista ID ${id}`)
  }

  // ------------------------------------------------------------------
  // 🔹 4. RENDERIZADO PRINCIPAL
  // ------------------------------------------------------------------
  return (
    <CRow className="mt-4">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faGift} className="me-2" />
              Módulo de Bonificaciones (Estilistas)
            </h5>
            <CButton color="light" size="sm" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
              Recargar
            </CButton>
          </CCardHeader>

          <CCardBody>
            {loading ? (
              <p className="text-center text-muted">Cargando estilistas...</p>
            ) : error ? (
              <p className="text-danger text-center">{error}</p>
            ) : (
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
                  {estilistas.map((estilista) => (
                    <CTableRow key={estilista.id_estilista_pk}>
                      <CTableDataCell>{estilista.id_estilista_pk}</CTableDataCell>
                      <CTableDataCell>{estilista.nombre_estilista}</CTableDataCell>
                      <CTableDataCell>{estilista.apellido_estilista}</CTableDataCell>
                      <CTableDataCell>{estilista.identidad_estilista}</CTableDataCell>
                      <CTableDataCell>{estilista.fecha_ingreso}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="success"
                          size="sm"
                          onClick={() => calcularBonificacion(estilista.id_estilista_pk)}
                        >
                          <FontAwesomeIcon icon={faUser} className="me-1" />
                          Calcular Bonificación
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Estilistas
