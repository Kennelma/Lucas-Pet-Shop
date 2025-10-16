import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const ModalAgregarSucursal = ({ 
  visible, 
  onHide, 
  formData, 
  onChange, 
  onSave, 
  loading, 
  editando, 
  errores,
  empresas 
}) => {

  return (
    <Dialog
      header={
        <div className="w-full text-center text-lg font-bold">
          {editando ? 'EDITAR SUCURSAL' : 'NUEVA SUCURSAL'}
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
          <span>
            <label htmlFor="id_empresa_fk" className="text-xs font-semibold text-gray-700 mb-1">Empresa</label>
            <Dropdown
              id="id_empresa_fk"
              name="id_empresa_fk"
              value={formData.id_empresa_fk}
              options={empresas}
              onChange={(e) => onChange({ target: { name: 'id_empresa_fk', value: e.value } })}
              optionLabel="nombre_empresa"
              optionValue="id_empresa_pk"
              placeholder="Seleccionar empresa..."
              className="w-full rounded-xl h-9"
              panelClassName="rounded-xl"
            />
            {errores.id_empresa_fk && <p className="text-xs text-red-600 mt-1">{errores.id_empresa_fk}</p>}
          </span>

          {/* Nombre de la Sucursal */}
          <span>
            <label htmlFor="nombre_sucursal" className="text-xs font-semibold text-gray-700 mb-1">Nombre de la sucursal</label>
            <InputText
              id="nombre_sucursal"
              name="nombre_sucursal"
              value={formData.nombre_sucursal}
              onChange={onChange}
              className="w-full rounded-xl h-9 text-sm uppercase"
              placeholder="Ej: Sucursal Norte"
            />
            {errores.nombre_sucursal && <p className="text-xs text-red-600 mt-1">{errores.nombre_sucursal}</p>}
          </span>

          {/* Dirección */}
          <span>
            <label htmlFor="direccion_sucursal" className="text-xs font-semibold text-gray-700 mb-1">Dirección</label>
            <InputText
              id="direccion_sucursal"
              name="direccion_sucursal"
              value={formData.direccion_sucursal}
              onChange={onChange}
              className="w-full rounded-xl h-9 text-sm uppercase"
              placeholder="Ej: Barrio El Carmen"
            />
            {errores.direccion_sucursal && <p className="text-xs text-red-600 mt-1">{errores.direccion_sucursal}</p>}
          </span>

          {/* Teléfono */}
          <span>
            <label htmlFor="telefono_sucursal" className="text-xs font-semibold text-gray-700 mb-1">TELÉFONO</label>
            <InputText
              id="telefono_sucursal"
              name="telefono_sucursal"
              value={formData.telefono_sucursal}
              onChange={onChange}
              className="w-full rounded-xl h-9 text-sm uppercase"
              placeholder="Ej: 9999-8888"
            />
            {errores.telefono_sucursal && <p className="text-xs text-red-600 mt-1">{errores.telefono_sucursal}</p>}
          </span>
        </div>
      </div>
    </Dialog>
  );
};

// Botón de agregar para usar en la interfaz principal
export const BotonAgregarSucursal = ({ onClick, loading = false }) => {
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
          <span>Nueva Sucursal</span>
        </>
      )}
    </button>
  );
};

export default ModalAgregarSucursal;