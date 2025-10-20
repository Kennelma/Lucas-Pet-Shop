import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

// Función para editar empresa
export const editarEmpresa = (empresa, onEdit) => {
  onEdit(empresa);
};

// Botón de editar para usar en la lista de empresas
export const BotonEditarEmpresa = ({ empresa, onEdit }) => {
  const handleEditar = (e) => {
    e.stopPropagation();
    editarEmpresa(empresa, onEdit);
  };

  return (
    <button
      onClick={handleEditar}
      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded text-sm flex items-center justify-center transition-colors"
      title="Editar empresa"
    >
      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
    </button>
  );
};

export default { editarEmpresa, BotonEditarEmpresa };