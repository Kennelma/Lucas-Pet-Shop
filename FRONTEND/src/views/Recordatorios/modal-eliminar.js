import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

// Función básica para eliminar recordatorio
export const eliminarRecordatorio = async (recordatorio, cargarDatos) => {
  try {
    const result = await Swal.fire({
      title: '¿Eliminar recordatorio?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Mensaje:</span> ${recordatorio.mensaje_recordatorio}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px'
    });

    if (result.isConfirmed) {
      // TODO: Implementar llamada real a la API
      
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El recordatorio ha sido eliminado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      await cargarDatos();
    }
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar el recordatorio'
    });
  }
};

// Botón de eliminar para usar en la tabla
export const BotonEliminar = ({ recordatorio, onReload }) => {
  const handleEliminar = async (e) => {
    e.stopPropagation();
    await eliminarRecordatorio(recordatorio, onReload);
  };

  return (
    <button 
      className="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
      onClick={handleEliminar}
      title="Eliminar"
    >
      <FontAwesomeIcon icon={faTrash} size="lg" />
    </button>
  );
};

export default { eliminarRecordatorio, BotonEliminar };
