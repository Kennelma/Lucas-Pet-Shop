import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ModalActualizarRecordatorio = ({
  isOpen,
  onClose,
  onActualizar,
  tipos = [],
  frecuencias = [],
  recordatorio = {}
}) => {
  const [tipoItem, setTipoItem] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [fechaProgramacion, setFechaProgramacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && recordatorio) {
      setTipoItem(recordatorio.tipoItem || '');
      setFrecuencia(recordatorio.frecuencia || '');
      setFechaProgramacion(recordatorio.fechaProgramacion || '');
      setMensaje(recordatorio.mensaje || '');
      setErrorMsg('');
    }
  }, [isOpen, recordatorio]);

  const limpiar = () => {
    setTipoItem('');
    setFrecuencia('');
    setFechaProgramacion('');
    setMensaje('');
    setErrorMsg('');
  };

  const handleActualizar = async () => {
    setErrorMsg('');

    if (!tipoItem || !frecuencia || !fechaProgramacion || !mensaje.trim()) {
      setErrorMsg('Completa todos los campos antes de actualizar.');
      return;
    }
    if (!recordatorio?.id_recordatorio_pk) {
      setErrorMsg('Falta el identificador del recordatorio.');
      return;
    }

    const payload = {
      id_recordatorio: recordatorio.id_recordatorio_pk,  
      mensaje_recordatorio: mensaje.trim(),
      programada_para: fechaProgramacion,                
      id_tipo_item_fk: Number(tipoItem),
      id_frecuencia_fk: Number(frecuencia),
    };

    try {
      setSaving(true);
      await onActualizar?.(payload);
      limpiar();
    } catch (err) {
      console.error('Error al actualizar recordatorio:', err);
      setErrorMsg(err?.message || 'Ocurrió un error inesperado al actualizar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Actualizar Recordatorio"
      visible={isOpen}
      style={{ width: '30rem' }}
      onHide={() => {
        limpiar();
        onClose?.();
      }}
      modal
    >
      <div className="flex flex-col gap-4">
        {errorMsg && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Recordatorio para clientes que han comprado:
          </label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={tipoItem}
            onChange={e => setTipoItem(e.target.value)}
          >
            <option value="">Seleccionar tipo</option>
            {tipos.map(t => (
              <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                {t.nombre_tipo_item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Frecuencia de envío del recordatorio:
          </label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={frecuencia}
            onChange={e => setFrecuencia(e.target.value)}
            disabled={frecuencias.length === 0}
          >
            <option value="">Seleccionar frecuencia</option>
            {frecuencias.map(f => (
              <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                {f.frecuencia_recordatorio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha y hora para enviar recordatorio:
          </label>
          <input
            type="datetime-local"
            className="w-full border rounded px-3 py-2 text-sm"
            value={fechaProgramacion}
            onChange={e => setFechaProgramacion(e.target.value)}
          />
         
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Mensaje
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            label="Cancelar"
            className="p-button-text"
            onClick={() => {
              limpiar();
              onClose?.();
            }}
            disabled={saving}
          />
          <Button
            label={saving ? 'Actualizando...' : 'Actualizar'}
            className="bg-blue-800 hover:bg-blue-900 text-white"
            onClick={handleActualizar}
            disabled={saving}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarRecordatorio;