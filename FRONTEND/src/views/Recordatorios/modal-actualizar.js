import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Función básica para actualizar recordatorio
export const actualizarRecordatorio = async (datosRecordatorio) => {
  try {
    // TODO: Implementar llamada a la API para actualizar
    console.log('Actualizando recordatorio:', datosRecordatorio);
    
    // Por ahora retorna éxito
    return { Consulta: true, mensaje: 'Recordatorio actualizado exitosamente' };
  } catch (error) {
    console.error('Error al actualizar recordatorio:', error);
    throw error;
  }
};

// Botón de actualizar para usar en la tabla
export const BotonActualizar = ({ recordatorio, onReload }) => {
  const handleActualizar = async (e) => {
    e.stopPropagation();
    
    try {
      const result = await Swal.fire({
        title: 'Actualizar recordatorio',
        text: '¿Estás seguro de que quieres actualizar este recordatorio?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await actualizarRecordatorio(recordatorio);
        
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El recordatorio ha sido actualizado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        if (onReload) await onReload();
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el recordatorio'
      });
    }
  };

  return (
    <button 
      className="text-green-600 hover:text-green-800 p-2 rounded transition-colors"
      onClick={handleActualizar}
      title="Actualizar"
    >
      <FontAwesomeIcon icon={faPenToSquare} size="lg" />
    </button>
  );
};

export default { actualizarRecordatorio, BotonActualizar };
