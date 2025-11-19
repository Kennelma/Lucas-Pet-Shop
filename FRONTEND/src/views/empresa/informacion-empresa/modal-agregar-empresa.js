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
  errores,
  onBlur
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
        {/* Campos señuelo ocultos para confundir al autocompletado */}
        <input type="text" style={{ display: 'none' }} autoComplete="off" />
        <input type="email" style={{ display: 'none' }} autoComplete="off" />
        <input type="tel" style={{ display: 'none' }} autoComplete="off" />

        <div className="flex flex-col gap-3">
          {/* Nombre de la Empresa */}
          <span>
            <label htmlFor="nombre_empresa" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DE LA EMPRESA</label>
            <InputText
              id="field_name_xyz"
              name="field_name_xyz"
              value={formData.nombre_empresa}
              onChange={(e) => {
                const event = { target: { name: 'nombre_empresa', value: e.target.value.toUpperCase() } };
                onChange(event);
              }}
              onBlur={(e) => onBlur({ target: { name: 'nombre_empresa', value: e.target.value } })}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Ej: MASCOTAS FELICES SA"
              type="text"
              autoComplete="off"
              data-lpignore="true"
            />
            {errores.nombre_empresa && <p className="text-xs text-red-600 mt-1">{errores.nombre_empresa}</p>}
          </span>

          {/* Teléfono */}
          <span>
            <label htmlFor="telefono_empresa" className="text-xs font-semibold text-gray-700 mb-1">TELÉFONO</label>
            <InputText
              id="field_phone_xyz"
              name="field_phone_xyz"
              value={formData.telefono_empresa || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                onChange({ target: { name: 'telefono_empresa', value } });
              }}
              onBlur={(e) => onBlur({ target: { name: 'telefono_empresa', value: e.target.value } })}
              placeholder="98972569"
              className="w-full rounded-xl h-9 text-sm"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              maxLength={8}
            />
            {errores.telefono_empresa && <p className="text-xs text-red-600 mt-1">{errores.telefono_empresa}</p>}
          </span>

          {/* Correo Electrónico */}
          <span>
            <label htmlFor="correo_empresa" className="text-xs font-semibold text-gray-700 mb-1">CORREO ELECTRÓNICO</label>
            <InputText
              id="field_mail_xyz"
              name="field_mail_xyz"
              value={formData.correo_empresa}
              onChange={(e) => onChange({ target: { name: 'correo_empresa', value: e.target.value } })}
              onBlur={(e) => onBlur({ target: { name: 'correo_empresa', value: e.target.value } })}
              className="w-full rounded-xl h-9 text-sm lowercase"
              placeholder="EJEM: contacto@empresa.com"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              inputMode="text"
            />
            {errores.correo_empresa && <p className="text-xs text-red-600 mt-1">{errores.correo_empresa}</p>}
          </span>

          {/* RTN Empresa */}
          <span>
            <label htmlFor="rtn_empresa" className="text-xs font-semibold text-gray-700 mb-1">RTN EMPRESA</label>
            <InputText
              id="field_rtn_xyz"
              name="field_rtn_xyz"
              value={formData.rtn_empresa || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                onChange({ target: { name: 'rtn_empresa', value } });
              }}
              onBlur={(e) => onBlur({ target: { name: 'rtn_empresa', value: e.target.value } })}
              placeholder="08012345678901"
              className="w-full rounded-xl h-9 text-sm"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              maxLength={14}
            />
            {errores.rtn_empresa && <p className="text-xs text-red-600 mt-1">{errores.rtn_empresa}</p>}
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