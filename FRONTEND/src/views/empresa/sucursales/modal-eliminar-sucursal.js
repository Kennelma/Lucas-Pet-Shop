import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { eliminarRegistro } from '../../../AXIOS.SERVICES/empresa-axios';

// Función para eliminar sucursal con confirmación
export const eliminarSucursal = async (sucursal, onReload) => {
  try {
    const result = await Swal.fire({
      title: '¿Eliminar sucursal?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${sucursal.nombre_sucursal}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Dirección:</span> ${sucursal.direccion_sucursal}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Teléfono:</span> ${sucursal.telefono_sucursal}</p>
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
      const resultado = await eliminarRegistro(sucursal.id_sucursal_pk, 'SUCURSALES');
      
      if (resultado.Consulta) {
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La sucursal ha sido eliminada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        if (onReload) await onReload();
      } else {
        throw new Error(resultado.error || 'Error al eliminar');
      }
    }
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar la sucursal'
    });
  }
};

// Botón de eliminar para usar en la lista de sucursales
export const BotonEliminarSucursal = ({ sucursal, onReload }) => {
  const handleEliminar = async (e) => {
    e.stopPropagation();
    await eliminarSucursal(sucursal, onReload);
  };

  return (
    <button
      onClick={handleEliminar}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
      title="Eliminar sucursal"
    >
      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
      <span>Eliminar</span>
    </button>
  );
};

export default { eliminarSucursal, BotonEliminarSucursal };