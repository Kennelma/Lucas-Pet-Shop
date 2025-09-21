import { useState, useEffect } from 'react';
import { serviciosService } from '../services/serviciosService';

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const data = await serviciosService.obtenerTodos();
      setServicios(data.datos || []);
      setError('');
    } catch (error) {
      setError('Error al cargar servicios');
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearServicio = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      await serviciosService.crear(formData);
      setMensaje('Servicio creado exitosamente');
      await cargarServicios();
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || 'Error al crear el servicio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const actualizarServicio = async (id, formData) => {
    setLoading(true);
    setError('');
    
    try {
      await serviciosService.actualizar(id, formData);
      setMensaje('Servicio actualizado exitosamente');
      await cargarServicios();
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || 'Error al actualizar el servicio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const eliminarServicio = async (servicio) => {
    try {
      await serviciosService.eliminar(servicio.id_servicio_peluqueria_pk);
      await cargarServicios();
      setMensaje('Servicio eliminado exitosamente');
      setTimeout(() => setMensaje(''), 3000);
      return { success: true };
    } catch (error) {
      const errorMsg = 'Error al eliminar el servicio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const limpiarMensajes = () => {
    setError('');
    setMensaje('');
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  return {
    servicios,
    loading,
    error,
    mensaje,
    cargarServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    limpiarMensajes
  };
};