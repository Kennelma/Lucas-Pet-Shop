import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { eliminarRegistro } from '../../../AXIOS.SERVICES/empresa-axios';

// Función para eliminar empresa con confirmación
export const eliminarEmpresa = async (empresa, onReload) => {
  try {
    const result = await Swal.fire({
      title: '¿Eliminar empresa?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${empresa.nombre_empresa}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Dirección:</span> ${empresa.direccion_empresa}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Teléfono:</span> ${empresa.telefono_empresa}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Email:</span> ${empresa.correo_empresa}</p>
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
      const response = await eliminarRegistro(empresa.id_empresa_pk, 'EMPRESA');
      
      if (response.Consulta) {
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La empresa ha sido eliminada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        if (onReload) await onReload();
      } else {
        throw new Error(response.error || 'Error al eliminar');
      }
    }
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar la empresa'
    });
  }
};

// Botón de eliminar para usar en la lista de empresas
export const BotonEliminarEmpresa = ({ empresa, onReload }) => {
  const handleEliminar = async (e) => {
    e.stopPropagation();
    await eliminarEmpresa(empresa, onReload);
  };

  return (
    <button
      onClick={handleEliminar}
      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded text-sm flex items-center justify-center transition-colors"
      title="Eliminar empresa"
    >
      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
    </button>
  );
};

export default { eliminarEmpresa, BotonEliminarEmpresa };