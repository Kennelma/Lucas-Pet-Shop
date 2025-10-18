import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const ModalAgregarEmpresa = ({ 
  visible, 
  onHide, 
  formData, 
  onChange, 
  onSave, 
  loading, 
  editando, 
  errores 
}) => {

  return (
    <Dialog
      header={
        <div className="w-full text-center text-lg font-bold">
          {editando ? 'EDITAR EMPRESA' : 'NUEVA EMPRESA'}
        </div>
      }
      visible={visible}
      style={{ width: '28rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onHide}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-text p-button-secondary"
            disabled={loading}
          />
          <Button
            label={loading ? (editando ? 'Actualizando...' : 'Guardando...') : (editando ? 'Actualizar' : 'Guardar')}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
            onClick={onSave}
            className="p-button-success"
            loading={loading}
            disabled={loading}
          />
        </div>
      }
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      <div className="mt-2">
        <div className="flex flex-col gap-3">
          {/* Nombre de la Empresa */}
          <span>
            <label htmlFor="nombre_empresa" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DE LA EMPRESA</label>
            <InputText
              id="nombre_empresa"
              name="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={onChange}
              className="w-full rounded-xl h-9 text-sm uppercase"
              placeholder="Ej: Tech Solutions SA"
            />
            {errores.nombre_empresa && <p className="text-xs text-red-600 mt-1">{errores.nombre_empresa}</p>}
          </span>

          {/* Dirección */}
          <span>
            <label htmlFor="direccion_empresa" className="text-xs font-semibold text-gray-700 mb-1">DIRECCIÓN</label>
            <InputText
              id="direccion_empresa"
              name="direccion_empresa"
              value={formData.direccion_empresa}
              onChange={onChange}
              className="w-full rounded-xl h-9 text-sm uppercase"
              placeholder="Ej: Av. Principal 123"
            />
            {errores.direccion_empresa && <p className="text-xs text-red-600 mt-1">{errores.direccion_empresa}</p>}
          </span>

          {/* Teléfono */}
          <span>
            <label htmlFor="telefono_empresa" className="text-xs font-semibold text-gray-700 mb-1">TELÉFONO</label>
            <InputText
              id="telefono_empresa"
              name="telefono_empresa"
              value={formData.telefono_empresa}
              onChange={onChange}
              className="w-full rounded-xl h-9 text-sm uppercase"
              placeholder="Ej: 2222-3333"
            />
            {errores.telefono_empresa && <p className="text-xs text-red-600 mt-1">{errores.telefono_empresa}</p>}
          </span>

          {/* Correo Electrónico */}
          <span>
            <label htmlFor="correo_empresa" className="text-xs font-semibold text-gray-700 mb-1">CORREO ELECTRÓNICO</label>
            <InputText
              id="correo_empresa"
              name="correo_empresa"
              value={formData.correo_empresa}
              onChange={onChange}
              className="w-full rounded-xl h-9 text-sm lowercase"
              placeholder="Ej: contacto@empresa.com"
              type="email"
            />
            {errores.correo_empresa && <p className="text-xs text-red-600 mt-1">{errores.correo_empresa}</p>}
          </span>
        </div>
      </div>
    </Dialog>
  );
};

// Botón de agregar para usar en la interfaz principal
export const BotonAgregarEmpresa = ({ onClick, loading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faPlus} />
          <span>Nueva Empresa</span>
        </>
      )}
    </button>
  );
};

export default ModalAgregarEmpresa;