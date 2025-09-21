import { useState, useEffect } from 'react';
import { promocionesService } from '../services/promocionesService';

export const usePromociones = () => {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarPromociones = async () => {
    setLoading(true);
    try {
      const data = await promocionesService.obtenerTodos();
      setPromociones(data.datos || []);
      setError('');
    } catch (error) {
      setError('Error al cargar promociones');
      console.error('Error cargando promociones:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearPromocion = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      await promocionesService.crear(formData);
      setMensaje('Promoción creada exitosamente');
      await cargarPromociones();
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || 'Error al crear la promoción';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const actualizarPromocion = async (id, formData) => {
    setLoading(true);
    setError('');
    
    try {
      await promocionesService.actualizar(id, formData);
      setMensaje('Promoción actualizada exitosamente');
      await cargarPromociones();
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || 'Error al actualizar la promoción';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const eliminarPromocion = async (promocion) => {
    try {
      await promocionesService.eliminar(promocion.id_promocion_pk);
      await cargarPromociones();
      setMensaje('Promoción eliminada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
      return { success: true };
    } catch (error) {
      const errorMsg = 'Error al eliminar la promoción';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const limpiarMensajes = () => {
    setError('');
    setMensaje('');
  };

  useEffect(() => {
    cargarPromociones();
  }, []);

  return {
    promociones,
    loading,
    error,
    mensaje,
    cargarPromociones,
    crearPromocion,
    actualizarPromocion,
    eliminarPromocion,
    limpiarMensajes
  };
};