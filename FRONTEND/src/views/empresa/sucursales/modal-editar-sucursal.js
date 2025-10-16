import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

// Función para editar sucursal
export const editarSucursal = (sucursal, onEdit) => {
  onEdit(sucursal);
};

// Botón de editar para usar en la lista de sucursales
export const BotonEditarSucursal = ({ sucursal, onEdit }) => {
  const handleEditar = (e) => {
    e.stopPropagation();
    editarSucursal(sucursal, onEdit);
  };

  return (
    <button
      onClick={handleEditar}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
      title="Editar sucursal"
    >
      <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
      <span>Editar</span>
    </button>
  );
};

export default { editarSucursal, BotonEditarSucursal };