import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { insertarRecordatorio } from "../../AXIOS.SERVICES/reminders-axios";

const ModalRecordatorio = ({ isOpen, onClose, onGuardar, tipoServicio = [], frecuencias = [] }) => {
  const [tipoItem, setTipoItem] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [fechaProgramacion, setFechaProgramacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const limpiar = () => {
    setTipoItem('');
    setFrecuencia('');
    setFechaProgramacion('');
    setMensaje('');
    setErrorMsg('');
  };

  // Intenta inferir el objeto recordatorio que devuelve tu backend
  const pickRecordatorio = (res) => {
    // Ajusta estas llaves a tu respuesta real si fuera necesario
    return (
      res?.recordatorio ??
      res?.Recordatorio ??
      res?.data ??
      res
    );
  };

  const handleGuardar = async () => {
    setErrorMsg('');

    // Validaciones simples
    if (!tipoItem || !frecuencia || !fechaProgramacion || !mensaje.trim()) {
      setErrorMsg('Completa todos los campos antes de guardar.');
      return;
    }

    const datosRegistro = {
      tipo_item: Number(tipoItem),
      frecuencia: Number(frecuencia),
      programada_para: fechaProgramacion, // formato YYYY-MM-DD
      mensaje: mensaje.trim(),
    };

    try {
      setSaving(true);
      const resultado = await insertarRecordatorio(datosRegistro);

      if (resultado?.error) {
        setErrorMsg(resultado.error);
        return;
      }

      const creado = pickRecordatorio(resultado) || datosRegistro;

      // Devuelve al padre el objeto creado
      onGuardar?.(creado);

      // Limpia y cierra
      limpiar();
      onClose?.();
    } catch (err) {
      console.error('Error al insertar recordatorio:', err);
      setErrorMsg(err?.message || 'Ocurrió un error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Nuevo Recordatorio"
      visible={isOpen}
      style={{ width: '30rem' }}
      onHide={() => { limpiar(); onClose?.(); }}
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
            {tipoServicio.map(t => (
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
            onClick={() => { limpiar(); onClose?.(); }}
            disabled={saving}
          />
          <Button
            label={saving ? "Guardando..." : "Guardar"}
            className="bg-green-800 hover:bg-green-900 text-white"
            onClick={handleGuardar}
            disabled={saving}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ModalRecordatorio;
