import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { eliminarRecordatorio as eliminarAPI } from '../../AXIOS.SERVICES/reminder'; // ✅ importa tu servicio real

// 🔹 Función que elimina un recordatorio llamando al backend
export const eliminarRecordatorio = async (recordatorio, cargarDatos) => {
  try {
    const result = await Swal.fire({
      title: '¿Eliminar recordatorio?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Mensaje:</span> ${recordatorio.mensaje_recordatorio}</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px'
    });

    if (result.isConfirmed) {
      // Llamamos al servicio real de Axios
      const respuesta = await eliminarAPI(recordatorio.id_recordatorio_pk);

      if (respuesta.Consulta) {
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El recordatorio fue eliminado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });

        if (cargarDatos) await cargarDatos();
      } else {
        throw new Error(respuesta.error || 'Error al eliminar el recordatorio');
      }
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

// 🔹 Botón de eliminar que se usa en la tabla
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
