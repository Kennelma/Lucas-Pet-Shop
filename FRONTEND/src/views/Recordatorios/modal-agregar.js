import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarAlt, faClock, faPaperPlane, faBell } from '@fortawesome/free-solid-svg-icons';

const ModalAgregar = ({ 
  visible, 
  onHide, 
  formData, 
  onChange, 
  onSave, 
  loading, 
  editando, 
  tiposItems, 
  frecuencias,
}) => {

  // 🔹 Función para calcular fecha mínima (hoy)
  const getFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // 🔹 Función para calcular hora por defecto (próxima hora)
  const getHoraPorDefecto = () => {
    const ahora = new Date();
    ahora.setHours(ahora.getHours() + 1);
    return ahora.toTimeString().slice(0, 5);
  };

  // 🔹 Verificar si la fecha programada es hoy
  const esFechaHoy = () => {
    if (!formData.fecha_programada) return false;
    const hoy = new Date().toISOString().split('T')[0];
    return formData.fecha_programada === hoy;
  };

  return (
    <Dialog
      header={
        <div className="w-full text-center text-lg font-bold">
          {editando ? 'EDITAR RECORDATORIO' : 'NUEVO RECORDATORIO'}
        </div>
      }
      visible={visible}
      style={{ width: '42rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onHide}
      footer={
        <div className="flex justify-end gap-3 mt-2">
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            className="p-button-text p-button-rounded" 
            onClick={onHide} 
            disabled={loading}
          />
          <Button 
            label={loading ? (editando ? 'Actualizando...' : 'Guardando...') : (editando ? 'Actualizar' : 'Guardar')} 
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"} 
            className="p-button-success p-button-rounded" 
            onClick={onSave} 
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
        <div className="flex flex-col gap-4">
          {/* Tipo de servicio */}
          <div>
            <label htmlFor="id_tipo_item_fk" className="text-xs font-semibold text-gray-700 mb-1 block">
              DESTINADO A CLIENTES QUE COMPRARON <span className="text-red-600">*</span>
            </label>
            {loading ? (
              <div className="w-full h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-500 text-sm">Cargando servicios...</span>
              </div>
            ) : (
              <select
                id="id_tipo_item_fk"
                name="id_tipo_item_fk"
                value={formData.id_tipo_item_fk || ''}
                onChange={onChange}
                className="w-full rounded-xl h-9 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={tiposItems.length === 0}
              >
                <option value="">-- Seleccionar servicio --</option>
                {tiposItems.map(t => (
                  <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                    {t.nombre_tipo_item}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Frecuencia */}
          <div>
            <label htmlFor="id_frecuencia_fk" className="text-xs font-semibold text-gray-700 mb-1 block">
              FRECUENCIA DE ENVÍO <span className="text-red-600">*</span>
            </label>
            {loading ? (
              <div className="w-full h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-500 text-sm">Cargando frecuencias...</span>
              </div>
            ) : (
              <select
                id="id_frecuencia_fk"
                name="id_frecuencia_fk"
                value={formData.id_frecuencia_fk || ''}
                onChange={onChange}
                className="w-full rounded-xl h-9 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={frecuencias.length === 0}
              >
                <option value="">-- Seleccionar frecuencia --</option>
                {frecuencias.map(f => (
                  <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                    {f.frecuencia_recordatorio} (cada {f.dias_intervalo} días)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ✅ NUEVO: FECHA Y HORA PROGRAMADA */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fecha Programada */}
            <div>
              <label htmlFor="fecha_programada" className="text-xs font-semibold text-gray-700 mb-1 block">
                FECHA DE PRIMER ENVÍO <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faCalendarAlt} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type="date"
                  id="fecha_programada"
                  name="fecha_programada"
                  value={formData.fecha_programada || getFechaMinima()}
                  onChange={onChange}
                  min={getFechaMinima()}
                  className="w-full rounded-xl h-9 px-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Primera fecha de envío programado
              </p>
            </div>

            {/* Hora Programada */}
            <div>
              <label htmlFor="hora_programada" className="text-xs font-semibold text-gray-700 mb-1 block">
                HORA DE ENVÍO <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faClock} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type="time"
                  id="hora_programada"
                  name="hora_programada"
                  value={formData.hora_programada || getHoraPorDefecto()}
                  onChange={onChange}
                  className="w-full rounded-xl h-9 px-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Hora exacta del envío programado
              </p>
            </div>
          </div>

          {/* ✅ CORREGIDO: OPCIONES DE ENVÍO CLARAS */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              OPCIÓN DE ENVÍO <span className="text-red-600">*</span>
            </label>
            
            {/* Opción 1: Solo programar */}
            <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
              formData.tipo_envio === 'programar' 
                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => onChange({
              target: { name: 'tipo_envio', value: 'programar' }
            })}>
              <input
                type="radio"
                name="tipo_envio"
                value="programar"
                checked={formData.tipo_envio === 'programar'}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" />
                  <span className="text-sm font-semibold text-gray-800">Solo programar para después</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  El recordatorio se enviará únicamente en la fecha y hora programada, y se repetirá según la frecuencia.
                </p>
              </div>
            </div>

            {/* Opción 2: Solo enviar ahora */}
            <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
              formData.tipo_envio === 'inmediato' 
                ? 'bg-green-50 border-green-300 shadow-sm' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => onChange({
              target: { name: 'tipo_envio', value: 'inmediato' }
            })}>
              <input
                type="radio"
                name="tipo_envio"
                value="inmediato"
                checked={formData.tipo_envio === 'inmediato'}
                onChange={onChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faPaperPlane} className="text-green-500" />
                  <span className="text-sm font-semibold text-gray-800">Solo enviar ahora (una vez)</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  El recordatorio se enviará inmediatamente después de guardar. No se programará para el futuro.
                </p>
              </div>
            </div>

            {/* Opción 3: Ambos (solo disponible si la fecha no es hoy) */}
            {!esFechaHoy() && (
              <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                formData.tipo_envio === 'ambos' 
                  ? 'bg-purple-50 border-purple-300 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => onChange({
                target: { name: 'tipo_envio', value: 'ambos' }
              })}>
                <input
                  type="radio"
                  name="tipo_envio"
                  value="ambos"
                  checked={formData.tipo_envio === 'ambos'}
                  onChange={onChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBell} className="text-purple-500" />
                    <span className="text-sm font-semibold text-gray-800">Enviar ahora Y programar</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    El recordatorio se enviará inmediatamente Y también se programará para la fecha seleccionada con la frecuencia establecida.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ✅ NUEVO: RESUMEN DE PROGRAMACIÓN MEJORADO */}
          {formData.fecha_programada && formData.hora_programada && formData.id_frecuencia_fk && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Resumen de Programación
              </h4>
              <div className="text-sm text-green-700 space-y-2">
                {formData.tipo_envio === 'programar' && (
                  <>
                    <p><strong>📅 Envío programado:</strong> {new Date(formData.fecha_programada).toLocaleDateString('es-ES')} a las {formData.hora_programada}</p>
                    <p><strong>🔄 Frecuencia:</strong> Cada {frecuencias.find(f => f.id_frecuencia_record_pk == formData.id_frecuencia_fk)?.dias_intervalo} días</p>
                    <p className="text-xs text-green-600">El recordatorio comenzará a enviarse en la fecha programada y continuará automáticamente.</p>
                  </>
                )}
                
                {formData.tipo_envio === 'inmediato' && (
                  <>
                    <p><strong>🚀 Envío inmediato:</strong> Se enviará inmediatamente después de guardar</p>
                    <p className="text-xs text-green-600">Este es un envío único. No se programará para el futuro.</p>
                  </>
                )}
                
                {formData.tipo_envio === 'ambos' && (
                  <>
                    <p><strong>🚀 Envío inmediato:</strong> Se enviará inmediatamente después de guardar</p>
                    <p><strong>📅 Envío programado:</strong> {new Date(formData.fecha_programada).toLocaleDateString('es-ES')} a las {formData.hora_programada}</p>
                    <p><strong>🔄 Frecuencia:</strong> Cada {frecuencias.find(f => f.id_frecuencia_record_pk == formData.id_frecuencia_fk)?.dias_intervalo} días</p>
                    <p className="text-xs text-green-600">El recordatorio se enviará ahora y también se programará para enviarse automáticamente en el futuro.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mensaje */}
          <div>
            <label htmlFor="mensaje_recordatorio" className="text-xs font-semibold text-gray-700 mb-1 block">
              MENSAJE DEL RECORDATORIO <span className="text-red-600">*</span>
            </label>
            <InputTextarea
              id="mensaje_recordatorio"
              name="mensaje_recordatorio"
              value={formData.mensaje_recordatorio}
              onChange={onChange}
              placeholder="Escribe el mensaje que llegará a tus clientes..."
              rows={4}
              className="w-full rounded-xl text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

// Botón de agregar
export const BotonAgregar = ({ onClick, loading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
      style={{ borderRadius: '12px' }}
      title="Agregar nuevo recordatorio"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faPlus} />
          <span>Nuevo Recordatorio</span>
        </>
      )}
    </button>
  );
};

export default ModalAgregar;