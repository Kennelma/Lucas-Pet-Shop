import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

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

  // 🔹 Función para calcular próxima fecha basada en frecuencia
  const calcularProximaFecha = (frecuenciaId) => {
    const frecuencia = frecuencias.find(f => f.id_frecuencia_record_pk == frecuenciaId);
    if (!frecuencia) return '';

    const hoy = new Date();
    let proximaFecha = new Date();
    
    switch(frecuencia.dias_intervalo) {
      case 1: // Diario
        proximaFecha.setDate(hoy.getDate() + 1);
        break;
      case 7: // Semanal
        proximaFecha.setDate(hoy.getDate() + 7);
        break;
      case 15: // Quincenal
        proximaFecha.setDate(hoy.getDate() + 15);
        break;
      case 30: // Mensual
        proximaFecha.setMonth(hoy.getMonth() + 1);
        break;
      case 60: // Bimestral
        proximaFecha.setMonth(hoy.getMonth() + 2);
        break;
      case 90: // Trimestral
        proximaFecha.setMonth(hoy.getMonth() + 3);
        break;
      default:
        proximaFecha.setDate(hoy.getDate() + 1);
    }
    
    return proximaFecha.toLocaleDateString('es-ES');
  };

  return (
    <Dialog
      header={
        <div className="w-full text-center text-lg font-bold">
          {editando ? 'EDITAR RECORDATORIO' : 'NUEVO RECORDATORIO'}
        </div>
      }
      visible={visible}
      style={{ width: '32rem', borderRadius: '1.5rem' }}
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
        <div className="flex flex-col gap-3">
          {/* Tipo de servicio */}
          <span>
            <label htmlFor="id_tipo_item_fk" className="text-xs font-semibold text-gray-700 mb-1">
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
          </span>

          {/* Frecuencia - MEJORADO */}
          <span>
            <label htmlFor="id_frecuencia_fk" className="text-xs font-semibold text-gray-700 mb-1">
              FRECUENCIA DE ENVÍO <span className="text-red-600">*</span>
            </label>
            {loading ? (
              <div className="w-full h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-500 text-sm">Cargando frecuencias...</span>
              </div>
            ) : (
              <div>
                <select
                  id="id_frecuencia_fk"
                  name="id_frecuencia_fk"
                  value={formData.id_frecuencia_fk || ''}
                  onChange={onChange}
                  className="w-full rounded-xl h-9 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  disabled={frecuencias.length === 0}
                >
                  <option value="">-- Seleccionar frecuencia --</option>
                  {frecuencias.map(f => (
                    <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                      {f.frecuencia_recordatorio}
                    </option>
                  ))}
                </select>
                
                {/* 🔹 MOSTRAR PRÓXIMA FECHA CALCULADA */}
                {formData.id_frecuencia_fk && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500" />
                    <span>
                      <strong>Próximo envío:</strong> {calcularProximaFecha(formData.id_frecuencia_fk)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </span>

          {/* Mensaje */}
          <span>
            <label htmlFor="mensaje_recordatorio" className="text-xs font-semibold text-gray-700 mb-1">
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
          </span>
        </div>
      </div>
    </Dialog>
  );
};

// 🔹 Función para calcular próxima fecha basada en frecuencia (MANTENER ESTA FUNCIÓN)
const calcularProximaFecha = (frecuenciaId) => {
  const frecuencia = frecuencias.find(f => f.id_frecuencia_record_pk == frecuenciaId);
  if (!frecuencia || !frecuencia.dias_intervalo) return '';

  const hoy = new Date();
  let proximaFecha = new Date(hoy);
  
  // Usar días_intervalo de la base de datos
  proximaFecha.setDate(hoy.getDate() + frecuencia.dias_intervalo);
  
  return proximaFecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Botón de agregar (se mantiene igual)
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