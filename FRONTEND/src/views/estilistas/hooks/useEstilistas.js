// src/modules/estilistas/hooks/useEstilistas.js
import { useState, useEffect } from 'react'
import {
  verEstilistas,
  insertarEstilista,
  actualizarEstilista,
  eliminarEstilista
} from '../../../AXIOS.SERVICES/employees-axios'

export const useEstilistas = () => {
  const [estilistas, setEstilistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) 

  const [modalVisible, setModalVisible] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formData, setFormData] = useState({
    id_estilista_pk: null,
    nombre_estilista: '',
    apellido_estilista: '',
    identidad_estilista: ''
  })



  
  // Cargar datos
  useEffect(() => {
    cargarEstilistas()
  }, [])

  const cargarEstilistas = async () => {
    try {
      setLoading(true)
      const data = await verEstilistas()
      setEstilistas(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar estilistas')
    } finally {
      setLoading(false)
    }
  }

  // Guardar (crear o actualizar)
  const guardarEstilista = async () => {
    if (!formData.nombre_estilista.trim() || !formData.apellido_estilista.trim()) {
      alert('Nombre y apellido son obligatorios.')
      return
    }
    if (!/^[0-9]{13}$/.test(formData.identidad_estilista)) {
      alert('El número de identidad debe tener exactamente 13 dígitos.')
      return
    }

    try {
      if (modoEdicion) {
        await actualizarEstilista({
          id_estilista: formData.id_estilista_pk,
          nombre_estilista: formData.nombre_estilista,
          apellido_estilista: formData.apellido_estilista,
          identidad_estilista: formData.identidad_estilista
        })
      } else {
        await insertarEstilista(formData)
      }
      setModalVisible(false)
      cargarEstilistas()
    } catch (err) {
      console.error(err)
      alert('Error al guardar los datos.')
    }
  }

  // Eliminar
  const eliminarRegistro = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este estilista?')) return
    try {
      await eliminarEstilista(id)
      cargarEstilistas()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar estilista.')
    }
  }

  return {
    estilistas,
    loading,
    error,
    modalVisible,
    setModalVisible,
    modoEdicion,
    setModoEdicion,
    formData,
    setFormData,
    cargarEstilistas,
    guardarEstilista,
    eliminarRegistro
  }
}
